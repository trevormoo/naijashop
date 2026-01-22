import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  ShoppingCart,
  Heart,
  User,
  Search,
  Menu,
  X,
  ChevronDown,
  LogOut,
  Package,
  Settings,
  Sparkles,
  Truck,
  Phone,
  Mail,
  MapPin,
  Zap,
  Gift,
  Percent,
  Headphones,
  Laptop,
  Shirt,
  Home,
  Smartphone,
  Monitor,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';

const categories = [
  { name: 'Electronics', slug: 'electronics', icon: Zap, color: 'from-blue-500 to-cyan-500' },
  { name: 'Fashion', slug: 'fashion', icon: Shirt, color: 'from-pink-500 to-rose-500' },
  { name: 'Home & Living', slug: 'home', icon: Home, color: 'from-amber-500 to-orange-500' },
  { name: 'Phones', slug: 'phones', icon: Smartphone, color: 'from-purple-500 to-violet-500' },
  { name: 'Computing', slug: 'computing', icon: Monitor, color: 'from-emerald-500 to-teal-500' },
  { name: 'Audio', slug: 'audio', icon: Headphones, color: 'from-red-500 to-pink-500' },
];

export default function Header() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { itemsCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [promoIndex, setPromoIndex] = useState(0);

  const userMenuRef = useRef<HTMLDivElement>(null);
  const categoryMenuRef = useRef<HTMLDivElement>(null);

  const promos = [
    { icon: Truck, text: 'Free delivery on orders over ₦50,000' },
    { icon: Gift, text: 'New arrivals weekly - Shop now!' },
    { icon: Percent, text: 'Up to 50% off on selected items' },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setPromoIndex((prev) => (prev + 1) % promos.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
      if (categoryMenuRef.current && !categoryMenuRef.current.contains(e.target as Node)) {
        setIsCategoryMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setIsSearchFocused(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
    setIsUserMenuOpen(false);
  };

  const CurrentPromoIcon = promos[promoIndex].icon;

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${isScrolled ? 'shadow-lg shadow-black/5' : ''}`}>
      {/* Animated Promo Banner */}
      <div className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M0%200h20v20H0z%22%20fill%3D%22none%22%2F%3E%3Cpath%20d%3D%22M10%200v20M0%2010h20%22%20stroke%3D%22%23fff%22%20stroke-opacity%3D%22.05%22%2F%3E%3C%2Fsvg%3E')] opacity-50" />
        <div className="container-custom py-2.5 flex justify-between items-center relative">
          <div className="flex items-center gap-2 text-sm font-medium overflow-hidden">
            <div className="flex items-center gap-2 animate-pulse">
              <CurrentPromoIcon className="w-4 h-4" />
            </div>
            <div key={promoIndex} className="animate-fade-in">
              {promos[promoIndex].text}
            </div>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm">
            <a href="tel:+2341234567890" className="flex items-center gap-1.5 hover:text-emerald-100 transition-colors">
              <Phone className="w-3.5 h-3.5" />
              <span>+234 123 456 7890</span>
            </a>
            <a href="mailto:support@naijashop.com" className="flex items-center gap-1.5 hover:text-emerald-100 transition-colors">
              <Mail className="w-3.5 h-3.5" />
              <span>support@naijashop.com</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Header with Glassmorphism */}
      <div className={`bg-white/80 backdrop-blur-xl border-b border-gray-100/50 transition-all duration-300 ${isScrolled ? 'py-3' : 'py-4'}`}>
        <div className="container-custom">
          <div className="flex items-center justify-between gap-4 lg:gap-8">
            {/* Logo */}
            <Link to="/" className="flex-shrink-0 group">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/25 group-hover:shadow-emerald-500/40 transition-all duration-300 group-hover:scale-105">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                    NaijaShop
                  </h1>
                  <p className="text-[10px] text-gray-400 -mt-0.5 tracking-wider">NIGERIA'S #1 STORE</p>
                </div>
              </div>
            </Link>

            {/* Search Bar - Desktop */}
            <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-2xl">
              <div className={`relative w-full transition-all duration-300 ${isSearchFocused ? 'scale-[1.02]' : ''}`}>
                <div className={`absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl opacity-0 blur transition-opacity duration-300 ${isSearchFocused ? 'opacity-75' : ''}`} />
                <div className="relative flex items-center">
                  <input
                    type="text"
                    placeholder="Search for products, brands and more..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setIsSearchFocused(true)}
                    onBlur={() => setIsSearchFocused(false)}
                    className="w-full pl-5 pr-14 py-3.5 bg-gray-50/80 border border-gray-200/50 rounded-2xl focus:outline-none focus:bg-white focus:border-transparent transition-all duration-300 text-gray-800 placeholder:text-gray-400"
                  />
                  <button
                    type="submit"
                    className="absolute right-2 p-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl hover:shadow-lg hover:shadow-emerald-500/25 transition-all duration-300 hover:scale-105"
                  >
                    <Search className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </form>

            {/* Actions */}
            <div className="flex items-center gap-1 sm:gap-2">
              {/* Wishlist */}
              {isAuthenticated && (
                <Link
                  to="/wishlist"
                  className="hidden md:flex items-center gap-2 px-3 py-2.5 rounded-xl text-gray-600 hover:bg-gray-100/80 hover:text-emerald-600 transition-all duration-300 group"
                >
                  <div className="relative">
                    <Heart className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                  </div>
                  <span className="hidden lg:inline text-sm font-medium">Wishlist</span>
                </Link>
              )}

              {/* Cart */}
              <Link
                to="/cart"
                className="relative flex items-center gap-2 px-3 py-2.5 rounded-xl text-gray-600 hover:bg-gray-100/80 hover:text-emerald-600 transition-all duration-300 group"
              >
                <div className="relative">
                  <ShoppingCart className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                  {itemsCount > 0 && (
                    <span className="absolute -top-2 -right-2 min-w-[20px] h-5 px-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/30 animate-bounce-subtle">
                      {itemsCount > 99 ? '99+' : itemsCount}
                    </span>
                  )}
                </div>
                <span className="hidden lg:inline text-sm font-medium">Cart</span>
              </Link>

              {/* User Menu */}
              {isAuthenticated ? (
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl transition-all duration-300 ${
                      isUserMenuOpen
                        ? 'bg-emerald-50 text-emerald-600'
                        : 'text-gray-600 hover:bg-gray-100/80 hover:text-emerald-600'
                    }`}
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center text-white text-sm font-bold shadow-md">
                      {user?.first_name?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <span className="hidden lg:inline text-sm font-medium max-w-[100px] truncate">
                      {user?.first_name}
                    </span>
                    <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl shadow-black/10 border border-gray-100/50 py-2 animate-scale-in origin-top-right">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="font-semibold text-gray-900">{user?.full_name}</p>
                        <p className="text-sm text-gray-500 truncate">{user?.email}</p>
                      </div>

                      <div className="py-2">
                        {isAdmin && (
                          <Link
                            to="/admin"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
                          >
                            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                              <Settings className="w-4 h-4 text-purple-600" />
                            </div>
                            <span className="font-medium">Admin Dashboard</span>
                          </Link>
                        )}

                        <Link
                          to="/profile"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
                        >
                          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                            <User className="w-4 h-4 text-blue-600" />
                          </div>
                          <span className="font-medium">My Profile</span>
                        </Link>

                        <Link
                          to="/orders"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
                        >
                          <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                            <Package className="w-4 h-4 text-amber-600" />
                          </div>
                          <span className="font-medium">My Orders</span>
                        </Link>

                        <Link
                          to="/wishlist"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-emerald-50 hover:text-emerald-600 transition-colors md:hidden"
                        >
                          <div className="w-8 h-8 bg-pink-100 rounded-lg flex items-center justify-center">
                            <Heart className="w-4 h-4 text-pink-600" />
                          </div>
                          <span className="font-medium">Wishlist</span>
                        </Link>
                      </div>

                      <div className="border-t border-gray-100 pt-2">
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-3 px-4 py-2.5 text-red-600 hover:bg-red-50 transition-colors w-full"
                        >
                          <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                            <LogOut className="w-4 h-4" />
                          </div>
                          <span className="font-medium">Logout</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    to="/login"
                    className="hidden sm:inline-flex px-4 py-2.5 text-gray-600 hover:text-emerald-600 text-sm font-medium transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-semibold rounded-xl hover:shadow-lg hover:shadow-emerald-500/25 transition-all duration-300 hover:scale-105"
                  >
                    Sign Up
                  </Link>
                </div>
              )}

              {/* Mobile menu button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2.5 rounded-xl text-gray-600 hover:bg-gray-100/80 transition-colors"
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Search */}
          <form onSubmit={handleSearch} className="mt-4 md:hidden">
            <div className="relative">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-4 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-emerald-500 text-white rounded-lg"
              >
                <Search className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Category Navigation - Desktop */}
      <nav className="hidden md:block bg-white border-b border-gray-100">
        <div className="container-custom">
          <div className="flex items-center gap-1 py-2">
            {/* Categories Dropdown */}
            <div className="relative" ref={categoryMenuRef}>
              <button
                onClick={() => setIsCategoryMenuOpen(!isCategoryMenuOpen)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all duration-300 ${
                  isCategoryMenuOpen
                    ? 'bg-emerald-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-emerald-50 hover:text-emerald-600'
                }`}
              >
                <Menu className="w-4 h-4" />
                <span>Categories</span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isCategoryMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {isCategoryMenuOpen && (
                <div className="absolute left-0 top-full mt-2 w-72 bg-white rounded-2xl shadow-xl shadow-black/10 border border-gray-100 py-3 animate-scale-in origin-top-left z-50">
                  {categories.map((category) => {
                    const Icon = category.icon;
                    return (
                      <Link
                        key={category.slug}
                        to={`/category/${category.slug}`}
                        onClick={() => setIsCategoryMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors group"
                      >
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${category.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-medium text-gray-700 group-hover:text-emerald-600 transition-colors">
                          {category.name}
                        </span>
                        <ArrowRight className="w-4 h-4 text-gray-300 ml-auto opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Quick Links */}
            <Link
              to="/products"
              className="px-4 py-2.5 text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl font-medium transition-all duration-300"
            >
              All Products
            </Link>
            <Link
              to="/products?featured=true"
              className="px-4 py-2.5 text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl font-medium transition-all duration-300 flex items-center gap-1.5"
            >
              <Sparkles className="w-4 h-4" />
              Featured
            </Link>
            <Link
              to="/products?on_sale=true"
              className="px-4 py-2.5 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-xl font-medium transition-all duration-300 flex items-center gap-1.5"
            >
              <Zap className="w-4 h-4" />
              Hot Deals
            </Link>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div
        className={`md:hidden fixed inset-0 z-50 transition-all duration-300 ${
          isMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={() => setIsMenuOpen(false)}
        />

        {/* Menu Panel */}
        <div
          className={`absolute top-0 right-0 w-[85%] max-w-sm h-full bg-white shadow-2xl transition-transform duration-300 ease-out ${
            isMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold text-gray-900">Menu</span>
              </div>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* User Info */}
            {isAuthenticated && (
              <div className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center text-white text-lg font-bold shadow-lg">
                    {user?.first_name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{user?.full_name}</p>
                    <p className="text-sm text-gray-500">{user?.email}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Menu Items */}
            <nav className="flex-1 overflow-y-auto py-4">
              <div className="px-4 mb-4">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Shop</p>
                <div className="space-y-1">
                  <Link
                    to="/products"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                      <Package className="w-5 h-5 text-gray-600" />
                    </div>
                    <span className="font-medium text-gray-700">All Products</span>
                  </Link>
                  {categories.map((category) => {
                    const Icon = category.icon;
                    return (
                      <Link
                        key={category.slug}
                        to={`/category/${category.slug}`}
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-gray-100 transition-colors"
                      >
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${category.color} flex items-center justify-center`}>
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-medium text-gray-700">{category.name}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>

              {isAuthenticated && (
                <div className="px-4 mb-4">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Account</p>
                  <div className="space-y-1">
                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-gray-100 transition-colors"
                      >
                        <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                          <Settings className="w-5 h-5 text-purple-600" />
                        </div>
                        <span className="font-medium text-gray-700">Admin Dashboard</span>
                      </Link>
                    )}
                    <Link
                      to="/profile"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-gray-100 transition-colors"
                    >
                      <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                        <User className="w-5 h-5 text-blue-600" />
                      </div>
                      <span className="font-medium text-gray-700">My Profile</span>
                    </Link>
                    <Link
                      to="/orders"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-gray-100 transition-colors"
                    >
                      <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                        <Package className="w-5 h-5 text-amber-600" />
                      </div>
                      <span className="font-medium text-gray-700">My Orders</span>
                    </Link>
                    <Link
                      to="/wishlist"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-gray-100 transition-colors"
                    >
                      <div className="w-10 h-10 bg-pink-100 rounded-xl flex items-center justify-center">
                        <Heart className="w-5 h-5 text-pink-600" />
                      </div>
                      <span className="font-medium text-gray-700">Wishlist</span>
                    </Link>
                  </div>
                </div>
              )}

              {/* Contact Info */}
              <div className="px-4">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Contact</p>
                <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                  <a href="tel:+2341234567890" className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="w-4 h-4 text-emerald-500" />
                    +234 123 456 7890
                  </a>
                  <a href="mailto:support@naijashop.com" className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail className="w-4 h-4 text-emerald-500" />
                    support@naijashop.com
                  </a>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4 text-emerald-500" />
                    Lagos, Nigeria
                  </div>
                </div>
              </div>
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-gray-100">
              {isAuthenticated ? (
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-50 text-red-600 rounded-xl font-medium hover:bg-red-100 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  Logout
                </button>
              ) : (
                <div className="flex gap-3">
                  <Link
                    to="/login"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex-1 px-4 py-3 text-center border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex-1 px-4 py-3 text-center bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-medium hover:shadow-lg transition-all"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scale-in {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes bounce-subtle {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
        .animate-scale-in {
          animation: scale-in 0.2s ease-out;
        }
        .animate-bounce-subtle {
          animation: bounce-subtle 2s ease-in-out infinite;
        }
      `}</style>
    </header>
  );
}
