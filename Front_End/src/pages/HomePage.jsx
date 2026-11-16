import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingBag,
  Package,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Truck,
  RotateCcw,
  Headphones,
  Laptop,
  Smartphone,
  Gamepad2,
  Watch,
  Check,
  Boxes,
} from 'lucide-react';
import { toast } from 'sonner';
import { productService } from '../services/productService';
import { categoryService } from '../services/categoryService';
import { brandService } from '../services/brandService';
import { useCart } from '../context/CartContext';

const categoryIcons = {
  1: Laptop,
  2: Smartphone,
  3: Headphones,
  4: Gamepad2,
  5: Boxes,
  6: Watch,
};

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [catalogNotice, setCatalogNotice] = useState('');
  const { addToCart } = useCart();

  useEffect(() => {
    Promise.allSettled([
      productService.list(),
      categoryService.getAll(),
      brandService.getAll(),
    ])
      .then(([productResult, categoryResult, brandResult]) => {
        if (productResult.status === 'fulfilled') {
          const prods = productResult.value;
          setProducts(Array.isArray(prods) ? prods : prods?.content || []);
        } else {
          throw productResult.reason;
        }
        if (categoryResult.status === 'fulfilled') setCategories(categoryResult.value || []);
        if (brandResult.status === 'fulfilled') setBrands(brandResult.value || []);
        if (categoryResult.status === 'rejected' || brandResult.status === 'rejected') {
          setCatalogNotice('Sign in to load category and brand directories.');
        }
      })
      .catch((error) => setLoadError(error.response?.data?.message || error.message || 'Unable to load the storefront data.'))
      .finally(() => setLoading(false));
  }, []);

  const handleAddToCart = (product, e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
    toast.success(`Added ${product.productName || product.name} to cart!`);
  };

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white py-16 sm:py-24">
        {/* Glow circles */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 right-10 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                <Sparkles className="w-3.5 h-3.5" /> Next-Gen Technology Store
              </span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
                Electronics Crafted for <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Precision.</span>
              </h1>
              <p className="text-sm sm:text-base text-slate-300 max-w-lg leading-relaxed">
                Discover flagship laptops, noise-canceling acoustics, OLED displays, and mobile devices
                engineered for creators, gamers, and professionals.
              </p>
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  to="/shop"
                  className="px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-lg shadow-blue-500/25 transition-all flex items-center gap-2"
                >
                  <span>Explore Electronic Catalog</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/shop?availability=in-stock"
                  className="px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/10 backdrop-blur-sm transition-all"
                >
                  In-Stock Gear
                </Link>
              </div>

              {/* Badges */}
              <div className="flex items-center gap-6 pt-4 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-blue-400" /> Browse live catalog
                </div>
                <div className="flex items-center gap-2">
                  <Boxes className="w-4 h-4 text-emerald-400" /> Products from real store data
                </div>
              </div>
            </div>

            {/* Hero Visual Card */}
            <div className="relative">
              <div className="relative rounded-3xl bg-gradient-to-b from-white/10 to-white/5 p-3 backdrop-blur-md border border-white/10 shadow-2xl">
                <div className="relative rounded-2xl overflow-hidden bg-slate-900 aspect-video sm:aspect-square flex items-center justify-center p-6">
                  <img
                    src="https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1000&q=80"
                    alt="Laptop from the NIT electronics collection"
                    className="w-full h-full object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute bottom-4 left-4 right-4 p-4 rounded-xl bg-slate-950/80 backdrop-blur-md border border-white/10 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">
                        NIT Electronics
                      </div>
                      <div className="text-xs font-bold text-white">Explore the product catalog</div>
                    </div>
                    <Link
                      to="/shop"
                      className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-semibold"
                    >
                      Shop now
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Categories Carousel / Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {catalogNotice && <p className="mb-3 text-xs text-slate-500">{catalogNotice}</p>}
        <div className="flex items-end justify-between mb-6">
          <div>
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
              Browse Categories
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">
              Browse by Category
            </h2>
          </div>
          <Link
            to="/shop"
            className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
          >
            All Categories <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.slice(0, 6).map((cat) => {
            const IconComponent = categoryIcons[cat.id] || Boxes;
            return (
              <Link
                key={cat.id}
                to={`/shop?category=${cat.id}`}
                className="group p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl hover:border-blue-500/50 hover:shadow-lg transition-all text-center flex flex-col items-center justify-center space-y-3"
              >
                <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 group-hover:scale-110 transition-transform flex items-center justify-center">
                  <IconComponent className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-xs text-slate-800 dark:text-slate-100 group-hover:text-blue-600 transition-colors">
                    {cat.name}
                  </h3>
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    {cat.productCount ? `${cat.productCount} models` : 'Explore'}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Featured Products Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-6">
          <div>
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
              Handpicked Gear
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">
              Latest Products
            </h2>
          </div>
          <Link
            to="/shop"
            className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
          >
            View Full Catalog <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="py-16 text-center text-slate-400 text-xs">
            Loading products from backend...
          </div>
        ) : loadError ? (
          <div className="py-12 text-center text-sm text-rose-600">{loadError}</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {products.slice(0, 8).map((product) => {
              const isOut = Number(product.quantity) <= 0 || product.status === false;
              return (
                <Link
                  key={product.id}
                  to={`/products/${product.id}`}
                  className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden hover:shadow-xl hover:border-blue-500/40 transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Thumbnail */}
                    <div className="h-52 bg-slate-50 dark:bg-slate-800/60 p-4 relative flex items-center justify-center overflow-hidden">
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt={product.productName}
                          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <ShoppingBag className="w-10 h-10 text-slate-300" />
                      )}

                      {/* Discount pill */}
                    </div>

                    {/* Meta info */}
                    <div className="p-4">
                      <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                        <span className="font-semibold text-blue-600 uppercase tracking-wider">
                          {product.brandName || 'Brand'}
                        </span>
                        <span className={isOut ? 'text-rose-600' : 'text-emerald-600'}>{isOut ? 'Out of stock' : `${product.quantity} in stock`}</span>
                      </div>

                      <h3 className="font-semibold text-xs text-slate-800 dark:text-slate-100 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
                        {product.productName || product.name}
                      </h3>
                    </div>
                  </div>

                  {/* Price & Add to Cart */}
                  <div className="p-4 pt-0 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 mt-2">
                    <div>
                      <div className="text-base font-extrabold text-slate-900 dark:text-slate-100">
                        ${Number(product.price).toFixed(2)}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => handleAddToCart(product, e)}
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
      </section>

      {/* Brands Showcase Band */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-10 rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="text-center max-w-xl mx-auto mb-8">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
              Authorized Partnerships
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">
              Top Global Electronics Brands
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Explore brands currently available in the store catalog.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4">
            {brands.map((b) => (
              <Link
                key={b.id}
                to={`/shop?brand=${b.id}`}
                className="px-5 py-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-extrabold text-xs text-slate-700 dark:text-slate-200 hover:border-blue-500 hover:text-blue-600 transition-all shadow-sm"
              >
                {b.name || b.brandName}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Assurance / Trust section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-2">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
              <Truck className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-xs text-slate-800 dark:text-slate-100">
              Live Product Catalog
            </h3>
            <p className="text-[11px] text-slate-400">
              Product names, prices, and stock status come from the store API.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-2">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-xs text-slate-800 dark:text-slate-100">
              Browse by Category
            </h3>
            <p className="text-[11px] text-slate-400">
              Find products using the categories configured in the backend.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-2">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
              <RotateCcw className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-xs text-slate-800 dark:text-slate-100">
              Browser Cart
            </h3>
            <p className="text-[11px] text-slate-400">
              Your selected items are saved locally in this browser.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-2">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
              <Headphones className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-xs text-slate-800 dark:text-slate-100">
              24/7 Expert Support
            </h3>
            <p className="text-[11px] text-slate-400">
              Talk with our system engineers for setup, driver updates, and tech queries.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
