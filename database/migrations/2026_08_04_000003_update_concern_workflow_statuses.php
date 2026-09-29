<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('concerns')->where('status', 'open')->update(['status' => 'submitted']);
    }

    public function down(): void
    {
        DB::table('concerns')->where('status', 'submitted')->update(['status' => 'open']);
        DB::table('concerns')->whereIn('status', ['under_review', 'closed'])->update(['status' => 'open']);
    }
};
