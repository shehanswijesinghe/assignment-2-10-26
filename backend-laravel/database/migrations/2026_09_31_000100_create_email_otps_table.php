<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('email_otps', function (Blueprint $table) {
            $table->string('id', 36)->primary();
            $table->string('user_id', 36)->index('email_otps_user_id_idx');
            $table->string('code_hash', 64);
            $table->dateTime('expires_at', 3);
            $table->dateTime('consumed_at', 3)->nullable();
            $table->dateTime('created_at', 3);

            $table->foreign('user_id', 'email_otps_user_id_fkey')->references('id')->on('users')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('email_otps');
    }
};
