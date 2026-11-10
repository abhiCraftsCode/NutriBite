import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import { categoryApi, foodApi } from '../../services';
import useFetch from '../../utils/useFetch';
import { Async, Empty } from '../../components/ui';
import FoodCard from '../../components/FoodCard';
import { useCart } from '../../context/CartContext';
import { inr } from '../../utils/format';

export default function Menu() {
  const [sp, setSp] = useSearchParams();
  const q = sp.get('q') || '';
  const cat = sp.get('category') || '';
  const [text, setText] = useState(q);
  const { count, cart } = useCart();
  const cats = useFetch(() => categoryApi.list(), []);
  const foods = useFetch(() => foodApi.list({ ...(q && { search: q }), ...(cat && { categoryId: cat }) }), [q, cat]);

  useEffect(() => { const t = setTimeout(() => text !== q && setSp((p) => { const n = new URLSearchParams(p); text ? n.set('q', text) : n.delete('q'); n.delete('page'); return n; }), 350); return () => clearTimeout(t); }, [text]); // eslint-disable-line
  const setParam = (k, v) => setSp((p) => { const n = new URLSearchParams(p); v ? n.set(k, v) : n.delete(k); if (k !== 'page') n.delete('page'); return n; });
  const items = foods.data?.items;
  // Client-side fallback filter in case the backend ignores the search parameter.
  const shown = useMemo(() => (items || []).filter((f) => !q || `${f.name} ${f.description}`.toLowerCase().includes(q.toLowerCase())), [items, q]);

  return (
    <div className="rounded-tile bg-paper p-5 sm:p-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-4xl font-semibold sm:text-5xl">All meals</h1>
          <p className="mt-2 max-w-md text-sm text-mute">Calories and macros are per serving, as listed by our kitchen.</p>
        </div>
        <label className="relative w-full sm:w-72">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-mute" />
          <input className="input pl-10" placeholder="Search meals" value={text} onChange={(e) => setText(e.target.value)} />
        </label>
      </div>
      <div className="mt-6 flex flex-wrap gap-2" role="tablist" aria-label="Categories">
        <button onClick={() => setParam('category', '')} className={`pill px-4 py-2 text-sm ${!cat ? 'bg-ink text-white' : 'bg-white ring-1 ring-line'}`}>All</button>
        {(cats.data || []).filter((c) => c.isActive !== false).map((c) => (
          <button key={c.id} onClick={() => setParam('category', String(c.id))} className={`pill px-4 py-2 text-sm ${cat === String(c.id) ? 'bg-ink text-white' : 'bg-white ring-1 ring-line'}`}>{c.name}</button>
        ))}
      </div>
      <div className="mt-8">
        <Async state={{ ...foods, data: foods.data && shown }} empty={<Empty title="No meals match" hint="Try another category or search term." />}>
          {(list) => (
            <>
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">{list.map((f) => <FoodCard key={f.id} food={f} />)}</div>
            </>
          )}
        </Async>
      </div>
      {count > 0 && (
        <Link to="/app/cart" className="fixed inset-x-4 bottom-5 z-40 mx-auto flex max-w-md items-center justify-between rounded-full bg-white px-6 py-4 shadow-2xl ring-1 ring-black/5">
          <span className="text-sm font-medium">{count} {count === 1 ? 'meal' : 'meals'} in your basket</span>
          <span className="rounded-full bg-ink px-4 py-1.5 text-sm text-white">View basket{cart.subtotal != null ? ` · ${inr(cart.subtotal)}` : ''}</span>
        </Link>
      )}
    </div>
  );
}
