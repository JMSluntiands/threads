<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('concerns', function (Blueprint $table) {
            $table->string('board_status')->default('pending')->after('developer_status');
        });

        DB::table('concerns')->where('user_status', 'completed')->update(['board_status' => 'completed']);
        DB::table('concerns')
            ->where('board_status', 'pending')
            ->where(function ($query) {
                $query->where('user_status', 'revised')->orWhere('developer_status', 'revised');
            })
            ->update(['board_status' => 'live_on_main_site']);
        DB::table('concerns')
            ->where('board_status', 'pending')
            ->where('developer_status', 'published')
            ->update(['board_status' => 'live_on_prod']);
        DB::table('concerns')
            ->where('board_status', 'pending')
            ->whereIn('user_status', ['working', 'not_working'])
            ->update(['board_status' => 'on_going']);
    }

    public function down(): void
    {
        Schema::table('concerns', function (Blueprint $table) {
            $table->dropColumn('board_status');
        });
    }
};
