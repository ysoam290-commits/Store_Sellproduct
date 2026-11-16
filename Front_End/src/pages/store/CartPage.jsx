import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  CreditCard,
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { getImageUrl } from '../../utils/imageHelper';

export default function CartPage() {
  const { cart, updateQuantity, removeFromCart, clearCart, cartTotal, count } = useCart();

  if (cart.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center mx-auto">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">
          Your cart is currently empty
        </h2>
        <p className="text-xs text-slate-400 max-w-sm mx-auto">
          Browse our high-performance electronic computers, monitors, accessories, and flagships.
        </p>
        <div className="pt-2">
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-blue-500/20 transition-all"
          >
            Browse Products <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <ShoppingBag className="w-6 h-6 text-blue-600" /> Shopping Cart ({count} {count === 1 ? 'item' : 'items'})
        </h1>
        <p className="text-xs text-slate-500 mt-1">Review your tech devices before checkout</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden">
            {cart.map((item) => (
              <div
                key={item.id}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors"
              >
                {/* Thumb & Title */}
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-16 h-16 rounded-xl bg-slate-50 dark:bg-slate-800 p-2 flex-shrink-0 flex items-center justify-center border border-slate-100 dark:border-slate-800">
                    {item.imageUrl || item.image ? (
                      <img
                        src={getImageUrl(item.imageUrl || item.image)}
                        alt={item.productName}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <ShoppingBag className="w-6 h-6 text-slate-400" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">
                      {item.brandName || 'Brand'}
                    </div>
                    <Link
                      to={`/products/${item.id}`}
                      className="font-semibold text-xs text-slate-800 dark:text-slate-100 hover:text-blue-600 transition-colors truncate block"
                    >
                      {item.productName || item.name}
                    </Link>
                    <div className="text-xs font-bold text-slate-900 dark:text-slate-100 mt-1">
                      ${Number(item.price).toFixed(2)} each
                    </div>
                  </div>
                </div>

                {/* Quantity Controls & Total */}
                <div className="flex items-center justify-between sm:justify-end gap-6">
                  <div className="flex items-center gap-2 border border-slate-200 dark:border-slate-700 rounded-xl p-1 bg-slate-50 dark:bg-slate-800">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="p-1 rounded-lg text-slate-500 hover:bg-white dark:hover:bg-slate-700 transition-colors"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-6 text-center text-xs font-bold">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="p-1 rounded-lg text-slate-500 hover:bg-white dark:hover:bg-slate-700 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="text-right">
                    <div className="font-bold text-sm text-slate-900 dark:text-slate-100">
                      ${(Number(item.price) * item.quantity).toFixed(2)}
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-[11px] text-red-500 hover:underline flex items-center gap-1 mt-1"
                    >
                      <Trash2 className="w-3 h-3" /> Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center px-1">
            <Link to="/shop" className="text-xs font-semibold text-blue-600 hover:underline">
              ← Add more items
            </Link>
            <button
              onClick={clearCart}
              className="text-xs font-semibold text-slate-400 hover:text-rose-500 transition-colors"
            >
              Clear Cart
            </button>
          </div>
        </div>

        {/* Order Summary */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider pb-3 border-b border-slate-100 dark:border-slate-800">
              Order Summary
            </h2>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Items Subtotal</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  ${cartTotal.toFixed(2)}
                </span>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between text-sm font-extrabold text-slate-900 dark:text-slate-100">
                <span>Order Total</span>
                <span className="text-blue-600 text-lg">${cartTotal.toFixed(2)}</span>
              </div>
            </div>

            <Link
              to="/checkout"
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
            >
              <CreditCard className="w-4 h-4" />
              <span>Proceed to Checkout</span>
            </Link>

            <div className="flex items-center justify-center text-center text-[11px] text-slate-400">
              <span>Your order is submitted securely to the store.</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
