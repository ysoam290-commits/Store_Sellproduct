import React, { useEffect, useMemo, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  Boxes,
  ChevronDown,
  Menu,
  Search,
  ShoppingBag,
  User as UserIcon,
  X,
  LayoutDashboard,
  LogOut,
  Shield,
  Layers,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { productService } from '../services/productService';
import { getProductBrands, getProductCategories } from '../utils/catalogOptions';

export default function StoreLayout() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [query, setQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);

  const { user, isAdmin, signOut } = useAuth();
  const { count, total } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    let active = true;
    productService.list().then((data) => {
      if (!active) return;
      const productList = Array.isArray(data) ? data : data?.content || [];
      setProducts(productList);
      setCategories(getProductCategories(productList));
      setBrands(getProductBrands(productList));
    }).catch(() => {
      if (active) {
        setProducts([]);
        setCategories([]);
        setBrands([]);
      }
    });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    setAccountMenuOpen(false);
  }, [location.pathname, location.search]);

  const searchMatches = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return products
      .filter(
        (p) =>
          (p.productName || p.name || '').toLowerCase().includes(q) ||
          (p.brandName || '').toLowerCase().includes(q)
      )
      .slice(0, 5);
  }, [query, products]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/shop?q=${encodeURIComponent(query)}`);
      setQuery('');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 font-sans text-slate-800 dark:text-slate-100">
      {/* Top Announcement Bar */}
      <div className="bg-slate-900 text-slate-300 py-1.5 px-4 text-[11px] text-center border-b border-slate-800 flex items-center justify-center gap-3">
        <span>⚡ Discover the latest technology at NIT Electronics</span>
        <Link to="/shop" className="text-blue-400 font-semibold hover:underline hidden sm:inline">
          Shop new arrivals →
        </Link>
      </div>

      {/* Main Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 py-3.5 flex items-center justify-between gap-4">
          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 flex-shrink-0 group">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <Boxes className="w-5 h-5" />
            </div>
            <div>
              <div className="font-extrabold text-base tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-1">
                NIT <span className="text-blue-600">ELECTRONICS</span>
              </div>
              <div className="text-[10px] text-slate-400 tracking-wider font-mono">
                STORE &amp; TECH LAB
              </div>
            </div>
          </Link>

          {/* Search Bar with live autocomplete */}
          <div className="relative flex-1 max-w-lg hidden sm:block">
            <form onSubmit={handleSearchSubmit} className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search MacBook, Sony ANC, Galaxy Ultra, RTX 4090..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-10 pr-20 py-2.5 bg-slate-100 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800 dark:text-slate-100"
              />
              <button
                type="submit"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[11px] font-semibold transition-colors"
              >
                Search
              </button>
            </form>

            {/* Autocomplete Dropdown */}
            {searchMatches.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden z-50 p-2 space-y-1 animate-fadeIn">
                {searchMatches.map((p) => (
                  <Link
                    key={p.id}
                    to={`/products/${p.id}`}
                    onClick={() => setQuery('')}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 p-1 flex items-center justify-center">
                        <img src={p.imageUrl} alt="" className="w-full h-full object-contain" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                          {p.productName || p.name}
                        </div>
                        <div className="text-[10px] text-slate-400">{p.brandName || 'Brand'}</div>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-blue-600">
                      ${Number(p.price).toFixed(2)}
                    </span>
                  </Link>
                ))}
                <button
                  onClick={handleSearchSubmit}
                  className="w-full py-2 text-center text-xs font-semibold text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-xl"
                >
                  View all results for "{query}" →
                </button>
              </div>
            )}
          </div>

          {/* Right Actions: Account, Cart, Admin shortcut */}
          <div className="flex items-center gap-3">
            {/* Admin Dashboard Pill */}
            {isAdmin && (
              <Link
                to="/admin"
                className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white dark:bg-blue-600 rounded-xl text-xs font-bold tracking-tight shadow-sm hover:opacity-90 transition-opacity"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Admin Backoffice</span>
              </Link>
            )}

            {/* User Account Popover */}
            <div className="relative">
              {user ? (
                <button
                  onClick={() => setAccountMenuOpen(!accountMenuOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-left transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-bold text-xs flex items-center justify-center">
                    {user.firstName ? user.firstName[0] : (user.email || 'U')[0].toUpperCase()}
                  </div>
                  <div className="hidden lg:block">
                    <div className="text-xs font-semibold leading-tight text-slate-800 dark:text-slate-200">
                      {user.firstName || user.email?.split('@')[0]}
                    </div>
                    <div className="text-[10px] text-slate-400">My Account</div>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden lg:block" />
                </button>
              ) : (
                <Link
                  to="/login"
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <UserIcon className="w-4 h-4 text-blue-600" />
                  <span>Sign In</span>
                </Link>
              )}

              {/* Account Dropdown Menu */}
              {accountMenuOpen && user && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-2 space-y-1 z-50">
                  <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-100">
                      {user.firstName ? `${user.firstName} ${user.lastName || ''}` : user.email}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate">{user.email}</div>
                  </div>
                  <Link
                    to="/profile"
                    onClick={() => setAccountMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    <UserIcon className="w-3.5 h-3.5" /> My Profile
                  </Link>
                  {isAdmin && (
                    <Link
                      to="/admin"
                      onClick={() => setAccountMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-blue-600 font-semibold hover:bg-blue-50 dark:hover:bg-slate-800"
                    >
                      <LayoutDashboard className="w-3.5 h-3.5" /> Admin Dashboard
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      setAccountMenuOpen(false);
                      signOut();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-800 text-left"
                  >
                    <LogOut className="w-3.5 h-3.5" /> Sign Out
                  </button>
                </div>
              )}
            </div>

            {/* Shopping Cart Link */}
            <Link
              to="/cart"
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white transition-all relative group"
            >
              <div className="relative">
                <ShoppingBag className="w-4 h-4" />
                {count > 0 && (
                  <span className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-rose-600 text-white text-[9px] font-extrabold flex items-center justify-center border-2 border-white dark:border-slate-900">
                    {count}
                  </span>
                )}
              </div>
              <span className="text-xs font-bold hidden sm:inline">
                ${total.toFixed(2)}
              </span>
            </Link>
          </div>
        </div>

        {/* Secondary Category Navigation */}
        <nav aria-label="Shop categories and brands" className="bg-slate-900 text-slate-200 border-t border-slate-800 hidden lg:block overflow-x-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex w-max min-w-full items-center gap-6 text-xs h-10 whitespace-nowrap">
            <NavLink
              to="/shop"
              className="flex items-center gap-2 font-bold text-white bg-blue-600 px-3 py-1.5 rounded-lg shadow-sm"
            >
              <Boxes className="w-3.5 h-3.5" /> All Electronics
            </NavLink>
            <Link to="/shop?sort=newest" className="hover:text-white transition-colors">
              New Releases
            </Link>
            <Link to="/shop?availability=in-stock" className="hover:text-white transition-colors">
              In Stock
            </Link>
            {categories.map((c) => (
              <Link
                key={c.name}
                to={`/shop?categoryName=${encodeURIComponent(c.name)}`}
                className="hover:text-white text-slate-300 transition-colors"
              >
                {c.name}
              </Link>
            ))}
            {brands.length > 0 && (
              <>
                <span aria-hidden="true" className="h-5 border-l border-slate-700" />
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Brands</span>
              </>
            )}
            {brands.map((brand) => (
              <Link
                key={`brand-${brand.name}`}
                to={`/shop?brandName=${encodeURIComponent(brand.name)}`}
                className="hover:text-white text-slate-300 transition-colors"
              >
                {brand.name || brand.brandName}
              </Link>
            ))}
          </div>
        </nav>
      </header>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-4 space-y-4">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search products..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
            />
          </form>

          <div className="space-y-1 text-xs font-semibold">
            <Link
              to="/shop"
              className="block p-2 rounded-lg bg-blue-50 text-blue-600 font-bold"
            >
              Shop All Products
            </Link>
            {categories.map((c) => (
              <Link
                key={c.name}
                to={`/shop?categoryName=${encodeURIComponent(c.name)}`}
                className="block p-2 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50"
              >
                {c.name}
              </Link>
            ))}
            {brands.length > 0 && <div className="px-2 pt-3 pb-1 text-[10px] uppercase tracking-wider text-slate-400">Brands</div>}
            {brands.map((brand) => (
              <Link
                key={`brand-${brand.name}`}
                to={`/shop?brandName=${encodeURIComponent(brand.name)}`}
                className="block p-2 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50"
              >
                {brand.name || brand.brandName}
              </Link>
            ))}
            {isAdmin && (
              <Link
                to="/admin"
                className="block p-2 rounded-lg text-purple-600 font-bold hover:bg-purple-50"
              >
                Admin Dashboard
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Main Outlet */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Store Footer */}
      <footer className="bg-slate-900 text-slate-400 text-xs border-t border-slate-800 pt-12 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2 font-extrabold text-sm text-white">
              <Boxes className="w-5 h-5 text-blue-500" /> NIT ELECTRONICS
            </div>
            <p className="text-[11px] leading-relaxed text-slate-400">
              Your trusted partner for consumer electronics, computing workstations, audio excellence,
              and mobile ecosystems.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-white mb-3 uppercase tracking-wider text-[11px]">
              Catalog &amp; Shop
            </h4>
            <div className="space-y-2 flex flex-col">
              <Link to="/shop" className="hover:text-white transition-colors">
                All Electronics
              </Link>
              <Link to="/shop?sort=newest" className="hover:text-white transition-colors">
                New Arrivals
              </Link>
              <Link to="/shop?availability=in-stock" className="hover:text-white transition-colors">
                In-Stock Hardware
              </Link>
              <Link to="/cart" className="hover:text-white transition-colors">
                Your Cart
              </Link>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-white mb-3 uppercase tracking-wider text-[11px]">
              Customer Service
            </h4>
            <div className="space-y-2 flex flex-col">
              <Link to="/profile" className="hover:text-white transition-colors">
                User Profile
              </Link>
              <Link to="/login" className="hover:text-white transition-colors">
                Sign In / Register
              </Link>
              <span className="text-slate-500">Order tracking and warranty details are not provided by the current API.</span>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-white mb-3 uppercase tracking-wider text-[11px]">
              Store Backoffice
            </h4>
            <div className="space-y-2 flex flex-col">
              <Link to="/admin" className="hover:text-white transition-colors text-blue-400 font-semibold">
                Admin Management Console
              </Link>
              <Link to="/admin/products" className="hover:text-white transition-colors">
                Products Inventory
              </Link>
              <Link to="/admin/brands" className="hover:text-white transition-colors">
                Brand Directory
              </Link>
              <Link to="/admin/roles" className="hover:text-white transition-colors">
                Security &amp; RBAC
              </Link>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 border-t border-slate-800 text-[11px] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>© {new Date().getFullYear()} NIT Electronics Store. All rights reserved.</div>
          <div className="flex items-center gap-4 text-slate-500">
            <span>Spring Boot REST Backend</span>
            <span>·</span>
            <span>ReactJS &amp; Tailwind CSS</span>
            <span>·</span>
            <span>JWT Secured</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
