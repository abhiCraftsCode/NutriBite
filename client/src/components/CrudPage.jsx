import { useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import useFetch from '../utils/useFetch';
import { Async, Empty, Field, FormError, Modal, PageHead, Spinner, useToast } from './ui';

const blank = (fields) => Object.fromEntries(fields.map((f) => [f.name, f.type === 'checkbox' ? !!f.default : f.default ?? '']));

function RecordForm({ cfg, row, onDone, onCancel }) {
  const [v, setV] = useState(() => (row ? { ...blank(cfg.fields), ...(cfg.toForm ? cfg.toForm(row) : row) } : blank(cfg.fields)));
  const [err, setErr] = useState(null);
  const [busy, setBusy] = useState(false);
  const toast = useToast();
  const submit = async (e) => {
    e.preventDefault(); setBusy(true); setErr(null);
    try {
      const body = cfg.toBody ? cfg.toBody(v, !!row) : v;
      row ? await cfg.update(row.id, body) : await cfg.create(body);
      toast(row ? `${cfg.noun} updated` : `${cfg.noun} created`); onDone();
    } catch (x) { setErr(x); } finally { setBusy(false); }
  };
  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        {cfg.fields.map((f) => {
          const set = (val) => setV((s) => ({ ...s, [f.name]: val }));
          const span = f.wide ? 'sm:col-span-2' : '';
          if (f.type === 'checkbox')
            return <label key={f.name} className={`flex items-center gap-3 rounded-2xl bg-cream px-4 py-3 text-sm ${span}`}><input type="checkbox" className="h-4 w-4 accent-orange-500" checked={!!v[f.name]} onChange={(e) => set(e.target.checked)} />{f.label}</label>;
          return (
            <div key={f.name} className={span}>
              <Field label={f.label} hint={f.hint}>
                {f.type === 'textarea' ? <textarea className="input" rows={f.rows || 3} required={f.required} value={v[f.name]} onChange={(e) => set(e.target.value)} />
                  : f.type === 'select' ? <select className="input" required={f.required} value={v[f.name]} onChange={(e) => set(e.target.value)}><option value="">Select…</option>{(f.options || []).map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</select>
                  : <input className="input" type={f.type || 'text'} step={f.step} min={f.min} required={f.required} disabled={f.lockOnEdit && !!row} value={v[f.name]} onChange={(e) => set(e.target.value)} />}
              </Field>
            </div>
          );
        })}
      </div>
      <FormError error={err} />
      <div className="flex justify-end gap-2"><button type="button" className="btn-ghost" onClick={onCancel}>Cancel</button><button className="btn-ink" disabled={busy}>{busy && <Spinner className="!text-white" />}Save</button></div>
    </form>
  );
}

/** One generic list + create/edit/deactivate page for the admin catalogue resources. */
export default function CrudPage({ cfg }) {
  const s = useFetch(cfg.load, [cfg.key]);
  const toast = useToast();
  const [edit, setEdit] = useState(null);
  const [q, setQ] = useState('');
  const remove = async (row) => {
    if (!window.confirm(`${cfg.removeLabel || 'Deactivate'} “${cfg.nameOf(row)}”?`)) return;
    try { await cfg.remove(row.id); toast(`${cfg.noun} ${cfg.removeLabel === 'Delete' ? 'deleted' : 'deactivated'}`); s.reload(); } catch (e) { toast(e.message, 'err'); }
  };
  return (
    <div>
      <PageHead title={cfg.title} sub={cfg.sub} action={cfg.create && <button className="btn-brand" onClick={() => setEdit({})}><Plus size={15} />New {cfg.noun.toLowerCase()}</button>} />
      {cfg.searchable && <input className="input mb-4 max-w-xs" placeholder={`Search ${cfg.title.toLowerCase()}`} value={q} onChange={(e) => setQ(e.target.value)} />}
      <Async state={s} empty={<Empty title={`No ${cfg.title.toLowerCase()} yet`} action={cfg.create && <button className="btn-brand" onClick={() => setEdit({})}>Create the first one</button>} />}>
        {(rows) => {
          const shown = q ? rows.filter((r) => cfg.nameOf(r).toLowerCase().includes(q.toLowerCase())) : rows;
          return (
            <div className="tile overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead className="bg-[#F6F7F9] text-mute"><tr>{cfg.columns.map((c) => <th key={c.label} className="px-5 py-3 font-normal">{c.label}</th>)}<th className="px-5 py-3 text-right font-normal">Actions</th></tr></thead>
                <tbody className="divide-y divide-line">
                  {shown.map((r) => (
                    <tr key={r.id}>
                      {cfg.columns.map((c) => <td key={c.label} className="px-5 py-3">{c.render ? c.render(r) : r[c.key] ?? '—'}</td>)}
                      <td className="px-5 py-3"><div className="flex justify-end gap-1.5">
                        {cfg.rowActions?.(r, s.reload)}
                        {cfg.update && <button aria-label="Edit" className="grid h-9 w-9 place-items-center rounded-xl ring-1 ring-line hover:bg-soft" onClick={() => setEdit(r)}><Pencil size={15} /></button>}
                        {cfg.remove && <button aria-label={cfg.removeLabel || 'Deactivate'} className="grid h-9 w-9 place-items-center rounded-xl text-brand ring-1 ring-brand-light hover:bg-brand-light" onClick={() => remove(r)}><Trash2 size={15} /></button>}
                      </div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }}
      </Async>
      {edit && <Modal wide title={edit.id ? `Edit ${cfg.noun.toLowerCase()}` : `New ${cfg.noun.toLowerCase()}`} onClose={() => setEdit(null)}><RecordForm cfg={cfg} row={edit.id ? edit : null} onCancel={() => setEdit(null)} onDone={() => { setEdit(null); s.reload(); }} /></Modal>}
    </div>
  );
}
