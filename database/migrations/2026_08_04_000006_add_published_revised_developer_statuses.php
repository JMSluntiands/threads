<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('concerns')
            ->where('developer_status', 'done')
            ->update(['developer_status' => 'published']);
    }

    public function down(): void
    {
        DB::table('concerns')
            ->whereIn('developer_status', ['published', 'revised'])
            ->update(['developer_status' => 'done']);
    }
};
