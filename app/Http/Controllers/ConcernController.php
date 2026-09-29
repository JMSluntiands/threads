<?php

namespace App\Http\Controllers;

use App\Models\Concern;
use App\Support\StoredFile;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class ConcernController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $side = $request->query('side');
        $status = $request->query('status');
        $company = $request->query('company');

        $query = Concern::query()
            ->visibleTo($request->user())
            ->with([
                'user:id,name,email,role,avatar_path',
                'comments' => fn ($q) => $q->with('user:id,name,email,role,avatar_path')->latest(),
            ])
            ->latest();

        if ($company && in_array($company, Concern::COMPANIES, true)) {
            $query->where('company', $company);
        }

        if ($side === 'user' && $status && in_array($status, Concern::USER_STATUSES, true)) {
            $query->where('user_status', $status);
        }

        if ($side === 'developer' && $status && in_array($status, Concern::DEVELOPER_STATUSES, true)) {
            $query->where('developer_status', $status);
        }

        $concerns = $query->get()->map(fn (Concern $concern) => $this->transform($concern));

        $base = Concern::query()->visibleTo($request->user());
        if ($company && in_array($company, Concern::COMPANIES, true)) {
            $base->where('company', $company);
        }

        $userCounts = (clone $base)
            ->selectRaw('user_status, COUNT(*) as total')
            ->groupBy('user_status')
            ->pluck('total', 'user_status');

        $developerCounts = (clone $base)
            ->selectRaw('developer_status, COUNT(*) as total')
            ->groupBy('developer_status')
            ->pluck('total', 'developer_status');

        $companyCounts = Concern::query()
            ->visibleTo($request->user())
            ->selectRaw('company, COUNT(*) as total')
            ->groupBy('company')
            ->pluck('total', 'company');

        $userStats = collect(Concern::USER_STATUSES)
            ->mapWithKeys(fn (string $key) => [$key => (int) ($userCounts[$key] ?? 0)])
            ->all();

        $developerStats = collect(Concern::DEVELOPER_STATUSES)
            ->mapWithKeys(fn (string $key) => [$key => (int) ($developerCounts[$key] ?? 0)])
            ->all();

        $companyStats = collect(Concern::COMPANIES)
            ->mapWithKeys(fn (string $key) => [$key => (int) ($companyCounts[$key] ?? 0)])
            ->all();

        return response()->json([
            'concerns' => $concerns,
            'stats' => [
                'total' => (clone $base)->count(),
                'user' => $userStats,
                'developer' => $developerStats,
                'company' => $companyStats,
            ],
            'companies' => Concern::COMPANIES,
            'statuses' => [
                'user' => Concern::USER_STATUSES,
                'developer' => Concern::DEVELOPER_STATUSES,
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'body' => ['required', 'string', 'max:5000'],
            'company' => ['required', Rule::in(Concern::COMPANIES)],
            'image' => ['nullable', 'image', 'max:5120'],
        ]);

        $imagePath = null;

        if ($request->hasFile('image')) {
            $imagePath = StoredFile::store($request->file('image'), 'concerns');
        }

        $concern = Concern::create([
            'user_id' => $request->user()->id,
            'company' => $validated['company'],
            'ticket_no' => Concern::nextTicketNo(),
            'title' => $validated['title'],
            'body' => $validated['body'],
            'user_status' => 'pending',
            'developer_status' => 'on_going',
            'board_status' => 'pending',
            'image_path' => $imagePath,
        ]);

        $concern->load([
            'user:id,name,email,role,avatar_path',
            'comments.user:id,name,email,role,avatar_path',
        ]);

        return response()->json([
            'concern' => $this->transform($concern),
            'message' => 'Ticket created.',
        ], 201);
    }

    public function show(Request $request, Concern $concern): JsonResponse
    {
        $this->authorizeVisible($request, $concern);

        $concern->load([
            'user:id,name,email,role,avatar_path',
            'comments' => fn ($q) => $q->with('user:id,name,email,role,avatar_path')->latest(),
        ]);

        return response()->json([
            'concern' => $this->transform($concern),
        ]);
    }

    public function updateStatus(Request $request, Concern $concern): JsonResponse
    {
        $validated = $request->validate([
            'side' => ['required', Rule::in(['user', 'developer'])],
            'status' => ['required', 'string'],
        ]);

        $this->authorizeVisible($request, $concern);

        $actor = $request->user();
        $side = $validated['side'];
        $next = $validated['status'];

        if ($side === 'user') {
            $isOwner = $concern->user_id === $actor->id;

            if (! $isOwner) {
                abort(403, 'Only the ticket owner can update user status.');
            }

            if (! in_array($next, Concern::USER_STATUSES, true)) {
                throw ValidationException::withMessages([
                    'status' => 'Invalid user status.',
                ]);
            }

            $allowed = $concern->allowedUserTransitions();

            if ($next !== $concern->user_status && ! in_array($next, $allowed, true)) {
                throw ValidationException::withMessages([
                    'status' => "Cannot move user status from {$concern->user_status} to {$next}.",
                ]);
            }

            $concern->update(['user_status' => $next]);
        }

        if ($side === 'developer') {
            if (! $actor->isDeveloper()) {
                abort(403, 'Only developers can update developer status.');
            }

            if (! in_array($next, Concern::DEVELOPER_STATUSES, true)) {
                throw ValidationException::withMessages([
                    'status' => 'Invalid developer status.',
                ]);
            }

            $allowed = $concern->allowedDeveloperTransitions();

            if ($next !== $concern->developer_status && ! in_array($next, $allowed, true)) {
                throw ValidationException::withMessages([
                    'status' => "Cannot move developer status from {$concern->developer_status} to {$next}.",
                ]);
            }

            $concern->update(['developer_status' => $next]);
        }

        $concern->load([
            'user:id,name,email,role,avatar_path',
            'comments.user:id,name,email,role,avatar_path',
        ]);

        return response()->json([
            'concern' => $this->transform($concern),
            'message' => 'Status updated.',
        ]);
    }

    public function updateBoard(Request $request, Concern $concern): JsonResponse
    {
        $this->authorizeVisible($request, $concern);

        $validated = $request->validate([
            'board_status' => ['required', Rule::in(Concern::BOARD_STATUSES)],
        ]);

        $status = $validated['board_status'];
        $legacy = Concern::LEGACY_FOR_BOARD[$status];

        $concern->update([
            'board_status' => $status,
            'user_status' => $legacy['user_status'],
            'developer_status' => $legacy['developer_status'],
        ]);

        $concern->load([
            'user:id,name,email,role,avatar_path',
            'comments.user:id,name,email,role,avatar_path',
        ]);

        return response()->json([
            'concern' => $this->transform($concern),
            'message' => 'Board status updated.',
        ]);
    }

    public function updateMarks(Request $request, Concern $concern): JsonResponse
    {
        $this->authorizeVisible($request, $concern);

        $validated = $request->validate([
            'is_priority' => ['sometimes', 'boolean'],
            'is_coding' => ['sometimes', 'boolean'],
        ]);

        $actor = $request->user();
        $updates = [];

        if (array_key_exists('is_priority', $validated)) {
            if ($concern->user_id !== $actor->id && ! $actor->isDeveloper()) {
                abort(403, 'Only the ticket owner or a developer can set priority.');
            }

            $updates['is_priority'] = $validated['is_priority'];
        }

        if (array_key_exists('is_coding', $validated)) {
            if (! $actor->isDeveloper()) {
                abort(403, 'Only a developer can mark coding.');
            }

            $updates['is_coding'] = $validated['is_coding'];
        }

        if ($updates !== []) {
            $concern->update($updates);
        }

        $concern->load([
            'user:id,name,email,role,avatar_path',
            'comments.user:id,name,email,role,avatar_path',
        ]);

        return response()->json([
            'concern' => $this->transform($concern),
            'message' => 'Ticket marks updated.',
        ]);
    }

    private function authorizeVisible(Request $request, Concern $concern): void
    {
        if (! $concern->isVisibleTo($request->user())) {
            abort(403, 'You can only open your own tickets.');
        }
    }

    private function transform(Concern $concern): array
    {
        $imageUrl = $concern->imageUrl();

        return [
            'id' => $concern->id,
            'ticket_no' => $concern->ticket_no,
            'user_id' => $concern->user_id,
            'company' => $concern->company,
            'title' => $concern->title,
            'body' => $concern->body,
            'user_status' => $concern->user_status,
            'developer_status' => $concern->developer_status,
            'board_status' => $concern->board_status ?: 'pending',
            'is_priority' => (bool) $concern->is_priority,
            'is_coding' => (bool) $concern->is_coding,
            'allowed_user_transitions' => $concern->allowedUserTransitions(),
            'allowed_developer_transitions' => $concern->allowedDeveloperTransitions(),
            'image_url' => $imageUrl,
            'image_missing' => (bool) $concern->image_path && $imageUrl === null,
            'created_at' => $concern->created_at?->toIso8601String(),
            'updated_at' => $concern->updated_at?->toIso8601String(),
            'user' => $concern->user,
            'comments' => $concern->comments->map(fn ($comment) => [
                'id' => $comment->id,
                'body' => $comment->body,
                'workflow_status' => $comment->workflow_status ?? 'on_going',
                'image_url' => $comment->imageUrl(),
                'created_at' => $comment->created_at?->toIso8601String(),
                'user' => $comment->user,
            ])->values(),
        ];
    }
}
