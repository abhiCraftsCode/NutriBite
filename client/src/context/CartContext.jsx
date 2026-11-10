import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { cartApi } from '../services';
import { useAuth } from './AuthContext';

const Ctx = createContext(null);
export const useCart = () => useContext(Ctx);

/** Normalises the backend cart so components don't care which key names it uses. */
export const normalizeCart = (d) => {
  const c = d?.cart || d || {};
  const items = (c.items || c.cartItems || []).map((it) => ({ ...it, food: it.food || {} }));
  return { items, subtotal: c.subtotal ?? c.total ?? null, deliveryFee: c.deliveryFee ?? null, raw: c };
};

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [cart, setCart] = useState({ items: [], subtotal: null });
  const [busy, setBusy] = useState(false);
  const isCustomer = user?.role === 'CUSTOMER';

  const refresh = useCallback(async () => {
    if (!isCustomer) return setCart({ items: [], subtotal: null });
    try { setCart(normalizeCart(await cartApi.get())); } catch { /* surfaced where used */ }
  }, [isCustomer]);
  useEffect(() => { refresh(); }, [refresh]);

  const run = async (fn) => { setBusy(true); try { await fn(); await refresh(); } finally { setBusy(false); } };
  const add = (foodId, quantity = 1) => run(() => cartApi.add({ foodId, quantity }));
  const setQty = (itemId, quantity) => run(() => cartApi.update(itemId, { quantity }));
  const remove = (itemId) => run(() => cartApi.remove(itemId));
  const clear = () => run(() => cartApi.clear());
  const count = cart.items.reduce((n, i) => n + (i.quantity || 0), 0);

  return <Ctx.Provider value={{ cart, count, busy, refresh, add, setQty, remove, clear }}>{children}</Ctx.Provider>;
}
