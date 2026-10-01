<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->string('id', 36)->primary();
            $table->string('name', 150);
            $table->string('slug', 190)->unique('products_slug_key');
            $table->text('description')->nullable();
            $table->decimal('price', 10, 2)->nullable();
            $table->string('category_id', 36)->nullable();
            $table->enum('status', ['active', 'draft', 'deactivated', 'deleted'])->default('draft');
            $table->string('meta_title', 70)->nullable();
            $table->string('meta_description', 160)->nullable();
            $table->string('meta_keywords', 255)->nullable();
            $table->decimal('rating_avg', 3, 2)->default(0);
            $table->unsignedInteger('rating_count')->default(0);
            $table->string('created_by', 36)->nullable();
            $table->dateTime('created_at', 3);
            $table->dateTime('updated_at', 3);

            $table->index('status', 'products_status_idx');
            $table->index('price', 'products_price_idx');
            $table->index('rating_avg', 'products_rating_avg_idx');
            $table->index('created_at', 'products_created_at_idx');
            $table->index('category_id', 'products_category_id_idx');
            $table->foreign('category_id', 'products_category_id_fkey')->references('id')->on('categories')->nullOnDelete();
            $table->foreign('created_by', 'products_created_by_fkey')->references('id')->on('users')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
