<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use App\Models\RecentlyViewed;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ProductController extends Controller
{
    /**
     * Display a listing of products.
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = Product::with(['category', 'images'])
            ->active();

        // Filter by category
        if ($request->has('category')) {
            $query->whereHas('category', function ($q) use ($request) {
                $q->where('slug', $request->category);
            });
        }

        // Filter by price range
        if ($request->has('min_price')) {
            $query->where('price', '>=', $request->min_price);
        }
        if ($request->has('max_price')) {
            $query->where('price', '<=', $request->max_price);
        }

        // Filter by stock status
        if ($request->boolean('in_stock')) {
            $query->inStock();
        }

        // Search
        if ($request->has('search')) {
            $query->search($request->search);
        }

        // Sorting
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');

        switch ($sortBy) {
            case 'price_low':
                $query->orderBy('price', 'asc');
                break;
            case 'price_high':
                $query->orderBy('price', 'desc');
                break;
            case 'name':
                $query->orderBy('name', $sortOrder);
                break;
            case 'rating':
                $query->orderBy('average_rating', 'desc');
                break;
            case 'popularity':
                $query->orderBy('sales_count', 'desc');
                break;
            default:
                $query->orderBy('created_at', 'desc');
        }

        $perPage = min($request->get('per_page', 12), 50);
        $products = $query->paginate($perPage);

        return ProductResource::collection($products);
    }

    /**
     * Display featured products.
     */
    public function featured(Request $request): AnonymousResourceCollection
    {
        $limit = min($request->get('limit', 8), 20);

        $products = Product::with(['category', 'images'])
            ->active()
            ->featured()
            ->inStock()
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get();

        return ProductResource::collection($products);
    }

    /**
     * Search products.
     */
    public function search(Request $request): AnonymousResourceCollection
    {
        $request->validate([
            'q' => ['required', 'string', 'min:2'],
        ]);

        $query = Product::with(['category', 'images'])
            ->active()
            ->search($request->q);

        $perPage = min($request->get('per_page', 12), 50);
        $products = $query->paginate($perPage);

        return ProductResource::collection($products);
    }

    /**
     * Display the specified product.
     */
    public function show(Request $request, Product $product): JsonResponse
    {
        if (!$product->is_active) {
            return response()->json([
                'message' => 'Product not found.',
            ], 404);
        }

        // Increment view count
        $product->increment('view_count');

        // Record recently viewed
        RecentlyViewed::recordView(
            $product->id,
            auth()->id(),
            session()->getId()
        );

        // Load relationships
        $product->load(['category', 'images', 'approvedReviews.user']);

        return response()->json([
            'product' => new ProductResource($product),
        ]);
    }

    /**
     * Get related products.
     */
    public function related(Product $product): AnonymousResourceCollection
    {
        $relatedProducts = $product->getRelatedProducts(8);

        return ProductResource::collection($relatedProducts);
    }

    /**
     * Get recently viewed products.
     */
    public function recentlyViewed(Request $request): AnonymousResourceCollection
    {
        $limit = min($request->get('limit', 10), 20);

        $products = RecentlyViewed::getRecentProducts(
            auth()->id(),
            session()->getId(),
            $limit
        );

        return ProductResource::collection($products);
    }
}
