import { Link } from 'react-router-dom';
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { AlertTriangle } from 'lucide-react';
import { adminApi } from '../../services';
import useFetch from '../../utils/useFetch';
import { Async, Badge, PageHead } from '../../components/ui';
import { dt, inr } from '../../utils/format';

const Stat = ({ l, v, dark, brand }) => (
  <div className={`rounded-tile p-5 ${dark ? 'bg-ink text-white' : brand ? 'bg-brand text-white' : 'bg-white shadow-tile'}`}>
    <div className={`text-sm ${dark || brand ? 'text-white/70' : 'text-mute'}`}>{l}</div><div className="mt-2 text-3xl font-semibold tabular-nums">{v ?? '—'}</div>
  </div>
);
const STAGES = [['pending', 'Pending'], ['confirmed', 'Confirmed'], ['preparing', 'Preparing'], ['readyForPickup', 'Ready'], ['delivered', 'Delivered'], ['cancelled', 'Cancelled']];

export default function AdminDashboard() {
  const s = useFetch(() => adminApi.dashboard(), []);
  return (
    <div>
      <PageHead title="Dashboard" sub="Live figures from the kitchen and orders." />
      <Async state={s}>
        {(raw) => {
          const D = raw.dashboard || raw; const o = D.overview || {}; const ord = D.orders || {}; const low = D.lowStock || {};
          const bars = STAGES.map(([k, name]) => ({ name, value: ord[k] ?? 0 }));
          const pop = (D.popularFoods || []).map((p) => ({ name: p.foodName, qty: p.quantitySold }));
          return (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <Stat brand l="Revenue today" v={inr(o.todayRevenue)} /><Stat dark l="Total revenue" v={inr(o.totalRevenue)} />
                <Stat l="Orders today" v={o.todayOrders} /><Stat l="All orders" v={o.totalOrders} />
                <Stat l="Customers" v={o.totalCustomers} /><Stat l="Delivery partners" v={o.totalDeliveryPartners} />
                <Stat l="Foods on menu" v={o.activeFoods} /><Stat l="Foods in catalogue" v={o.totalFoods} />
              </div>
              <div className="grid gap-5 lg:grid-cols-[1.6fr_1fr]">
                <section className="tile p-6"><h2 className="font-medium">Orders by stage</h2>
                  <div className="mt-4 h-64"><ResponsiveContainer><BarChart data={bars}><CartesianGrid vertical={false} stroke="#ECE5DB" /><XAxis dataKey="name" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} /><YAxis allowDecimals={false} tick={{ fontSize: 12 }} axisLine={false} tickLine={false} /><Tooltip cursor={{ fill: '#FFF3E8' }} /><Bar dataKey="value" radius={[8, 8, 0, 0]}>{bars.map((b, i) => <Cell key={i} fill={b.name === 'Cancelled' ? '#CFC8BD' : '#F57C1F'} />)}</Bar></BarChart></ResponsiveContainer></div>
                </section>
                <section className="tile p-6"><div className="flex items-center justify-between"><h2 className="font-medium">Low stock</h2><span className="pill bg-brand text-white">{low.count ?? 0}</span></div>
                  {(low.ingredients || []).length === 0 ? <p className="mt-4 text-sm text-mute">Everything is above its reorder level.</p> : (
                    <ul className="mt-3 space-y-2">{low.ingredients.map((i) => <li key={i.id} className="flex items-center justify-between rounded-2xl bg-cream px-4 py-2.5 text-sm"><span className="flex items-center gap-2"><AlertTriangle size={14} className="text-brand" />{i.name}</span><span className="text-mute">{i.stockQuantity} / {i.reorderLevel} {i.unit}</span></li>)}</ul>)}
                  <Link to="/admin/inventory" className="mt-4 inline-block text-sm text-brand">Open inventory</Link>
                </section>
              </div>
              <div className="grid gap-5 lg:grid-cols-[1.6fr_1fr]">
                <section className="tile p-6"><div className="flex items-center justify-between"><h2 className="font-medium">Recent orders</h2><Link to="/admin/orders" className="text-sm text-brand">Go to orders</Link></div>
                  <div className="mt-3 overflow-x-auto"><table className="w-full min-w-[480px] text-left text-sm"><thead className="text-mute"><tr><th className="py-2 font-normal">Order</th><th className="font-normal">Customer</th><th className="font-normal">Status</th><th className="text-right font-normal">Total</th></tr></thead>
                    <tbody className="divide-y divide-line">{(D.recentOrders || []).map((r) => <tr key={r.id}><td className="py-3"><div className="font-medium">{r.orderNumber}</div><div className="text-xs text-mute">{dt(r.createdAt)}</div></td><td>{r.user?.name}</td><td><Badge status={r.status} /></td><td className="text-right">{inr(r.total)}</td></tr>)}</tbody></table></div>
                </section>
                <section className="tile p-6"><h2 className="font-medium">Popular meals</h2>
                  {pop.length === 0 ? <p className="mt-4 text-sm text-mute">No sales recorded yet.</p> : (
                    <ul className="mt-3 space-y-3">{(D.popularFoods || []).map((p) => <li key={p.foodId} className="flex items-center justify-between text-sm"><span className="font-medium">{p.foodName}</span><span className="text-right text-mute">{p.quantitySold} sold<br />{inr(p.revenue)}</span></li>)}</ul>)}
                </section>
              </div>
            </div>
          );
        }}
      </Async>
    </div>
  );
}
