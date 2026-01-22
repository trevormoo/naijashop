<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\CategoryResource;
use App\Http\Resources\ProductResource;
use App\Models\Category;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class CategoryController extends Controller
{
    /**
     * Display a listing of categories.
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = Category::active()->ordered();

        // Only root categories if specified
        if ($request->boolean('root_only')) {
            $query->root();
        }

        // Include children
        if ($request->boolean('with_children')) {
            $query->with('children');
        }

        $categories = $query->get();

        return CategoryResource::collection($categories);
    }

    /**
     * Get category tree structure.
     */
    public function tree(): JsonResponse
    {
        $categories = Category::getTree();

        return response()->json([
            'categories' => CategoryResource::collection($categories),
        ]);
    }

    /**
     * Display featured categories.
     */
    public function featured(Request $request): AnonymousResourceCollection
    {
        $limit = min($request->get('limit', 6), 12);

        $categories = Category::active()
            ->featured()
            ->ordered()
            ->limit($limit)
            ->get();

        return CategoryResource::collection($categories);
    }

    /**
     * Display the specified category.
     */
    public function show(Category $category): JsonResponse
    {
        if (!$category->is_active) {
            return response()->json([
                'message' => 'Category not found.',
            ], 404);
        }

        $category->load(['parent', 'children']);

        return response()->json([
            'category' => new CategoryResource($category),
        ]);
    }

    /**
     * Display products in a category.
     */
    public function products(Request $request, Category $category): AnonymousResourceCollection
    {
        if (!$category->is_active) {
            abort(404, 'Category not found.');
        }

        // Get all category IDs (including children)
        $categoryIds = collect([$category->id]);

        if ($request->boolean('include_children')) {
            $categoryIds = $categoryIds->merge(
                $category->children()->active()->pluck('id')
            );
        }

        $query = $category->products()
            ->with(['category', 'images'])
            ->active();

        // Include children products
        if ($request->boolean('include_children')) {
            $query = \App\Models\Product::with(['category', 'images'])
                ->active()
                ->whereIn('category_id', $categoryIds);
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

        // Sorting
        $sortBy = $request->get('sort_by', 'created_at');

        switch ($sortBy) {
            case 'price_low':
                $query->orderBy('price', 'asc');
                break;
            case 'price_high':
                $query->orderBy('price', 'desc');
                break;
            case 'name':
                $query->orderBy('name', 'asc');
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
}
