import { paymentApi } from '../services';

let scriptPromise;
const loadRazorpay = () => {
  if (window.Razorpay) return Promise.resolve();
  scriptPromise ??= new Promise((res, rej) => {
    const s = document.createElement('script');
    s.src = 'https://checkout.razorpay.com/v1/checkout.js';
    s.onload = res; s.onerror = () => { scriptPromise = null; rej({ message: 'Could not load Razorpay Checkout. Check your connection and retry.' }); };
    document.body.appendChild(s);
  });
  return scriptPromise;
};

/**
 * Opens Razorpay Checkout for an existing PENDING_PAYMENT order.
 * Resolves { status: 'verified' | 'dismissed' | 'failed', error? }.
 * Success is only ever reported after the backend /payments/verify call succeeds.
 */
export async function payForOrder(orderId, user) {
  await loadRazorpay();
  const d = await paymentApi.createOrder({ orderId });
  const p = d?.payment || d || {};
  const key = p.keyId || p.key || p.razorpayKeyId || p.key_id;
  const rzpOrderId = p.razorpayOrderId || p.razorpay_order_id || p.id;
  if (!key || !rzpOrderId) throw { message: 'The server did not return payment details. Please try again.' };

  return new Promise((resolve) => {
    let settled = false;
    let lastFailure = null;
    const done = (v) => { if (!settled) { settled = true; resolve(v); } };
    const rzp = new window.Razorpay({
      key, order_id: rzpOrderId, amount: p.amount, currency: p.currency || 'INR', name: 'NutriBite',
      description: p.orderNumber ? `Order ${p.orderNumber}` : 'Meal order',
      prefill: { name: user?.name, email: user?.email, contact: user?.phone },
      theme: { color: '#F57C1F' },
      handler: async (r) => {
        try {
          await paymentApi.verify({ razorpayOrderId: r.razorpay_order_id, razorpayPaymentId: r.razorpay_payment_id, razorpaySignature: r.razorpay_signature });
          done({ status: 'verified' });
        } catch (error) { done({ status: 'failed', error }); }
      },
      modal: {
        // Razorpay lets the customer retry inside the modal, so a failure is only recorded once the
        // modal closes. A plain close with no reported failure is NOT treated as a failed payment.
        ondismiss: async () => {
          if (settled) return;
          if (lastFailure) {
            try { await paymentApi.failed({ razorpayOrderId: rzpOrderId, failureReason: lastFailure }); } catch { /* ignore */ }
            done({ status: 'failed', error: { message: lastFailure } });
          } else done({ status: 'dismissed' });
        },
      },
    });
    rzp.on('payment.failed', (r) => { lastFailure = r?.error?.description || 'Payment attempt failed'; });
    rzp.open();
  });
}
