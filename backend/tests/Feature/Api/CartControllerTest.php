<?php

namespace Tests\Feature\Api;

use App\Models\Cart;
use App\Models\Category;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CartControllerTest extends TestCase
{
    use RefreshDatabase;

    private User $user;
    private Product $product;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create();
        $category = Category::factory()->create(['is_active' => true]);
        $this->product = Product::factory()->create([
            'category_id' => $category->id,
            'is_active' => true,
            'stock_quantity' => 10,
        ]);
    }

    public function test_authenticated_user_can_view_cart(): void
    {
        $response = $this->actingAs($this->user)
            ->getJson('/api/cart');

        $response->assertStatus(200)
            ->assertJsonStructure(['cart']);
    }

    public function test_authenticated_user_can_add_product_to_cart(): void
    {
        $response = $this->actingAs($this->user)
            ->postJson('/api/cart/add', [
                'product_id' => $this->product->id,
                'quantity' => 2,
            ]);

        $response->assertStatus(200)
            ->assertJsonPath('message', 'Product added to cart.');
    }

    public function test_cannot_add_out_of_stock_product_to_cart(): void
    {
        $category = Category::factory()->create(['is_active' => true]);
        $outOfStockProduct = Product::factory()->create([
            'category_id' => $category->id,
            'is_active' => true,
            'stock_quantity' => 0,
            'track_quantity' => true,
            'allow_backorders' => false,
        ]);

        $response = $this->actingAs($this->user)
            ->postJson('/api/cart/add', [
                'product_id' => $outOfStockProduct->id,
                'quantity' => 1,
            ]);

        $response->assertStatus(400);
    }

    public function test_authenticated_user_can_update_cart_quantity(): void
    {
        // First add product to cart
        $this->actingAs($this->user)
            ->postJson('/api/cart/add', [
                'product_id' => $this->product->id,
                'quantity' => 1,
            ]);

        // Get the cart item
        $cart = Cart::where('user_id', $this->user->id)->first();
        $cartItem = $cart->items->first();

        // Then update quantity
        $response = $this->actingAs($this->user)
            ->putJson("/api/cart/update/{$cartItem->id}", [
                'quantity' => 5,
            ]);

        $response->assertStatus(200);
    }

    public function test_authenticated_user_can_remove_product_from_cart(): void
    {
        // First add product to cart
        $this->actingAs($this->user)
            ->postJson('/api/cart/add', [
                'product_id' => $this->product->id,
                'quantity' => 1,
            ]);

        // Get the cart item
        $cart = Cart::where('user_id', $this->user->id)->first();
        $cartItem = $cart->items->first();

        // Then remove it
        $response = $this->actingAs($this->user)
            ->deleteJson("/api/cart/remove/{$cartItem->id}");

        $response->assertStatus(200)
            ->assertJsonPath('message', 'Item removed from cart.');
    }

    public function test_authenticated_user_can_clear_cart(): void
    {
        // First add product to cart
        $this->actingAs($this->user)
            ->postJson('/api/cart/add', [
                'product_id' => $this->product->id,
                'quantity' => 1,
            ]);

        // Then clear the cart
        $response = $this->actingAs($this->user)
            ->deleteJson('/api/cart/clear');

        $response->assertStatus(200)
            ->assertJsonPath('message', 'Cart cleared.');
    }

    public function test_guest_user_can_access_cart(): void
    {
        // Cart is session-based, so guests can also access it
        $response = $this->getJson('/api/cart');

        $response->assertStatus(200)
            ->assertJsonStructure(['cart']);
    }
}
