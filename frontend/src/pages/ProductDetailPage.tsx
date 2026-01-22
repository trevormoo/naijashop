import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ShoppingCart,
  Heart,
  Star,
  Minus,
  Plus,
  ChevronRight,
  Truck,
  ShieldCheck,
  RefreshCw,
  Package,
  Loader2,
  Share2,
  Check,
  Sparkles,
  BadgeCheck,
  Clock,

} from 'lucide-react';
import { productsApi } from '@/services/api';
import { Product } from '@/types';
import { useCart } from '@/context/CartContext';
import ProductCard from '@/components/products/ProductCard';
import toast from 'react-hot-toast';

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['product', slug],
    queryFn: () => productsApi.getOne(slug!),
    enabled: !!slug,
  });

  const { data: relatedData } = useQuery({
    queryKey: ['relatedProducts', slug],
    queryFn: () => productsApi.getRelated(slug!),
    enabled: !!slug,
  });

  const product = (data as { product: Product })?.product;
  const relatedProducts = (relatedData as { products?: Product[] })?.products || [];

  const handleAddToCart = async () => {
    if (!product?.in_stock) {
      toast.error('This product is out of stock');
      return;
    }
    setIsAddingToCart(true);
    try {
      await addToCart(product.id, quantity);
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleWishlist = () => {
    setIsWishlisted(!isWishlisted);
    if (!isWishlisted) {
      toast.success('Added to wishlist');
    } else {
      toast('Removed from wishlist');
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product?.name,
          url: window.location.href,
        });
      } catch (err) {
        // User cancelled
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-emerald-50/30 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-emerald-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading product...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-emerald-50/30">
        <div className="container-custom py-16 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl mx-auto mb-6 flex items-center justify-center">
              <Package className="w-12 h-12 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Product not found</h2>
            <p className="text-gray-500 mb-6">The product you're looking for doesn't exist or has been removed.</p>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-emerald-500/30 transition-all duration-300"
            >
              <Sparkles className="w-5 h-5" />
              Browse Products
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-emerald-50/30">
      <div className="container-custom py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm mb-6 overflow-x-auto pb-2">
          <Link to="/" className="text-gray-500 hover:text-emerald-600 transition-colors whitespace-nowrap">
            Home
          </Link>
          <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <Link to="/products" className="text-gray-500 hover:text-emerald-600 transition-colors whitespace-nowrap">
            Products
          </Link>
          {product.category && (
            <>
              <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <Link
                to={`/category/${product.category.slug}`}
                className="text-gray-500 hover:text-emerald-600 transition-colors whitespace-nowrap"
              >
                {product.category.name}
              </Link>
            </>
          )}
          <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <span className="text-gray-900 font-medium truncate">{product.name}</span>
        </nav>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 mb-16">
          {/* Images Section */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative aspect-square bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100/50 overflow-hidden group">
              <img
                src={product.images?.[selectedImage]?.url || product.primary_image || '/images/placeholder-product.png'}
                alt={product.name}
                className="w-full h-full object-contain p-6 group-hover:scale-105 transition-transform duration-500"
              />
              {product.discount_percentage && (
                <span className="absolute top-4 left-4 px-3 py-1.5 bg-gradient-to-r from-red-500 to-rose-500 text-white text-sm font-bold rounded-xl shadow-lg">
                  -{product.discount_percentage}% OFF
                </span>
              )}
              {/* Share Button */}
              <button
                onClick={handleShare}
                className="absolute top-4 right-4 p-3 bg-white/90 backdrop-blur rounded-xl shadow-lg hover:bg-white transition-all"
              >
                <Share2 className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Thumbnail Gallery */}
            {product.images && product.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {product.images.map((image, index) => (
                  <button
                    key={image.id}
                    onClick={() => setSelectedImage(index)}
                    className={`relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all duration-300 ${
                      index === selectedImage
                        ? 'border-emerald-500 shadow-lg shadow-emerald-500/30'
                        : 'border-gray-200 hover:border-emerald-300'
                    }`}
                  >
                    <img src={image.thumbnail_url} alt="" className="w-full h-full object-cover" />
                    {index === selectedImage && (
                      <div className="absolute inset-0 bg-emerald-500/10" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info Section */}
          <div className="lg:py-4">
            {/* Category Badge */}
            {product.category && (
              <Link
                to={`/category/${product.category.slug}`}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 text-sm font-medium rounded-lg hover:bg-emerald-100 transition-colors mb-4"
              >
                {product.category.name}
              </Link>
            )}

            {/* Product Name */}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              {product.name}
            </h1>

            {/* Rating */}
            {product.review_count > 0 && (
              <div className="flex items-center gap-3 mb-6">
                <div className="flex items-center gap-1 px-3 py-1.5 bg-amber-50 rounded-xl">
                  <Star className="w-5 h-5 text-amber-500 fill-current" />
                  <span className="font-bold text-amber-700">{product.average_rating?.toFixed(1)}</span>
                </div>
                <span className="text-gray-500">
                  {product.review_count} {product.review_count === 1 ? 'review' : 'reviews'}
                </span>
                <span className="flex items-center gap-1 text-emerald-600 text-sm">
                  <BadgeCheck className="w-4 h-4" />
                  Verified
                </span>
              </div>
            )}

            {/* Price Section */}
            <div className="bg-gradient-to-r from-gray-50 to-emerald-50/50 rounded-2xl p-5 mb-6">
              <div className="flex items-baseline gap-3 flex-wrap">
                <span className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  {product.formatted_price}
                </span>
                {product.compare_price && (
                  <>
                    <span className="text-xl text-gray-400 line-through">
                      ₦{product.compare_price.toLocaleString()}
                    </span>
                    <span className="px-2 py-1 bg-red-100 text-red-600 text-sm font-bold rounded-lg">
                      Save ₦{(product.compare_price - product.price).toLocaleString()}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="mb-6">
              <p className="text-gray-600 leading-relaxed">
                {product.short_description || product.description}
              </p>
            </div>

            {/* Stock Status */}
            <div className="mb-6">
              {product.in_stock ? (
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl">
                  <Check className="w-5 h-5" />
                  <span className="font-medium">In Stock</span>
                  <span className="text-emerald-600">({product.stock_quantity} available)</span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded-xl">
                  <span className="font-medium">Out of Stock</span>
                </div>
              )}
            </div>

            {/* Quantity Selector */}
            <div className="flex items-center gap-4 mb-6">
              <span className="text-sm font-medium text-gray-700">Quantity:</span>
              <div className="flex items-center bg-gray-100 rounded-xl p-1">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                  className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-white disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-12 text-center font-bold text-gray-900">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock_quantity, quantity + 1))}
                  disabled={quantity >= product.stock_quantity}
                  className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-white disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mb-8">
              <button
                onClick={handleAddToCart}
                disabled={isAddingToCart || !product.in_stock}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-emerald-500/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                {isAddingToCart ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    Add to Cart
                  </>
                )}
              </button>
              <button
                onClick={handleWishlist}
                className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                  isWishlisted
                    ? 'bg-red-50 border-red-200 text-red-500'
                    : 'bg-white border-gray-200 text-gray-600 hover:border-red-200 hover:text-red-500'
                }`}
              >
                <Heart className={`w-6 h-6 ${isWishlisted ? 'fill-current' : ''}`} />
              </button>
            </div>

            {/* Trust Features */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-lg shadow-gray-200/50 p-5 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <Truck className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Free Delivery</p>
                  <p className="text-sm text-gray-500">On orders over ₦50,000</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Secure Payment</p>
                  <p className="text-sm text-gray-500">100% secure transactions</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                  <RefreshCw className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Easy Returns</p>
                  <p className="text-sm text-gray-500">7 days return policy</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                  <Clock className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Fast Delivery</p>
                  <p className="text-sm text-gray-500">2-5 business days</p>
                </div>
              </div>
            </div>

            {/* SKU */}
            {product.sku && (
              <p className="text-sm text-gray-400 mt-4">
                SKU: <span className="font-mono">{product.sku}</span>
              </p>
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="pb-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Related Products</h2>
                <p className="text-gray-500 mt-1">You might also like these</p>
              </div>
              <Link
                to="/products"
                className="hidden sm:flex items-center gap-2 text-emerald-600 font-medium hover:text-emerald-700 transition-colors"
              >
                View All
                <ChevronRight className="w-5 h-5" />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {relatedProducts.slice(0, 4).map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
