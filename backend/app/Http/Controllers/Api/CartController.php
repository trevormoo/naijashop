<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\CartResource;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Coupon;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CartController extends Controller
{
    /**
     * Get current cart.
     */
    public function index(Request $request): JsonResponse
    {
        $cart = $this->getCart($request);
        $cart->load('items.product.images');

        return response()->json([
            'cart' => new CartResource($cart),
        ]);
    }

    /**
     * Add item to cart.
     */
    public function add(Request $request): JsonResponse
    {
        $request->validate([
            'product_id' => ['required', 'exists:products,id'],
            'quantity' => ['nullable', 'integer', 'min:1', 'max:100'],
            'options' => ['nullable', 'array'],
        ]);

        $product = Product::findOrFail($request->product_id);

        // Check if product is active and in stock
        if (!$product->is_active) {
            return response()->json([
                'message' => 'This product is not available.',
            ], 400);
        }

        if (!$product->in_stock) {
            return response()->json([
                'message' => 'This product is out of stock.',
            ], 400);
        }

        $quantity = $request->get('quantity', 1);

        // Check stock quantity
        if ($product->track_quantity && !$product->allow_backorders) {
            if ($product->stock_quantity < $quantity) {
                return response()->json([
                    'message' => "Only {$product->stock_quantity} items available in stock.",
                ], 400);
            }
        }

        $cart = $this->getCart($request);
        $cartItem = $cart->addProduct($product, $quantity, $request->get('options', []));

        $cart->load('items.product.images');

        return response()->json([
            'message' => 'Product added to cart.',
            'cart' => new CartResource($cart),
        ]);
    }

    /**
     * Update cart item quantity.
     */
    public function update(Request $request, CartItem $cartItem): JsonResponse
    {
        $request->validate([
            'quantity' => ['required', 'integer', 'min:0', 'max:100'],
        ]);

        // Verify item belongs to user's cart
        $cart = $this->getCart($request);
        if ($cartItem->cart_id !== $cart->id) {
            return response()->json([
                'message' => 'Cart item not found.',
            ], 404);
        }

        $quantity = $request->quantity;

        if ($quantity === 0) {
            $cart->removeItem($cartItem);
            $message = 'Item removed from cart.';
        } else {
            // Check stock
            $product = $cartItem->product;
            if ($product->track_quantity && !$product->allow_backorders) {
                if ($product->stock_quantity < $quantity) {
                    return response()->json([
                        'message' => "Only {$product->stock_quantity} items available in stock.",
                    ], 400);
                }
            }

            $cart->updateItemQuantity($cartItem, $quantity);
            $message = 'Cart updated.';
        }

        $cart->load('items.product.images');

        return response()->json([
            'message' => $message,
            'cart' => new CartResource($cart),
        ]);
    }

    /**
     * Remove item from cart.
     */
    public function remove(Request $request, CartItem $cartItem): JsonResponse
    {
        $cart = $this->getCart($request);

        if ($cartItem->cart_id !== $cart->id) {
            return response()->json([
                'message' => 'Cart item not found.',
            ], 404);
        }

        $cart->removeItem($cartItem);
        $cart->load('items.product.images');

        return response()->json([
            'message' => 'Item removed from cart.',
            'cart' => new CartResource($cart),
        ]);
    }

    /**
     * Clear the cart.
     */
    public function clear(Request $request): JsonResponse
    {
        $cart = $this->getCart($request);
        $cart->clear();

        return response()->json([
            'message' => 'Cart cleared.',
            'cart' => new CartResource($cart),
        ]);
    }

    /**
     * Apply coupon code.
     */
    public function applyCoupon(Request $request): JsonResponse
    {
        $request->validate([
            'code' => ['required', 'string'],
        ]);

        $cart = $this->getCart($request);

        if ($cart->is_empty) {
            return response()->json([
                'message' => 'Your cart is empty.',
            ], 400);
        }

        $coupon = Coupon::where('code', strtoupper($request->code))->first();

        if (!$coupon) {
            return response()->json([
                'message' => 'Invalid coupon code.',
            ], 400);
        }

        // Validate coupon
        $error = $coupon->getValidationError($cart->subtotal, auth()->id());
        if ($error) {
            return response()->json([
                'message' => $error,
            ], 400);
        }

        // Apply coupon
        $cart->update(['coupon_code' => $coupon->code]);
        $cart->recalculate();
        $cart->load('items.product.images');

        return response()->json([
            'message' => 'Coupon applied successfully.',
            'cart' => new CartResource($cart),
            'discount' => $coupon->calculateDiscount($cart->subtotal),
        ]);
    }

    /**
     * Remove coupon code.
     */
    public function removeCoupon(Request $request): JsonResponse
    {
        $cart = $this->getCart($request);
        $cart->removeCoupon();
        $cart->load('items.product.images');

        return response()->json([
            'message' => 'Coupon removed.',
            'cart' => new CartResource($cart),
        ]);
    }

    /**
     * Get or create cart for current user/session.
     */
    private function getCart(Request $request): Cart
    {
        if (auth()->check()) {
            $cart = Cart::getOrCreate(auth()->id());

            // Merge session cart if exists
            $sessionCart = Cart::where('session_id', session()->getId())
                ->whereNull('user_id')
                ->first();

            if ($sessionCart) {
                $cart->mergeWith($sessionCart);
            }

            return $cart;
        }

        return Cart::getOrCreate(null, session()->getId());
    }
}
