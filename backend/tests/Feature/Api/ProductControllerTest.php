<?php

namespace Tests\Feature\Api;

use App\Models\Category;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProductControllerTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
    }

    public function test_can_list_products(): void
    {
        $category = Category::factory()->create(['is_active' => true]);
        Product::factory()->count(5)->create([
            'category_id' => $category->id,
            'is_active' => true,
        ]);

        $response = $this->getJson('/api/products');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => [
                        'id',
                        'name',
                        'slug',
                        'price',
                        'category',
                    ]
                ],
                'links',
                'meta',
            ]);
    }

    public function test_can_filter_products_by_category(): void
    {
        $category1 = Category::factory()->create(['is_active' => true, 'slug' => 'electronics']);
        $category2 = Category::factory()->create(['is_active' => true, 'slug' => 'fashion']);

        Product::factory()->count(3)->create([
            'category_id' => $category1->id,
            'is_active' => true,
        ]);
        Product::factory()->count(2)->create([
            'category_id' => $category2->id,
            'is_active' => true,
        ]);

        $response = $this->getJson('/api/products?category=electronics');

        $response->assertStatus(200);
        $this->assertCount(3, $response->json('data'));
    }

    public function test_can_search_products(): void
    {
        $category = Category::factory()->create(['is_active' => true]);
        Product::factory()->create([
            'category_id' => $category->id,
            'name' => 'iPhone 15 Pro',
            'is_active' => true,
        ]);
        Product::factory()->create([
            'category_id' => $category->id,
            'name' => 'Samsung Galaxy',
            'is_active' => true,
        ]);

        $response = $this->getJson('/api/products/search?q=iPhone');

        $response->assertStatus(200);
        $this->assertCount(1, $response->json('data'));
        $this->assertEquals('iPhone 15 Pro', $response->json('data.0.name'));
    }

    public function test_can_get_featured_products(): void
    {
        $category = Category::factory()->create(['is_active' => true]);
        Product::factory()->count(3)->create([
            'category_id' => $category->id,
            'is_active' => true,
            'is_featured' => true,
        ]);
        Product::factory()->count(2)->create([
            'category_id' => $category->id,
            'is_active' => true,
            'is_featured' => false,
        ]);

        $response = $this->getJson('/api/products/featured');

        $response->assertStatus(200);
        $this->assertCount(3, $response->json('data'));
    }

    public function test_can_get_single_product(): void
    {
        $category = Category::factory()->create(['is_active' => true]);
        $product = Product::factory()->create([
            'category_id' => $category->id,
            'is_active' => true,
        ]);

        $response = $this->getJson("/api/products/{$product->slug}");

        $response->assertStatus(200)
            ->assertJsonPath('product.id', $product->id)
            ->assertJsonPath('product.name', $product->name);
    }

    public function test_inactive_product_returns_404(): void
    {
        $category = Category::factory()->create(['is_active' => true]);
        $product = Product::factory()->create([
            'category_id' => $category->id,
            'is_active' => false,
        ]);

        $response = $this->getJson("/api/products/{$product->slug}");

        $response->assertStatus(404);
    }
}
