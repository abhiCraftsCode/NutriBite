import { useState } from 'react';
import { Plus } from 'lucide-react';
import { adminApi, foodApi } from '../../services';
import useFetch from '../../utils/useFetch';
import { Async, Badge, Empty, Field, FormError, Modal, PageHead, Spinner, Stars, useToast } from '../../components/ui';
import { d } from '../../utils/format';

export function Partners() {
  const toast = useToast();
  const s = useFetch(() => adminApi.partners(), []);
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({ name: '', email: '', password: '', phone: '' });
  const [err, setErr] = useState(null);
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const submit = async (e) => {
    e.preventDefault(); setBusy(true); setErr(null);
    try { await adminApi.createPartner(Object.fromEntries(Object.entries(f).filter(([, v]) => v))); toast('Delivery partner account created'); setOpen(false); setF({ name: '', email: '', password: '', phone: '' }); s.reload(); }
    catch (x) { setErr(x); } finally { setBusy(false); }
  };
  return (
    <div>
      <PageHead title="Delivery partners" sub="Assign a partner from the order screen once an order is confirmed." action={<button className="btn-brand" onClick={() => setOpen(true)}><Plus size={15} />New partner</button>} />
      <Async state={s} empty={<Empty title="No delivery partners yet" hint="Create an account for each rider." />}>
        {(rows) => (
          <div className="tile overflow-x-auto"><table className="w-full min-w-[560px] text-left text-sm"><thead className="bg-[#F6F7F9] text-mute"><tr><th className="px-5 py-3 font-normal">Name</th><th className="font-normal">Email</th><th className="font-normal">Phone</th><th className="font-normal">Availability</th></tr></thead>
            <tbody className="divide-y divide-line">{rows.map((p) => (
              <tr key={p.id}><td className="px-5 py-3 font-medium">{p.name}</td><td>{p.email}</td><td>{p.phone || '—'}</td><td><span className={`pill ${p.availability === 'AVAILABLE' ? 'bg-emerald-100 text-emerald-800' : p.availability === 'BUSY' ? 'bg-brand-light text-brand-dark' : 'bg-neutral-200'}`}>{p.availability === 'BUSY' ? 'On a delivery' : p.availability === 'INACTIVE' ? 'Inactive' : 'Available'}</span></td></tr>))}</tbody></table></div>
        )}
      </Async>
      {open && (
        <Modal title="New delivery partner" onClose={() => setOpen(false)}>
          <form onSubmit={submit} className="space-y-4">
            <Field label="Full name"><input className="input" required value={f.name} onChange={set('name')} /></Field>
            <Field label="Email"><input className="input" type="email" required value={f.email} onChange={set('email')} /></Field>
            <Field label="Phone (optional)"><input className="input" inputMode="tel" maxLength={20} value={f.phone} onChange={set('phone')} /></Field>
            <Field label="Temporary password"><input className="input" type="password" required minLength={8} value={f.password} onChange={set('password')} /></Field>
            <FormError error={err} />
            <button className="btn-ink w-full" disabled={busy}>{busy && <Spinner className="!text-white" />}Create account</button>
          </form>
        </Modal>
      )}
    </div>
  );
}

export function AdminReviews() {
  const toast = useToast();
  const [status, setStatus] = useState('');
  const s = useFetch(() => adminApi.reviews(status ? { status } : undefined), [status]);
  const act = async (r, st) => { try { await adminApi.moderate(r.id, st); toast(`Review ${st === 'APPROVED' ? 'approved' : 'hidden'}`); s.reload(); } catch (e) { toast(e.message, 'err'); } };
  return (
    <div>
      <PageHead title="Reviews" sub="Only pending reviews can be moderated; approved ones show on meal pages." action={
        <select className="input !w-44" value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Filter reviews"><option value="">All</option><option value="PENDING">Pending</option><option value="APPROVED">Approved</option><option value="HIDDEN">Hidden</option></select>} />
      <Async state={s} empty={<Empty title="No reviews to show" />}>
        {(rows) => <ul className="space-y-3">{rows.map((r) => (
          <li key={r.id} className="tile flex flex-wrap items-start justify-between gap-4 p-5">
            <div className="min-w-0 flex-1"><div className="flex items-center gap-3"><span className="font-medium">{r.food?.name || `Meal #${r.foodId}`}</span><Badge status={r.status} /></div><div className="mt-1"><Stars value={r.rating} /></div>{r.comment && <p className="mt-2 text-sm text-neutral-700">{r.comment}</p>}<p className="mt-2 text-xs text-mute">{r.user?.name || `User #${r.userId}`} · {d(r.createdAt)}</p></div>
            {r.status === 'PENDING' && <div className="flex gap-2"><button className="btn-ink !py-2" onClick={() => act(r, 'APPROVED')}>Approve</button><button className="btn-ghost !py-2" onClick={() => act(r, 'HIDDEN')}>Hide</button></div>}
          </li>))}</ul>}
      </Async>
    </div>
  );
}

function Review({ row, foods, onClose, onDone }) {
  const toast = useToast();
  const [f, setF] = useState({ status: 'APPROVED', adminNote: row.adminNote || '', approvedFoodId: row.approvedFoodId || '' });
  const [err, setErr] = useState(null);
  const [busy, setBusy] = useState(false);
  const submit = async (e) => {
    e.preventDefault(); setBusy(true); setErr(null);
    try { await adminApi.reviewSuggestion(row.id, { status: f.status, ...(f.adminNote && { adminNote: f.adminNote }), ...(f.status === 'APPROVED' && f.approvedFoodId && { approvedFoodId: Number(f.approvedFoodId) }) }); toast(`Suggestion ${f.status === 'APPROVED' ? 'approved' : 'rejected'}`); onDone(); }
    catch (x) { setErr(x); } finally { setBusy(false); }
  };
  return (
    <Modal wide title={row.title} onClose={onClose}>
      <div className="space-y-3 text-sm"><p>{row.description}</p>{row.ingredients && <p><b>Ingredients:</b> {row.ingredients}</p>}{row.recipe && <p className="whitespace-pre-line"><b>Recipe:</b> {row.recipe}</p>}</div>
      {row.status !== 'PENDING' ? <p className="mt-5 border-t border-line pt-5 text-sm text-mute">Already {row.status.toLowerCase()}.{row.adminNote && ` Note: ${row.adminNote}`}{row.approvedFood && ` Linked meal: ${row.approvedFood.name}.`}</p> : <form onSubmit={submit} className="mt-5 space-y-4 border-t border-line pt-5">
        <div className="flex gap-2">{['APPROVED', 'REJECTED'].map((st) => <button type="button" key={st} onClick={() => setF({ ...f, status: st })} className={`pill px-4 py-2 text-sm ${f.status === st ? 'bg-ink text-white' : 'bg-soft'}`}>{st === 'APPROVED' ? 'Approve' : 'Reject'}</button>)}</div>
        {f.status === 'APPROVED' && <Field label="Link to a catalogue meal (optional)" hint="Approval does not create a meal. Add it under Foods."><select className="input" value={f.approvedFoodId} onChange={(e) => setF({ ...f, approvedFoodId: e.target.value })}><option value="">Not linked</option>{foods.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}</select></Field>}
        <Field label="Note to the customer"><textarea className="input" rows={3} value={f.adminNote} onChange={(e) => setF({ ...f, adminNote: e.target.value })} /></Field>
        <FormError error={err} />
        <button className="btn-ink" disabled={busy}>{busy && <Spinner className="!text-white" />}Save decision</button>
      </form>}
    </Modal>
  );
}

export function AdminSuggestions() {
  const [status, setStatus] = useState('');
  const s = useFetch(() => adminApi.suggestions(status ? { status } : undefined), [status]);
  const foods = useFetch(async () => (await foodApi.list()).items, []);
  const [open, setOpen] = useState(null);
  return (
    <div>
      <PageHead title="Suggestions" sub="Meal ideas from customers." action={
        <select className="input !w-44" value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Filter suggestions"><option value="">All</option><option value="PENDING">Pending</option><option value="APPROVED">Approved</option><option value="REJECTED">Rejected</option></select>} />
      <Async state={s} empty={<Empty title="No suggestions yet" />}>
        {(rows) => <ul className="space-y-3">{rows.map((r) => (
          <li key={r.id} className="tile flex flex-wrap items-center justify-between gap-3 p-5"><div className="min-w-0"><div className="flex items-center gap-3"><span className="font-medium">{r.title}</span><Badge status={r.status} /></div><p className="mt-1 line-clamp-1 text-sm text-neutral-700">{r.description}</p><p className="mt-1 text-xs text-mute">{r.user?.name || `User #${r.userId}`} · {d(r.createdAt)}</p></div>
            <button className="btn-ghost" onClick={() => setOpen(r)}>{r.status === 'PENDING' ? 'Review' : 'View'}</button></li>))}</ul>}
      </Async>
      {open && <Review row={open} foods={foods.data || []} onClose={() => setOpen(null)} onDone={() => { setOpen(null); s.reload(); }} />}
    </div>
  );
}
