import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  Tag,
  Truck,
  ShieldCheck,
  RefreshCw,
  Sparkles,
  X,
  Gift,
  Loader2,
  ChevronLeft,
  Clock,
  Package,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';

export default function CartPage() {
  const { cart, isLoading, updateQuantity, removeItem, applyCoupon, removeCoupon } = useCart();
  const { isAuthenticated } = useAuth();
  const [couponCode, setCouponCode] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [updatingItemId, setUpdatingItemId] = useState<number | null>(null);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setIsApplyingCoupon(true);
    const success = await applyCoupon(couponCode);
    if (success) setCouponCode('');
    setIsApplyingCoupon(false);
  };

  const handleUpdateQuantity = async (itemId: number, newQuantity: number) => {
    setUpdatingItemId(itemId);
    await updateQuantity(itemId, newQuantity);
    setUpdatingItemId(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-emerald-50/30 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-emerald-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading your cart...</p>
        </div>
      </div>
    );
  }

  if (!cart || cart.is_empty) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-emerald-50/30">
        <div className="container-custom py-16">
          <div className="max-w-md mx-auto text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl mx-auto mb-6 flex items-center justify-center">
              <ShoppingBag className="w-12 h-12 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
            <p className="text-gray-500 mb-8">
              Looks like you haven't added any items to your cart yet. Start shopping to fill it up!
            </p>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-emerald-500/30 transition-all duration-300"
            >
              <Sparkles className="w-5 h-5" />
              Start Shopping
            </Link>

            {/* Trust Badges */}
            <div className="mt-12 grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="w-12 h-12 bg-emerald-100 rounded-xl mx-auto mb-2 flex items-center justify-center">
                  <Truck className="w-6 h-6 text-emerald-600" />
                </div>
                <p className="text-xs text-gray-500">Free Delivery</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-xl mx-auto mb-2 flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6 text-blue-600" />
                </div>
                <p className="text-xs text-gray-500">Secure Payment</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-xl mx-auto mb-2 flex items-center justify-center">
                  <RefreshCw className="w-6 h-6 text-purple-600" />
                </div>
                <p className="text-xs text-gray-500">Easy Returns</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-emerald-50/30">
      <div className="container-custom py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link
              to="/products"
              className="inline-flex items-center gap-1 text-gray-500 hover:text-emerald-600 text-sm mb-2 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Continue Shopping
            </Link>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Shopping Cart
              <span className="ml-2 text-lg font-normal text-gray-500">
                ({cart.items_count} {cart.items_count === 1 ? 'item' : 'items'})
              </span>
            </h1>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.items.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-100/50 p-4 sm:p-5 transition-all duration-300 hover:shadow-xl"
              >
                <div className="flex gap-4">
                  {/* Product Image */}
                  <Link
                    to={`/products/${item.product.slug}`}
                    className="relative w-24 h-24 sm:w-28 sm:h-28 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0 group"
                  >
                    <img
                      src={item.product.primary_image || '/images/placeholder-product.png'}
                      alt={item.product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {item.product.discount_percentage && (
                      <span className="absolute top-2 left-2 px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-lg">
                        -{item.product.discount_percentage}%
                      </span>
                    )}
                  </Link>

                  {/* Product Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <Link
                          to={`/products/${item.product.slug}`}
                          className="font-semibold text-gray-900 hover:text-emerald-600 transition-colors line-clamp-2"
                        >
                          {item.product.name}
                        </Link>
                        {item.product.category && (
                          <p className="text-sm text-gray-500 mt-0.5">{item.product.category.name}</p>
                        )}
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-end justify-between mt-3">
                      {/* Quantity Controls */}
                      <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
                        <button
                          onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1 || updatingItemId === item.id}
                          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-10 text-center font-semibold text-gray-900">
                          {updatingItemId === item.id ? (
                            <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                          ) : (
                            item.quantity
                          )}
                        </span>
                        <button
                          onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                          disabled={item.quantity >= item.max_quantity || updatingItemId === item.id}
                          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Price */}
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-900">{item.formatted_subtotal}</p>
                        <p className="text-sm text-gray-500">{item.formatted_price} each</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Estimated Delivery */}
            <div className="bg-emerald-50 rounded-2xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                <Clock className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="font-medium text-emerald-900">Estimated Delivery</p>
                <p className="text-sm text-emerald-700">2-5 business days for most locations</p>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100/50 overflow-hidden sticky top-24">
              <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-4">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Order Summary
                </h2>
              </div>

              <div className="p-6">
                {/* Coupon Section */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Tag className="w-4 h-4 inline-block mr-1.5" />
                    Promo Code
                  </label>
                  {cart.coupon_code ? (
                    <div className="flex items-center justify-between bg-emerald-50 p-3 rounded-xl border border-emerald-200">
                      <div className="flex items-center gap-2">
                        <Gift className="w-5 h-5 text-emerald-600" />
                        <span className="font-medium text-emerald-700">{cart.coupon_code}</span>
                      </div>
                      <button
                        onClick={removeCoupon}
                        className="p-1.5 text-red-500 hover:bg-red-100 rounded-lg transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        placeholder="Enter code"
                        className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-sm"
                      />
                      <button
                        onClick={handleApplyCoupon}
                        disabled={isApplyingCoupon || !couponCode.trim()}
                        className="px-4 py-3 bg-gray-900 text-white font-medium rounded-xl hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      >
                        {isApplyingCoupon ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Apply'}
                      </button>
                    </div>
                  )}
                </div>

                {/* Price Breakdown */}
                <div className="space-y-3 py-4 border-t border-gray-100">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium text-gray-900">{cart.formatted_subtotal}</span>
                  </div>
                  {cart.discount_amount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-emerald-600">Discount</span>
                      <span className="font-medium text-emerald-600">-{cart.formatted_discount}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shipping</span>
                    <span className="text-gray-500">Calculated at checkout</span>
                  </div>
                </div>

                {/* Total */}
                <div className="flex justify-between items-center py-4 border-t border-gray-100">
                  <span className="text-lg font-bold text-gray-900">Total</span>
                  <span className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                    {cart.formatted_total}
                  </span>
                </div>

                {/* Checkout Button */}
                {isAuthenticated ? (
                  <Link
                    to="/checkout"
                    className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-emerald-500/30 transition-all duration-300 group"
                  >
                    Proceed to Checkout
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                ) : (
                  <div className="space-y-3">
                    <Link
                      to="/login"
                      className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-emerald-500/30 transition-all duration-300"
                    >
                      Login to Checkout
                    </Link>
                    <p className="text-center text-sm text-gray-500">
                      Don't have an account?{' '}
                      <Link to="/register" className="text-emerald-600 font-medium hover:underline">
                        Sign up
                      </Link>
                    </p>
                  </div>
                )}

                {/* Trust Badges */}
                <div className="mt-6 pt-6 border-t border-gray-100 space-y-3">
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                      <Truck className="w-4 h-4 text-emerald-600" />
                    </div>
                    <span>Free delivery over ₦50,000</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <ShieldCheck className="w-4 h-4 text-blue-600" />
                    </div>
                    <span>Secure checkout</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                      <RefreshCw className="w-4 h-4 text-purple-600" />
                    </div>
                    <span>Easy returns within 7 days</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
