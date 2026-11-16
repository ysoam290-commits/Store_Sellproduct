import React, { useState, useEffect, useMemo } from 'react';
import {
  Boxes,
  Plus,
  Search,
  Edit2,
  Trash2,
  RefreshCw,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { brandApi } from '../../api/brandApi';
import BrandModal from '../../components/brand/BrandModal';
import ConfirmDialog from '../../components/ConfirmDialog';
import Pagination from '../../components/Pagination';
import Table from '../../components/Table';
import Button from '../../components/Button';
import Badge from '../../components/Badge';
import { useDebounce } from '../../hooks/useDebounce';
import { formatDate } from '../../utils/formatters';

export default function BrandManagement() {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 300);
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('name-asc');

  // Modals
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deletingBrand, setDeletingBrand] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  const loadBrands = async () => {
    try {
      setLoading(true);
      const data = await brandApi.getAll();
      setBrands(Array.isArray(data) ? data : []);
    } catch {
      toast.error('Failed to load brands');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBrands();
  }, []);

  // Filter & Sort
  const filteredBrands = useMemo(() => {
    return brands
      .filter((b) => {
        if (debouncedSearch) {
          const q = debouncedSearch.toLowerCase();
          const matchName = b.name?.toLowerCase().includes(q);
          const matchDesc = b.description?.toLowerCase().includes(q);
          if (!matchName && !matchDesc) return false;
        }

        if (statusFilter !== '') {
          const isAct = statusFilter === 'true';
          if (b.status !== isAct) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'name-asc') return (a.name || '').localeCompare(b.name || '');
        if (sortBy === 'name-desc') return (b.name || '').localeCompare(a.name || '');
        if (sortBy === 'id-desc') return (b.id || 0) - (a.id || 0);
        return (a.id || 0) - (b.id || 0);
      });
  }, [brands, debouncedSearch, statusFilter, sortBy]);

  // Paginated View
  const totalPages = Math.ceil(filteredBrands.length / pageSize) || 1;
  const paginatedBrands = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredBrands.slice(start, start + pageSize);
  }, [filteredBrands, currentPage, pageSize]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, statusFilter, sortBy]);

  // Save Brand
  const handleSaveBrand = async (payload, isEdit, id) => {
    try {
      if (isEdit) {
        await brandApi.update(id, payload);
        toast.success('Brand updated successfully!');
      } else {
        await brandApi.create(payload);
        toast.success('Brand created successfully!');
      }
      loadBrands();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to save brand';
      toast.error(msg);
      throw err;
    }
  };

  // Delete Brand
  const handleDeleteBrand = async () => {
    if (!deletingBrand) return;
    try {
      setDeleteLoading(true);
      await brandApi.delete(deletingBrand.id);
      toast.success('Brand deleted successfully!');
      setDeleteConfirmOpen(false);
      setDeletingBrand(null);
      loadBrands();
    } catch (err) {
      toast.error(err.response?.data?.message || err.response?.data?.error || err.message || 'Failed to delete brand');
    } finally {
      setDeleteLoading(false);
    }
  };

  const columns = [
    {
      header: 'Brand Name',
      render: (item) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center flex-shrink-0 font-bold text-sm">
            {item.name ? item.name[0].toUpperCase() : 'B'}
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
      header: 'Added On',
      render: (item) => (
        <span className="text-slate-600 dark:text-slate-400 text-xs">
          {formatDate(item.createdAt)}
        </span>
      ),
    },
    {
      header: 'Status',
      render: (item) => (
        <Badge variant={item.status !== false ? 'success' : 'danger'}>
          {item.status !== false ? 'Active Partner' : 'Inactive'}
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
              setEditingBrand(item);
              setModalOpen(true);
            }}
            className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors"
            title="Edit Brand"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setDeletingBrand(item);
              setDeleteConfirmOpen(true);
            }}
            className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
            title="Delete Brand"
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
            Brand Partners
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage electronics manufacturers, OEMs, and registered vendor brands
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={loadBrands}
            icon={RefreshCw}
            disabled={loading}
          >
            Refresh
          </Button>

          <Button
            size="sm"
            onClick={() => {
              setEditingBrand(null);
              setModalOpen(true);
            }}
            icon={Plus}
          >
            Add Brand
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="lg:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search brands by name or details..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-4 py-2 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

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

          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="name-asc">Brand Name: A → Z</option>
              <option value="name-desc">Brand Name: Z → A</option>
              <option value="id-desc">Recently Added</option>
              <option value="id-asc">Oldest Added</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <Table
        columns={columns}
        data={paginatedBrands}
        loading={loading}
        emptyTitle="No brands found"
        emptyDescription="Add electronic brands like Apple, Sony, Dell, or Samsung to your catalog."
        emptyActionLabel="Add Brand"
        onEmptyAction={() => {
          setEditingBrand(null);
          setModalOpen(true);
        }}
      />

      {/* Pagination */}
      {!loading && filteredBrands.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalElements={filteredBrands.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
        />
      )}

      {/* Brand Modal */}
      <BrandModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveBrand}
        brand={editingBrand}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleDeleteBrand}
        loading={deleteLoading}
        title="Delete Brand"
        message={`Delete brand "${deletingBrand?.name}"? Reassign or remove its linked products first.`}
      />
    </div>
  );
}
