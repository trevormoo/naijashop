<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Product\StoreProductRequest;
use App\Http\Requests\Product\UpdateProductRequest;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use App\Models\ProductImage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Intervention\Image\Laravel\Facades\Image;

class AdminProductController extends Controller
{
    /**
     * Display a listing of products.
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = Product::with(['category', 'images']);

        // Search
        if ($request->has('search')) {
            $query->search($request->search);
        }

        // Filter by category
        if ($request->has('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        // Filter by status
        if ($request->has('is_active')) {
            $query->where('is_active', $request->boolean('is_active'));
        }

        // Filter by stock status
        if ($request->has('stock_status')) {
            switch ($request->stock_status) {
                case 'low':
                    $query->lowStock();
                    break;
                case 'out':
                    $query->outOfStock();
                    break;
                case 'in':
                    $query->inStock();
                    break;
            }
        }

        // Sorting
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        $perPage = min($request->get('per_page', 15), 100);

        return ProductResource::collection($query->paginate($perPage));
    }

    /**
     * Store a newly created product.
     */
    public function store(StoreProductRequest $request): JsonResponse
    {
        try {
            DB::beginTransaction();

            $product = Product::create($request->validated());

            // Handle image uploads
            if ($request->hasFile('images')) {
                $this->uploadImages($product, $request->file('images'));
            }

            DB::commit();

            $product->load(['category', 'images']);

            return response()->json([
                'message' => 'Product created successfully.',
                'product' => new ProductResource($product),
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'message' => 'Failed to create product.',
                'error' => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }
    }

    /**
     * Display the specified product.
     */
    public function show(Product $product): JsonResponse
    {
        $product->load(['category', 'images', 'reviews.user']);

        return response()->json([
            'product' => new ProductResource($product),
        ]);
    }

    /**
     * Update the specified product.
     */
    public function update(UpdateProductRequest $request, Product $product): JsonResponse
    {
        $product->update($request->validated());
        $product->load(['category', 'images']);

        return response()->json([
            'message' => 'Product updated successfully.',
            'product' => new ProductResource($product),
        ]);
    }

    /**
     * Remove the specified product.
     */
    public function destroy(Product $product): JsonResponse
    {
        // Delete associated images
        foreach ($product->images as $image) {
            Storage::disk('public')->delete($image->image_path);
            if ($image->thumbnail_path) {
                Storage::disk('public')->delete($image->thumbnail_path);
            }
        }

        $product->delete();

        return response()->json([
            'message' => 'Product deleted successfully.',
        ]);
    }

    /**
     * Upload images for a product.
     */
    public function uploadImages(Request $request, Product $product): JsonResponse
    {
        $request->validate([
            'images' => ['required', 'array'],
            'images.*' => ['image', 'mimes:jpeg,png,jpg,gif,webp', 'max:2048'],
        ]);

        $uploadedImages = [];

        foreach ($request->file('images') as $index => $file) {
            $uploadedImages[] = $this->processAndStoreImage($product, $file, $index === 0 && $product->images()->count() === 0);
        }

        $product->load('images');

        return response()->json([
            'message' => 'Images uploaded successfully.',
            'images' => $uploadedImages,
        ]);
    }

    /**
     * Delete a product image.
     */
    public function deleteImage(Product $product, ProductImage $image): JsonResponse
    {
        if ($image->product_id !== $product->id) {
            return response()->json([
                'message' => 'Image not found.',
            ], 404);
        }

        // Delete files
        Storage::disk('public')->delete($image->image_path);
        if ($image->thumbnail_path) {
            Storage::disk('public')->delete($image->thumbnail_path);
        }

        $wasPrimary = $image->is_primary;
        $image->delete();

        // If deleted image was primary, set another as primary
        if ($wasPrimary) {
            $newPrimary = $product->images()->first();
            if ($newPrimary) {
                $newPrimary->update(['is_primary' => true]);
            }
        }

        return response()->json([
            'message' => 'Image deleted successfully.',
        ]);
    }

    /**
     * Set an image as primary.
     */
    public function setPrimaryImage(Product $product, ProductImage $image): JsonResponse
    {
        if ($image->product_id !== $product->id) {
            return response()->json([
                'message' => 'Image not found.',
            ], 404);
        }

        $image->setPrimary();

        return response()->json([
            'message' => 'Primary image updated.',
        ]);
    }

    /**
     * Bulk action on products.
     */
    public function bulkAction(Request $request): JsonResponse
    {
        $request->validate([
            'action' => ['required', 'in:activate,deactivate,delete,feature,unfeature'],
            'product_ids' => ['required', 'array'],
            'product_ids.*' => ['exists:products,id'],
        ]);

        $count = 0;

        switch ($request->action) {
            case 'activate':
                $count = Product::whereIn('id', $request->product_ids)
                    ->update(['is_active' => true]);
                $message = "{$count} products activated.";
                break;

            case 'deactivate':
                $count = Product::whereIn('id', $request->product_ids)
                    ->update(['is_active' => false]);
                $message = "{$count} products deactivated.";
                break;

            case 'delete':
                $products = Product::whereIn('id', $request->product_ids)->get();
                foreach ($products as $product) {
                    foreach ($product->images as $image) {
                        Storage::disk('public')->delete($image->image_path);
                    }
                    $product->delete();
                    $count++;
                }
                $message = "{$count} products deleted.";
                break;

            case 'feature':
                $count = Product::whereIn('id', $request->product_ids)
                    ->update(['is_featured' => true]);
                $message = "{$count} products featured.";
                break;

            case 'unfeature':
                $count = Product::whereIn('id', $request->product_ids)
                    ->update(['is_featured' => false]);
                $message = "{$count} products unfeatured.";
                break;
        }

        return response()->json([
            'message' => $message,
            'affected' => $count,
        ]);
    }

    /**
     * Process and store an uploaded image.
     */
    private function processAndStoreImage(Product $product, $file, bool $isPrimary = false): ProductImage
    {
        $filename = uniqid('product_') . '.' . $file->getClientOriginalExtension();
        $path = "products/{$product->id}";

        // Store original image
        $imagePath = $file->storeAs($path, $filename, 'public');

        // Create thumbnail
        $thumbnailFilename = 'thumb_' . $filename;
        $thumbnailPath = null;

        try {
            $thumbnail = Image::read($file->getPathname());
            $thumbnail->scale(width: 300);

            $thumbnailFullPath = storage_path("app/public/{$path}/{$thumbnailFilename}");

            // Ensure directory exists
            if (!file_exists(dirname($thumbnailFullPath))) {
                mkdir(dirname($thumbnailFullPath), 0755, true);
            }

            $thumbnail->save($thumbnailFullPath);
            $thumbnailPath = "{$path}/{$thumbnailFilename}";
        } catch (\Exception $e) {
            // Thumbnail creation failed, continue without thumbnail
        }

        return $product->images()->create([
            'image_path' => $imagePath,
            'thumbnail_path' => $thumbnailPath,
            'alt_text' => $product->name,
            'is_primary' => $isPrimary,
            'sort_order' => $product->images()->count(),
        ]);
    }
}
