import React, { useState, useEffect, useMemo } from 'react';
import {
  Package,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Tag,
  Building2,
  ArrowUpDown,
  RefreshCw,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { productApi } from '../../api/productApi';
import { categoryApi } from '../../api/categoryApi';
import { brandApi } from '../../api/brandApi';
import ProductModal from '../../components/product/ProductModal';
import ConfirmDialog from '../../components/ConfirmDialog';
import Pagination from '../../components/Pagination';
import Table from '../../components/Table';
import Button from '../../components/Button';
import Badge from '../../components/Badge';
import { useDebounce } from '../../hooks/useDebounce';
import { formatCurrency } from '../../utils/formatters';
import { getImageUrl } from '../../utils/imageHelper';

export default function ProductManagement() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 300);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [sortBy, setSortBy] = useState('newest'); // 'newest', 'price-asc', 'price-desc', 'name'

  // Modals
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deletingProduct, setDeletingProduct] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Load Initial Data
  const loadData = async () => {
    try {
      setLoading(true);
      const [prods, cats, brs] = await Promise.all([
        productApi.getAll().catch(() => []),
        categoryApi.getAll().catch(() => []),
        brandApi.getAll().catch(() => []),
      ]);
      setProducts(Array.isArray(prods) ? prods : []);
      setCategories(Array.isArray(cats) ? cats : cats?.content || []);
      setBrands(Array.isArray(brs) ? brs : []);
    } catch {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtered & Sorted Products
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        // Search term check
        if (debouncedSearch) {
          const q = debouncedSearch.toLowerCase();
          const matchName = p.productName?.toLowerCase().includes(q);
          const matchDesc = p.description?.toLowerCase().includes(q);
          const matchBrand = p.brandName?.toLowerCase().includes(q);
          const matchCat = p.categoryName?.toLowerCase().includes(q);
          if (!matchName && !matchDesc && !matchBrand && !matchCat) return false;
        }

        // Category check
        if (selectedCategory && Number(p.categoryId) !== Number(selectedCategory)) {
          return false;
        }

        // Brand check
        if (selectedBrand && Number(p.brandId) !== Number(selectedBrand)) {
          return false;
        }

        // Status check
        if (selectedStatus !== '') {
          const isAct = selectedStatus === 'true';
          if (p.status !== isAct) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return (a.price || 0) - (b.price || 0);
        if (sortBy === 'price-desc') return (b.price || 0) - (a.price || 0);
        if (sortBy === 'name') return (a.productName || '').localeCompare(b.productName || '');
        return (b.id || 0) - (a.id || 0); // newest first
      });
  }, [products, debouncedSearch, selectedCategory, selectedBrand, selectedStatus, sortBy]);

  // Paginated Slice
  const totalPages = Math.ceil(filteredProducts.length / pageSize) || 1;
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredProducts.slice(start, start + pageSize);
  }, [filteredProducts, currentPage, pageSize]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, selectedCategory, selectedBrand, selectedStatus, sortBy]);

  // Save (Create or Update)
  const handleSaveProduct = async (payload, isEdit, id) => {
    try {
      if (isEdit) {
        await productApi.update(id, payload);
        toast.success('Product updated successfully!');
      } else {
        await productApi.create(payload);
        toast.success('Product created successfully!');
      }
      loadData();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to save product';
      toast.error(msg);
      throw err;
    }
  };

  // Delete Action
  const handleDeleteProduct = async () => {
    if (!deletingProduct) return;
    try {
      setDeleteLoading(true);
      await productApi.delete(deletingProduct.id);
      toast.success('Product deleted successfully!');
      setDeleteConfirmOpen(false);
      setDeletingProduct(null);
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete product');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Table Columns Definition
  const columns = [
    {
      header: 'Product',
      render: (item) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 overflow-hidden flex-shrink-0 flex items-center justify-center">
            {item.image ? (
              <img
                src={getImageUrl(item.image)}
                alt={item.productName}
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
            <div className="font-semibold text-slate-900 dark:text-slate-100 truncate max-w-xs sm:max-w-sm">
              {item.productName}
            </div>
            <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
              <span>ID: #{item.id}</span>
              {item.brandName && (
                <>
                  <span>•</span>
                  <span className="text-blue-600 dark:text-blue-400 font-medium">
                    {item.brandName}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      ),
    },
    {
      header: 'Category',
      render: (item) => (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium text-xs">
          <Tag className="w-3 h-3 text-slate-400" />
          {item.categoryName || 'Uncategorized'}
        </span>
      ),
    },
    {
      header: 'Price',
      render: (item) => (
        <span className="font-bold text-slate-900 dark:text-slate-100">
          {formatCurrency(item.price)}
        </span>
      ),
    },
    {
      header: 'Stock',
      render: (item) => (
        <span
          className={`font-semibold ${
            (item.quantity ?? 0) > 5
              ? 'text-slate-700 dark:text-slate-300'
              : (item.quantity ?? 0) > 0
              ? 'text-amber-600 dark:text-amber-400'
              : 'text-red-600 dark:text-red-400'
          }`}
        >
          {item.quantity ?? 0} units
        </span>
      ),
    },
    {
      header: 'Status',
      render: (item) => (
        <Badge variant={item.status ? 'success' : 'danger'}>
          {item.status ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      header: 'Actions',
      headerClassName: 'text-right',
      className: 'text-right',
      render: (item) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            onClick={() => {
              setEditingProduct(item);
              setModalOpen(true);
            }}
            className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors"
            title="Edit Product"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setDeletingProduct(item);
              setDeleteConfirmOpen(true);
            }}
            className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
            title="Delete Product"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Products Catalog
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage electronic devices, hardware inventory, and manufacturer specs
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            icon={RefreshCw}
            disabled={loading}
          >
            Refresh
          </Button>

          <Button
            size="sm"
            onClick={() => {
              setEditingProduct(null);
              setModalOpen(true);
            }}
            icon={Plus}
          >
            Add Product
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Live Search */}
          <div className="lg:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search products by title, brand, description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-4 py-2 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          {/* Category Dropdown */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Brand Dropdown */}
          <div>
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="w-full text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="">All Brands</option>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By Dropdown */}
          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="newest">Sort: Newest First</option>
              <option value="price-asc">Sort: Price Low → High</option>
              <option value="price-desc">Sort: Price High → Low</option>
              <option value="name">Sort: Product Title A–Z</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <Table
        columns={columns}
        data={paginatedProducts}
        loading={loading}
        emptyTitle="No products match your criteria"
        emptyDescription="Try clearing your search query or category filters to see available electronics."
        emptyActionLabel="Add Product"
        onEmptyAction={() => {
          setEditingProduct(null);
          setModalOpen(true);
        }}
      />

      {/* Pagination Controls */}
      {!loading && filteredProducts.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalElements={filteredProducts.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
        />
      )}

      {/* Product Create/Edit Modal */}
      <ProductModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveProduct}
        product={editingProduct}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleDeleteProduct}
        loading={deleteLoading}
        title="Delete Product"
        message={`Are you sure you want to delete "${deletingProduct?.productName}"? This action removes the item from the catalog permanently.`}
      />
    </div>
  );
}
