<?php

namespace Tests\Unit\Models;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProductTest extends TestCase
{
    use RefreshDatabase;

    public function test_product_has_in_stock_attribute_when_quantity_available(): void
    {
        $category = Category::factory()->create();
        $product = Product::factory()->create([
            'category_id' => $category->id,
            'stock_quantity' => 10,
            'track_quantity' => true,
            'allow_backorders' => false,
        ]);

        $this->assertTrue($product->in_stock);
    }

    public function test_product_is_not_in_stock_when_quantity_zero(): void
    {
        $category = Category::factory()->create();
        $product = Product::factory()->create([
            'category_id' => $category->id,
            'stock_quantity' => 0,
            'track_quantity' => true,
            'allow_backorders' => false,
        ]);

        $this->assertFalse($product->in_stock);
    }

    public function test_product_is_in_stock_with_backorders_allowed(): void
    {
        $category = Category::factory()->create();
        $product = Product::factory()->create([
            'category_id' => $category->id,
            'stock_quantity' => 0,
            'track_quantity' => true,
            'allow_backorders' => true,
        ]);

        $this->assertTrue($product->in_stock);
    }

    public function test_product_is_always_in_stock_when_not_tracking_quantity(): void
    {
        $category = Category::factory()->create();
        $product = Product::factory()->create([
            'category_id' => $category->id,
            'stock_quantity' => 0,
            'track_quantity' => false,
        ]);

        $this->assertTrue($product->in_stock);
    }

    public function test_product_calculates_discount_percentage(): void
    {
        $category = Category::factory()->create();
        $product = Product::factory()->create([
            'category_id' => $category->id,
            'price' => 80000,
            'compare_price' => 100000,
        ]);

        $this->assertEquals(20, $product->discount_percentage);
    }

    public function test_product_discount_is_null_when_no_compare_price(): void
    {
        $category = Category::factory()->create();
        $product = Product::factory()->create([
            'category_id' => $category->id,
            'price' => 80000,
            'compare_price' => null,
        ]);

        $this->assertNull($product->discount_percentage);
    }

    public function test_product_identifies_low_stock(): void
    {
        $category = Category::factory()->create();
        $product = Product::factory()->create([
            'category_id' => $category->id,
            'stock_quantity' => 3,
            'low_stock_threshold' => 5,
            'track_quantity' => true,
        ]);

        $this->assertTrue($product->is_low_stock);
    }

    public function test_product_can_decrement_stock(): void
    {
        $category = Category::factory()->create();
        $product = Product::factory()->create([
            'category_id' => $category->id,
            'stock_quantity' => 10,
            'track_quantity' => true,
        ]);

        $result = $product->decrementStock(3);

        $this->assertTrue($result);
        $product->refresh();
        $this->assertEquals(7, $product->stock_quantity);
        $this->assertEquals(3, $product->sales_count);
    }

    public function test_product_cannot_decrement_stock_below_zero_without_backorders(): void
    {
        $category = Category::factory()->create();
        $product = Product::factory()->create([
            'category_id' => $category->id,
            'stock_quantity' => 2,
            'track_quantity' => true,
            'allow_backorders' => false,
        ]);

        $result = $product->decrementStock(5);

        $this->assertFalse($result);
        $product->refresh();
        $this->assertEquals(2, $product->stock_quantity);
    }

    public function test_product_belongs_to_category(): void
    {
        $category = Category::factory()->create(['name' => 'Electronics']);
        $product = Product::factory()->create(['category_id' => $category->id]);

        $this->assertEquals('Electronics', $product->category->name);
    }

    public function test_product_generates_slug_on_creation(): void
    {
        $category = Category::factory()->create();
        $product = Product::factory()->create([
            'category_id' => $category->id,
            'name' => 'iPhone 15 Pro Max',
            'slug' => null,
        ]);

        $this->assertEquals('iphone-15-pro-max', $product->slug);
    }
}
