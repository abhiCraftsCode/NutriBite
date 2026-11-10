import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import { adminApi } from '../../services';
import useFetch from '../../utils/useFetch';
import { Async, Badge, Empty, FormError, Modal, PageHead, Pager, Spinner, useToast } from '../../components/ui';
import Timeline from '../../components/Timeline';
import { ADMIN_NEXT, dt, inr, label } from '../../utils/format';

const STATUSES = ['PENDING_PAYMENT', 'PLACED', 'CONFIRMED', 'PREPARING', 'READY_FOR_PICKUP', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'];
const ASSIGNABLE = ['READY_FOR_PICKUP']; // backend only assigns ready-for-pickup orders

function OrderModal({ id, onClose, onChanged }) {
  const toast = useToast();
  const s = useFetch(() => adminApi.order(id), [id]);
  const partners = useFetch(() => adminApi.partners(), []);
  const [partner, setPartner] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);
  const run = async (fn, msg) => { setBusy(true); setErr(null); try { await fn(); toast(msg); s.reload(); onChanged(); } catch (x) { setErr(x); } finally { setBusy(false); } };
  return (
    <Modal wide title="Order details" onClose={onClose}>
      <Async state={s}>
        {(raw) => {
          const o = raw.order || raw; const items = o.items || o.orderItems || []; const hist = o.statusHistory || o.orderStatusHistory || o.history || []; const del = o.delivery;
          const next = ADMIN_NEXT[o.status];
          return (
            <div className="space-y-4 text-sm">
              <div className="flex items-center justify-between"><div><div className="text-lg font-semibold">{o.orderNumber}</div><div className="text-mute">{dt(o.createdAt)} · {o.user?.name || o.deliveryName}</div></div><Badge status={o.status} /></div>
              <Timeline status={o.status} history={hist} />
              <ul className="divide-y divide-line rounded-2xl bg-cream px-4">{items.map((i) => <li key={i.id} className="flex justify-between py-2.5"><span>{i.quantity} × {i.foodName}</span><span>{inr(i.total)}</span></li>)}<li className="flex justify-between py-2.5 font-semibold"><span>Total</span><span>{inr(o.total)}</span></li></ul>
              <p><b>Deliver to:</b> {o.deliveryName}, {o.deliveryPhone} — {o.deliveryAddress}, {o.deliveryCity}, {o.deliveryState} {o.deliveryPincode}</p>
              {(o.payments || []).map((p) => <p key={p.id}><b>Payment:</b> {label(p.method)} <Badge status={p.status} />{p.failureReason && <span className="text-xs text-red-600"> {p.failureReason}</span>}</p>)}
              {del?.partner || del?.partnerId ? <p><b>Delivery:</b> {del.partner?.name || `Partner #${del.partnerId}`} {del.partner?.phone && `(${del.partner.phone})`} <Badge status={del.status} /></p> : null}
              <FormError error={err} />
              <div className="flex flex-wrap items-end gap-3">
                {next && <button className="btn-brand" disabled={busy} onClick={() => run(() => adminApi.setStatus(o.id, next), `Order marked ${label(next).toLowerCase()}`)}>{busy && <Spinner className="!text-white" />}Mark as {label(next).toLowerCase()}</button>}
                {ASSIGNABLE.includes(o.status) && !(del?.partner || del?.partnerId) && (
                  <div className="flex items-end gap-2">
                    <select className="input !w-56" value={partner} onChange={(e) => setPartner(e.target.value)} aria-label="Delivery partner"><option value="">Choose delivery partner…</option>{(partners.data || []).map((p) => <option key={p.id} value={p.id} disabled={p.availability !== 'AVAILABLE'}>{p.name}{p.availability !== 'AVAILABLE' ? ` (${p.availability.toLowerCase()})` : ''}</option>)}</select>
                    <button className="btn-ink" disabled={!partner || busy} onClick={() => run(() => adminApi.assign(o.id, Number(partner)), 'Delivery partner assigned')}>Assign</button>
                  </div>
                )}
              </div>
            </div>
          );
        }}
      </Async>
    </Modal>
  );
}

export default function AdminOrders() {
  const [sp, setSp] = useSearchParams();
  const status = sp.get('status') || ''; const q = sp.get('search') || ''; const page = Number(sp.get('page') || 1);
  const [text, setText] = useState(q);
  const [open, setOpen] = useState(null);
  const s = useFetch(() => adminApi.orders({ page, ...(status && { status }), ...(q && { search: q }) }), [status, q, page]);
  const setParam = (k, v) => setSp((p) => { const n = new URLSearchParams(p); v ? n.set(k, v) : n.delete(k); if (k !== 'page') n.delete('page'); return n; });
  useEffect(() => { const t = setTimeout(() => text !== q && setParam('search', text), 400); return () => clearTimeout(t); }, [text]); // eslint-disable-line
  return (
    <div>
      <PageHead title="Orders" sub="Move orders through the kitchen and hand them to a rider." />
      <div className="mb-4 flex flex-wrap gap-3">
        <label className="relative"><Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-mute" /><input className="input w-64 pl-10" placeholder="Order number or customer" value={text} onChange={(e) => setText(e.target.value)} /></label>
        <select className="input !w-52" value={status} onChange={(e) => setParam('status', e.target.value)} aria-label="Filter by status"><option value="">All statuses</option>{STATUSES.map((x) => <option key={x} value={x}>{label(x)}</option>)}</select>
      </div>
      <Async state={s.data ? { ...s, data: s.data.items } : s} empty={<Empty title="No orders found" hint="Try clearing the filters." />}>
        {(rows) => (
          <>
            <div className="tile overflow-x-auto"><table className="w-full min-w-[640px] text-left text-sm"><thead className="bg-[#F6F7F9] text-mute"><tr><th className="px-5 py-3 font-normal">Order</th><th className="font-normal">Customer</th><th className="font-normal">Status</th><th className="font-normal">Total</th><th /></tr></thead>
              <tbody className="divide-y divide-line">{rows.map((r) => (
                <tr key={r.id}><td className="px-5 py-3"><div className="font-medium">{r.orderNumber}</div><div className="text-xs text-mute">{dt(r.createdAt)}</div></td><td>{r.user?.name || r.deliveryName}</td><td><Badge status={r.status} /></td><td>{inr(r.total)}</td><td className="px-5 text-right"><button className="btn-ghost !px-4 !py-1.5" onClick={() => setOpen(r.id)}>Open</button></td></tr>))}</tbody></table></div>
            <Pager page={s.data?.page} onPage={(n) => setParam('page', String(n))} />
          </>
        )}
      </Async>
      {open && <OrderModal id={open} onClose={() => setOpen(null)} onChanged={s.reload} />}
    </div>
  );
}
