import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Modal from '../Modal';
import Input from '../Input';
import Button from '../Button';

const brandSchema = z.object({
  name: z.string().min(1, 'Brand name is required'),
  description: z.string().optional(),
  status: z.boolean(),
});

export default function BrandModal({
  isOpen,
  onClose,
  onSave,
  brand = null,
}) {
  const isEdit = Boolean(brand && brand.id);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(brandSchema),
    defaultValues: {
      name: '',
      description: '',
      status: true,
    },
  });

  useEffect(() => {
    if (brand) {
      reset({
        name: brand.name || '',
        description: brand.description || '',
        status: brand.status !== false,
      });
    } else {
      reset({
        name: '',
        description: '',
        status: true,
      });
    }
  }, [brand, reset, isOpen]);

  const onFormSubmit = async (values) => {
    try {
      await onSave(values, isEdit, brand?.id);
      onClose();
    } catch {
      // Handled by parent
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Edit Brand' : 'Create Brand'}
      description={
        isEdit
          ? 'Update electronic manufacturer or brand specifications'
          : 'Register a hardware brand / OEM partner in the store'
      }
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
        <Input
          label="Brand Name"
          placeholder="e.g. Apple, Sony, Samsung, Dell"
          required
          error={errors.name?.message}
          {...register('name')}
          disabled={isSubmitting}
        />

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Description
          </label>
          <textarea
            rows={3}
            placeholder="Manufacturer background, warranty information..."
            {...register('description')}
            disabled={isSubmitting}
            className="w-full text-xs sm:text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800">
          <input
            id="brand-status"
            type="checkbox"
            {...register('status')}
            disabled={isSubmitting}
            className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 dark:border-slate-700"
          />
          <label htmlFor="brand-status" className="text-xs font-semibold text-slate-700 dark:text-slate-200 cursor-pointer">
            Active brand (Products will be linked and filtered under this brand)
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
            {isEdit ? 'Save Changes' : 'Create Brand'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
