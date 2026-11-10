import { Link } from 'react-router-dom';
import { ArrowRight, Leaf, ListChecks, ShoppingBag, Truck } from 'lucide-react';
import { foodApi } from '../../services';
import useFetch from '../../utils/useFetch';
import { Plate } from '../../components/ui';
import FoodCard from '../../components/FoodCard';
import { inr } from '../../utils/format';

const STEPS = [
  [ListChecks, 'Choose', 'Browse meals with calories, macros and ingredients listed up front.'],
  [ShoppingBag, 'Pay', 'Check out with Razorpay. Your order is confirmed once payment is verified.'],
  [Truck, 'Track', 'Follow every status change, from kitchen to our own delivery partner.'],
];

export default function Landing() {
  const foods = useFetch(async () => (await foodApi.list()).items, []);
  const list = foods.data || [];
  const hero = list.find((f) => f.image) || list[0];
  const featured = list.slice(0, 4);

  return (
    <div className="space-y-16">
      {/* Hero: oversized plate bleeding off the left edge, bento tiles on the right */}
      <section className="grid items-center gap-8 lg:grid-cols-[1.05fr_1fr]">
        <div className="relative -ml-4 h-[340px] sm:-ml-8 sm:h-[480px] lg:h-[560px]">
          <Plate src={hero?.image} alt={hero?.name || 'A NutriBite meal'} className="absolute -left-24 top-0 aspect-square h-full shadow-[0_30px_60px_-30px_rgba(120,60,10,.5)]" />
          {hero && (
            <Link to={`/menu/${hero.id}`} className="absolute bottom-4 right-0 rounded-3xl bg-white px-5 py-4 shadow-tile sm:right-8">
              <div className="text-xs text-mute">Today's pick</div>
              <div className="font-medium">{hero.name}</div>
              <div className="text-sm text-brand">{hero.calories != null && `${hero.calories} kcal · `}{inr(hero.price)}</div>
            </Link>
          )}
        </div>
        <div>
          <h1 className="font-serif text-5xl font-semibold leading-[1.02] sm:text-6xl">Healthy meals with the numbers on the label.</h1>
          <p className="mt-5 max-w-md text-lg text-neutral-700">Every dish from our kitchen shows its calories, protein, carbs, fat and ingredients before you add it to your basket.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/menu" className="btn-brand px-7 py-3.5 text-base">Order a meal<ArrowRight size={18} /></Link>
            <Link to="/about" className="btn-ghost px-7 py-3.5 text-base">How we cook</Link>
          </div>
          <div className="mt-10 grid max-w-md grid-cols-2 gap-3">
            <div className="rounded-3xl bg-ink p-5 text-white"><div className="text-3xl font-semibold">{list.length || '—'}</div><div className="text-sm text-white/60">meals on the menu today</div></div>
            <div className="rounded-3xl bg-brand-light p-5"><div className="text-3xl font-semibold">1 kitchen</div><div className="text-sm text-neutral-700">one team, our own riders</div></div>
          </div>
        </div>
      </section>

      {/* Featured meals from the live catalogue */}
      {featured.length > 0 && (
        <section className="rounded-tile bg-paper p-5 sm:p-10">
          <div className="mb-6 flex items-end justify-between">
            <h2 className="font-serif text-3xl font-semibold sm:text-4xl">From today's menu</h2>
            <Link to="/menu" className="text-sm font-medium text-brand">See all meals</Link>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">{featured.map((f) => <FoodCard key={f.id} food={f} />)}</div>
        </section>
      )}

      {/* Transparency */}
      <section className="grid gap-4 lg:grid-cols-3">
        <div className="tile p-8 lg:col-span-2">
          <h2 className="font-serif text-3xl font-semibold">Nutrition you can read before you pay</h2>
          <p className="mt-3 max-w-xl text-neutral-700">Values are given per serving, exactly as our kitchen records them. If a figure has not been published for a meal, we show a dash instead of guessing.</p>
          <div className="mt-6 grid max-w-lg grid-cols-4 gap-2 text-center">
            {['kcal', 'protein', 'carbs', 'fat'].map((l) => <div key={l} className="rounded-2xl bg-cream py-4"><div className="text-xl font-semibold">—</div><div className="text-xs text-mute">{l}</div></div>)}
          </div>
        </div>
        <div className="tile flex flex-col justify-between bg-brand p-8 text-white" style={{ background: '#F57C1F' }}>
          <Leaf />
          <div><h3 className="text-2xl font-semibold">Ingredients, listed</h3><p className="mt-2 text-sm text-white/90">Open any meal to see what goes into one serving, plus allergen notes.</p></div>
        </div>
      </section>

      {/* Process: a real sequence */}
      <section>
        <h2 className="font-serif text-3xl font-semibold sm:text-4xl">From menu to doorstep</h2>
        <ol className="mt-6 grid gap-4 md:grid-cols-3">
          {STEPS.map(([Icon, t, s], i) => (
            <li key={t} className={`rounded-tile p-7 ${i === 1 ? 'bg-ink text-white' : 'bg-white shadow-tile'}`}>
              <span className="mb-10 grid h-12 w-12 place-items-center rounded-full bg-brand text-white"><Icon size={20} /></span>
              <h3 className="text-xl font-semibold">{i + 1}. {t}</h3>
              <p className={`mt-2 text-sm ${i === 1 ? 'text-white/70' : 'text-neutral-700'}`}>{s}</p>
            </li>
          ))}
        </ol>
      </section>

      <footer className="flex flex-wrap items-center justify-between gap-4 border-t border-line pt-8 text-sm text-mute">
        <span>© {new Date().getFullYear()} NutriBite</span>
        <nav className="flex gap-5"><Link to="/menu">Menu</Link><Link to="/about">About</Link><Link to="/contact">Contact</Link><Link to="/login">Sign in</Link></nav>
      </footer>
    </div>
  );
}
