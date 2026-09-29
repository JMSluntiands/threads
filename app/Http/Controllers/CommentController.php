<?php

namespace App\Http\Controllers;

use App\Models\Concern;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class CommentController extends Controller
{
    public function store(Request $request, Concern $concern): JsonResponse
    {
        if (! $concern->isVisibleTo($request->user())) {
            abort(403, 'You can only comment on your own tickets.');
        }

        $validated = $request->validate([
            'body' => ['nullable', 'required_without:image', 'string', 'max:2000'],
            'workflow_status' => ['nullable', 'string', Rule::in(Concern::DEVELOPER_STATUSES)],
            'image' => ['nullable', 'required_without:body', 'image', 'max:5120'],
        ]);

        $workflowStatus = $validated['workflow_status'] ?? $concern->developer_status;
        $imagePath = null;

        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('comments', 'public');
        }

        $comment = $concern->comments()->create([
            'user_id' => $request->user()->id,
            'body' => trim((string) ($validated['body'] ?? '')),
            'workflow_status' => $workflowStatus,
            'image_path' => $imagePath,
        ]);

        $comment->load('user:id,name,email,role,avatar_path');

        return response()->json([
            'comment' => [
                'id' => $comment->id,
                'body' => $comment->body,
                'workflow_status' => $comment->workflow_status,
                'image_url' => $comment->imageUrl(),
                'created_at' => $comment->created_at?->toIso8601String(),
                'user' => $comment->user,
            ],
            'message' => 'Comment added.',
        ], 201);
    }
}
