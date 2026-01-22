import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { SlidersHorizontal, Grid, List } from 'lucide-react';
import { productsApi } from '@/services/api';
import { Product, PaginatedResponse } from '@/types';
import ProductCard from '@/components/products/ProductCard';
import LoadingSpinner from '@/components/common/LoadingSpinner';

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const page = parseInt(searchParams.get('page') || '1');
  const search = searchParams.get('q') || '';
  const category = searchParams.get('category') || '';
  const sortBy = searchParams.get('sort_by') || 'created_at';

  const { data, isLoading } = useQuery({
    queryKey: ['products', { page, search, category, sortBy }],
    queryFn: () => productsApi.getAll({ page, search, category, sort_by: sortBy }),
  });

  const products = (data as PaginatedResponse<Product>)?.data || [];
  const meta = (data as PaginatedResponse<Product>)?.meta;

  return (
    <div className="container-custom py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar filters */}
        <aside className="lg:w-64 flex-shrink-0">
          <div className="card p-4">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <SlidersHorizontal className="w-5 h-5" /> Filters
            </h3>
            {/* Filter options would go here */}
            <div className="space-y-4">
              <div>
                <label className="label">Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSearchParams({ ...Object.fromEntries(searchParams), sort_by: e.target.value })}
                  className="input"
                >
                  <option value="created_at">Newest</option>
                  <option value="price_low">Price: Low to High</option>
                  <option value="price_high">Price: High to Low</option>
                  <option value="popularity">Most Popular</option>
                  <option value="rating">Top Rated</option>
                </select>
              </div>
            </div>
          </div>
        </aside>

        {/* Products grid */}
        <div className="flex-1">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">
              {search ? `Search results for "${search}"` : 'All Products'}
            </h1>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${viewMode === 'grid' ? 'bg-primary-100 text-primary-600' : 'text-gray-500'}`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${viewMode === 'list' ? 'bg-primary-100 text-primary-600' : 'text-gray-500'}`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No products found.</p>
            </div>
          ) : (
            <>
              <div className={`grid gap-4 lg:gap-6 ${viewMode === 'grid' ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4' : 'grid-cols-1'}`}>
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Pagination */}
              {meta && meta.last_page > 1 && (
                <div className="flex justify-center gap-2 mt-8">
                  {Array.from({ length: meta.last_page }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => setSearchParams({ ...Object.fromEntries(searchParams), page: p.toString() })}
                      className={`px-4 py-2 rounded ${p === meta.current_page ? 'bg-primary-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
