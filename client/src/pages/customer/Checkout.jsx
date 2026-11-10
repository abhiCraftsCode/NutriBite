import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MapPin, Plus } from 'lucide-react';
import { addressApi, orderApi } from '../../services';
import useFetch from '../../utils/useFetch';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { Async, Empty, FormError, Modal, PageHead, Spinner, useToast } from '../../components/ui';
import AddressForm from '../../components/AddressForm';
import { payForOrder } from '../../utils/pay';
import { inr } from '../../utils/format';

export default function Checkout() {
  const { cart, refresh } = useCart();
  const { user } = useAuth();
  const nav = useNavigate();
  const toast = useToast();
  const addrs = useFetch(() => addressApi.list(), []);
  const [sel, setSel] = useState(null);
  const [adding, setAdding] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);
  const [pending, setPending] = useState(null); // order awaiting payment

  if (!cart.items.length && !pending) return <Empty title="Nothing to check out" hint="Your basket is empty." action={<Link to="/menu" className="btn-brand">Browse meals</Link>} />;

  const pay = async (order) => {
    const r = await payForOrder(order.id, user);
    if (r.status === 'verified') { await refresh(); toast('Payment verified. Your order is placed.'); nav(`/app/orders/${order.id}`, { replace: true }); }
    else if (r.status === 'failed') {
      setErr(r.error);
      if (r.error?.status === 409) { setPending(null); await refresh(); } // stock gone: order cancelled and refunded by the server
    }
    else setErr({ message: 'Checkout was closed before we confirmed a payment. If money was taken, it will show on the order once verified. Otherwise, retry below.' });
  };
  const place = async () => {
    setBusy(true); setErr(null);
    try {
      let order = pending;
      if (!order) { const d = await orderApi.create({ addressId: sel }); order = d.order || d; setPending(order); }
      await pay(order);
    } catch (e) { setErr(e); } finally { setBusy(false); }
  };

  return (
    <div>
      <PageHead title="Checkout" sub="Choose where we should deliver." />
      <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
        <section className="space-y-3">
          <Async state={addrs} empty={<Empty title="No saved addresses" hint="Add one to continue." action={<button className="btn-brand" onClick={() => setAdding(true)}>Add address</button>} />}>
            {(list) => (
              <>
                {list.map((a) => (
                  <label key={a.id} className={`tile flex cursor-pointer items-start gap-3 p-5 ring-2 ${sel === a.id ? 'ring-brand' : 'ring-transparent'} ${pending ? 'pointer-events-none opacity-60' : ''}`}>
                    <input type="radio" name="addr" className="mt-1 accent-orange-500" checked={sel === a.id} onChange={() => setSel(a.id)} />
                    <MapPin size={18} className="mt-0.5 text-brand" />
                    <div className="text-sm"><div className="font-medium">{a.label || 'Address'}</div><div className="text-neutral-700">{a.address}, {a.city}, {a.state} {a.pincode}</div>{a.landmark && <div className="text-mute">Near {a.landmark}</div>}</div>
                  </label>
                ))}
                <button className="btn-ghost" onClick={() => setAdding(true)}><Plus size={14} />Add another address</button>
              </>
            )}
          </Async>
          {!user?.phone && <p className="rounded-2xl bg-amber-50 p-4 text-sm text-amber-800">Your profile has no phone number. Deliveries use your profile phone, so <Link className="underline" to="/app/profile">add one</Link> first.</p>}
        </section>
        <aside className="tile h-fit bg-ink p-6 text-white">
          <h2 className="text-lg font-medium">Order summary</h2>
          <ul className="mt-4 space-y-2 text-sm">{cart.items.map((i) => <li key={i.id} className="flex justify-between gap-3"><span>{i.quantity} × {i.food.name}</span></li>)}</ul>
          <div className="mt-4 flex justify-between border-t border-white/15 pt-4 text-sm"><span className="text-white/60">Subtotal</span><span>{cart.subtotal != null ? inr(cart.subtotal) : 'Confirmed on order'}</span></div>
          <p className="mt-2 text-xs text-white/50">Delivery fee and total are calculated by our server and shown on your order.</p>
          <div className="mt-4"><FormError error={err} /></div>
          <button className="btn mt-4 w-full bg-brand text-white hover:bg-brand-dark" disabled={busy || (!sel && !pending)} onClick={place}>
            {busy && <Spinner className="!text-white" />}{pending ? 'Retry payment' : 'Place order and pay'}
          </button>
          {pending && <Link to={`/app/orders/${pending.id}`} className="mt-3 block text-center text-sm text-white/70 underline">View this order</Link>}
        </aside>
      </div>
      {adding && (
        <Modal title="New address" onClose={() => setAdding(false)}>
          <AddressForm onCancel={() => setAdding(false)} onSave={async (b) => { const a = await addressApi.create(b); setAdding(false); await addrs.reload(); setSel((a.address || a).id ?? null); toast('Address saved'); }} />
        </Modal>
      )}
    </div>
  );
}
