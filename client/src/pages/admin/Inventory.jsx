import { useState } from 'react';
import { History, PackagePlus } from 'lucide-react';
import { inventoryApi } from '../../services';
import useFetch from '../../utils/useFetch';
import { Async, Empty, Field, FormError, Modal, PageHead, Spinner, useToast } from '../../components/ui';
import { dt, label } from '../../utils/format';

const TYPES = [['RESTOCK', 'Restock'], ['PURCHASE', 'Purchase'], ['ADJUSTMENT', 'Adjustment'], ['WASTE', 'Waste']];
const HELP = {
  RESTOCK: 'Adds stock. Use for a supplier delivery or topping up the store room.',
  PURCHASE: 'Adds stock, same effect as Restock. Use it to label a bought-in purchase in the history.',
  ADJUSTMENT: 'Corrects the count after a stock-take. Enter a positive number to add or a negative number to remove.',
  WASTE: 'Removes stock for spoilage, spills or expiry. Enter a positive number; the server subtracts it.',
};

function MoveForm({ item, initial, onClose, onDone }) {
  const toast = useToast();
  const [f, setF] = useState({ type: initial, quantity: '', note: '' });
  const [err, setErr] = useState(null);
  const [busy, setBusy] = useState(false);
  const submit = async (e) => {
    e.preventDefault(); setBusy(true); setErr(null);
    try { await inventoryApi.move(item.id, { type: f.type, quantity: Number(f.quantity), ...(f.note && { note: f.note }) }); toast(`${label(f.type)} recorded for ${item.name}`); onDone(); }
    catch (x) { setErr(x); } finally { setBusy(false); }
  };
  return (
    <Modal title={`Stock · ${item.name}`} onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <p className="text-sm text-mute">Current stock: <b className="text-ink">{item.stockQuantity} {item.unit}</b>. The server applies the change and blocks negative stock.</p>
        <Field label="Movement"><select className="input" value={f.type} onChange={(e) => setF({ ...f, type: e.target.value })}>{TYPES.map(([v, t]) => <option key={v} value={v}>{t}</option>)}</select></Field>
        <p className="rounded-2xl bg-cream px-4 py-3 text-sm">{HELP[f.type]}</p>
        <Field label={`Quantity (${item.unit})`} hint={f.type === 'ADJUSTMENT' ? 'Negative values are allowed for adjustments only.' : undefined}><input className="input" type="number" step="any" required value={f.quantity} onChange={(e) => setF({ ...f, quantity: e.target.value })} /></Field>
        <Field label="Note"><input className="input" value={f.note} onChange={(e) => setF({ ...f, note: e.target.value })} placeholder="Supplier delivery" /></Field>
        <FormError error={err} />
        <button className="btn-ink w-full" disabled={busy}>{busy && <Spinner className="!text-white" />}Record movement</button>
      </form>
    </Modal>
  );
}

function History_({ item, onClose }) {
  const s = useFetch(() => inventoryApi.movements(item.id), [item.id]);
  return (
    <Modal wide title={`Movements · ${item.name}`} onClose={onClose}>
      <Async state={s} empty={<Empty title="No movements recorded" />}>
        {(list) => <ul className="divide-y divide-line text-sm">{list.map((m) => (
          <li key={m.id} className="flex items-center justify-between gap-3 py-3"><div><div className="font-medium">{label(m.type)}</div><div className="text-xs text-mute">{m.note || '—'}{m.user?.name ? ` · ${m.user.name}` : ''}</div></div><div className="text-right"><div className="font-medium">{['WASTE', 'ORDER_DEDUCTION'].includes(m.type) && m.quantity > 0 ? '−' : m.quantity > 0 ? '+' : ''}{m.quantity} {item.unit}</div><div className="text-xs text-mute">{dt(m.createdAt)}</div></div></li>
        ))}</ul>}
      </Async>
    </Modal>
  );
}

export default function Inventory() {
  const [low, setLow] = useState(false);
  const s = useFetch(() => inventoryApi.list(low ? { lowStock: true } : undefined), [low]);
  const [move, setMove] = useState(null);
  const [hist, setHist] = useState(null);
  return (
    <div>
      <PageHead title="Inventory" sub="Stock changes are recorded as movements." action={
        <div className="flex rounded-full bg-white p-1 shadow-tile">{[[false, 'All'], [true, 'Low stock']].map(([v, t]) => <button key={t} onClick={() => setLow(v)} className={`rounded-full px-4 py-2 text-sm ${low === v ? 'bg-brand text-white' : ''}`}>{t}</button>)}</div>} />
      <Async state={s} empty={<Empty title={low ? 'Nothing is low on stock' : 'No ingredients yet'} />}>
        {(rows) => (
          <div className="tile overflow-x-auto"><table className="w-full min-w-[680px] text-left text-sm">
            <thead className="bg-[#F6F7F9] text-mute"><tr><th className="px-5 py-3 font-normal">Ingredient</th><th className="font-normal">In stock</th><th className="font-normal">Reorder at</th><th className="font-normal">Status</th><th className="px-5 text-right font-normal">Actions</th></tr></thead>
            <tbody className="divide-y divide-line">{rows.map((r) => (
              <tr key={r.id}><td className="px-5 py-3 font-medium">{r.name}</td><td>{r.stockQuantity} {r.unit}</td><td>{r.reorderLevel} {r.unit}</td>
                <td>{r.isLowStock ? <span className="pill bg-brand-light text-brand-dark">Low stock</span> : <span className="pill bg-emerald-100 text-emerald-800">OK</span>}</td>
                <td className="px-5"><div className="flex justify-end gap-2"><button className="btn-ghost !px-3 !py-1.5" onClick={() => setMove({ item: r, type: 'RESTOCK' })}><PackagePlus size={14} />Stock</button><button aria-label="History" className="grid h-9 w-9 place-items-center rounded-xl ring-1 ring-line" onClick={() => setHist(r)}><History size={15} /></button></div></td></tr>
            ))}</tbody></table></div>
        )}
      </Async>
      {move && <MoveForm item={move.item} initial={move.type} onClose={() => setMove(null)} onDone={() => { setMove(null); s.reload(); }} />}
      {hist && <History_ item={hist} onClose={() => setHist(null)} />}
    </div>
  );
}
