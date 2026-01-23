import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowRight,
  Truck,
  Shield,
  CreditCard,
  Headphones,
  Sparkles,
  Zap,
  TrendingUp,
  Star,
  ChevronRight
} from 'lucide-react';
import { productsApi, categoriesApi } from '@/services/api';
import { Product, Category } from '@/types';
import ProductCard from '@/components/products/ProductCard';
import LoadingSpinner from '@/components/common/LoadingSpinner';

export default function HomePage() {
  const { data: featuredProducts, isLoading: loadingProducts } = useQuery({
    queryKey: ['featuredProducts'],
    queryFn: () => productsApi.getFeatured(8),
  });

  const { data: categories, isLoading: loadingCategories } = useQuery({
    queryKey: ['featuredCategories'],
    queryFn: () => categoriesApi.getFeatured(6),
  });

  return (
    <div className="min-h-screen">
      {/* Hero Section - Modern Gradient with Glassmorphism */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-green-600 to-teal-700 min-h-[600px]">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute top-1/2 -left-20 w-60 h-60 bg-emerald-400/20 rounded-full blur-3xl animate-pulse delay-1000" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-teal-400/10 rounded-full blur-3xl" />
          {/* Grid Pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />
        </div>

        <div className="container-custom relative py-20 lg:py-28">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-white">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-6">
                <Sparkles className="w-4 h-4 text-yellow-300" />
                <span className="text-sm font-medium">Nigeria's #1 Online Store</span>
              </div>

              <h1 className="text-5xl lg:text-7xl font-bold mb-6 leading-tight">
                Shop Smarter,
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-yellow-400">
                  Live Better
                </span>
              </h1>

              <p className="text-xl text-emerald-100 mb-8 max-w-lg leading-relaxed">
                Discover premium products at unbeatable prices. Fast nationwide delivery,
                secure payments, and a shopping experience you'll love.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-wrap gap-4 mb-12">
                <Link
                  to="/products"
                  className="group inline-flex items-center gap-2 px-8 py-4 bg-white text-emerald-700 rounded-2xl font-semibold text-lg hover:bg-yellow-300 hover:text-emerald-800 transition-all duration-300 shadow-lg shadow-black/20 hover:shadow-xl hover:scale-105"
                >
                  Start Shopping
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/category/deals"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-sm text-white rounded-2xl font-semibold text-lg border border-white/30 hover:bg-white/20 transition-all duration-300"
                >
                  <Zap className="w-5 h-5" />
                  Flash Deals
                </Link>
              </div>

              {/* Stats */}
              <div className="flex gap-8">
                <div>
                  <p className="text-3xl font-bold">50K+</p>
                  <p className="text-emerald-200 text-sm">Happy Customers</p>
                </div>
                <div className="w-px bg-white/20" />
                <div>
                  <p className="text-3xl font-bold">10K+</p>
                  <p className="text-emerald-200 text-sm">Products</p>
                </div>
                <div className="w-px bg-white/20" />
                <div>
                  <p className="text-3xl font-bold">4.9</p>
                  <p className="text-emerald-200 text-sm flex items-center gap-1">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" /> Rating
                  </p>
                </div>
              </div>
            </div>

            {/* Floating Product Cards */}
            <div className="hidden lg:block relative">
              <div className="relative w-full h-[500px]">
                {/* Main Card */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 bg-white rounded-3xl shadow-2xl p-6 transform hover:scale-105 transition-all duration-500 z-20">
                  <div className="w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl mb-4 flex items-center justify-center">
                    <span className="text-6xl">📱</span>
                  </div>
                  <h3 className="font-bold text-gray-900 mb-1">iPhone 15 Pro Max</h3>
                  <p className="text-emerald-600 font-bold text-xl">₦1,500,000</p>
                  <div className="flex items-center gap-1 mt-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                    <span className="text-gray-500 text-sm ml-1">(234)</span>
                  </div>
                </div>

                {/* Floating Cards */}
                <div className="absolute top-10 right-0 bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl p-4 animate-bounce-slow z-10">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                      <Truck className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Free Delivery</p>
                      <p className="text-sm text-gray-500">Orders over ₦50K</p>
                    </div>
                  </div>
                </div>

                <div className="absolute bottom-20 left-0 bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl p-4 animate-bounce-slow delay-500 z-10">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                      <span className="text-2xl">🔥</span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Flash Sale</p>
                      <p className="text-sm text-emerald-600 font-medium">Up to 50% OFF</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="white"/>
          </svg>
        </div>
      </section>

      {/* Features Strip - Glassmorphism Cards */}
      <section className="py-12 bg-white">
        <div className="container-custom">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Truck, title: 'Free Delivery', desc: 'Orders over ₦50,000', bgColor: 'bg-emerald-100', textColor: 'text-emerald-600' },
              { icon: Shield, title: 'Secure Shopping', desc: '100% Protected', bgColor: 'bg-blue-100', textColor: 'text-blue-600' },
              { icon: CreditCard, title: 'Easy Payments', desc: 'Multiple Options', bgColor: 'bg-purple-100', textColor: 'text-purple-600' },
              { icon: Headphones, title: '24/7 Support', desc: 'Always Available', bgColor: 'bg-orange-100', textColor: 'text-orange-600' },
            ].map((feature, i) => (
              <div
                key={i}
                className="group p-6 rounded-2xl bg-gradient-to-br from-gray-50 to-white border border-gray-100 hover:border-emerald-200 hover:shadow-lg hover:shadow-emerald-100/50 transition-all duration-300"
              >
                <div className={`w-14 h-14 rounded-2xl ${feature.bgColor} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className={`w-7 h-7 ${feature.textColor}`} />
                </div>
                <h3 className="font-bold text-gray-900 mb-1">{feature.title}</h3>
                <p className="text-sm text-gray-500">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories - Modern Bento Grid */}
      <section className="py-16 bg-gray-50">
        <div className="container-custom">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Shop by Category</h2>
              <p className="text-gray-500">Explore our wide range of product categories</p>
            </div>
            <Link
              to="/categories"
              className="hidden md:inline-flex items-center gap-2 px-6 py-3 bg-emerald-50 text-emerald-700 rounded-xl font-medium hover:bg-emerald-100 transition-colors"
            >
              View All <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {loadingCategories ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {(categories as { data: Category[] })?.data?.map((category, i) => (
                <Link
                  key={category.id}
                  to={`/category/${category.slug}`}
                  className={`group relative overflow-hidden rounded-3xl bg-gradient-to-br ${
                    i === 0 ? 'from-emerald-500 to-teal-600 md:col-span-2 md:row-span-2' :
                    i === 1 ? 'from-purple-500 to-indigo-600' :
                    i === 2 ? 'from-orange-500 to-red-500' :
                    i === 3 ? 'from-blue-500 to-cyan-500' :
                    i === 4 ? 'from-pink-500 to-rose-500' :
                    'from-gray-700 to-gray-900'
                  } p-6 ${i === 0 ? 'min-h-[280px]' : 'min-h-[140px]'} flex flex-col justify-end transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl`}
                >
                  {/* Overlay Pattern */}
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_-20%,rgba(255,255,255,0.2),transparent_50%)]" />

                  {/* Icon/Image */}
                  <div className={`absolute ${i === 0 ? 'top-6 right-6 text-6xl' : 'top-4 right-4 text-4xl'} opacity-80`}>
                    {category.image ? (
                      <img src={category.image} alt="" className={`${i === 0 ? 'w-20 h-20' : 'w-12 h-12'} object-contain`} />
                    ) : (
                      <span className="text-white/30 font-bold">{category.name[0]}</span>
                    )}
                  </div>

                  <div className="relative z-10">
                    <h3 className={`font-bold text-white ${i === 0 ? 'text-2xl' : 'text-lg'} mb-1`}>
                      {category.name}
                    </h3>
                    {category.products_count && (
                      <p className="text-white/70 text-sm">{category.products_count} Products</p>
                    )}
                  </div>

                  {/* Hover Arrow */}
                  <div className="absolute bottom-4 right-4 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all duration-300">
                    <ArrowRight className="w-5 h-5 text-white" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-white">
        <div className="container-custom">
          <div className="flex items-center justify-between mb-10">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium mb-3">
                <TrendingUp className="w-4 h-4" />
                Trending Now
              </div>
              <h2 className="text-3xl font-bold text-gray-900">Featured Products</h2>
            </div>
            <Link
              to="/products?featured=true"
              className="hidden md:inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors"
            >
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {loadingProducts ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {(featuredProducts as { data?: Product[] })?.data?.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          <div className="mt-8 md:hidden text-center">
            <Link
              to="/products?featured=true"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-xl font-medium"
            >
              View All Products <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Promo Banner - Modern Design */}
      <section className="py-16 bg-gray-50">
        <div className="container-custom">
          <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900">
            {/* Background Pattern */}
            <div className="absolute inset-0">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(16,185,129,0.15),transparent_50%)]" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_70%,rgba(234,179,8,0.1),transparent_50%)]" />
              <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px]" />
            </div>

            <div className="relative px-8 py-16 lg:px-16 lg:py-20">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div>
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/20 text-emerald-400 rounded-full text-sm font-medium mb-6">
                    <Sparkles className="w-4 h-4" />
                    New Customer Offer
                  </div>
                  <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
                    Get <span className="text-emerald-400">20% Off</span><br />
                    Your First Order
                  </h2>
                  <p className="text-gray-400 text-lg mb-8 max-w-md">
                    Join thousands of happy customers. Use code WELCOME20 at checkout and start saving today.
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <Link
                      to="/register"
                      className="inline-flex items-center gap-2 px-8 py-4 bg-emerald-500 text-white rounded-2xl font-semibold hover:bg-emerald-400 transition-all duration-300 shadow-lg shadow-emerald-500/30"
                    >
                      Create Account
                      <ArrowRight className="w-5 h-5" />
                    </Link>
                    <div className="flex items-center gap-3 px-6 py-4 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
                      <span className="text-gray-400">Use code:</span>
                      <span className="font-mono font-bold text-emerald-400 text-lg">WELCOME20</span>
                    </div>
                  </div>
                </div>

                {/* Decorative Elements */}
                <div className="hidden lg:flex justify-center">
                  <div className="relative">
                    <div className="w-64 h-64 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full opacity-20 blur-3xl absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                    <div className="relative text-9xl">🛍️</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 bg-white">
        <div className="container-custom">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Stay in the Loop</h2>
            <p className="text-gray-500 mb-8">
              Subscribe to get special offers, free giveaways, and exclusive deals.
            </p>
            <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-6 py-4 rounded-2xl border border-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all"
              />
              <button
                type="submit"
                className="px-8 py-4 bg-emerald-600 text-white rounded-2xl font-semibold hover:bg-emerald-700 transition-colors whitespace-nowrap"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
