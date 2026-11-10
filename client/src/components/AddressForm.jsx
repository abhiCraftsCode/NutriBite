import { useState } from 'react';
import { Field, FormError, Spinner } from './ui';

const EMPTY = { label: '', address: '', city: '', state: '', pincode: '', landmark: '' };
export default function AddressForm({ initial, onSave, onCancel }) {
  const [f, setF] = useState({ ...EMPTY, ...(initial ? Object.fromEntries(Object.keys(EMPTY).map((k) => [k, initial[k] ?? ''])) : {}) });
  const [err, setErr] = useState(null);
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const submit = async (e) => {
    e.preventDefault(); setBusy(true); setErr(null);
    const body = Object.fromEntries(Object.entries(f).filter(([k, v]) => v !== '' || ['address', 'city', 'state', 'pincode'].includes(k)));
    try { await onSave(body); } catch (x) { setErr(x); } finally { setBusy(false); }
  };
  return (
    <form onSubmit={submit} className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <Field label="Label (optional)"><input className="input" placeholder="Home" value={f.label} onChange={set('label')} /></Field>
        <Field label="Pincode"><input className="input" required inputMode="numeric" maxLength={6} value={f.pincode} onChange={set('pincode')} /></Field>
      </div>
      <Field label="Street address"><input className="input" required value={f.address} onChange={set('address')} /></Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="City"><input className="input" required value={f.city} onChange={set('city')} /></Field>
        <Field label="State"><input className="input" required value={f.state} onChange={set('state')} /></Field>
      </div>
      <Field label="Landmark (optional)"><input className="input" value={f.landmark} onChange={set('landmark')} /></Field>
      <FormError error={err} />
      <div className="flex justify-end gap-2 pt-2">
        {onCancel && <button type="button" className="btn-ghost" onClick={onCancel}>Cancel</button>}
        <button className="btn-ink" disabled={busy}>{busy && <Spinner className="!text-white" />}Save address</button>
      </div>
    </form>
  );
}
