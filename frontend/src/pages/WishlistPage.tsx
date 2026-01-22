import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Trash2, Loader2 } from 'lucide-react';
import { wishlistApi } from '@/services/api';
import { useCart } from '@/context/CartContext';
import { Product } from '@/types';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import toast from 'react-hot-toast';

export default function WishlistPage() {
  const { addToCart } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [removingIds, setRemovingIds] = useState<Set<number>>(new Set());
  const [movingToCartIds, setMovingToCartIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
  setIsLoading(true);
  try {
    const response = await wishlistApi.get();
    const res = response as any;
    setProducts(res.data.data);
  } catch (error) {
    console.error('Failed to fetch wishlist:', error);
    toast.error('Failed to load wishlist');
  } finally {
    setIsLoading(false);
  }
};

  const handleRemove = async (productId: number) => {
    setRemovingIds((prev) => new Set(prev).add(productId));
    try {
      await wishlistApi.remove(productId);
      setProducts((prev) => prev.filter((p) => p.id !== productId));
      toast.success('Removed from wishlist');
    } catch (error) {
      toast.error('Failed to remove from wishlist');
    } finally {
      setRemovingIds((prev) => {
        const next = new Set(prev);
        next.delete(productId);
        return next;
      });
    }
  };

  const handleMoveToCart = async (product: Product) => {
    if (!product.in_stock) {
      toast.error('This product is out of stock');
      return;
    }

    setMovingToCartIds((prev) => new Set(prev).add(product.id));
    try {
      await addToCart(product.id);
      await wishlistApi.remove(product.id);
      setProducts((prev) => prev.filter((p) => p.id !== product.id));
      toast.success('Moved to cart');
    } catch (error) {
      toast.error('Failed to move to cart');
    } finally {
      setMovingToCartIds((prev) => {
        const next = new Set(prev);
        next.delete(product.id);
        return next;
      });
    }
  };

  const handleClearWishlist = async () => {
    if (!confirm('Are you sure you want to clear your wishlist?')) return;

    try {
      await wishlistApi.clear();
      setProducts([]);
      toast.success('Wishlist cleared');
    } catch (error) {
      toast.error('Failed to clear wishlist');
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="container-custom">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">My Wishlist ({products.length})</h1>
          {products.length > 0 && (
            <button
              onClick={handleClearWishlist}
              className="text-red-600 hover:text-red-700 text-sm font-medium"
            >
              Clear All
            </button>
          )}
        </div>

        {products.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Your wishlist is empty
            </h2>
            <p className="text-gray-500 mb-6">
              Save items you like by clicking the heart icon on products.
            </p>
            <Link to="/products" className="btn btn-primary">
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-lg shadow-sm overflow-hidden group"
              >
                <Link to={`/products/${product.slug}`} className="block relative">
                  <img
                    src={product.primary_image || '/images/placeholder-product.png'}
                    alt={product.name}
                    className="w-full h-48 object-cover"
                  />
                  {product.discount_percentage && (
                    <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                      -{product.discount_percentage}%
                    </span>
                  )}
                  {!product.in_stock && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <span className="bg-white text-gray-900 px-3 py-1 rounded font-medium">
                        Out of Stock
                      </span>
                    </div>
                  )}
                </Link>

                <div className="p-4">
                  <Link
                    to={`/products/${product.slug}`}
                    className="font-medium text-gray-900 hover:text-primary-600 line-clamp-2 mb-2"
                  >
                    {product.name}
                  </Link>

                  {product.category && (
                    <p className="text-xs text-gray-500 mb-2">{product.category.name}</p>
                  )}

                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-lg font-bold text-gray-900">
                      {product.formatted_price}
                    </span>
                    {product.compare_price && (
                      <span className="text-sm text-gray-500 line-through">
                        ₦{product.compare_price.toLocaleString()}
                      </span>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleMoveToCart(product)}
                      disabled={movingToCartIds.has(product.id) || !product.in_stock}
                      className="flex-1 btn btn-primary btn-sm disabled:opacity-50"
                    >
                      {movingToCartIds.has(product.id) ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <ShoppingCart className="w-4 h-4 mr-1" />
                          Add to Cart
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleRemove(product.id)}
                      disabled={removingIds.has(product.id)}
                      className="btn btn-secondary btn-sm px-3"
                    >
                      {removingIds.has(product.id) ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4 text-red-500" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
