import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Star } from 'lucide-react';
import { orderApi, reviewApi } from '../../services';
import useFetch from '../../utils/useFetch';
import { useAuth } from '../../context/AuthContext';
import { Async, Badge, Empty, FormError, PageHead, Spinner, Stars, useToast } from '../../components/ui';
import Timeline from '../../components/Timeline';
import { payForOrder } from '../../utils/pay';
import { dt, inr, label } from '../../utils/format';

export function OrderList() {
  const s = useFetch(() => orderApi.list(), []);
  return (
    <div>
      <PageHead title="Your orders" />
      <Async state={s} empty={<Empty title="No orders yet" hint="Your placed orders will appear here." action={<Link to="/menu" className="btn-brand">Browse meals</Link>} />}>
        {(list) => (
          <ul className="space-y-3">
            {list.map((o) => (
              <li key={o.id}>
                <Link to={`/app/orders/${o.id}`} className="tile flex flex-wrap items-center justify-between gap-3 p-5 hover:ring-2 hover:ring-brand-light">
                  <div><div className="font-medium">{o.orderNumber}</div><div className="text-xs text-mute">{dt(o.createdAt)}</div></div>
                  <Badge status={o.status} />
                  <div className="font-semibold">{inr(o.total)}</div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Async>
    </div>
  );
}

/** Inline review block under each delivered item: stars + comment, or the review already given. */
function ItemReview({ item, existing, onDone }) {
  const toast = useToast();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [err, setErr] = useState(null);
  const [busy, setBusy] = useState(false);
  if (existing)
    return (
      <div className="mt-3 rounded-2xl bg-cream p-4 text-sm">
        <div className="flex items-center justify-between gap-2"><span className="font-medium">Your review</span><Badge status={existing.status} /></div>
        <div className="mt-1"><Stars value={existing.rating} /></div>
        {existing.comment && <p className="mt-1 text-neutral-700">{existing.comment}</p>}
        {existing.status === 'PENDING' && <p className="mt-1 text-xs text-mute">Shown on the meal page once our team approves it.</p>}
      </div>
    );
  const submit = async (e) => {
    e.preventDefault(); setBusy(true); setErr(null);
    try { await reviewApi.create({ orderItemId: item.id, rating, ...(comment.trim() && { comment: comment.trim() }) }); toast('Thanks, your review was submitted'); onDone(); }
    catch (x) { setErr(x); } finally { setBusy(false); }
  };
  return (
    <form onSubmit={submit} className="mt-3 space-y-3 rounded-2xl border border-dashed border-brand/50 bg-cream p-4">
      <div className="text-sm font-medium">How was the {item.foodName}?</div>
      <div className="flex gap-1" role="radiogroup" aria-label="Rating">
        {[1, 2, 3, 4, 5].map((n) => (
          <button type="button" key={n} role="radio" aria-checked={rating === n} aria-label={`${n} star${n > 1 ? 's' : ''}`} onClick={() => setRating(n)}>
            <Star size={28} className={n <= rating ? 'fill-brand text-brand' : 'text-neutral-300'} />
          </button>
        ))}
      </div>
      <textarea className="input" rows={3} placeholder="Write a few words about the meal (optional)" value={comment} maxLength={1000} onChange={(e) => setComment(e.target.value)} />
      <FormError error={err} />
      <button className="btn-brand" disabled={busy || rating === 0}>{busy && <Spinner className="!text-white" />}Submit review</button>
    </form>
  );
}

export function OrderDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const toast = useToast();
  const s = useFetch(() => orderApi.get(id), [id]);
  const mine = useFetch(() => reviewApi.mine().catch(() => []), [id]);
  const reviewsByItem = Object.fromEntries((mine.data || []).map((r) => [r.orderItemId, r]));
  const [paying, setPaying] = useState(false);

  return (
    <Async state={s}>
      {(raw) => {
        const o = raw.order || raw;
        const items = o.items || o.orderItems || [];
        const history = o.statusHistory || o.orderStatusHistory || o.history || [];
        const pays = o.payments || [];
        const pay = pays[pays.length - 1];
        const del = o.delivery;
        const retry = async () => {
          setPaying(true);
          try {
            const r = await payForOrder(o.id, user);
            if (r.status === 'verified') toast('Payment verified. Your order is placed.');
            else if (r.status === 'failed') toast(r.error?.message || 'Payment failed', 'err');
            else toast('Checkout closed. Payment is not confirmed yet.', 'err');
            s.reload();
          } catch (e) { toast(e.message, 'err'); } finally { setPaying(false); }
        };
        return (
          <div className="space-y-4">
            <PageHead title={o.orderNumber || `Order #${o.id}`} sub={`Placed ${dt(o.createdAt)}`} action={<Badge status={o.status} />} />
            <Timeline status={o.status} history={history} />
            {o.status === 'PENDING_PAYMENT' && (
              <div className="tile flex flex-wrap items-center justify-between gap-3 p-5">
                <p className="text-sm">This order is waiting for a verified payment.</p>
                <button className="btn-brand" onClick={retry} disabled={paying}>{paying && <Spinner className="!text-white" />}Pay now</button>
              </div>
            )}
            {o.status === 'CANCELLED' && o.cancelReason && <p className="rounded-2xl bg-red-50 p-4 text-sm text-red-700">Reason: {o.cancelReason}</p>}
            <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
              <section className="tile p-6">
                <h2 className="text-lg font-medium">Items</h2>
                <ul className="mt-3 divide-y divide-line">
                  {items.map((i) => (
                    <li key={i.id} className="py-3 text-sm">
                      <div className="flex items-center justify-between gap-3">
                        <div><div className="font-medium">{i.quantity} × {i.foodName}</div><div className="text-xs text-mute">{inr(i.unitPrice)} each</div></div>
                        <span>{inr(i.total)}</span>
                      </div>
                      {o.status === 'DELIVERED' && <ItemReview item={i} existing={reviewsByItem[i.id]} onDone={() => mine.reload()} />}
                    </li>
                  ))}
                </ul>
                <dl className="mt-3 space-y-1 border-t border-line pt-3 text-sm">
                  <div className="flex justify-between"><dt className="text-mute">Subtotal</dt><dd>{inr(o.subtotal)}</dd></div>
                  <div className="flex justify-between"><dt className="text-mute">Delivery</dt><dd>{inr(o.deliveryFee)}</dd></div>
                  <div className="flex justify-between text-base font-semibold"><dt>Total</dt><dd>{inr(o.total)}</dd></div>
                </dl>
              </section>
              <div className="space-y-4">
                <section className="tile p-6 text-sm">
                  <h2 className="text-lg font-medium">Delivered to</h2>
                  <p className="mt-2">{o.deliveryName}<br />{o.deliveryAddress}, {o.deliveryCity}, {o.deliveryState} {o.deliveryPincode}{o.deliveryLandmark && <><br />Near {o.deliveryLandmark}</>}<br /><span className="text-mute">{o.deliveryPhone}</span></p>
                </section>
                {pay && <section className="tile p-6 text-sm"><h2 className="text-lg font-medium">Payment</h2><p className="mt-2 flex items-center gap-2">{label(pay.method)} <Badge status={pay.status} /></p>{pay.failureReason && <p className="mt-1 text-xs text-red-600">{pay.failureReason}</p>}</section>}
                {del && <section className="tile p-6 text-sm"><h2 className="text-lg font-medium">Delivery</h2><p className="mt-2 flex items-center gap-2"><Badge status={del.status} />{del.partner?.name && <span>with {del.partner.name}</span>}</p></section>}
              </div>
            </div>
            {history.length > 0 && (
              <section className="tile p-6"><h2 className="text-lg font-medium">History</h2>
                <ul className="mt-3 space-y-2 text-sm">{history.map((h) => <li key={h.id} className="flex justify-between gap-3"><span>{label(h.status)}{h.note ? ` — ${h.note}` : ''}</span><span className="text-mute">{dt(h.createdAt)}</span></li>)}</ul>
              </section>
            )}
          </div>
        );
      }}
    </Async>
  );
}
