<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('product_images', function (Blueprint $table) {
            $table->string('id', 36)->primary();
            $table->string('product_id', 36);
            $table->string('base_url', 255);
            $table->string('folder', 255);
            $table->string('name', 255);
            $table->unsignedTinyInteger('position')->default(0);
            $table->dateTime('created_at', 3);
            $table->index(['product_id', 'position'], 'product_images_product_position_idx');
            $table->index('name', 'product_images_name_idx');
            $table->foreign('product_id', 'product_images_product_id_fkey')->references('id')->on('products')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('product_images');
    }
};
