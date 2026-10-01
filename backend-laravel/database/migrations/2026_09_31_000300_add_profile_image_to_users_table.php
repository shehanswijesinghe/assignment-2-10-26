<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('avatar_base_url', 255)->nullable()->after('status');
            $table->string('avatar_folder', 255)->nullable()->after('avatar_base_url');
            $table->string('avatar_name', 255)->nullable()->after('avatar_folder');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['avatar_base_url', 'avatar_folder', 'avatar_name']);
        });
    }
};
