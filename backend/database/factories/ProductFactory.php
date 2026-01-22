<?php

namespace Database\Factories;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class ProductFactory extends Factory
{
    protected $model = Product::class;

    public function definition(): array
    {
        $name = fake()->unique()->words(3, true);
        $price = fake()->numberBetween(10000, 500000);

        return [
            'name' => ucwords($name),
            'slug' => Str::slug($name),
            'sku' => 'SKU-' . strtoupper(Str::random(8)),
            'short_description' => fake()->sentence(),
            'description' => fake()->paragraphs(3, true),
            'price' => $price,
            'compare_price' => fake()->boolean(30) ? $price * 1.2 : null,
            'cost_price' => $price * 0.7,
            'category_id' => Category::factory(),
            'stock_quantity' => fake()->numberBetween(0, 100),
            'low_stock_threshold' => 5,
            'track_quantity' => true,
            'allow_backorders' => false,
            'weight' => fake()->randomFloat(2, 0.1, 10),
            'dimensions' => null,
            'is_active' => true,
            'is_featured' => fake()->boolean(20),
            'is_digital' => false,
            'digital_file_path' => null,
            'view_count' => 0,
            'sales_count' => 0,
            'average_rating' => 0,
            'review_count' => 0,
            'meta_title' => null,
            'meta_description' => null,
            'tags' => [],
            'attributes' => [],
        ];
    }

    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => false,
        ]);
    }

    public function featured(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_featured' => true,
        ]);
    }

    public function outOfStock(): static
    {
        return $this->state(fn (array $attributes) => [
            'stock_quantity' => 0,
            'track_quantity' => true,
            'allow_backorders' => false,
        ]);
    }

    public function lowStock(): static
    {
        return $this->state(fn (array $attributes) => [
            'stock_quantity' => 3,
            'low_stock_threshold' => 5,
            'track_quantity' => true,
        ]);
    }
}
