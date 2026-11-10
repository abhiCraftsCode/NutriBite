import { Link } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { Empty, Plate, Stepper, useToast, PageHead } from '../../components/ui';
import { inr } from '../../utils/format';

export default function Cart() {
  const { cart, setQty, remove, clear, busy } = useCart();
  const toast = useToast();
  const guard = (fn) => fn().catch((e) => toast(e.message, 'err'));
  if (!cart.items.length)
    return <Empty title="Your basket is empty" hint="Add a few meals and they will show up here." action={<Link to="/menu" className="btn-brand">Browse meals</Link>} />;
  const line = (i) => i.total ?? i.lineTotal ?? (i.food.price != null ? i.food.price * i.quantity : null);
  return (
    <div>
      <PageHead title="Your basket" action={<button className="btn-ghost" disabled={busy} onClick={() => guard(clear)}><Trash2 size={14} />Clear basket</button>} />
      <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
        <ul className="space-y-3">
          {cart.items.map((i) => (
            <li key={i.id} className="tile flex items-center gap-4 p-4">
              <Plate src={i.food.image} alt={i.food.name} className="h-20 w-20 shrink-0" />
              <div className="min-w-0 flex-1">
                <Link to={`/menu/${i.food.id ?? i.foodId}`} className="font-medium">{i.food.name}</Link>
                <p className="text-xs text-mute">{i.food.calories != null ? `${i.food.calories} kcal · ` : ''}{inr(i.food.price)} each</p>
                {i.food.isAvailable === false && <p className="text-xs text-red-600">No longer available. Remove it to check out.</p>}
              </div>
              <Stepper value={i.quantity} disabled={busy} onChange={(q) => guard(() => setQty(i.id, q))} />
              <div className="w-20 text-right font-medium">{inr(line(i))}</div>
              <button aria-label={`Remove ${i.food.name}`} className="grid h-9 w-9 place-items-center rounded-full bg-soft" onClick={() => guard(() => remove(i.id))}><Trash2 size={15} /></button>
            </li>
          ))}
        </ul>
        <aside className="tile h-fit bg-ink p-6 text-white">
          <h2 className="text-lg font-medium">Summary</h2>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between"><dt className="text-white/60">Subtotal</dt><dd>{cart.subtotal != null ? inr(cart.subtotal) : 'Calculated at checkout'}</dd></div>
            <div className="flex justify-between"><dt className="text-white/60">Delivery</dt><dd>{cart.deliveryFee != null ? inr(cart.deliveryFee) : 'Calculated at checkout'}</dd></div>
          </dl>
          <p className="mt-3 text-xs text-white/50">Final prices are confirmed by our server when you place the order.</p>
          <Link to="/app/checkout" className="btn mt-5 w-full bg-white text-ink hover:bg-cream">Continue to checkout</Link>
        </aside>
      </div>
    </div>
  );
}
