import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Upload, Image as ImageIcon, X } from 'lucide-react';
import Modal from '../Modal';
import Input from '../Input';
import Button from '../Button';
import { categoryApi } from '../../api/categoryApi';
import { brandApi } from '../../api/brandApi';
import { getImageUrl } from '../../utils/imageHelper';

const productSchema = z.object({
  productName: z.string().min(1, 'Product name is required'),
  price: z.coerce.number().min(0, 'Price must be greater than or equal to 0'),
  quantity: z.coerce.number().int().min(0, 'Quantity must be at least 0'),
  categoryId: z.coerce.number().min(1, 'Please select a category'),
  brandId: z.coerce.number().min(1, 'Please select a brand'),
  status: z.boolean(),
  description: z.string().optional(),
});

export default function ProductModal({
  isOpen,
  onClose,
  onSave,
  product = null,
}) {
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [imageError, setImageError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const isEdit = Boolean(product && product.id);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: {
      productName: '',
      price: '',
      quantity: 10,
      categoryId: '',
      brandId: '',
      status: true,
      description: '',
    },
  });

  // Load dropdown options when modal opens
  useEffect(() => {
    if (isOpen) {
      Promise.all([
        categoryApi.getAll().catch(() => []),
        brandApi.getAll().catch(() => []),
      ]).then(([cats, brs]) => {
        setCategories(Array.isArray(cats) ? cats : cats?.content || []);
        setBrands(Array.isArray(brs) ? brs : []);
      });
    }
  }, [isOpen]);

  // Reset or fill form when product changes
  useEffect(() => {
    if (product) {
      reset({
        productName: product.productName || '',
        price: product.price ?? 0,
        quantity: product.quantity ?? 10,
        categoryId: product.categoryId || '',
        brandId: product.brandId || '',
        status: product.status !== false,
        description: product.description || '',
      });
      setImagePreview(product.image ? getImageUrl(product.image) : '');
      setImageFile(null);
      setImageError('');
    } else {
      reset({
        productName: '',
        price: '',
        quantity: 10,
        categoryId: '',
        brandId: '',
        status: true,
        description: '',
      });
      setImagePreview('');
      setImageFile(null);
      setImageError('');
    }
  }, [product, reset, isOpen]);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setImageError('Please select a valid image file (PNG, JPG, WEBP)');
        return;
      }
      setImageFile(file);
      setImageError('');
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview('');
  };

  const onFormSubmit = async (values) => {
    // For new products, backend requires an image file
    if (!isEdit && !imageFile) {
      setImageError('Product image is required for new products');
      return;
    }

    try {
      setSubmitting(true);

      if (!isEdit) {
        // Create product: multipart/form-data
        const formData = new FormData();
        formData.append('productName', values.productName);
        formData.append('price', values.price);
        formData.append('quantity', values.quantity);
        formData.append('status', values.status);
        formData.append('categoryId', values.categoryId);
        formData.append('brandId', values.brandId);
        if (values.description) {
          formData.append('description', values.description);
        }
        if (imageFile) {
          formData.append('image', imageFile);
        }
        await onSave(formData, false);
      } else {
        // Update product: ProductRequest JSON
        const payload = {
          productName: values.productName,
          price: values.price,
          quantity: values.quantity,
          status: values.status,
          categoryId: Number(values.categoryId),
          brandId: Number(values.brandId),
          description: values.description || '',
        };
        await onSave(payload, true, product.id);
      }
      onClose();
    } catch (err) {
      // Error handling done in parent caller
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Edit Product' : 'Add New Product'}
      description={
        isEdit
          ? 'Update product specifications, price, or inventory'
          : 'Create a new electronic item with hardware details and photo'
      }
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
        {/* Product Name */}
        <Input
          label="Product Name"
          placeholder="e.g. MacBook Pro M3 Max 16-inch"
          required
          error={errors.productName?.message}
          {...register('productName')}
          disabled={submitting}
        />

        {/* Category & Brand Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              {...register('categoryId')}
              disabled={submitting}
              className={`w-full text-xs sm:text-sm bg-white dark:bg-slate-900 border rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 ${
                errors.categoryId
                  ? 'border-red-300 dark:border-red-700'
                  : 'border-slate-300 dark:border-slate-700'
              }`}
            >
              <option value="">Select Category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            {errors.categoryId && (
              <p className="text-[11px] font-medium text-red-600 dark:text-red-400 mt-1">
                {errors.categoryId.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Brand <span className="text-red-500">*</span>
            </label>
            <select
              {...register('brandId')}
              disabled={submitting}
              className={`w-full text-xs sm:text-sm bg-white dark:bg-slate-900 border rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 ${
                errors.brandId
                  ? 'border-red-300 dark:border-red-700'
                  : 'border-slate-300 dark:border-slate-700'
              }`}
            >
              <option value="">Select Brand</option>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
            {errors.brandId && (
              <p className="text-[11px] font-medium text-red-600 dark:text-red-400 mt-1">
                {errors.brandId.message}
              </p>
            )}
          </div>
        </div>

        {/* Price & Quantity */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <Input
            label="Price (USD)"
            type="number"
            step="0.01"
            placeholder="999.99"
            required
            error={errors.price?.message}
            {...register('price')}
            disabled={submitting}
          />

          <Input
            label="Stock Quantity"
            type="number"
            placeholder="15"
            required
            error={errors.quantity?.message}
            {...register('quantity')}
            disabled={submitting}
          />
        </div>

        {/* Status Switch */}
        <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800">
          <input
            id="product-status"
            type="checkbox"
            {...register('status')}
            disabled={submitting}
            className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 dark:border-slate-700"
          />
          <label htmlFor="product-status" className="text-xs font-semibold text-slate-700 dark:text-slate-200 cursor-pointer">
            Active for sale (Product is visible to customers)
          </label>
        </div>

        {/* Image Upload with Preview */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Product Image {!isEdit && <span className="text-red-500">*</span>}
          </label>

          {imagePreview ? (
            <div className="relative group w-32 h-32 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
              <img
                src={imagePreview}
                alt="Product preview"
                className="w-full h-full object-contain p-2"
              />
              <button
                type="button"
                onClick={removeImage}
                disabled={submitting}
                className="absolute top-1.5 right-1.5 p-1 rounded-full bg-slate-900/70 text-white hover:bg-red-600 transition-colors"
                title="Remove image"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 rounded-xl cursor-pointer bg-slate-50/50 dark:bg-slate-800/30 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-2">
                <Upload className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                Click or drag image to upload
              </span>
              <span className="text-[11px] text-slate-400 mt-0.5">
                PNG, JPG, WEBP (Max 5MB)
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                disabled={submitting}
                className="hidden"
              />
            </label>
          )}

          {imageError && (
            <p className="text-[11px] font-medium text-red-600 dark:text-red-400 mt-1">
              {imageError}
            </p>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Description
          </label>
          <textarea
            rows={3}
            placeholder="Detailed hardware specs, features, warranty..."
            {...register('description')}
            disabled={submitting}
            className="w-full text-xs sm:text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            loading={submitting}
          >
            {isEdit ? 'Save Changes' : 'Create Product'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
