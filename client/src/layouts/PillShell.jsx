import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LogOut, Menu as MenuIcon, ShoppingBag, X } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { homeFor } from '../utils/format';

export const Logo = ({ className = '' }) => (
  <Link to="/" className={`relative font-sans text-[26px] font-semibold tracking-tight ${className}`} aria-label="NutriBite home">
    Nutri<span>Bite</span>
    <svg className="absolute -top-1.5 left-[3.1rem] h-3.5 w-3.5 text-brand" viewBox="0 0 24 24" fill="currentColor"><path d="M4 20C4 9 11 3 21 3c0 10-6 17-17 17z" /></svg>
  </Link>
);

const pill = ({ isActive }) => `rounded-full px-5 py-2.5 text-[15px] transition ${isActive ? 'bg-brand text-white' : 'hover:bg-soft'}`;

/** Public + customer shell: a white "sheet" on the cream canvas with a floating pill nav (ref 1). */
export default function PillShell() {
  const { user, logout } = useAuth();
  const { count } = useCart();
  const nav = useNavigate();
  const [open, setOpen] = useState(false);
  const customer = user?.role === 'CUSTOMER';
  const links = customer
    ? [['/app', 'Home', true], ['/menu', 'Menu'], ['/app/orders', 'Orders'], ['/app/reviews', 'Reviews'], ['/app/suggestions', 'Suggest a meal'], ['/app/profile', 'Profile']]
    : [['/', 'Home', true], ['/menu', 'Menu'], ['/about', 'About'], ['/contact', 'Contact']];

  return (
    <div className="min-h-screen bg-gradient-to-b from-cream to-[#FFFAF5] p-2 sm:p-5">
      <div className="mx-auto max-w-[1360px] rounded-[28px] bg-white/70 p-4 ring-1 ring-white sm:rounded-sheet sm:p-8">
        <header className="flex items-center justify-between gap-4">
          <Logo />
          <nav className="hidden rounded-full bg-white p-2 shadow-tile lg:flex" aria-label="Main">
            {links.map(([to, t, end]) => <NavLink key={to} to={to} end={end} className={pill}>{t}</NavLink>)}
          </nav>
          <div className="flex items-center gap-2">
            {customer && (
              <Link to="/app/cart" className="flex items-center gap-3 rounded-full bg-white px-5 py-3 text-sm shadow-tile">
                {count} {count === 1 ? 'item' : 'items'}
                <span className="relative"><ShoppingBag size={20} />{count > 0 && <i className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-brand" />}</span>
              </Link>
            )}
            {user ? (
              <>
                <Link to={customer ? '/app/profile' : homeFor(user.role)} className="hidden items-center gap-2 rounded-full bg-white py-1.5 pl-1.5 pr-4 text-sm shadow-tile sm:flex">
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-brand font-medium text-white">{user.name?.[0]?.toUpperCase()}</span>
                  {user.name?.split(' ')[0]}
                </Link>
                <button onClick={() => { logout(); nav('/'); }} className="grid h-11 w-11 place-items-center rounded-full bg-white shadow-tile" aria-label="Sign out"><LogOut size={18} /></button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-ghost hidden sm:inline-flex">Sign in</Link>
                <Link to="/register" className="btn-ink">Join</Link>
              </>
            )}
            <button className="grid h-11 w-11 place-items-center rounded-full bg-white shadow-tile lg:hidden" onClick={() => setOpen(!open)} aria-label="Menu">
              {open ? <X size={18} /> : <MenuIcon size={18} />}
            </button>
          </div>
        </header>
        {open && (
          <nav className="mt-3 flex flex-col gap-1 rounded-3xl bg-white p-3 shadow-tile lg:hidden" onClick={() => setOpen(false)}>
            {links.map(([to, t, end]) => <NavLink key={to} to={to} end={end} className={pill}>{t}</NavLink>)}
            {!user && <NavLink to="/login" className={pill}>Sign in</NavLink>}
          </nav>
        )}
        <main className="mt-8"><Outlet /></main>
      </div>
    </div>
  );
}
