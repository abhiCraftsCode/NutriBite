import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LogOut, Menu as MenuIcon, X } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Logo } from './PillShell';

/** Admin + delivery shell (ref 3): white sidebar, orange-filled active item, soft-grey canvas. */
export default function SidebarShell({ items, area }) {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const [open, setOpen] = useState(false);
  const link = ({ isActive }) =>
    `flex items-center gap-3 rounded-2xl px-4 py-3 text-[15px] transition ${isActive ? 'bg-brand text-white shadow-md shadow-brand/30' : 'text-mute hover:bg-soft hover:text-ink'}`;
  const side = (
    <div className="flex h-full flex-col">
      <div className="px-6 py-6"><Logo /><p className="mt-1 text-xs text-mute">{area}</p></div>
      <nav className="flex-1 space-y-1 overflow-y-auto px-4" onClick={() => setOpen(false)} aria-label={area}>
        {items.map(({ to, text, icon: Icon, end }) => (
          <NavLink key={to} to={to} end={end} className={link}><Icon size={19} />{text}</NavLink>
        ))}
      </nav>
      <div className="m-4 rounded-3xl bg-cream p-4">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-full bg-brand font-medium text-white">{user?.name?.[0]?.toUpperCase()}</span>
          <div className="min-w-0"><p className="truncate text-sm font-medium">{user?.name}</p><p className="truncate text-xs text-mute">{user?.email}</p></div>
        </div>
        <button onClick={() => { logout(); nav('/'); }} className="btn-ghost mt-3 w-full"><LogOut size={15} />Sign out</button>
      </div>
    </div>
  );
  return (
    <div className="min-h-screen bg-[#F6F7F9] lg:pl-64">
      <aside className="fixed inset-y-0 left-0 hidden w-64 bg-white lg:block">{side}</aside>
      {open && (
        <div className="fixed inset-0 z-40 bg-ink/40 lg:hidden" onClick={() => setOpen(false)}>
          <aside className="h-full w-72 bg-white" onClick={(e) => e.stopPropagation()}>{side}</aside>
        </div>
      )}
      <div className="sticky top-0 z-30 flex items-center justify-between bg-white/90 px-4 py-3 backdrop-blur lg:hidden">
        <Logo />
        <button onClick={() => setOpen(!open)} className="grid h-10 w-10 place-items-center rounded-full bg-soft" aria-label="Menu">{open ? <X size={18} /> : <MenuIcon size={18} />}</button>
      </div>
      <main className="mx-auto max-w-[1280px] p-4 sm:p-8"><Outlet /></main>
    </div>
  );
}
