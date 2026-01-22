<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Products table stores all product information including pricing,
     * stock management, and SEO metadata.
     */
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('sku')->unique()->nullable();
            $table->text('short_description')->nullable();
            $table->longText('description')->nullable();
            $table->decimal('price', 12, 2);
            $table->decimal('compare_price', 12, 2)->nullable(); // Original price for discounts
            $table->decimal('cost_price', 12, 2)->nullable(); // For profit calculations
            $table->foreignId('category_id')->nullable()->constrained()->nullOnDelete();
            $table->integer('stock_quantity')->default(0);
            $table->integer('low_stock_threshold')->default(5);
            $table->boolean('track_quantity')->default(true);
            $table->boolean('allow_backorders')->default(false);
            $table->decimal('weight', 8, 2)->nullable(); // in kg
            $table->string('dimensions')->nullable(); // JSON: {length, width, height}
            $table->boolean('is_active')->default(true);
            $table->boolean('is_featured')->default(false);
            $table->boolean('is_digital')->default(false);
            $table->string('digital_file_path')->nullable(); // For digital products
            $table->integer('view_count')->default(0);
            $table->integer('sales_count')->default(0);
            $table->decimal('average_rating', 3, 2)->default(0);
            $table->integer('review_count')->default(0);
            $table->string('meta_title')->nullable();
            $table->text('meta_description')->nullable();
            $table->json('tags')->nullable();
            $table->json('attributes')->nullable(); // Size, Color, Material, etc.
            $table->timestamps();
            $table->softDeletes();

            // Indexes for performance
            $table->index('slug');
            $table->index('sku');
            $table->index('category_id');
            $table->index('is_active');
            $table->index('is_featured');
            $table->index('price');
            $table->index('stock_quantity');
            $table->index('average_rating');
            $table->index('sales_count');
            $table->index('created_at');

            // Full-text search index
            $table->fullText(['name', 'short_description', 'description']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
