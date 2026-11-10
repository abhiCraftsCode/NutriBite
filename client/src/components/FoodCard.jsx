import { Link } from 'react-router-dom';
import { Flame, Minus, Plus } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { Macros, Plate, useToast } from './ui';
import { inr } from '../utils/format';
import { useNavigate } from 'react-router-dom';

/** Catalogue card (ref 2): warm-grey tile, centred plate, macro strip, dark action pill. */
export default function FoodCard({ food }) {
  const { user } = useAuth();
  const { cart, add, setQty, busy } = useCart();
  const toast = useToast();
  const nav = useNavigate();
  const [pending, setPending] = useState(false);
  const inCart = cart.items.find((i) => (i.foodId ?? i.food?.id) === food.id);
  const unavailable = food.isAvailable === false;

  const act = async (fn) => {
    setPending(true);
    try { await fn(); } catch (e) { toast(e.message, 'err'); } finally { setPending(false); }
  };
  const onAdd = () => {
    if (!user) return nav('/login', { state: { from: '/menu' } });
    if (user.role !== 'CUSTOMER') return toast('Only customer accounts can order.', 'err');
    act(() => add(food.id, 1));
  };

  return (
    <article className="flex flex-col rounded-tile bg-soft p-5">
      <Link to={`/menu/${food.id}`} className="relative block" aria-label={food.name}>
        {food.category?.name && <span className="pill absolute left-0 top-0 z-10 bg-white/80 text-mute">{food.category.name}</span>}
        <Plate src={food.image} alt={food.name} className="mx-auto mt-6 aspect-square w-[78%] shadow-[14px_10px_24px_-14px_rgba(0,0,0,.35)]" />
      </Link>
      <h3 className="mt-5 text-lg font-semibold leading-snug">{food.name}</h3>
      <p className="mt-1 line-clamp-2 min-h-[2.75rem] text-sm text-neutral-700">{food.description}</p>
      <div className="mt-3 flex items-center justify-between text-sm">
        <span className="font-semibold">{inr(food.price)}</span>
        <span className="flex items-center gap-1 text-mute"><Flame size={14} className="text-brand" />{food.servingSize || '1 serving'}</span>
      </div>
      <div className="mt-3"><Macros food={food} /></div>
      <div className="mt-3">
        {unavailable ? (
          <button disabled className="btn-ghost w-full">Currently unavailable</button>
        ) : inCart ? (
          <div className="flex items-center justify-between rounded-full bg-neutral-700 px-2 py-1.5 text-white">
            <button disabled={pending || busy} aria-label="Remove one" onClick={() => act(() => setQty(inCart.id, inCart.quantity - 1).catch(() => {}) )} className="grid h-8 w-8 place-items-center rounded-full hover:bg-neutral-600 disabled:opacity-40"><Minus size={15} /></button>
            <span className="text-sm font-medium">{inCart.quantity}</span>
            <button disabled={pending || busy || inCart.quantity >= 20} aria-label="Add one" onClick={() => act(() => setQty(inCart.id, inCart.quantity + 1))} className="grid h-8 w-8 place-items-center rounded-full hover:bg-neutral-600 disabled:opacity-40"><Plus size={15} /></button>
          </div>
        ) : (
          <button onClick={onAdd} disabled={pending} className="btn w-full bg-white text-ink ring-1 ring-neutral-300 hover:bg-white/60">Add meal</button>
        )}
      </div>
    </article>
  );
}
