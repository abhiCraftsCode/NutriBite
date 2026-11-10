export const inr = (paise) =>
  paise == null ? '—' : new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(paise / 100);
export const toPaise = (rupees) => Math.round(Number(rupees) * 100);
export const toRupees = (paise) => (paise == null ? '' : paise / 100);
export const dt = (v) => (v ? new Date(v).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—');
export const d = (v) => (v ? new Date(v).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—');
export const label = (s) => (s ? s.replaceAll('_', ' ').toLowerCase().replace(/^\w/, (c) => c.toUpperCase()) : '');
export const homeFor = (role) => (role === 'ADMIN' ? '/admin' : role === 'DELIVERY_PARTNER' ? '/delivery' : '/app');

export const ORDER_FLOW = ['PLACED', 'CONFIRMED', 'PREPARING', 'READY_FOR_PICKUP', 'OUT_FOR_DELIVERY', 'DELIVERED'];
export const ADMIN_NEXT = { PLACED: 'CONFIRMED', CONFIRMED: 'PREPARING', PREPARING: 'READY_FOR_PICKUP' };
export const DELIVERY_NEXT = { ASSIGNED: 'ACCEPTED', ACCEPTED: 'PICKED_UP', PICKED_UP: 'OUT_FOR_DELIVERY', OUT_FOR_DELIVERY: 'DELIVERED' };
export const DELIVERY_ACTION = { ACCEPTED: 'Accept delivery', PICKED_UP: 'Mark picked up', OUT_FOR_DELIVERY: 'Start delivery', DELIVERED: 'Mark delivered' };
export const statusTone = (s) =>
  ({ DELIVERED: 'bg-emerald-100 text-emerald-800', CANCELLED: 'bg-red-100 text-red-700', PENDING_PAYMENT: 'bg-neutral-200 text-neutral-700',
     APPROVED: 'bg-emerald-100 text-emerald-800', HIDDEN: 'bg-neutral-200 text-neutral-700', REJECTED: 'bg-red-100 text-red-700', PENDING: 'bg-amber-100 text-amber-800',
     CAPTURED: 'bg-emerald-100 text-emerald-800', FAILED: 'bg-red-100 text-red-700' }[s] || 'bg-brand-light text-brand-dark');
