import { Link, useParams } from 'react-router-dom';
import { useState } from 'react';
import { MapPin, Phone } from 'lucide-react';
import { deliveryApi } from '../../services';
import useFetch from '../../utils/useFetch';
import { Async, Badge, Empty, FormError, PageHead, Spinner, useToast } from '../../components/ui';
import { DELIVERY_ACTION, DELIVERY_NEXT, dt, label } from '../../utils/format';

const ordOf = (x) => x.order || {};
const addr = (o) => `${o.deliveryAddress || ''}, ${o.deliveryCity || ''}, ${o.deliveryState || ''} ${o.deliveryPincode || ''}`;

function Row({ x }) {
  const o = ordOf(x);
  return (
    <li><Link to={`/delivery/${x.id}`} className="tile flex flex-wrap items-center justify-between gap-3 p-5 hover:ring-2 hover:ring-brand-light">
      <div><div className="font-medium">{o.orderNumber || `Delivery #${x.id}`}</div><div className="text-xs text-mute">{o.deliveryName} · {o.deliveryCity}</div></div>
      <Badge status={x.status} /><span className="text-xs text-mute">Assigned {dt(x.assignedAt)}</span></Link></li>
  );
}

const DONE = ['DELIVERED', 'CANCELLED'];

export function DeliveryHome() {
  const s = useFetch(() => deliveryApi.list(), []);
  const active = (s.data || []).filter((x) => !DONE.includes(x.status));
  const current = active[0];
  return (
    <div>
      <PageHead title="My deliveries" sub="Orders assigned to you." />
      {current && (
        <Link to={`/delivery/${current.id}`} className="mb-5 block rounded-tile bg-ink p-6 text-white">
          <div className="flex items-center justify-between"><span className="text-lg font-medium">Current delivery</span><Badge status={current.status} /></div>
          <div className="mt-3 text-2xl font-semibold">{ordOf(current).orderNumber}</div><div className="mt-1 text-sm text-white/70">{ordOf(current).deliveryName} · {addr(ordOf(current))}</div>
        </Link>
      )}
      <Async state={{ ...s, data: s.data && active }} empty={<Empty title="No deliveries assigned" hint="New assignments from the kitchen will appear here." />}>
        {(rows) => <ul className="space-y-3">{rows.map((x) => <Row key={x.id} x={x} />)}</ul>}
      </Async>
    </div>
  );
}

export function DeliveryHistory() {
  const s = useFetch(() => deliveryApi.list(), []);
  const done = s.data && s.data.filter((x) => DONE.includes(x.status));
  return (
    <div><PageHead title="Delivery history" sub="Completed deliveries." />
      <Async state={{ ...s, data: done }} empty={<Empty title="No completed deliveries yet" />}>{(rows) => <ul className="space-y-3">{rows.map((x) => <Row key={x.id} x={x} />)}</ul>}</Async>
    </div>
  );
}

export function DeliveryDetail() {
  const { id } = useParams();
  const toast = useToast();
  const s = useFetch(() => deliveryApi.get(id), [id]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);
  return (
    <Async state={s}>
      {(raw) => {
        const x = raw.delivery || raw; const o = ordOf(x); const items = o.items || o.orderItems || []; const events = x.events || x.deliveryEvents || [];
        const next = DELIVERY_NEXT[x.status];
        const go = async () => { setBusy(true); setErr(null); try { await deliveryApi.setStatus(x.id, next); toast(`Delivery ${label(next).toLowerCase()}`); s.reload(); } catch (e) { setErr(e); } finally { setBusy(false); } };
        return (
          <div className="space-y-4">
            <PageHead title={o.orderNumber || `Delivery #${x.id}`} action={<Badge status={x.status} />} />
            {next && (
              <div className="rounded-tile bg-ink p-6 text-white"><p className="text-sm text-white/70">Next step</p>
                <button className="btn mt-3 bg-brand text-white hover:bg-brand-dark" disabled={busy} onClick={go}>{busy && <Spinner className="!text-white" />}{DELIVERY_ACTION[next]}</button>
                <div className="mt-3"><FormError error={err} /></div></div>
            )}
            <div className="grid gap-4 lg:grid-cols-2">
              <section className="tile p-6 text-sm"><h2 className="text-lg font-medium">Customer</h2>
                <p className="mt-2 font-medium">{o.deliveryName}</p>
                {o.deliveryPhone && <a href={`tel:${o.deliveryPhone}`} className="mt-1 flex items-center gap-2 text-brand"><Phone size={14} />{o.deliveryPhone}</a>}
                <p className="mt-3 flex gap-2"><MapPin size={16} className="mt-0.5 shrink-0 text-brand" /><span>{addr(o)}{o.deliveryLandmark && <><br /><span className="text-mute">Near {o.deliveryLandmark}</span></>}</span></p></section>
              <section className="tile p-6 text-sm"><h2 className="text-lg font-medium">Order contents</h2>
                <ul className="mt-2 space-y-1">{items.map((i) => <li key={i.id}>{i.quantity} × {i.foodName}</li>)}</ul></section>
            </div>
            <section className="tile p-6 text-sm"><h2 className="text-lg font-medium">Events</h2>
              {events.length === 0 ? <p className="mt-2 text-mute">No events yet.</p> : <ul className="mt-3 space-y-2">{events.map((e) => <li key={e.id} className="flex justify-between gap-3"><span>{label(e.status)}{e.note ? ` — ${e.note}` : ''}</span><span className="text-mute">{dt(e.createdAt)}</span></li>)}</ul>}
              <dl className="mt-4 grid grid-cols-2 gap-2 border-t border-line pt-3 text-xs text-mute sm:grid-cols-4"><div>Assigned<br /><b className="text-ink">{dt(x.assignedAt)}</b></div><div>Accepted<br /><b className="text-ink">{dt(x.acceptedAt)}</b></div><div>Picked up<br /><b className="text-ink">{dt(x.pickedUpAt)}</b></div><div>Delivered<br /><b className="text-ink">{dt(x.deliveredAt)}</b></div></dl>
            </section>
          </div>
        );
      }}
    </Async>
  );
}
