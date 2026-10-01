<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->string('id', 36)->primary();
            $table->string('email', 255)->unique('users_email_key');
            $table->string('password_hash', 191);
            $table->string('first_name', 100);
            $table->string('last_name', 100);
            $table->enum('role', ['USER', 'ADMIN'])->default('USER');
            $table->enum('status', ['email_approval_pending', 'email_approved', 'admin_pending', 'activated', 'deactivated', 'deleted'])
                ->default('email_approval_pending');
            $table->dateTime('created_at', 3);
            $table->dateTime('updated_at', 3);

            $table->index('status', 'users_status_idx');
            $table->index('created_at', 'users_created_at_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};
