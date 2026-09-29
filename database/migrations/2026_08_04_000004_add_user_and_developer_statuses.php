<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('role')->default('user')->after('email');
        });

        Schema::table('concerns', function (Blueprint $table) {
            $table->string('user_status')->default('open')->after('body');
            $table->string('developer_status')->default('queued')->after('user_status');
        });

        $userMap = [
            'open' => 'open',
            'submitted' => 'open',
            'under_review' => 'waiting',
            'in_progress' => 'waiting',
            'resolved' => 'confirmed',
            'closed' => 'closed',
        ];

        $developerMap = [
            'open' => 'queued',
            'submitted' => 'queued',
            'under_review' => 'queued',
            'in_progress' => 'in_progress',
            'resolved' => 'done',
            'closed' => 'done',
        ];

        foreach (DB::table('concerns')->get(['id', 'status']) as $concern) {
            DB::table('concerns')->where('id', $concern->id)->update([
                'user_status' => $userMap[$concern->status] ?? 'open',
                'developer_status' => $developerMap[$concern->status] ?? 'queued',
            ]);
        }

        Schema::table('concerns', function (Blueprint $table) {
            $table->dropColumn('status');
        });
    }

    public function down(): void
    {
        Schema::table('concerns', function (Blueprint $table) {
            $table->string('status')->default('submitted')->after('body');
        });

        foreach (DB::table('concerns')->get(['id', 'developer_status', 'user_status']) as $concern) {
            $status = match ($concern->developer_status) {
                'queued' => 'submitted',
                'in_progress', 'blocked', 'review' => 'in_progress',
                'done' => $concern->user_status === 'closed' ? 'closed' : 'resolved',
                default => 'submitted',
            };

            DB::table('concerns')->where('id', $concern->id)->update(['status' => $status]);
        }

        Schema::table('concerns', function (Blueprint $table) {
            $table->dropColumn(['user_status', 'developer_status']);
        });

        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('role');
        });
    }
};
