import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ShieldCheck } from 'lucide-react';
import Modal from '../Modal';
import Input from '../Input';
import Button from '../Button';

const roleSchema = z.object({
  name: z.string().min(1, 'Role name is required'),
  code: z.string().optional(),
  status: z.boolean(),
});

export default function RoleModal({
  isOpen,
  onClose,
  onSave,
  role = null,
}) {
  const isEdit = Boolean(role && role.id);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(roleSchema),
    defaultValues: {
      name: '',
      code: '',
      status: true,
    },
  });

  useEffect(() => {
    if (role) {
      reset({
        name: role.name || '',
        code: role.code || '',
        status: role.status !== false,
      });

    } else {
      reset({
        name: '',
        code: '',
        status: true,
      });
    }
  }, [role, reset, isOpen]);

  const onFormSubmit = async (values) => {
    try {
      const payload = {
        name: values.name.trim(),
        code: values.code?.trim() || values.name.trim().toUpperCase(),
        status: values.status,
        ...(role ? { permissions: role.permissions || [] } : {}),
      };
      await onSave(payload, isEdit, role?.id);
      onClose();
    } catch {
      // Handled by parent
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Edit Role & Permissions' : 'Create Role'}
      description={
        isEdit
          ? 'Modify role title, code, and RBAC granular authorities'
          : 'Define a new organizational role with security permissions'
      }
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <Input
            label="Role Name"
            placeholder="e.g. ROLE_MANAGER"
            required
            error={errors.name?.message}
            {...register('name')}
            disabled={isSubmitting}
          />

          <Input
            label="Role Code"
            placeholder="e.g. MANAGER"
            error={errors.code?.message}
            {...register('code')}
            disabled={isSubmitting}
          />
        </div>

        {role && <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-3"><label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-blue-500" />Existing permissions</label><p className="mt-2 text-xs text-slate-500">{(role.permissions || []).map((permission) => permission.name || permission).join(', ') || 'No permissions assigned.'}</p><p className="mt-2 text-[11px] text-slate-400">Permission assignment requires a backend permission catalog, which is not currently available.</p></div>}

        <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800">
          <input
            id="role-status"
            type="checkbox"
            {...register('status')}
            disabled={isSubmitting}
            className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 dark:border-slate-700"
          />
          <label htmlFor="role-status" className="text-xs font-semibold text-slate-700 dark:text-slate-200 cursor-pointer">
            Active role (Can be assigned to new and existing user accounts)
          </label>
        </div>

        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            loading={isSubmitting}
          >
            {isEdit ? 'Save Changes' : 'Create Role'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
