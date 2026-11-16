import React, { useState, useEffect, useMemo } from 'react';
import {
  Shield,
  Plus,
  Search,
  Edit2,
  Trash2,
  RefreshCw,
  KeyRound,
  ShieldAlert,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { roleApi } from '../../api/roleApi';
import RoleModal from '../../components/role/RoleModal';
import ConfirmDialog from '../../components/ConfirmDialog';
import Pagination from '../../components/Pagination';
import Table from '../../components/Table';
import Button from '../../components/Button';
import Badge from '../../components/Badge';
import { useDebounce } from '../../hooks/useDebounce';

export default function RoleManagement() {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 300);
  const [statusFilter, setStatusFilter] = useState('');

  // Modals
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deletingRole, setDeletingRole] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  const loadRoles = async () => {
    try {
      setLoading(true);
      const res = await roleApi.getAll();
      const list = res?.list || (Array.isArray(res) ? res : []);
      setRoles(list);
    } catch {
      toast.error('Failed to load system roles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRoles();
  }, []);

  // Filter
  const filteredRoles = useMemo(() => {
    return roles.filter((r) => {
      if (debouncedSearch) {
        const q = debouncedSearch.toLowerCase();
        const matchName = r.name?.toLowerCase().includes(q);
        const matchCode = r.code?.toLowerCase().includes(q);
        if (!matchName && !matchCode) return false;
      }
      if (statusFilter !== '') {
        const isAct = statusFilter === 'true';
        if (r.status !== isAct) return false;
      }
      return true;
    });
  }, [roles, debouncedSearch, statusFilter]);

  const totalPages = Math.ceil(filteredRoles.length / pageSize) || 1;
  const paginatedRoles = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRoles.slice(start, start + pageSize);
  }, [filteredRoles, currentPage, pageSize]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, statusFilter]);

  // Save Role
  const handleSaveRole = async (payload, isEdit, id) => {
    try {
      if (isEdit) {
        await roleApi.update(id, payload);
        toast.success('Role and permissions updated successfully!');
      } else {
        await roleApi.create(payload);
        toast.success('New role provisioned successfully!');
      }
      loadRoles();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to save role';
      toast.error(msg);
      throw err;
    }
  };

  // Delete Role
  const handleDeleteRole = async () => {
    if (!deletingRole) return;
    try {
      setDeleteLoading(true);
      await roleApi.delete(deletingRole.id);
      toast.success('Role deleted successfully!');
      setDeleteConfirmOpen(false);
      setDeletingRole(null);
      loadRoles();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete role');
    } finally {
      setDeleteLoading(false);
    }
  };

  const columns = [
    {
      header: 'Role Authority',
      render: (item) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center flex-shrink-0">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-slate-900 dark:text-slate-100 font-mono text-xs">
              {item.name}
            </div>
            {item.code && (
              <div className="text-[11px] text-slate-400 mt-0.5">
                Code: {item.code}
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      header: 'Assigned Permissions',
      render: (item) => {
        const perms = item.permissions || [];
        if (perms.length === 0) {
          return <span className="text-slate-400 text-xs italic">No specific permissions</span>;
        }
        return (
          <div className="flex flex-wrap gap-1 max-w-md">
            {perms.slice(0, 3).map((p, idx) => {
              const name = typeof p === 'string' ? p : p.name;
              return (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono text-[10px]"
                >
                  {name}
                </span>
              );
            })}
            {perms.length > 3 && (
              <span className="px-1.5 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 text-[10px] font-semibold">
                +{perms.length - 3} more
              </span>
            )}
          </div>
        );
      },
    },
    {
      header: 'Status',
      render: (item) => (
        <Badge variant={item.status !== false ? 'success' : 'danger'}>
          {item.status !== false ? 'Active Policy' : 'Disabled'}
        </Badge>
      ),
    },
    {
      header: 'Actions',
      headerClassName: 'text-right',
      className: 'text-right',
      render: (item) => {
        const isCoreRole = item.name === 'ROLE_ADMIN' || item.name === 'ROLE_USER';
        return (
          <div className="flex items-center justify-end gap-1.5">
            <button
              onClick={() => {
                setEditingRole(item);
                setModalOpen(true);
              }}
              className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors"
              title="Edit Role"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                if (isCoreRole) {
                  toast.error(`Cannot delete core system role ${item.name}`);
                  return;
                }
                setDeletingRole(item);
                setDeleteConfirmOpen(true);
              }}
              disabled={isCoreRole}
              className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title={isCoreRole ? 'Core system role protected' : 'Delete Role'}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Roles &amp; RBAC Security
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Configure system authorization roles, authority sets, and permission scopes
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={loadRoles}
            icon={RefreshCw}
            disabled={loading}
          >
            Refresh
          </Button>

          <Button
            size="sm"
            onClick={() => {
              setEditingRole(null);
              setModalOpen(true);
            }}
            icon={Plus}
          >
            Create Role
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <div className="lg:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search roles by name or authority code..."
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
              <option value="true">Active Roles</option>
              <option value="false">Disabled Roles</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <Table
        columns={columns}
        data={paginatedRoles}
        loading={loading}
        emptyTitle="No roles found"
        emptyDescription="Create a security role to assign granular authorities to team members."
        emptyActionLabel="Create Role"
        onEmptyAction={() => {
          setEditingRole(null);
          setModalOpen(true);
        }}
      />

      {/* Pagination */}
      {!loading && filteredRoles.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalElements={filteredRoles.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
        />
      )}

      {/* Role Modal */}
      <RoleModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveRole}
        role={editingRole}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleDeleteRole}
        loading={deleteLoading}
        title="Delete Role"
        message={`Are you sure you want to remove role "${deletingRole?.name}"? Accounts assigned this role will lose its authorities.`}
      />
    </div>
  );
}
