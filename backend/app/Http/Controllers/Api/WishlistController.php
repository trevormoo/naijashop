<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use App\Models\Wishlist;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class WishlistController extends Controller
{
    /**
     * Get user's wishlist
     */
    public function index(Request $request): JsonResponse
    {
        $wishlistItems = Wishlist::with(['product.category', 'product.images'])
            ->where('user_id', $request->user()->id)
            ->latest()
            ->paginate(12);

        $products = $wishlistItems->getCollection()->map(function ($item) {
            return $item->product;
        });

        return response()->json([
            'data' => ProductResource::collection($products),
            'meta' => [
                'current_page' => $wishlistItems->currentPage(),
                'last_page' => $wishlistItems->lastPage(),
                'per_page' => $wishlistItems->perPage(),
                'total' => $wishlistItems->total(),
            ],
        ]);
    }

    /**
     * Add product to wishlist
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
        ]);

        $product = Product::findOrFail($request->product_id);

        $exists = Wishlist::where('user_id', $request->user()->id)
            ->where('product_id', $product->id)
            ->exists();

        if ($exists) {
            return response()->json([
                'message' => 'Product already in wishlist',
            ], 422);
        }

        Wishlist::create([
            'user_id' => $request->user()->id,
            'product_id' => $product->id,
        ]);

        return response()->json([
            'message' => 'Product added to wishlist',
        ], 201);
    }

    /**
     * Remove product from wishlist
     */
    public function destroy(Request $request, Product $product): JsonResponse
    {
        $deleted = Wishlist::where('user_id', $request->user()->id)
            ->where('product_id', $product->id)
            ->delete();

        if (!$deleted) {
            return response()->json([
                'message' => 'Product not found in wishlist',
            ], 404);
        }

        return response()->json([
            'message' => 'Product removed from wishlist',
        ]);
    }

    /**
     * Toggle product in wishlist
     */
    public function toggle(Request $request): JsonResponse
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
        ]);

        $wishlistItem = Wishlist::where('user_id', $request->user()->id)
            ->where('product_id', $request->product_id)
            ->first();

        if ($wishlistItem) {
            $wishlistItem->delete();
            return response()->json([
                'message' => 'Product removed from wishlist',
                'in_wishlist' => false,
            ]);
        }

        Wishlist::create([
            'user_id' => $request->user()->id,
            'product_id' => $request->product_id,
        ]);

        return response()->json([
            'message' => 'Product added to wishlist',
            'in_wishlist' => true,
        ], 201);
    }

    /**
     * Check if product is in wishlist
     */
    public function check(Request $request, Product $product): JsonResponse
    {
        $inWishlist = Wishlist::where('user_id', $request->user()->id)
            ->where('product_id', $product->id)
            ->exists();

        return response()->json([
            'in_wishlist' => $inWishlist,
        ]);
    }

    /**
     * Clear entire wishlist
     */
    public function clear(Request $request): JsonResponse
    {
        Wishlist::where('user_id', $request->user()->id)->delete();

        return response()->json([
            'message' => 'Wishlist cleared',
        ]);
    }

    /**
     * Move item from wishlist to cart
     */
    public function moveToCart(Request $request, Product $product): JsonResponse
    {
        $wishlistItem = Wishlist::where('user_id', $request->user()->id)
            ->where('product_id', $product->id)
            ->first();

        if (!$wishlistItem) {
            return response()->json([
                'message' => 'Product not found in wishlist',
            ], 404);
        }

        if (!$product->in_stock) {
            return response()->json([
                'message' => 'Product is out of stock',
            ], 422);
        }

        // Get or create cart
        $cart = $request->user()->cart()->firstOrCreate([
            'user_id' => $request->user()->id,
        ]);

        // Add to cart
        $cartItem = $cart->items()->where('product_id', $product->id)->first();

        if ($cartItem) {
            $cartItem->increment('quantity');
        } else {
            $cart->items()->create([
                'product_id' => $product->id,
                'quantity' => 1,
                'price' => $product->price,
            ]);
        }

        // Remove from wishlist
        $wishlistItem->delete();

        return response()->json([
            'message' => 'Product moved to cart',
        ]);
    }
}
