import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { SlidersHorizontal, Grid, List, X } from 'lucide-react';
import { productsApi, categoriesApi } from '@/services/api';
import { Product, Category, PaginatedResponse } from '@/types';
import ProductCard from '@/components/products/ProductCard';
import LoadingSpinner from '@/components/common/LoadingSpinner';

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);

  const page = parseInt(searchParams.get('page') || '1');
  const search = searchParams.get('q') || searchParams.get('search') || '';
  const category = searchParams.get('category') || '';
  const sortBy = searchParams.get('sort_by') || 'created_at';
  const minPrice = searchParams.get('min_price') || '';
  const maxPrice = searchParams.get('max_price') || '';
  const inStock = searchParams.get('in_stock') === 'true';

  // Fetch categories for filter
  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesApi.getAll({ root_only: true }),
  });

  const categories = (categoriesData as { data: Category[] })?.data || [];

  const { data, isLoading } = useQuery({
    queryKey: ['products', { page, search, category, sortBy, minPrice, maxPrice, inStock }],
    queryFn: () => productsApi.getAll({
      page,
      per_page: 12,
      search: search || undefined,
      category: category || undefined,
      sort_by: sortBy,
      min_price: minPrice ? Number(minPrice) : undefined,
      max_price: maxPrice ? Number(maxPrice) : undefined,
      in_stock: inStock || undefined,
    }),
  });

  const products = (data as PaginatedResponse<Product>)?.data || [];
  const meta = (data as PaginatedResponse<Product>)?.meta;

  const updateParams = (updates: Record<string, string | undefined>) => {
    const newParams = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value === undefined || value === '') {
        newParams.delete(key);
      } else {
        newParams.set(key, value);
      }
    });
    // Reset to page 1 when filters change (unless we're changing page)
    if (!Object.keys(updates).includes('page')) {
      newParams.set('page', '1');
    }
    setSearchParams(newParams);
  };

  const clearFilters = () => {
    setSearchParams(search ? { q: search } : {});
  };

  const hasActiveFilters = category || minPrice || maxPrice || inStock;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="container-custom py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Mobile filter toggle */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="lg:hidden flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 rounded-lg"
        >
          <SlidersHorizontal className="w-5 h-5" />
          {showFilters ? 'Hide Filters' : 'Show Filters'}
        </button>

        {/* Sidebar filters */}
        <aside className={`lg:w-64 flex-shrink-0 ${showFilters ? 'block' : 'hidden lg:block'}`}>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5" /> Filters
              </h3>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-emerald-600 hover:text-emerald-700"
                >
                  Clear all
                </button>
              )}
            </div>

            {/* Categories */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={category}
                onChange={(e) => updateParams({ category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.slug}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Price Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => updateParams({ min_price: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => updateParams({ max_price: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                />
              </div>
            </div>

            {/* In Stock */}
            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={inStock}
                  onChange={(e) => updateParams({ in_stock: e.target.checked ? 'true' : undefined })}
                  className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                />
                <span className="text-sm text-gray-700">In Stock Only</span>
              </label>
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => updateParams({ sort_by: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                <option value="created_at">Newest</option>
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
                <option value="popularity">Most Popular</option>
                <option value="rating">Top Rated</option>
              </select>
            </div>
          </div>
        </aside>

        {/* Products grid */}
        <div className="flex-1">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {search ? `Search results for "${search}"` : category ? categories.find(c => c.slug === category)?.name || 'Products' : 'All Products'}
              </h1>
              {meta && (
                <p className="text-gray-500 mt-1">
                  {meta.total} {meta.total === 1 ? 'product' : 'products'} found
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-emerald-100 text-emerald-600' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-emerald-100 text-emerald-600' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Active filters display */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2 mb-4">
              {category && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm">
                  {categories.find(c => c.slug === category)?.name}
                  <button onClick={() => updateParams({ category: undefined })} className="hover:text-emerald-900">
                    <X className="w-4 h-4" />
                  </button>
                </span>
              )}
              {(minPrice || maxPrice) && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm">
                  {minPrice && maxPrice
                    ? `${formatCurrency(Number(minPrice))} - ${formatCurrency(Number(maxPrice))}`
                    : minPrice
                    ? `From ${formatCurrency(Number(minPrice))}`
                    : `Up to ${formatCurrency(Number(maxPrice))}`}
                  <button onClick={() => updateParams({ min_price: undefined, max_price: undefined })} className="hover:text-emerald-900">
                    <X className="w-4 h-4" />
                  </button>
                </span>
              )}
              {inStock && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm">
                  In Stock
                  <button onClick={() => updateParams({ in_stock: undefined })} className="hover:text-emerald-900">
                    <X className="w-4 h-4" />
                  </button>
                </span>
              )}
            </div>
          )}

          {isLoading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <SlidersHorizontal className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
              <p className="text-gray-500 mb-4">Try adjusting your filters or search terms</p>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <>
              <div className={`grid gap-4 lg:gap-6 ${viewMode === 'grid' ? 'grid-cols-2 md:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}>
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Pagination */}
              {meta && meta.last_page > 1 && (
                <div className="flex justify-center items-center gap-2 mt-8">
                  <button
                    onClick={() => updateParams({ page: String(Math.max(1, page - 1)) })}
                    disabled={page === 1}
                    className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>

                  <div className="flex gap-1">
                    {Array.from({ length: Math.min(meta.last_page, 5) }, (_, i) => {
                      let pageNum;
                      if (meta.last_page <= 5) {
                        pageNum = i + 1;
                      } else if (page <= 3) {
                        pageNum = i + 1;
                      } else if (page >= meta.last_page - 2) {
                        pageNum = meta.last_page - 4 + i;
                      } else {
                        pageNum = page - 2 + i;
                      }
                      return (
                        <button
                          key={pageNum}
                          onClick={() => updateParams({ page: String(pageNum) })}
                          className={`w-10 h-10 rounded-lg ${
                            pageNum === meta.current_page
                              ? 'bg-emerald-600 text-white'
                              : 'bg-gray-100 hover:bg-gray-200'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => updateParams({ page: String(Math.min(meta.last_page, page + 1)) })}
                    disabled={page === meta.last_page}
                    className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
