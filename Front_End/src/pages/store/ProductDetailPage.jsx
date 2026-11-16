import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Package,
  ShoppingBag,
  CheckCircle2,
  Plus,
  Minus,
  Building2,
  Tag,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';
import { productService } from '../../services/productService';
import { useCart } from '../../context/CartContext';

export default function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const { addToCart } = useCart();

  useEffect(() => {
    setLoading(true);
    productService
      .get(id)
      .then((data) => {
        setProduct(data);
        return productService.list();
      })
      .then((all) => {
        const list = Array.isArray(all) ? all : all?.content || [];
        setRelatedProducts(list.filter((p) => String(p.id) !== String(id)).slice(0, 4));
      })
      .catch((error) => setLoadError(error.response?.data?.message || error.message || 'Could not load this product.'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center text-slate-400">
        Loading electronic product specifications...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-lg font-bold text-slate-800">{loadError || 'Product not found'}</h2>
        <Link to="/shop" className="text-sm text-blue-600 hover:underline mt-2 inline-block">
          Return to electronics catalog →
        </Link>
      </div>
    );
  }

  const isOut = Number(product.quantity) <= 0 || product.status === false;

  const handleAddToCart = () => {
    addToCart(product, quantity);
    toast.success(`Added ${quantity} × ${product.productName || product.name} to your cart!`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Back button */}
      <div>
        <Link
          to="/shop"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Electronics Catalog
        </Link>
      </div>

      {/* Main Product Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-10 shadow-sm">
        {/* Photo Gallery Column */}
        <div className="space-y-4">
          <div className="h-96 sm:h-[420px] bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-8 flex items-center justify-center border border-slate-100 dark:border-slate-800">
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.productName}
                className="w-full h-full object-contain"
              />
            ) : (
              <Package className="w-24 h-24 text-slate-300" />
            )}
          </div>
        </div>

        {/* Details & Specs Column */}
        <div className="flex flex-col justify-between space-y-6">
          <div>
            {/* Brand & Category badges */}
            <div className="flex items-center gap-2 mb-3">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider bg-blue-50 dark:bg-blue-900/30 text-blue-600">
                <Building2 className="w-3.5 h-3.5" />
                {product.brandName || 'Brand'}
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                <Tag className="w-3.5 h-3.5" />
                {product.categoryName || 'Electronics'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 leading-tight">
              {product.productName || product.name}
            </h1>

            <div className="flex items-center gap-4 mt-3">
              <div className="flex items-center gap-1 text-amber-500 font-bold text-xs">
                <span className={isOut ? 'text-rose-600' : 'text-emerald-600'}>
                  {isOut ? 'Currently unavailable' : `In stock · ${product.quantity} available`}
                </span>
              </div>
              <span className="text-slate-300">·</span>
            </div>

            {/* Price section */}
            <div className="mt-5 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-baseline gap-3">
              <span className="text-3xl font-extrabold text-slate-900 dark:text-slate-100">
                ${Number(product.price).toFixed(2)}
              </span>
            </div>

            {/* Description */}
            <section className="mt-5 rounded-2xl border border-blue-100 dark:border-blue-900/60 bg-gradient-to-br from-blue-50/80 via-white to-slate-50 dark:from-blue-950/35 dark:via-slate-900 dark:to-slate-800/70 p-5 sm:p-6">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm">
                  <Sparkles className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-blue-600 dark:text-blue-400">Product details</p>
                  <h2 className="mt-0.5 text-base font-bold text-slate-900 dark:text-slate-100">About this product</h2>
                </div>
              </div>
              <p className="mt-4 whitespace-pre-line text-sm leading-7 text-slate-600 dark:text-slate-300">
                {product.description?.trim() || 'More information about this product will be added soon.'}
              </p>
            </section>

            {/* Specs Table */}
            {product.specs && product.specs.length > 0 && (
              <div className="mt-6 border-t border-slate-100 dark:border-slate-800 pt-4">
                <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-3">
                  Technical Specifications
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {product.specs.map((s, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex justify-between gap-2"
                    >
                      <span className="text-slate-400 font-medium">{s.label}</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-200 text-right">
                        {s.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Quantity & CTA */}
          <div className="pt-6 border-t border-slate-100 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Quantity
              </span>
              <div className="flex items-center gap-2 border border-slate-200 dark:border-slate-700 rounded-xl p-1 bg-slate-50 dark:bg-slate-800">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-1.5 rounded-lg text-slate-500 hover:bg-white dark:hover:bg-slate-700 transition-colors"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-8 text-center text-xs font-bold">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity(Math.min(Number(product.quantity) || quantity + 1, quantity + 1))}
                  className="p-1.5 rounded-lg text-slate-500 hover:bg-white dark:hover:bg-slate-700 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={isOut}
                className="flex-1 py-3.5 px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Add to Shopping Cart</span>
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            More from the Catalog
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {relatedProducts.map((p) => (
              <Link
                key={p.id}
                to={`/products/${p.id}`}
                className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl hover:shadow-lg transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="h-40 bg-slate-50 dark:bg-slate-800 p-3 rounded-xl flex items-center justify-center mb-3">
                    {p.imageUrl ? (
                      <img
                        src={p.imageUrl}
                        alt={p.productName}
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <Package className="w-8 h-8 text-slate-300" />
                    )}
                  </div>
                  <div className="text-[10px] text-blue-600 font-semibold uppercase">
                    {p.brandName || 'Brand'}
                  </div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 line-clamp-1 mt-0.5">
                    {p.productName || p.name}
                  </h4>
                </div>
                <div className="mt-3 font-bold text-sm text-slate-900 dark:text-slate-100">
                  ${Number(p.price).toFixed(2)}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
