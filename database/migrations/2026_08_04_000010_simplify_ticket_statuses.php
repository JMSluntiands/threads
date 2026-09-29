<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $userMap = [
            'open' => 'pending',
            'waiting' => 'pending',
            'confirmed' => 'working',
            'closed' => 'not_working',
        ];

        foreach ($userMap as $from => $to) {
            DB::table('concerns')->where('user_status', $from)->update(['user_status' => $to]);
        }

        $developerMap = [
            'queued' => 'on_going',
            'in_progress' => 'on_going',
            'blocked' => 'on_going',
            'review' => 'on_going',
            'done' => 'published',
        ];

        foreach ($developerMap as $from => $to) {
            DB::table('concerns')->where('developer_status', $from)->update(['developer_status' => $to]);
        }

        $commentMap = [
            'queued' => 'on_going',
            'in_progress' => 'on_going',
            'blocked' => 'on_going',
            'review' => 'on_going',
            'done' => 'published',
        ];

        foreach ($commentMap as $from => $to) {
            DB::table('comments')->where('workflow_status', $from)->update(['workflow_status' => $to]);
        }

        DB::table('comments')->whereNull('workflow_status')->update(['workflow_status' => 'on_going']);
    }

    public function down(): void
    {
        DB::table('concerns')->where('user_status', 'pending')->update(['user_status' => 'open']);
        DB::table('concerns')->where('user_status', 'working')->update(['user_status' => 'waiting']);
        DB::table('concerns')->where('user_status', 'not_working')->update(['user_status' => 'closed']);

        DB::table('concerns')->where('developer_status', 'on_going')->update(['developer_status' => 'queued']);

        DB::table('comments')->where('workflow_status', 'on_going')->update(['workflow_status' => 'queued']);
    }
};
