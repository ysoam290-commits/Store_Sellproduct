import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Search,
  Filter,
  SlidersHorizontal,
  Package,
  ShoppingBag,
  Check,
  ChevronDown,
  X,
  Layers,
  Building2,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';
import { productService } from '../../services/productService';
import { useCart } from '../../context/CartContext';
import Pagination from '../../components/common/Pagination';
import { getProductBrands, getProductCategories } from '../../utils/catalogOptions';

export default function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  // Filters state from URL or local
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('categoryName') || searchParams.get('category') || '');
  const [selectedBrand, setSelectedBrand] = useState(searchParams.get('brandName') || searchParams.get('brand') || '');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [inStockOnly, setInStockOnly] = useState(searchParams.get('availability') === 'in-stock');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'newest');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 9;

  const { addToCart } = useCart();

  useEffect(() => {
    productService.list()
      .then((data) => {
        const prods = Array.isArray(data) ? data : data?.content || [];
        setProducts(prods);
        setCategories(getProductCategories(prods));
        setBrands(getProductBrands(prods));
      })
      .catch((error) => setLoadError(error.response?.data?.message || error.message || 'Unable to load catalog data.'))
      .finally(() => setLoading(false));
  }, []);

  // Keep catalog filters in sync with navbar and browser URL navigation.
  useEffect(() => {
    setSelectedCategory(searchParams.get('categoryName') || searchParams.get('category') || '');
    setSelectedBrand(searchParams.get('brandName') || searchParams.get('brand') || '');
    setSearchQuery(searchParams.get('q') || '');
    setMinPrice(searchParams.get('minPrice') || '');
    setMaxPrice(searchParams.get('maxPrice') || '');
    setInStockOnly(searchParams.get('availability') === 'in-stock');
    setSortBy(searchParams.get('sort') || 'newest');
    setCurrentPage(0);
  }, [searchParams]);

  // Filter & Sort Logic
  const filteredProducts = useMemo(() => {
    let list = [...products];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (p) =>
          (p.productName || p.name || '').toLowerCase().includes(q) ||
          (p.brandName || '').toLowerCase().includes(q) ||
          (p.categoryName || '').toLowerCase().includes(q)
      );
    }

    if (selectedCategory) {
      const category = selectedCategory.trim().toLocaleLowerCase();
      list = list.filter((p) =>
        String(p.categoryId) === selectedCategory ||
        String(p.categoryName || '').trim().toLocaleLowerCase() === category
      );
    }

    if (selectedBrand) {
      const brand = selectedBrand.trim().toLocaleLowerCase();
      list = list.filter((p) =>
        String(p.brandId) === selectedBrand ||
        String(p.brandName || '').trim().toLocaleLowerCase() === brand
      );
    }

    if (minPrice) {
      list = list.filter((p) => Number(p.price) >= Number(minPrice));
    }

    if (maxPrice) {
      list = list.filter((p) => Number(p.price) <= Number(maxPrice));
    }

    if (inStockOnly) {
      list = list.filter((p) => Number(p.quantity) > 0 && p.status !== false);
    }

    // Sort
    if (sortBy === 'price-low') {
      list.sort((a, b) => Number(a.price) - Number(b.price));
    } else if (sortBy === 'price-high') {
      list.sort((a, b) => Number(b.price) - Number(a.price));
    } else if (sortBy === 'newest') {
      list.sort((a, b) => (b.id || 0) - (a.id || 0));
    }

    return list;
  }, [products, searchQuery, selectedCategory, selectedBrand, minPrice, maxPrice, inStockOnly, sortBy]);

  const totalPages = Math.ceil(filteredProducts.length / pageSize) || 1;
  const paginatedProducts = useMemo(() => {
    const start = currentPage * pageSize;
    return filteredProducts.slice(start, start + pageSize);
  }, [filteredProducts, currentPage, pageSize]);

  const clearAllFilters = () => {
    setSelectedCategory('');
    setSelectedBrand('');
    setSearchQuery('');
    setMinPrice('');
    setMaxPrice('');
    setInStockOnly(false);
    setSortBy('newest');
    setCurrentPage(0);
    setSearchParams({});
  };

  const selectCategory = (categoryId) => {
    setSelectedCategory(categoryId);
    // Category buttons should show that category across every brand.
    setSelectedBrand('');
    setCurrentPage(0);
  };

  const handleAddToCart = (product, e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
    toast.success(`Added ${product.productName || product.name} to cart!`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Breadcrumb & Title */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
          <Link to="/" className="hover:text-blue-600 transition-colors">
            Home
          </Link>
          <span>/</span>
          <span className="text-slate-700 dark:text-slate-200 font-medium">Electronics Catalog</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              Explore Electronic Devices
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              High-end computers, audio gear, mobile flagships, and smart peripherals.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Mobile Filter Toggle */}
            <button
              onClick={() => setMobileFilterOpen(true)}
              className="lg:hidden flex items-center gap-2 px-3.5 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300"
            >
              <SlidersHorizontal className="w-4 h-4 text-blue-600" /> Filters
            </button>

            {/* Sort Select */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 hidden sm:inline">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="newest">Newest Arrivals</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Sidebar Filters + Catalog */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Filters (Desktop) */}
        <aside className="hidden lg:block space-y-6">
          <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                Filter Devices
              </span>
              <button
                onClick={clearAllFilters}
                className="text-[11px] font-semibold text-blue-600 hover:underline"
              >
                Reset All
              </button>
            </div>

            {/* Search within catalog */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Search Catalog
              </label>
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter by title..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>

            {/* Categories */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2.5">
                Categories
              </label>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                <button
                  onClick={() => selectCategory('')}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    !selectedCategory
                      ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  All Categories ({products.length})
                </button>
                {categories.map((c) => (
                  <button
                    key={c.name}
                    onClick={() => selectCategory(c.name)}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      String(selectedCategory) === String(c.id) ||
                      String(selectedCategory).toLocaleLowerCase() === c.name.toLocaleLowerCase()
                        ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 font-semibold'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Brands */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2.5">
                Brands &amp; Makers
              </label>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                <button
                  onClick={() => setSelectedBrand('')}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    !selectedBrand
                      ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  All Brands
                </button>
                {brands.map((b) => (
                  <button
                    key={b.name}
                    onClick={() => setSelectedBrand(b.name)}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      String(selectedBrand) === String(b.id) ||
                      String(selectedBrand).toLocaleLowerCase() === b.name.toLocaleLowerCase()
                        ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 font-semibold'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    {b.name || b.brandName}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Price Range ($)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                />
                <span className="text-slate-400">-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                />
              </div>
            </div>

            {/* Availability */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  In Stock Only
                </span>
              </label>
            </div>
          </div>
        </aside>

        {/* Catalog Grid */}
        <div className="lg:col-span-3 space-y-6">
          {loading ? (
            <div className="py-20 text-center text-slate-400 text-sm">
              Loading electronic inventory...
            </div>
          ) : loadError ? (
            <div className="py-12 text-center text-sm text-rose-600">{loadError}</div>
          ) : paginatedProducts.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
              <Package className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                No matching electronic items
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Try widening your price range or clearing category filters.
              </p>
              <button
                onClick={clearAllFilters}
                className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {paginatedProducts.map((p) => {
                const isOut = Number(p.quantity) <= 0 || p.status === false;
                return (
                  <Link
                    key={p.id}
                    to={`/products/${p.id}`}
                    className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden hover:shadow-xl hover:border-blue-500/40 transition-all flex flex-col justify-between"
                  >
                    <div>
                      {/* Product Image */}
                      <div className="h-52 bg-slate-50 dark:bg-slate-800/60 p-4 relative flex items-center justify-center overflow-hidden">
                        {p.imageUrl ? (
                          <img
                            src={p.imageUrl}
                            alt={p.productName}
                            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <Package className="w-12 h-12 text-slate-300" />
                        )}

                        {/* Badges */}
                        <div className="absolute top-3 left-3 flex flex-col gap-1">
                          {isOut && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-white">
                              Out of stock
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-4">
                        <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                          <span className="font-semibold text-blue-600 uppercase tracking-wider">
                            {p.brandName || 'Brand'}
                          </span>
                          <span className={isOut ? 'text-rose-600' : 'text-emerald-600'}>{isOut ? 'Out of stock' : `${p.quantity} in stock`}</span>
                        </div>

                        <h3 className="font-semibold text-sm text-slate-800 dark:text-slate-100 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
                          {p.productName || p.name}
                        </h3>

                        <div className="mt-3 min-h-[76px] rounded-xl border border-slate-100 dark:border-slate-800 bg-gradient-to-br from-blue-50/80 to-slate-50 dark:from-blue-950/30 dark:to-slate-800/60 p-3">
                          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                            <Sparkles className="h-3 w-3" /> Product details
                          </div>
                          <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                            {p.description?.trim() || 'More product details will be added soon.'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Footer / Price & Add */}
                    <div className="p-4 pt-0 flex items-center justify-between border-t border-slate-100 dark:border-slate-800/80 mt-2">
                      <div>
                        <div className="text-base font-extrabold text-slate-900 dark:text-slate-100">
                          ${Number(p.price).toFixed(2)}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => handleAddToCart(p, e)}
                        disabled={isOut}
                        className="px-3.5 py-2 rounded-xl bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-600 hover:text-white text-blue-600 dark:text-blue-400 text-xs font-semibold transition-all flex items-center gap-1.5 disabled:opacity-50"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>Add</span>
                      </button>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalElements={filteredProducts.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>
    </div>
  );
}
