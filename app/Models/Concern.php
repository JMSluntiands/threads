<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Support\StoredFile;

#[Fillable(['user_id', 'company', 'ticket_no', 'title', 'body', 'image_path', 'user_status', 'developer_status', 'board_status', 'is_priority', 'is_coding'])]
class Concern extends Model
{
    protected function casts(): array
    {
        return [
            'is_priority' => 'boolean',
            'is_coding' => 'boolean',
        ];
    }

    public const COMPANIES = [
        'luntian',
        'bluinq',
    ];

    public const USER_STATUSES = [
        'pending',
        'working',
        'not_working',
        'revised',
        'completed',
    ];

    public const DEVELOPER_STATUSES = [
        'on_going',
        'published',
        'revised',
    ];

    public const BOARD_STATUSES = [
        'pending',
        'on_going',
        'live_on_dev',
        'live_on_prod',
        'live_on_main_site',
        'completed',
    ];

    public const LEGACY_FOR_BOARD = [
        'pending' => ['user_status' => 'pending', 'developer_status' => 'on_going'],
        'on_going' => ['user_status' => 'working', 'developer_status' => 'on_going'],
        'live_on_dev' => ['user_status' => 'working', 'developer_status' => 'on_going'],
        'live_on_prod' => ['user_status' => 'working', 'developer_status' => 'published'],
        'live_on_main_site' => ['user_status' => 'revised', 'developer_status' => 'revised'],
        'completed' => ['user_status' => 'completed', 'developer_status' => 'revised'],
    ];

    public const USER_WORKFLOW = [
        'pending' => ['working', 'not_working', 'revised', 'completed'],
        'working' => ['pending', 'not_working', 'revised', 'completed'],
        'not_working' => ['pending', 'working', 'revised', 'completed'],
        'revised' => ['working', 'completed', 'pending'],
        'completed' => ['pending', 'working', 'revised'],
    ];

    public const DEVELOPER_WORKFLOW = [
        'on_going' => ['published', 'revised'],
        'published' => ['revised', 'on_going'],
        'revised' => ['published', 'on_going'],
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function scopeVisibleTo(Builder $query, User $user): Builder
    {
        if (! $user->isDeveloper()) {
            $query->where('user_id', $user->id);
        }

        return $query;
    }

    public function isVisibleTo(User $user): bool
    {
        return $user->isDeveloper() || $this->user_id === $user->id;
    }

    public function comments(): HasMany
    {
        return $this->hasMany(Comment::class)->latest();
    }

    public function imageUrl(): ?string
    {
        return StoredFile::url($this->image_path);
    }

    public function allowedUserTransitions(): array
    {
        return self::USER_WORKFLOW[$this->user_status] ?? self::USER_STATUSES;
    }

    public function allowedDeveloperTransitions(): array
    {
        return self::DEVELOPER_WORKFLOW[$this->developer_status] ?? self::DEVELOPER_STATUSES;
    }

    public static function nextTicketNo(): string
    {
        $latest = static::query()->orderByDesc('id')->value('id') ?? 0;

        return 'TKT-'.str_pad((string) ($latest + 1), 4, '0', STR_PAD_LEFT);
    }
}
