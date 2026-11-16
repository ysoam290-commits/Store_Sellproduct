import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  Tag,
  Boxes,
  Users,
  Shield,
  Plus,
  ArrowRight,
  TrendingUp,
  Activity,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { productApi } from '../../api/productApi';
import { categoryApi } from '../../api/categoryApi';
import { brandApi } from '../../api/brandApi';
import { formatCurrency } from '../../utils/formatters';
import { getImageUrl } from '../../utils/imageHelper';
import Spinner from '../../components/Spinner';
import Badge from '../../components/Badge';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    productsCount: 0,
    categoriesCount: 0,
    brandsCount: 0,
    totalInventoryValue: 0,
  });
  const [recentProducts, setRecentProducts] = useState([]);
  const [categoriesList, setCategoriesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setLoading(true);
        const [prods, cats, brs] = await Promise.all([
          productApi.getAll(),
          categoryApi.getAll(),
          brandApi.getAll(),
        ]);

        const prodList = Array.isArray(prods) ? prods : [];
        const catList = Array.isArray(cats) ? cats : cats?.content || [];
        const brList = Array.isArray(brs) ? brs : [];

        const totalVal = prodList.reduce(
          (sum, p) => sum + (p.price || 0) * (p.quantity || 0),
          0
        );

        setStats({
          productsCount: prodList.length,
          categoriesCount: catList.length,
          brandsCount: brList.length,
          totalInventoryValue: totalVal,
        });

        setRecentProducts(prodList.slice(0, 5));
        setCategoriesList(catList.slice(0, 6));
      } catch (error) {
        setLoadError(error.response?.data?.message || error.message || 'Could not load dashboard data.');
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Spinner size="lg" />
        <p className="mt-3 text-xs text-slate-500 dark:text-slate-400 font-medium">
          Loading store telemetry and analytics...
        </p>
      </div>
    );
  }

  const statCards = [
    {
      label: 'Total Products',
      value: stats.productsCount,
      sub: 'Items currently in catalog',
      icon: Package,
      color: 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400',
      href: '/admin/products',
    },
    {
      label: 'Active Categories',
      value: stats.categoriesCount,
      sub: 'Store departments & tags',
      icon: Tag,
      color: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400',
      href: '/admin/categories',
    },
    {
      label: 'Partner Brands',
      value: stats.brandsCount,
      sub: 'Registered electronics OEMs',
      icon: Boxes,
      color: 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400',
      href: '/admin/brands',
    },
    {
      label: 'Inventory Asset Value',
      value: formatCurrency(stats.totalInventoryValue),
      sub: 'Sum of in-stock warehouse inventory',
      icon: TrendingUp,
      color: 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400',
      href: '/admin/products',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-lg shadow-blue-500/15">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-blue-200">
            Store Management Console
          </span>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight mt-1">
            NIT Electronics Dashboard
          </h1>
          <p className="text-xs text-blue-100/90 mt-1 max-w-lg">
            Spring Boot REST API integrated with JWT security, PostgreSQL persistence, and live inventory control.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/shop"
            target="_blank"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs backdrop-blur-sm transition-all border border-white/15"
          >
            <span>Preview Storefront</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
          <Link
            to="/admin/products"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-blue-700 hover:bg-blue-50 font-bold text-xs shadow-md transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Manage Catalog</span>
          </Link>
        </div>
      </div>

      {loadError && <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">Dashboard data could not be loaded: {loadError}</div>}

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <Link
              key={idx}
              to={card.href}
              className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-blue-300 dark:hover:border-blue-700/60 transition-all group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  {card.label}
                </span>
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${card.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3 text-2xl font-extrabold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {card.value}
              </div>
              <div className="mt-1 text-[11px] text-slate-400">
                {card.sub}
              </div>
            </Link>
          );
        })}
      </div>

      {/* Two Column Layout: Recent Products & System Telemetry */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Products Table Preview (2 Cols) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Recently Added Devices
              </h2>
              <p className="text-[11px] text-slate-400">
                Latest hardware units listed on the platform
              </p>
            </div>
            <Link
              to="/admin/products"
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
            >
              <span>View all</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {recentProducts.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              No products found. Add your first item.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {recentProducts.map((p) => (
                <div
                  key={p.id}
                  className="py-3 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 overflow-hidden flex-shrink-0 flex items-center justify-center">
                      {p.image ? (
                        <img
                          src={getImageUrl(p.image)}
                          alt={p.productName}
                          className="w-full h-full object-contain p-1"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      ) : (
                        <Package className="w-5 h-5 text-slate-400" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                        {p.productName}
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                        <span>{p.categoryName || 'General'}</span>
                        {p.brandName && (
                          <>
                            <span>•</span>
                            <span className="text-blue-600 dark:text-blue-400 font-medium">
                              {p.brandName}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <div className="font-bold text-slate-900 dark:text-slate-100">
                      {formatCurrency(p.price)}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {p.quantity ?? 0} in stock
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Categories Breakdown & API Integration Status (1 Col) */}
        <div className="space-y-6">
          {/* Categories Overview Card */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Categories Overview
              </h2>
              <Link
                to="/admin/categories"
                className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline"
              >
                Manage
              </Link>
            </div>

            <div className="space-y-2">
              {categoriesList.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-xs"
                >
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    {c.name}
                  </span>
                  <Badge variant={c.status !== false ? 'success' : 'danger'} size="xs">
                    {c.status !== false ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          {/* Backend Health Status */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-500" />
              <span>Backend Architecture</span>
            </h2>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Framework</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  Spring Boot 3 + Java
                </span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Security</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  JWT Stateless Bearer
                </span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Image Serving</span>
                <span className="font-mono text-[11px] text-blue-600 dark:text-blue-400">
                  /uploads/**
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Pagination</span>
                <span className="font-mono text-[11px] text-purple-600 dark:text-purple-400">
                  PageResponse&lt;T&gt;
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
