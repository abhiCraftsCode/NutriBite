import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { accountApi, addressApi, reviewApi, suggestionApi, orderApi } from '../../services';
import useFetch from '../../utils/useFetch';
import { useAuth } from '../../context/AuthContext';
import { Async, Badge, Empty, Field, FormError, Modal, PageHead, Spinner, Stars, useToast } from '../../components/ui';
import AddressForm from '../../components/AddressForm';
import { d, dt, inr } from '../../utils/format';

export function CustomerDashboard() {
  const { user } = useAuth();
  const orders = useFetch(() => orderApi.list(), []);
  const active = (orders.data || []).filter((o) => !['DELIVERED', 'CANCELLED', 'PENDING_PAYMENT'].includes(o.status));
  const spent = (orders.data || []).filter((o) => o.status === 'DELIVERED').reduce((n, o) => n + (o.total || 0), 0);
  return (
    <div className="space-y-5">
      <PageHead title={`Hello, ${user.name.split(' ')[0]}`} sub="Here is what is happening with your meals." />
      <div className="grid gap-4 md:grid-cols-3">
        <div className="tile p-6"><div className="text-sm text-mute">Orders placed</div><div className="mt-2 text-4xl font-semibold">{orders.data?.length ?? '—'}</div></div>
        <div className="rounded-tile bg-ink p-6 text-white"><div className="text-sm text-white/60">On the way or in the kitchen</div><div className="mt-2 text-4xl font-semibold">{active.length}</div></div>
        <div className="rounded-tile bg-brand p-6 text-white"><div className="text-sm text-white/80">Spent on delivered meals</div><div className="mt-2 text-4xl font-semibold">{inr(spent)}</div></div>
      </div>
      <section className="tile p-6">
        <div className="flex items-center justify-between"><h2 className="text-lg font-medium">Active orders</h2><Link to="/app/orders" className="text-sm text-brand">All orders</Link></div>
        <Async state={orders} empty={<Empty title="No orders yet" action={<Link to="/menu" className="btn-brand">Browse meals</Link>} />}>
          {() => active.length === 0 ? <p className="mt-3 text-sm text-mute">Nothing in progress right now.</p> : (
            <ul className="mt-3 space-y-2">{active.map((o) => <li key={o.id}><Link to={`/app/orders/${o.id}`} className="flex items-center justify-between rounded-2xl bg-cream px-4 py-3 text-sm"><span className="font-medium">{o.orderNumber}</span><Badge status={o.status} /><span>{inr(o.total)}</span></Link></li>)}</ul>
          )}
        </Async>
      </section>
      <div className="flex flex-wrap gap-3"><Link to="/menu" className="btn-brand">Order a meal</Link><Link to="/app/suggestions" className="btn-ghost">Suggest a meal</Link><Link to="/app/reviews" className="btn-ghost">My reviews</Link></div>
    </div>
  );
}

export function MyReviews() {
  const s = useFetch(() => reviewApi.mine(), []);
  const orders = useFetch(() => orderApi.list(), []);
  const delivered = (orders.data || []).filter((o) => o.status === 'DELIVERED');
  return (
    <div><PageHead title="My reviews" sub="You can review each meal once its order has been delivered." />
      <section className="tile mb-6 p-6">
        <h2 className="text-lg font-medium">Delivered orders</h2>
        {delivered.length === 0 ? <p className="mt-2 text-sm text-mute">Once an order is delivered, open it and use the star box under each meal. Reviews appear on the meal page after our team approves them.</p> : (
          <ul className="mt-3 space-y-2">{delivered.map((o) => <li key={o.id}><Link to={`/app/orders/${o.id}`} className="flex items-center justify-between rounded-2xl bg-cream px-4 py-3 text-sm"><span className="font-medium">{o.orderNumber}</span><span className="text-brand">Rate meals</span></Link></li>)}</ul>
        )}
      </section>
      <Async state={s} empty={<Empty title="No reviews yet" hint="After a delivery, open the order and tap Review on an item." />}>
        {(list) => <ul className="space-y-3">{list.map((r) => (
          <li key={r.id} className="tile p-5"><div className="flex items-center justify-between"><span className="font-medium">{r.food?.name || `Meal #${r.foodId}`}</span><Badge status={r.status} /></div><div className="mt-1"><Stars value={r.rating} /></div>{r.comment && <p className="mt-2 text-sm text-neutral-700">{r.comment}</p>}<p className="mt-2 text-xs text-mute">{d(r.createdAt)}</p></li>
        ))}</ul>}
      </Async>
    </div>
  );
}

export function Suggestions() {
  const toast = useToast();
  const s = useFetch(() => suggestionApi.mine(), []);
  const [f, setF] = useState({ title: '', description: '', ingredients: '', recipe: '' });
  const [err, setErr] = useState(null);
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const submit = async (e) => {
    e.preventDefault(); setBusy(true); setErr(null);
    try { await suggestionApi.create(Object.fromEntries(Object.entries(f).filter(([, v]) => v.trim()))); toast('Suggestion sent to our kitchen'); setF({ title: '', description: '', ingredients: '', recipe: '' }); s.reload(); }
    catch (x) { setErr(x); } finally { setBusy(false); }
  };
  return (
    <div><PageHead title="Suggest a meal" sub="Tell us what you would like to see on the menu." />
      <div className="grid gap-5 lg:grid-cols-2">
        <form onSubmit={submit} className="tile space-y-4 p-6">
          <Field label="Meal name"><input className="input" required minLength={3} value={f.title} onChange={set('title')} /></Field>
          <Field label="Description"><textarea className="input" rows={3} value={f.description} onChange={set('description')} /></Field>
          <Field label="Ingredients"><textarea className="input" rows={3} value={f.ingredients} onChange={set('ingredients')} /></Field>
          <Field label="Recipe"><textarea className="input" rows={4} value={f.recipe} onChange={set('recipe')} /></Field>
          <FormError error={err} />
          <button className="btn-ink" disabled={busy}>{busy && <Spinner className="!text-white" />}Send suggestion</button>
        </form>
        <div>
          <h2 className="mb-3 text-lg font-medium">Your suggestions</h2>
          <Async state={s} empty={<Empty title="Nothing sent yet" />}>
            {(list) => <ul className="space-y-3">{list.map((x) => (
              <li key={x.id} className="tile p-5"><div className="flex items-center justify-between gap-2"><span className="font-medium">{x.title}</span><Badge status={x.status} /></div><p className="mt-1 text-sm text-neutral-700">{x.description}</p>{x.approvedFood && <p className="mt-2 text-sm">Added to the menu as <Link className="text-brand underline" to={`/menu/${x.approvedFood.id}`}>{x.approvedFood.name}</Link></p>}{x.adminNote && <p className="mt-2 rounded-xl bg-cream p-3 text-sm"><b>Our reply:</b> {x.adminNote}</p>}<p className="mt-2 text-xs text-mute">{d(x.createdAt)}</p></li>
            ))}</ul>}
          </Async>
        </div>
      </div>
    </div>
  );
}

function ProfileForm() {
  const { user, setUser } = useAuth();
  const toast = useToast();
  const [f, setF] = useState({ name: user.name || '', phone: user.phone || '' });
  const [err, setErr] = useState(null);
  const submit = async (e) => {
    e.preventDefault(); setErr(null);
    const body = {}; if (f.name && f.name !== user.name) body.name = f.name; if (f.phone && f.phone !== user.phone) body.phone = f.phone;
    if (!Object.keys(body).length) return toast('Nothing to update', 'err');
    try { const r = await accountApi.profile(body); setUser({ ...user, ...(r?.user || r || body) }); toast('Profile updated'); } catch (x) { setErr(x); }
  };
  return (
    <form onSubmit={submit} className="tile space-y-4 p-6"><h2 className="text-lg font-medium">Profile</h2>
      <Field label="Email"><input className="input opacity-60" disabled value={user.email} /></Field>
      <Field label="Name"><input className="input" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></Field>
      <Field label="Phone"><input className="input" inputMode="tel" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} /></Field>
      <FormError error={err} /><button className="btn-ink">Save profile</button>
    </form>
  );
}
function PasswordForm() {
  const toast = useToast();
  const [f, setF] = useState({ currentPassword: '', newPassword: '' });
  const [err, setErr] = useState(null);
  const submit = async (e) => {
    e.preventDefault(); setErr(null);
    try { await accountApi.password(f); toast('Password changed'); setF({ currentPassword: '', newPassword: '' }); } catch (x) { setErr(x); }
  };
  return (
    <form onSubmit={submit} className="tile space-y-4 p-6"><h2 className="text-lg font-medium">Change password</h2>
      <Field label="Current password"><input className="input" type="password" required autoComplete="current-password" value={f.currentPassword} onChange={(e) => setF({ ...f, currentPassword: e.target.value })} /></Field>
      <Field label="New password"><input className="input" type="password" required minLength={8} autoComplete="new-password" value={f.newPassword} onChange={(e) => setF({ ...f, newPassword: e.target.value })} /></Field>
      <FormError error={err} /><button className="btn-ink">Update password</button>
    </form>
  );
}
function Addresses() {
  const toast = useToast();
  const s = useFetch(() => addressApi.list(), []);
  const [edit, setEdit] = useState(null);
  const del = async (a) => { if (!window.confirm('Delete this address?')) return; try { await addressApi.remove(a.id); toast('Address deleted'); s.reload(); } catch (e) { toast(e.message, 'err'); } };
  return (
    <section className="tile p-6">
      <div className="flex items-center justify-between"><h2 className="text-lg font-medium">Addresses</h2><button className="btn-ghost" onClick={() => setEdit({})}><Plus size={14} />Add</button></div>
      <Async state={s} empty={<Empty title="No saved addresses" />}>
        {(list) => <ul className="mt-3 space-y-2">{list.map((a) => (
          <li key={a.id} className="flex items-start justify-between gap-3 rounded-2xl bg-cream p-4 text-sm"><div><div className="font-medium">{a.label || 'Address'}</div>{a.address}, {a.city}, {a.state} {a.pincode}</div>
            <div className="flex gap-1"><button aria-label="Edit address" className="grid h-8 w-8 place-items-center rounded-full bg-white" onClick={() => setEdit(a)}><Pencil size={14} /></button><button aria-label="Delete address" className="grid h-8 w-8 place-items-center rounded-full bg-white text-red-600" onClick={() => del(a)}><Trash2 size={14} /></button></div></li>
        ))}</ul>}
      </Async>
      {edit && <Modal title={edit.id ? 'Edit address' : 'New address'} onClose={() => setEdit(null)}>
        <AddressForm initial={edit.id ? edit : null} onCancel={() => setEdit(null)} onSave={async (b) => { edit.id ? await addressApi.update(edit.id, b) : await addressApi.create(b); setEdit(null); toast('Address saved'); s.reload(); }} />
      </Modal>}
    </section>
  );
}

/** Shared by all roles; addresses appear for customers only. */
export function Profile() {
  const { user } = useAuth();
  return (
    <div><PageHead title="Account" sub={`Signed in as ${user.role.replace('_', ' ').toLowerCase()}`} />
      <div className="grid gap-5 lg:grid-cols-2"><div className="space-y-5"><ProfileForm /><PasswordForm /></div>{user.role === 'CUSTOMER' && <Addresses />}</div>
    </div>
  );
}
