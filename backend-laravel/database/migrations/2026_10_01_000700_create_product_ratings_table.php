<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('product_ratings', function (Blueprint $table) {
            $table->string('id', 36)->primary();
            $table->string('product_id', 36);
            $table->string('user_id', 36);
            $table->unsignedTinyInteger('rating');
            $table->dateTime('created_at', 3);
            $table->dateTime('updated_at', 3);
            $table->unique(['product_id', 'user_id'], 'product_ratings_product_user_key');
            $table->foreign('product_id', 'product_ratings_product_id_fkey')->references('id')->on('products')->cascadeOnDelete();
            $table->foreign('user_id', 'product_ratings_user_id_fkey')->references('id')->on('users')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('product_ratings');
    }
};
