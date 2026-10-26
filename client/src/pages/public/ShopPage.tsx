import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, SlidersHorizontal, ArrowUpDown, X, Search, Check } from 'lucide-react';
import { api } from '../../services/api';
import { IProduct, ICategory, IBrand } from '../../types';
import { ProductCard } from '../../components/products/ProductCard';
import { Button } from '../../components/ui/Button';

export const ShopPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState<IProduct[]>([]);
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [brands, setBrands] = useState<IBrand[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Filter states
  const categoryParam = searchParams.get('category') || 'all';
  const brandParam = searchParams.get('brand') || 'all';
  const sortParam = searchParams.get('sort') || 'newest';
  const searchParam = searchParams.get('search') || '';
  const inStockParam = searchParams.get('inStock') === 'true';
  const pageParam = parseInt(searchParams.get('page') || '1', 10);

  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 12,
    pages: 1,
  });

  // Load categories & brands once
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [catRes, brandRes] = await Promise.all([
          api.get('/products/categories'),
          api.get('/products/brands'),
        ]);
        if (catRes.data.success) setCategories(catRes.data.categories);
        if (brandRes.data.success) setBrands(brandRes.data.brands);
      } catch (err) {
        console.error('Metadata fetch error:', err);
      }
    };
    fetchMetadata();
  }, []);

  // Fetch filtered products
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const params: any = {
          page: pageParam,
          limit: 12,
          sort: sortParam,
        };

        if (categoryParam !== 'all') params.category = categoryParam;
        if (brandParam !== 'all') params.brand = brandParam;
        if (searchParam) params.search = searchParam;
        if (inStockParam) params.inStock = 'true';

        const res = await api.get('/products', { params });
        if (res.data.success) {
          setProducts(res.data.products);
          setPagination(res.data.pagination);
        }
      } catch (err) {
        console.error('Failed to load products:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [categoryParam, brandParam, sortParam, searchParam, inStockParam, pageParam]);

  const updateParam = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (!value || value === 'all') {
      newParams.delete(key);
    } else {
      newParams.set(key, value);
    }
    newParams.set('page', '1'); // Reset to page 1 on filter change
    setSearchParams(newParams);
  };

  const clearAllFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  const hasActiveFilters =
    categoryParam !== 'all' || brandParam !== 'all' || searchParam || inStockParam;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 pb-6 border-b border-[#E8E3FA]">
        <div>
          <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-[#14152D]">
            {searchParam ? `Search: "${searchParam}"` : 'All Products'}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Showing {products.length} of {pagination.total} handcrafted & curated items
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          {/* Mobile Filter Toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsMobileFilterOpen(true)}
            className="md:hidden flex-1"
            leftIcon={<SlidersHorizontal className="w-4 h-4" />}
          >
            Filters {hasActiveFilters && '•'}
          </Button>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 font-medium hidden sm:inline-block">Sort by:</span>
            <select
              value={sortParam}
              onChange={(e) => updateParam('sort', e.target.value)}
              className="bg-white border border-[#E8E3FA] text-[#14152D] text-xs font-semibold rounded-xl px-3 py-2 outline-none focus:border-[#7444FF] cursor-pointer"
            >
              <option value="newest">Newest Arrivals</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
              <option value="popular">Most Popular</option>
            </select>
          </div>
        </div>
      </div>

      {/* Active Filter Pills */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 pt-4">
          <span className="text-xs text-gray-400 font-medium">Active:</span>
          {categoryParam !== 'all' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F0EBFF] text-[#7444FF] text-xs font-semibold">
              Category: {categories.find((c) => c.slug === categoryParam)?.name || categoryParam}
              <X className="w-3.5 h-3.5 cursor-pointer" onClick={() => updateParam('category', 'all')} />
            </span>
          )}
          {brandParam !== 'all' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFEBEA] text-[#FF6B67] text-xs font-semibold">
              Brand: {brands.find((b) => b.slug === brandParam)?.name || brandParam}
              <X className="w-3.5 h-3.5 cursor-pointer" onClick={() => updateParam('brand', 'all')} />
            </span>
          )}
          {searchParam && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-semibold">
              Query: "{searchParam}"
              <X className="w-3.5 h-3.5 cursor-pointer" onClick={() => updateParam('search', '')} />
            </span>
          )}
          {inStockParam && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E3FAF7] text-[#148376] text-xs font-semibold">
              In Stock Only
              <X className="w-3.5 h-3.5 cursor-pointer" onClick={() => updateParam('inStock', '')} />
            </span>
          )}
          <button
            onClick={clearAllFilters}
            className="text-xs font-semibold text-[#FF6B67] hover:underline ml-2"
          >
            Clear All
          </button>
        </div>
      )}

      {/* Main Content: Sidebar Filters + Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pt-6">
        {/* Desktop Sidebar Filters */}
        <aside className="hidden md:block space-y-8 pr-4">
          {/* Categories */}
          <div>
            <h3 className="font-display font-semibold text-sm text-[#14152D] uppercase tracking-wider mb-3">
              Categories
            </h3>
            <div className="space-y-1.5">
              <button
                onClick={() => updateParam('category', 'all')}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-colors flex items-center justify-between ${
                  categoryParam === 'all'
                    ? 'bg-[#7444FF] text-white font-semibold'
                    : 'text-gray-600 hover:bg-[#F0EBFF] hover:text-[#7444FF]'
                }`}
              >
                <span>All Categories</span>
                <span>{categories.reduce((sum, c) => sum + (c.productCount || 0), 0)}</span>
              </button>
              {categories.map((cat) => (
                <button
                  key={cat._id}
                  onClick={() => updateParam('category', cat.slug)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-colors flex items-center justify-between ${
                    categoryParam === cat.slug
                      ? 'bg-[#7444FF] text-white font-semibold'
                      : 'text-gray-600 hover:bg-[#F0EBFF] hover:text-[#7444FF]'
                  }`}
                >
                  <span>{cat.name}</span>
                  <span className="opacity-75">{cat.productCount || 0}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Availability */}
          <div className="pt-4 border-t border-gray-100">
            <h3 className="font-display font-semibold text-sm text-[#14152D] uppercase tracking-wider mb-3">
              Availability
            </h3>
            <label className="flex items-center gap-2.5 text-xs text-gray-700 font-medium cursor-pointer select-none">
              <input
                type="checkbox"
                checked={inStockParam}
                onChange={(e) => updateParam('inStock', e.target.checked ? 'true' : '')}
                className="w-4 h-4 rounded border-gray-300 text-[#7444FF] focus:ring-[#7444FF]"
              />
              <span>In Stock Only</span>
            </label>
          </div>

          {/* Brands */}
          {brands.length > 0 && (
            <div className="pt-4 border-t border-gray-100">
              <h3 className="font-display font-semibold text-sm text-[#14152D] uppercase tracking-wider mb-3">
                Brands
              </h3>
              <div className="space-y-1.5">
                <button
                  onClick={() => updateParam('brand', 'all')}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                    brandParam === 'all'
                      ? 'bg-[#14152D] text-white font-semibold'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  All Brands
                </button>
                {brands.map((b) => (
                  <button
                    key={b._id}
                    onClick={() => updateParam('brand', b.slug)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                      brandParam === b.slug
                        ? 'bg-[#14152D] text-white font-semibold'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {b.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </aside>

        {/* Product Grid Area */}
        <div className="md:col-span-3 space-y-8">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="h-80 bg-gray-100 rounded-3xl animate-pulse" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-[#E8E3FA] p-8 space-y-4">
              <div className="w-16 h-16 rounded-full bg-[#F0EBFF] text-[#7444FF] flex items-center justify-center mx-auto">
                <Search className="w-8 h-8" />
              </div>
              <h3 className="font-display font-bold text-xl text-[#14152D]">No products found</h3>
              <p className="text-sm text-gray-500 max-w-sm mx-auto">
                Try adjusting your search query, clearing filters, or browsing other categories.
              </p>
              <Button variant="outline" size="sm" onClick={clearAllFilters}>
                Reset All Filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-6">
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page <= 1}
                onClick={() => updateParam('page', (pagination.page - 1).toString())}
              >
                Previous
              </Button>

              {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => updateParam('page', p.toString())}
                  className={`w-9 h-9 rounded-xl text-xs font-semibold transition-colors ${
                    pagination.page === p
                      ? 'bg-[#7444FF] text-white shadow-sm'
                      : 'bg-white border border-[#E8E3FA] text-gray-700 hover:bg-[#F0EBFF]'
                  }`}
                >
                  {p}
                </button>
              ))}

              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page >= pagination.pages}
                onClick={() => updateParam('page', (pagination.page + 1).toString())}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filters Drawer */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-[#14152D]/60 backdrop-blur-sm"
            onClick={() => setIsMobileFilterOpen(false)}
          />
          <div className="relative ml-auto w-full max-w-xs bg-white h-full p-6 shadow-2xl overflow-y-auto space-y-6">
            <div className="flex justify-between items-center pb-4 border-b border-gray-100">
              <h3 className="font-display font-bold text-lg text-[#14152D]">Filters</h3>
              <button onClick={() => setIsMobileFilterOpen(false)} className="p-1 text-gray-500">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Categories */}
            <div>
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Category</h4>
              <div className="space-y-1">
                <button
                  onClick={() => {
                    updateParam('category', 'all');
                    setIsMobileFilterOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs ${
                    categoryParam === 'all' ? 'bg-[#7444FF] text-white font-bold' : 'text-gray-700'
                  }`}
                >
                  All Categories
                </button>
                {categories.map((c) => (
                  <button
                    key={c._id}
                    onClick={() => {
                      updateParam('category', c.slug);
                      setIsMobileFilterOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs ${
                      categoryParam === c.slug ? 'bg-[#7444FF] text-white font-bold' : 'text-gray-700'
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Stock Toggle */}
            <div className="pt-4 border-t border-gray-100">
              <label className="flex items-center gap-2 text-xs font-semibold text-gray-800">
                <input
                  type="checkbox"
                  checked={inStockParam}
                  onChange={(e) => updateParam('inStock', e.target.checked ? 'true' : '')}
                />
                In Stock Only
              </label>
            </div>

            <Button
              variant="primary"
              className="w-full mt-4"
              onClick={() => setIsMobileFilterOpen(false)}
            >
              Apply Filters
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
