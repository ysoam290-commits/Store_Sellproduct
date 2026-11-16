import React, { useState, useEffect, useCallback } from 'react';
import {
  Tag,
  Plus,
  Search,
  Edit2,
  Trash2,
  RefreshCw,
  Hash,
  ArrowUpDown,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { categoryApi } from '../../api/categoryApi';
import CategoryModal from '../../components/category/CategoryModal';
import ConfirmDialog from '../../components/ConfirmDialog';
import Pagination from '../../components/Pagination';
import Table from '../../components/Table';
import Button from '../../components/Button';
import Badge from '../../components/Badge';
import { useDebounce } from '../../hooks/useDebounce';

export default function CategoryManagement() {
  const [categories, setCategories] = useState([]);
  const [pageInfo, setPageInfo] = useState({
    pageNumber: 1,
    pageSize: 6,
    totalElements: 0,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(true);

  // Filters & Sorting
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 300);
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('id');
  const [sortAs, setSortAs] = useState('desc');

  // Modals
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deletingCategory, setDeletingCategory] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Fetch categories using the backend filter / PageResponse endpoint
  const fetchCategories = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      const params = {
        page: page,
        size: pageInfo.pageSize,
        sortBy: sortBy,
        sortAs: sortAs,
      };

      if (debouncedSearch.trim()) {
        params.name = debouncedSearch.trim();
      }

      if (statusFilter !== '') {
        params.status = statusFilter === 'true';
      }

      const res = await categoryApi.filter(params);

      // Handle PageResponse structure
      if (res && res.content) {
        setCategories(res.content);
        setPageInfo({
          pageNumber: res.pageNumber || page,
          pageSize: res.pageSize || 6,
          totalElements: res.totalElements || res.content.length,
          totalPages: res.totalpage || res.totalPages || Math.ceil((res.totalElements || 0) / 6) || 1,
        });
      } else if (Array.isArray(res)) {
        setCategories(res);
        setPageInfo((prev) => ({
          ...prev,
          totalElements: res.length,
          totalPages: Math.ceil(res.length / prev.pageSize) || 1,
        }));
      } else {
        // Fallback to getAll if filter returns non-page
        const fallback = await categoryApi.getAll();
        const list = Array.isArray(fallback) ? fallback : fallback?.content || [];
        setCategories(list);
        setPageInfo((prev) => ({
          ...prev,
          totalElements: list.length,
          totalPages: 1,
        }));
      }
    } catch {
      // If /filter fails (e.g. backend params strictness), fallback to getAll
      try {
        const fallback = await categoryApi.getAll();
        const list = Array.isArray(fallback) ? fallback : fallback?.content || [];
        setCategories(list);
        setPageInfo((prev) => ({ ...prev, totalElements: list.length, totalPages: 1 }));
      } catch {
        toast.error('Failed to load categories');
      }
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, statusFilter, sortBy, sortAs, pageInfo.pageSize]);

  useEffect(() => {
    fetchCategories(1);
  }, [fetchCategories]);

  const handlePageChange = (newPage) => {
    fetchCategories(newPage);
  };

  // Save (Create or Update)
  const handleSaveCategory = async (payload, isEdit, id) => {
    try {
      if (isEdit) {
        await categoryApi.update(id, payload);
        toast.success('Category updated successfully!');
      } else {
        await categoryApi.create(payload);
        toast.success('Category created successfully!');
      }
      fetchCategories(pageInfo.pageNumber);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to save category';
      toast.error(msg);
      throw err;
    }
  };

  // Delete Category
  const handleDeleteCategory = async () => {
    if (!deletingCategory) return;
    try {
      setDeleteLoading(true);
      await categoryApi.delete(deletingCategory.id);
      toast.success('Category deleted successfully!');
      setDeleteConfirmOpen(false);
      setDeletingCategory(null);
      fetchCategories(1);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete category');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Columns
  const columns = [
    {
      header: 'Category Details',
      render: (item) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0">
            <Tag className="w-4 h-4" />
          </div>
          <div>
            <div className="font-semibold text-slate-900 dark:text-slate-100">
              {item.name}
            </div>
            {item.description && (
              <div className="text-[11px] text-slate-400 line-clamp-1 max-w-sm mt-0.5">
                {item.description}
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      header: 'Code Identifier',
      render: (item) => (
        <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
          {item.code || '—'}
        </span>
      ),
    },
    {
      header: 'Status',
      render: (item) => (
        <Badge variant={item.status !== false ? 'success' : 'danger'}>
          {item.status !== false ? 'Active' : 'Inactive'}
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
              setEditingCategory(item);
              setModalOpen(true);
            }}
            className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors"
            title="Edit Category"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setDeletingCategory(item);
              setDeleteConfirmOpen(true);
            }}
            className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
            title="Delete Category"
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
            Category Taxonomy
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Organize catalog groupings, navigation menus, and filtering categories
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchCategories(pageInfo.pageNumber)}
            icon={RefreshCw}
            disabled={loading}
          >
            Refresh
          </Button>

          <Button
            size="sm"
            onClick={() => {
              setEditingCategory(null);
              setModalOpen(true);
            }}
            icon={Plus}
          >
            Create Category
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search by Name */}
          <div className="lg:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter categories by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-4 py-2 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="">All Statuses</option>
              <option value="true">Active Only</option>
              <option value="false">Inactive Only</option>
            </select>
          </div>

          {/* Sort Order */}
          <div>
            <select
              value={`${sortBy}-${sortAs}`}
              onChange={(e) => {
                const [by, as] = e.target.value.split('-');
                setSortBy(by);
                setSortAs(as);
              }}
              className="w-full text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="id-desc">Newest First</option>
              <option value="id-asc">Oldest First</option>
              <option value="name-asc">Name A → Z</option>
              <option value="name-desc">Name Z → A</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <Table
        columns={columns}
        data={categories}
        loading={loading}
        emptyTitle="No categories found"
        emptyDescription="Create your first catalog category to start organizing electronic products."
        emptyActionLabel="Create Category"
        onEmptyAction={() => {
          setEditingCategory(null);
          setModalOpen(true);
        }}
      />

      {/* Pagination using backend PageResponse */}
      {!loading && pageInfo.totalElements > 0 && (
        <Pagination
          currentPage={pageInfo.pageNumber}
          totalPages={pageInfo.totalPages}
          totalElements={pageInfo.totalElements}
          pageSize={pageInfo.pageSize}
          onPageChange={handlePageChange}
        />
      )}

      {/* Category Modal */}
      <CategoryModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveCategory}
        category={editingCategory}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleDeleteCategory}
        loading={deleteLoading}
        title="Delete Category"
        message={`Are you sure you want to delete category "${deletingCategory?.name}"? Items linked to this category may lose their categorization.`}
      />
    </div>
  );
}
