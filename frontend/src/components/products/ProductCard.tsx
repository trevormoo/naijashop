import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Star, Eye, Zap } from 'lucide-react';
import { Product } from '@/types';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { wishlistApi } from '@/services/api';
import toast from 'react-hot-toast';
import { useState } from 'react';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(product.in_wishlist || false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const productImage =
  product.image_url ||
  product.primary_image ||
  'https://via.placeholder.com/600x600?text=NaijaShop';
  
  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!product.in_stock) {
      toast.error('This product is out of stock');
      return;
    }

    setIsAddingToCart(true);
    try {
      await addToCart(product.id);
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleToggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.error('Please login to add items to wishlist');
      return;
    }

    try {
      await wishlistApi.toggle(product.id);
      setIsInWishlist(!isInWishlist);
      toast.success(isInWishlist ? 'Removed from wishlist' : 'Added to wishlist');
    } catch (error) {
      toast.error('Failed to update wishlist');
    }
  };

  return (
    <Link
      to={`/products/${product.slug}`}
      className="group relative bg-white rounded-3xl overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-emerald-500/10 hover:-translate-y-1 border border-gray-100"
    >
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
        {/* Skeleton Loader */}
        {!isImageLoaded && (
          <div className="absolute inset-0 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 animate-pulse" />
        )}

        <img
          src={productImage}
          alt={product.name}
          className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-110 ${
            isImageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          loading="lazy"
          onLoad={() => setIsImageLoaded(true)}
        />

        {/* Gradient Overlay on Hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300" />

        {/* Badges - Top Left */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {product.discount_percentage && (
            <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-red-500 to-rose-500 text-white text-xs font-bold rounded-full shadow-lg shadow-red-500/30">
              <Zap className="w-3 h-3" />
              -{product.discount_percentage}%
            </span>
          )}
          {product.is_featured && (
            <span className="px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-bold rounded-full shadow-lg shadow-emerald-500/30">
              Featured
            </span>
          )}
          {!product.in_stock && (
            <span className="px-3 py-1.5 bg-gray-900/90 backdrop-blur-sm text-white text-xs font-bold rounded-full">
              Sold Out
            </span>
          )}
        </div>

        {/* Action Buttons - Top Right */}
        <div className="absolute top-3 right-3 flex flex-col gap-2">
          <button
            onClick={handleToggleWishlist}
            className={`p-2.5 rounded-full transition-all duration-300 shadow-lg ${
              isInWishlist
                ? 'bg-red-500 text-white shadow-red-500/30'
                : 'bg-white/90 backdrop-blur-sm text-gray-600 hover:bg-red-500 hover:text-white hover:shadow-red-500/30'
            }`}
          >
            <Heart className={`w-5 h-5 ${isInWishlist ? 'fill-current' : ''}`} />
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            className="p-2.5 rounded-full bg-white/90 backdrop-blur-sm text-gray-600 hover:bg-emerald-500 hover:text-white transition-all duration-300 shadow-lg hover:shadow-emerald-500/30 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0"
          >
            <Eye className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Add to Cart - Bottom */}
        <div className="absolute inset-x-3 bottom-3 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300">
          <button
            onClick={handleAddToCart}
            disabled={isAddingToCart || !product.in_stock}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-400 text-white font-semibold rounded-2xl transition-all duration-300 shadow-xl shadow-emerald-500/30 disabled:shadow-none"
          >
            <ShoppingCart className="w-5 h-5" />
            {isAddingToCart ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Adding...
              </span>
            ) : (
              'Add to Cart'
            )}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Category */}
        {product.category && (
          <p className="text-xs font-medium text-emerald-600 uppercase tracking-wider mb-2">
            {product.category.name}
          </p>
        )}

        {/* Name */}
        <h3 className="font-semibold text-gray-900 group-hover:text-emerald-600 transition-colors duration-300 line-clamp-2 mb-3 min-h-[48px]">
          {product.name}
        </h3>

        {/* Rating */}
        {product.review_count > 0 && (
          <div className="flex items-center gap-2 mb-3">
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-4 h-4 ${
                    star <= product.average_rating
                      ? 'text-amber-400 fill-amber-400'
                      : 'text-gray-200'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-gray-500">
              ({product.review_count})
            </span>
          </div>
        )}

        {/* Price */}
        <div className="flex items-end gap-2 flex-wrap">
          <span className="text-2xl font-bold text-gray-900">
            {product.formatted_price}
          </span>
          {product.compare_price && (
            <span className="text-sm text-gray-400 line-through pb-0.5">
              ₦{product.compare_price.toLocaleString()}
            </span>
          )}
        </div>

        {/* Stock Status */}
        {product.is_low_stock && product.in_stock && (
          <div className="mt-3 flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
            </span>
            <p className="text-xs font-medium text-orange-600">
              Only {product.stock_quantity} left in stock
            </p>
          </div>
        )}

        {/* Progress bar for low stock */}
        {product.is_low_stock && product.in_stock && (
          <div className="mt-2 w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-orange-500 to-red-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min((product.stock_quantity / 20) * 100, 100)}%` }}
            />
          </div>
        )}
      </div>
    </Link>
  );
}
