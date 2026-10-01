<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('categories', function (Blueprint $table) {
            $table->string('id', 36)->primary();
            $table->string('name', 100);
            $table->dateTime('created_at', 3);
            $table->dateTime('updated_at', 3);
            $table->index('name', 'categories_name_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('categories');
    }
};
