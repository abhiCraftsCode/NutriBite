import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Clock, Star } from 'lucide-react';
import { foodApi, reviewApi } from '../../services';
import useFetch from '../../utils/useFetch';
import { Async, Plate, Stars, Stepper, useToast } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { inr } from '../../utils/format';

const Tile = ({ children, className = '' }) => <section className={`tile p-6 ${className}`}>{children}</section>;
const Stat = ({ v, l }) => (<div><div className="text-xs text-mute">{l}</div><div className="mt-1 text-2xl font-semibold tabular-nums">{v ?? '—'}</div></div>);

export default function FoodDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const { add, busy } = useCart();
  const toast = useToast();
  const nav = useNavigate();
  const [qty, setQty] = useState(1);
  const state = useFetch(() => foodApi.get(id), [id]);
  const reviews = useFetch(() => reviewApi.forFood(id).catch(() => ({ reviews: [], totalReviews: 0 })), [id]);

  const addToCart = async () => {
    if (!user) return nav('/login', { state: { from: `/menu/${id}` } });
    if (user.role !== 'CUSTOMER') return toast('Only customer accounts can order.', 'err');
    try { await add(Number(id), qty); toast('Added to your basket'); } catch (e) { toast(e.message, 'err'); }
  };

  return (
    <Async state={state}>
      {(raw) => {
        const f = raw.food || raw;
        const ings = f.ingredients || f.foodIngredients || [];
        const recipe = f.recipe;
        const rs = reviews.data?.reviews || [];
        const avg = reviews.data?.totalReviews ? reviews.data.averageRating : null;
        return (
          <div className="grid gap-4 lg:grid-cols-[1fr_1.15fr_.8fr]">
            <div className="flex flex-col items-center gap-4">
              <Plate src={f.image} alt={f.name} className="aspect-square w-full max-w-[460px] shadow-2xl lg:-ml-16 lg:w-[calc(100%+4rem)] lg:max-w-none" />
              <Link to="/menu" className="text-sm text-mute underline">← All meals</Link>
            </div>
            <div className="space-y-4">
              <Tile>
                <div className="flex items-start justify-between gap-3">
                  <h1 className="font-serif text-3xl font-semibold leading-tight">{f.name}</h1>
                  {f.category?.name && <span className="pill shrink-0 bg-brand text-white">{f.category.name}</span>}
                </div>
                <p className="mt-4 text-[15px] leading-relaxed text-neutral-700">{f.description}</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {f.prepTimeMinutes != null && <span className="pill gap-1 bg-ink text-white"><Clock size={12} />{f.prepTimeMinutes} min prep</span>}
                  {f.servingSize && <span className="pill bg-ink text-white">{f.servingSize}</span>}
                  {f.isAvailable === false && <span className="pill bg-red-100 text-red-700">Currently unavailable</span>}
                </div>
              </Tile>
              <Tile>
                <h2 className="text-lg font-medium">Nutritional value per serving</h2>
                <div className="mt-4 grid grid-cols-4 gap-2">
                  <Stat v={f.calories} l="kcal" /><Stat v={f.protein != null ? `${f.protein}g` : null} l="protein" />
                  <Stat v={f.fat != null ? `${f.fat}g` : null} l="fats" /><Stat v={f.carbohydrates != null ? `${f.carbohydrates}g` : null} l="carbohydrates" />
                </div>
                {f.notes && <><h3 className="mt-6 text-lg font-medium">Notes and allergens</h3><p className="mt-1 whitespace-pre-line text-sm text-neutral-700">{f.notes}</p></>}
              </Tile>
              {recipe && (
                <Tile>
                  <h2 className="text-lg font-medium">Recipe</h2>
                  <p className="mt-1 text-xs text-mute">Prep {recipe.prepTimeMinutes ?? '—'} min · Cook {recipe.cookTimeMinutes ?? '—'} min</p>
                  <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-neutral-700">{recipe.instructions}</p>
                </Tile>
              )}
            </div>
            <div className="space-y-4">
              <Tile>
                <h2 className="text-lg font-medium">Ingredients</h2>
                {ings.length ? (
                  <ul className="mt-3 space-y-1.5 text-sm">
                    {ings.map((i, k) => { const n = i.ingredient || i; return <li key={k} className="flex justify-between gap-2"><span>{n.name}</span>{i.quantity != null && <span className="text-mute">{i.quantity} {n.unit}</span>}</li>; })}
                  </ul>
                ) : <p className="mt-2 text-sm text-mute">Ingredient list not published for this meal.</p>}
              </Tile>
              <Tile className="bg-ink text-white">
                <div className="flex items-end justify-between">
                  <div><div className="text-xs text-white/60">Price</div><div className="text-3xl font-semibold">{inr(f.price)}</div></div>
                  <Stepper dark value={qty} onChange={setQty} />
                </div>
                <button onClick={addToCart} disabled={busy || f.isAvailable === false} className="btn mt-5 w-full bg-white text-ink hover:bg-cream">Add to cart</button>
              </Tile>
              <Tile>
                <div className="flex items-center justify-between"><h2 className="text-lg font-medium">Reviews</h2>{avg && <span className="flex items-center gap-1 text-sm"><Star size={14} className="fill-brand text-brand" />{avg}</span>}</div>
                {rs.length === 0 ? <p className="mt-2 text-sm text-mute">No reviews yet. Order this meal and be the first.</p> : (
                  <ul className="mt-3 space-y-3">{rs.slice(0, 5).map((r) => (
                    <li key={r.id} className="border-t border-line pt-3 text-sm"><Stars value={r.rating} /><p className="mt-1 text-neutral-700">{r.comment}</p><p className="mt-1 text-xs text-mute">{r.user?.name}</p></li>
                  ))}</ul>
                )}
              </Tile>
            </div>
          </div>
        );
      }}
    </Async>
  );
}
