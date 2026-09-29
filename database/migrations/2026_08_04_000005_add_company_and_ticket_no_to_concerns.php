<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('concerns', function (Blueprint $table) {
            $table->string('company')->default('luntian')->after('user_id');
            $table->string('ticket_no')->nullable()->unique()->after('id');
        });

        $concerns = \App\Models\Concern::query()->orderBy('id')->get();

        foreach ($concerns as $index => $concern) {
            $concern->forceFill([
                'ticket_no' => 'TKT-'.str_pad((string) ($index + 1), 4, '0', STR_PAD_LEFT),
                'company' => 'luntian',
            ])->save();
        }
    }

    public function down(): void
    {
        Schema::table('concerns', function (Blueprint $table) {
            $table->dropColumn(['company', 'ticket_no']);
        });
    }
};
