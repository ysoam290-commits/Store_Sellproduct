import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Modal from '../Modal';
import Input from '../Input';
import Button from '../Button';

const categorySchema = z.object({
  name: z.string().min(1, 'Category name is required'),
  code: z
    .string()
    .min(1, 'Category code is required')
    .regex(/^[A-Z0-9_-]+$/i, 'Code should contain letters, numbers, hyphens or underscores'),
  description: z.string().optional(),
  status: z.boolean(),
});

export default function CategoryModal({
  isOpen,
  onClose,
  onSave,
  category = null,
}) {
  const isEdit = Boolean(category && category.id);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      code: '',
      description: '',
      status: true,
    },
  });

  useEffect(() => {
    if (category) {
      reset({
        name: category.name || '',
        code: category.code || '',
        description: category.description || '',
        status: category.status !== false,
      });
    } else {
      reset({
        name: '',
        code: '',
        description: '',
        status: true,
      });
    }
  }, [category, reset, isOpen]);

  // Auto-generate code slug from name if not editing
  const handleNameChange = (e) => {
    const val = e.target.value;
    if (!isEdit && !watch('code')) {
      const generatedCode = val
        .trim()
        .toUpperCase()
        .replace(/[^A-Z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '');
      setValue('code', generatedCode, { shouldValidate: true });
    }
  };

  const onFormSubmit = async (values) => {
    try {
      await onSave(values, isEdit, category?.id);
      onClose();
    } catch {
      // Error handled by caller
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Edit Category' : 'Create Category'}
      description={
        isEdit
          ? 'Update category name, unique code, or status'
          : 'Create a new product category for your store catalog'
      }
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
        <Input
          label="Category Name"
          placeholder="e.g. Laptops & Computers"
          required
          error={errors.name?.message}
          {...register('name', { onChange: handleNameChange })}
          disabled={isSubmitting}
        />

        <Input
          label="Category Code"
          placeholder="e.g. LAPTOP_COMPUTERS"
          required
          helperText="Unique identifier code required by the backend"
          error={errors.code?.message}
          {...register('code')}
          disabled={isSubmitting}
        />

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Description
          </label>
          <textarea
            rows={3}
            placeholder="Category overview or department notes..."
            {...register('description')}
            disabled={isSubmitting}
            className="w-full text-xs sm:text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800">
          <input
            id="cat-status"
            type="checkbox"
            {...register('status')}
            disabled={isSubmitting}
            className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 dark:border-slate-700"
          />
          <label htmlFor="cat-status" className="text-xs font-semibold text-slate-700 dark:text-slate-200 cursor-pointer">
            Active category (Enabled for store display & filtering)
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
            {isEdit ? 'Save Changes' : 'Create Category'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
