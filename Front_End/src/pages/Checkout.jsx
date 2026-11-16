import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  ExternalLink,
  LoaderCircle,
  PackageCheck,
  QrCode,
  RefreshCw,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { orderService } from '../services/orderService';
import { paymentService } from '../services/paymentService';

const getPaymentStatus = (data) => String(data?.paymentStatus || data?.status || 'PENDING').toUpperCase();

const getQrImageSource = (image) => {
  if (typeof image !== 'string' || !image.trim()) return null;
  const value = image.trim();
  // Some payment API versions return a hosted QR image instead of its bytes.
  if (/^(https?:)?\/\//i.test(value) || value.startsWith('blob:')) return value;

  const dataUriMatch = value.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,([\s\S]+)$/i);
  // Preserve other image data URIs (for example, an SVG QR) as-is.
  if (value.startsWith('data:image/') && !dataUriMatch) return value;

  const base64 = (dataUriMatch ? dataUriMatch[2] : value).replace(/\s/g, '');
  const unpadded = base64.replace(/-/g, '+').replace(/_/g, '/');
  const normalized = unpadded + '='.repeat((4 - (unpadded.length % 4)) % 4);

  let bytes;
  try {
    bytes = window.atob(normalized);
  } catch {
    throw new Error('The QR image returned by the payment API is not valid Base64.');
  }
  if (bytes.length < 12) throw new Error('The QR image returned by the payment API is incomplete.');

  let mimeType = dataUriMatch?.[1];
  if (!mimeType) {
    if (bytes.startsWith('\x89PNG\r\n\x1a\n')) mimeType = 'image/png';
    else if (bytes.startsWith('\xff\xd8\xff')) mimeType = 'image/jpeg';
    else if (bytes.startsWith('GIF87a') || bytes.startsWith('GIF89a')) mimeType = 'image/gif';
    else if (bytes.slice(0, 4) === 'RIFF' && bytes.slice(8, 12) === 'WEBP') mimeType = 'image/webp';
    else mimeType = 'image/png';
  }

  return `data:${mimeType};base64,${normalized}`;
};

const getErrorMessage = (error, fallback) => {
  const body = error.response?.data;
  const nestedData = body?.data;
  const validation = body?.error && typeof body.error === 'object'
    ? Object.values(body.error).flat().join(' ')
    : body?.errors && typeof body.errors === 'object'
      ? Object.values(body.errors).flat().join(' ')
      : '';
  return body?.message || body?.detail || nestedData?.message || validation || error.message || fallback;
};

const getRemainingSeconds = (expiresAt, now) => {
  if (!expiresAt) return null;
  const expiration = new Date(expiresAt).getTime();
  if (Number.isNaN(expiration)) return null;
  return Math.max(0, Math.floor((expiration - now) / 1000));
};

export default function Checkout() {
  const { user } = useAuth();
  const { cart, cartTotal, clearCart } = useCart();
  const navigate = useNavigate();
  const [shippingAddress, setShippingAddress] = useState('');
  const [note, setNote] = useState('');
  const [customerFirstName, setCustomerFirstName] = useState(user?.profile?.firstName || '');
  const [customerLastName, setCustomerLastName] = useState(user?.profile?.lastName || '');
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '');
  const [paymentMethod, setPaymentMethod] = useState('ABA_KHQR');
  const [submitting, setSubmitting] = useState(false);
  const [requestingPayment, setRequestingPayment] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [order, setOrder] = useState(null);
  const [payment, setPayment] = useState(null);
  const [error, setError] = useState('');
  const [paymentError, setPaymentError] = useState('');
  const [qrLoadError, setQrLoadError] = useState('');
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (!payment?.expiresAt) return undefined;
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [payment?.expiresAt]);

  const qrSrc = useMemo(() => {
    if (!payment?.qrImage) return null;
    try {
      return getQrImageSource(payment.qrImage);
    } catch (imageError) {
      return { error: imageError.message };
    }
  }, [payment?.qrImage]);

  const remainingSeconds = getRemainingSeconds(payment?.expiresAt, now);
  const serverStatus = getPaymentStatus(payment);
  const displayedStatus = serverStatus === 'PENDING' && remainingSeconds === 0 ? 'EXPIRED' : serverStatus;
  const needsCustomerName = !user?.profile?.firstName?.trim() || !user?.profile?.lastName?.trim();
  const needsCustomerPhone = !user?.phone?.trim();

  const requestPayment = async (orderId, customer = {}) => {
    setPaymentError('');
    setQrLoadError('');
    setRequestingPayment(true);
    try {
      const result = await paymentService.createKhqr(orderId, customer);
      setPayment(result || null);
      if (!result?.qrImage) {
        setPaymentError('ABA created a payment response without a QR image. Please try generating the payment again.');
      } else {
        toast.success('ABA KHQR payment is ready. Scan the code to pay.');
      }
    } catch (paymentRequestError) {
      const message = getErrorMessage(paymentRequestError, 'Could not create the ABA KHQR payment.');
      setPaymentError(message);
      toast.error(message);
    } finally {
      setRequestingPayment(false);
    }
  };

  const placeOrder = async (event) => {
    event.preventDefault();
    if (!user?.id) {
      navigate('/login', { state: { from: { pathname: '/checkout' } } });
      return;
    }
    if (!cart.length) return;

    setSubmitting(true);
    setError('');
    try {
      const created = await orderService.create(user.id, { shippingAddress, note, items: cart });
      if (!created?.id) throw new Error('The order API response did not include an order ID.');

      setOrder(created);
      clearCart();
      toast.success(`Order ${created.orderNumber || `#${created.id}`} created. Preparing ABA KHQR…`);
      await requestPayment(created.id, {
        firstName: customerFirstName.trim(),
        lastName: customerLastName.trim(),
        phone: customerPhone.trim(),
      });
    } catch (orderError) {
      const message = getErrorMessage(orderError, 'Could not place your order.');
      setError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const checkPaymentStatus = async () => {
    if (!payment?.paymentId) {
      setPaymentError('The payment response did not include a payment ID, so its status cannot be checked.');
      return;
    }
    setCheckingStatus(true);
    setPaymentError('');
    try {
      const updated = await paymentService.checkStatus(payment.paymentId);
      setPayment((current) => ({ ...current, ...updated }));
      const status = getPaymentStatus(updated);
      if (status === 'PAID') toast.success('Payment confirmed. Thank you!');
      else if (status === 'FAILED') setPaymentError('ABA reported that this payment failed. Generate a new payment to try again.');
      else if (getRemainingSeconds(updated?.expiresAt || payment.expiresAt, Date.now()) === 0) {
        setPaymentError('This KHQR payment has expired. Generate a new payment to continue.');
      } else toast('Payment is still pending. Scan the KHQR code, then check again.');
    } catch (statusError) {
      const message = getErrorMessage(statusError, 'Could not check the payment status.');
      setPaymentError(message);
      toast.error(message);
    } finally {
      setCheckingStatus(false);
    }
  };

  if (order) {
    const secondsLabel = remainingSeconds == null
      ? 'Expiration time unavailable'
      : remainingSeconds === 0
        ? 'Payment expired'
        : `Expires in ${Math.floor(remainingSeconds / 60)}:${String(remainingSeconds % 60).padStart(2, '0')}`;
    const paymentAmount = Number(payment?.amount ?? order.totalAmount ?? cartTotal);
    const qrImageError = qrSrc && typeof qrSrc === 'object' ? qrSrc.error : '';

    return (
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
          <header className="px-6 sm:px-8 py-6 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <span className="w-11 h-11 rounded-2xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center"><QrCode className="w-6 h-6" /></span>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">Scan to Pay with ABA</h1>
                <p className="text-sm text-slate-500 mt-1">Open ABA Mobile and scan this KHQR to complete your order.</p>
              </div>
            </div>
          </header>

          <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.8fr)] gap-8 p-6 sm:p-8">
            <section className="flex flex-col items-center justify-center min-h-[320px] rounded-2xl bg-slate-50 dark:bg-slate-800/50 p-5">
              {payment?.qrImage && !qrImageError ? (
                <>
                  {qrLoadError ? (
                    <div role="alert" className="max-w-sm text-center text-sm text-rose-700 bg-rose-50 rounded-xl p-4">The QR image could not be displayed. {qrLoadError}</div>
                  ) : (
                    <img
                      src={qrSrc}
                      alt="ABA KHQR Payment"
                      onError={() => setQrLoadError('The returned image data is not a readable QR image.')}
                      className="w-64 h-64 sm:w-72 sm:h-72 object-contain rounded-xl bg-white p-2 shadow-sm"
                    />
                  )}
                  <p className="mt-4 text-sm text-slate-500 text-center">Keep the QR code visible while scanning with ABA Mobile.</p>
                </>
              ) : payment?.qrImage ? (
                <div role="alert" className="max-w-sm text-center text-sm text-rose-700 bg-rose-50 rounded-xl p-4">{qrImageError}</div>
              ) : (
                <div className="max-w-sm text-center">
                  <QrCode className="w-12 h-12 mx-auto text-slate-300" />
                  <p role="alert" className="mt-3 text-sm text-amber-700">{paymentError || 'No QR image was returned by the payment API.'}</p>
                  <button type="button" onClick={() => requestPayment(order.id, { firstName: customerFirstName.trim(), lastName: customerLastName.trim(), phone: customerPhone.trim() })} disabled={requestingPayment} className="mt-4 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60">
                    {requestingPayment ? <LoaderCircle className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}{requestingPayment ? 'Generating…' : 'Generate KHQR again'}
                  </button>
                </div>
              )}
            </section>

            <section className="space-y-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-400 font-semibold">Payment status</p>
                  <p className={`mt-1 font-bold ${displayedStatus === 'PAID' ? 'text-emerald-600' : displayedStatus === 'FAILED' || displayedStatus === 'EXPIRED' ? 'text-rose-600' : 'text-amber-600'}`}>{displayedStatus}</p>
                </div>
                {displayedStatus === 'PAID' && <CheckCircle2 className="w-7 h-7 text-emerald-500" />}
              </div>

              <div className="rounded-2xl border border-slate-200 dark:border-slate-700 divide-y divide-slate-100 dark:divide-slate-800">
                <div className="p-4 flex justify-between gap-4 text-sm"><span className="text-slate-500">Order ID</span><span className="font-semibold text-slate-900 dark:text-slate-100">{payment?.orderId ?? order.id}</span></div>
                <div className="p-4 flex justify-between gap-4 text-sm"><span className="text-slate-500">Amount</span><span className="font-bold text-slate-900 dark:text-slate-100">{payment?.currency || 'USD'} {Number.isFinite(paymentAmount) ? paymentAmount.toFixed(2) : '—'}</span></div>
                <div className="p-4 flex justify-between gap-4 text-sm"><span className="text-slate-500">Payment ID</span><span className="font-semibold text-slate-900 dark:text-slate-100">{payment?.paymentId ?? 'Pending'}</span></div>
                <div className="p-4 flex justify-between gap-4 text-sm"><span className="text-slate-500 flex items-center gap-2"><Clock3 className="w-4 h-4" />Expires</span><span className={remainingSeconds === 0 ? 'font-semibold text-rose-600' : 'font-semibold text-slate-900 dark:text-slate-100'}>{secondsLabel}</span></div>
              </div>

              {paymentError && <p role="alert" className="rounded-xl bg-rose-50 text-rose-700 text-sm p-3">{paymentError}</p>}
              {(displayedStatus === 'EXPIRED' || displayedStatus === 'FAILED') && payment?.qrImage && (
                <button type="button" onClick={() => requestPayment(order.id, { firstName: customerFirstName.trim(), lastName: customerLastName.trim(), phone: customerPhone.trim() })} disabled={requestingPayment} className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 px-4 py-3 text-sm font-semibold text-white disabled:opacity-60">
                  {requestingPayment ? <LoaderCircle className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}{requestingPayment ? 'Generating…' : 'Generate a new KHQR'}
                </button>
              )}
              {payment?.abaPayDeeplink && (
                <a href={payment.abaPayDeeplink} className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-4 py-3 text-sm font-bold text-white transition-colors">
                  Open ABA Mobile <ExternalLink className="w-4 h-4" />
                </a>
              )}
              {displayedStatus !== 'PAID' && payment?.paymentId && (
                <button type="button" onClick={checkPaymentStatus} disabled={checkingStatus} className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 dark:border-slate-700 px-4 py-3 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-60">
                  {checkingStatus ? <LoaderCircle className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                  Check Payment Status
                </button>
              )}
              {displayedStatus === 'PAID' ? (
                <Link to="/shop" className="block text-center text-sm font-semibold text-blue-600 hover:underline">Continue shopping</Link>
              ) : (
                <p className="text-xs leading-relaxed text-slate-400">If you have paid, allow a moment for ABA to confirm it, then check the status again.</p>
              )}
            </section>
          </div>
        </div>
      </main>
    );
  }

  if (!cart.length) {
    return (
      <main className="max-w-2xl mx-auto px-4 py-20 text-center">
        <PackageCheck className="w-14 h-14 mx-auto text-slate-300" />
        <h1 className="mt-4 text-xl font-bold text-slate-900 dark:text-slate-100">Your cart is empty</h1>
        <Link to="/shop" className="inline-flex mt-5 text-blue-600 font-semibold">Browse products</Link>
      </main>
    );
  }

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <Link to="/cart" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-blue-600"><ArrowLeft className="w-4 h-4" /> Back to cart</Link>
      <h1 className="mt-5 text-2xl font-bold text-slate-900 dark:text-slate-100">Checkout</h1>
      <div className="mt-6 grid lg:grid-cols-3 gap-8">
        <form onSubmit={placeOrder} className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-5">
          <div>
            <label htmlFor="shippingAddress" className="block text-sm font-semibold mb-2">Shipping Address</label>
            <textarea id="shippingAddress" required maxLength={500} rows={4} value={shippingAddress} onChange={(event) => setShippingAddress(event.target.value)} placeholder="Street, city, province, postal code" className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label htmlFor="orderNote" className="block text-sm font-semibold mb-2">Note <span className="font-normal text-slate-400">(optional)</span></label>
            <textarea id="orderNote" maxLength={1000} rows={3} value={note} onChange={(event) => setNote(event.target.value)} placeholder="Delivery instructions" className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <fieldset className="rounded-xl border border-slate-200 dark:border-slate-700 p-4">
            <legend className="px-2 text-sm font-semibold">Payment method</legend>
            <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-blue-200 bg-blue-50/70 p-3 dark:border-blue-900 dark:bg-blue-950/30">
              <input type="radio" name="paymentMethod" value="ABA_KHQR" checked={paymentMethod === 'ABA_KHQR'} onChange={() => setPaymentMethod('ABA_KHQR')} className="mt-1 accent-blue-600" />
              <span><span className="block text-sm font-semibold">ABA PayWay KHQR</span><span className="mt-0.5 block text-xs text-slate-500">Generate an official sandbox QR code and scan it with ABA Mobile.</span></span>
            </label>
          </fieldset>
          {(needsCustomerName || needsCustomerPhone) && (
            <div className="grid sm:grid-cols-2 gap-4 rounded-xl border border-amber-200 bg-amber-50/70 p-4">
              <p className="sm:col-span-2 text-sm text-amber-800">Enter the customer details ABA PayWay requires. A phone number entered here is used for this payment only and will not replace your saved account number.</p>
              {needsCustomerName && <>
                <div>
                  <label htmlFor="customerFirstName" className="block text-sm font-semibold mb-2">First name</label>
                  <input id="customerFirstName" required maxLength={20} value={customerFirstName} onChange={(event) => setCustomerFirstName(event.target.value)} autoComplete="given-name" className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label htmlFor="customerLastName" className="block text-sm font-semibold mb-2">Last name</label>
                  <input id="customerLastName" required maxLength={20} value={customerLastName} onChange={(event) => setCustomerLastName(event.target.value)} autoComplete="family-name" className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </>}
              {needsCustomerPhone && <div className={needsCustomerName ? '' : 'sm:col-span-2'}>
                <label htmlFor="customerPhone" className="block text-sm font-semibold mb-2">Phone number for ABA</label>
                <input id="customerPhone" required type="tel" minLength={8} maxLength={20} pattern="[0-9+() -]{8,20}" title="Enter 8 to 20 digits, spaces, or phone punctuation." value={customerPhone} onChange={(event) => setCustomerPhone(event.target.value)} autoComplete="tel" placeholder="+855 12 345 678" className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
              </div>}
            </div>
          )}
          {!user?.id && <p className="text-sm text-amber-700 bg-amber-50 rounded-lg p-3">Sign in to place your order.</p>}
          {error && <p role="alert" className="text-sm text-red-600 bg-red-50 rounded-lg p-3">{error}</p>}
          <button disabled={submitting || !paymentMethod} type="submit" className="w-full sm:w-auto inline-flex justify-center items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold text-sm px-6 py-3">
            {submitting && <LoaderCircle className="w-4 h-4 animate-spin" />}{submitting ? 'Creating order and payment…' : user?.id ? 'Place Order & Pay with ABA' : 'Sign in to continue'}
          </button>
        </form>

        <aside className="h-fit bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
          <h2 className="font-bold text-slate-900 dark:text-slate-100">Order Summary</h2>
          <ul className="mt-4 divide-y divide-slate-100 dark:divide-slate-800">
            {cart.map((item) => <li key={item.id} className="py-3 flex justify-between gap-3 text-sm"><span className="text-slate-600 dark:text-slate-300">{item.productName || item.name} × {item.quantity}</span><span className="font-semibold">${(Number(item.price) * item.quantity).toFixed(2)}</span></li>)}
          </ul>
          <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 flex justify-between font-bold"><span>Total</span><span className="text-blue-600">${cartTotal.toFixed(2)}</span></div>
        </aside>
      </div>
    </main>
  );
}
