import { createContext, useCallback, useContext, useState } from 'react';
import { AlertTriangle, Check, Inbox, Loader2, Minus, Plus, RefreshCw, X } from 'lucide-react';
import { statusTone, label } from '../utils/format';

/* ---------- toasts ---------- */
const ToastCtx = createContext(() => {});
export const useToast = () => useContext(ToastCtx);
export function ToastProvider({ children }) {
  const [items, setItems] = useState([]);
  const push = useCallback((message, kind = 'ok') => {
    const id = Math.random();
    setItems((s) => [...s, { id, message, kind }]);
    setTimeout(() => setItems((s) => s.filter((i) => i.id !== id)), 4200);
  }, []);
  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div className="fixed bottom-24 left-1/2 z-[60] flex -translate-x-1/2 flex-col gap-2" role="status" aria-live="polite">
        {items.map((t) => (
          <div key={t.id} className={`flex items-center gap-2 rounded-full px-5 py-3 text-sm text-white shadow-lg ${t.kind === 'err' ? 'bg-red-600' : 'bg-ink'}`}>
            {t.kind === 'err' ? <AlertTriangle size={16} /> : <Check size={16} className="text-brand" />}
            {t.message}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

/* ---------- states ---------- */
export const Spinner = ({ className = '' }) => <Loader2 className={`animate-spin text-brand ${className}`} size={20} />;
export const Loading = ({ text = 'Loading…' }) => (
  <div className="flex items-center justify-center gap-3 py-20 text-sm text-mute"><Spinner />{text}</div>
);
export const ErrorState = ({ error, onRetry }) => (
  <div className="tile mx-auto my-8 max-w-md p-8 text-center">
    <AlertTriangle className="mx-auto text-brand" />
    <p className="mt-3 font-medium">{error?.message || 'Something went wrong.'}</p>
    {error?.details?.length > 0 && <ul className="mt-2 text-xs text-mute">{error.details.map((d, i) => <li key={i}>{d}</li>)}</ul>}
    {onRetry && <button onClick={onRetry} className="btn-ink mt-5"><RefreshCw size={14} />Try again</button>}
  </div>
);
export const Empty = ({ title, hint, action }) => (
  <div className="mx-auto max-w-sm py-16 text-center">
    <Inbox className="mx-auto text-brand" />
    <p className="mt-3 font-medium">{title}</p>
    {hint && <p className="mt-1 text-sm text-mute">{hint}</p>}
    {action && <div className="mt-5">{action}</div>}
  </div>
);
export const Async = ({ state, children, empty }) => {
  if (state.loading && !state.data) return <Loading />;
  if (state.error) return <ErrorState error={state.error} onRetry={state.reload} />;
  if (empty && (!state.data || state.data.length === 0)) return empty;
  return children(state.data);
};
export const FormError = ({ error }) =>
  error ? (
    <div role="alert" className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
      {error.message}
      {error.details?.length > 0 && <ul className="mt-1 list-disc pl-5 text-xs">{error.details.map((d, i) => <li key={i}>{d}</li>)}</ul>}
    </div>
  ) : null;

/* ---------- primitives ---------- */
export const Badge = ({ status }) => <span className={`pill ${statusTone(status)}`}>{label(status)}</span>;

export function Field({ label: l, children, hint }) {
  return (
    <label className="block">
      <span className="label">{l}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-mute">{hint}</span>}
    </label>
  );
}

export function Modal({ title, onClose, children, wide }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 p-0 sm:items-center sm:p-6" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-label={title} onClick={(e) => e.stopPropagation()}
        className={`max-h-[92vh] w-full overflow-y-auto rounded-t-sheet bg-white p-6 shadow-2xl sm:rounded-sheet sm:p-8 ${wide ? 'max-w-2xl' : 'max-w-md'}`}>
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-serif text-2xl font-semibold">{title}</h2>
          <button onClick={onClose} aria-label="Close" className="grid h-9 w-9 place-items-center rounded-full bg-soft"><X size={16} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

export const Stepper = ({ value, onChange, min = 1, max = 20, disabled, dark }) => (
  <div className={`inline-flex items-center gap-3 rounded-full px-2 py-1.5 ${dark ? 'bg-neutral-700 text-white' : 'bg-soft'}`}>
    <button disabled={disabled || value <= min} onClick={() => onChange(value - 1)} aria-label="Decrease"
      className={`grid h-7 w-7 place-items-center rounded-full disabled:opacity-40 ${dark ? 'bg-neutral-600' : 'bg-white'}`}><Minus size={14} /></button>
    <span className="w-6 text-center text-sm font-medium tabular-nums">{value}</span>
    <button disabled={disabled || value >= max} onClick={() => onChange(value + 1)} aria-label="Increase"
      className={`grid h-7 w-7 place-items-center rounded-full disabled:opacity-40 ${dark ? 'bg-neutral-600' : 'bg-white'}`}><Plus size={14} /></button>
  </div>
);

/** Plate-style food image: round crop (ref 1/2). Falls back to an illustrated empty plate. */
export function Plate({ src, alt = '', className = '' }) {
  const [bad, setBad] = useState(false);
  if (!src || bad)
    return (
      <div className={`grid place-items-center rounded-full bg-gradient-to-br from-peach to-brand-light ${className}`} role="img" aria-label={alt}>
        <svg viewBox="0 0 100 100" className="h-3/5 w-3/5 text-brand/70" fill="none" stroke="currentColor" strokeWidth="3">
          <circle cx="50" cy="50" r="38" /><circle cx="50" cy="50" r="24" /><path d="M42 44c4-8 12-8 16 0M40 58c6 6 14 6 20 0" strokeLinecap="round" />
        </svg>
      </div>
    );
  return <img src={src} alt={alt} onError={() => setBad(true)} className={`rounded-full object-cover ${className}`} />;
}

/** Four macro chips as in the catalogue reference. Missing values are shown as — , never invented. */
export const Macros = ({ food }) => (
  <div className="grid grid-cols-4 gap-1.5">
    {[[food.calories, 'Cal', ''], [food.protein, 'Protein', 'g'], [food.carbohydrates, 'Carbs', 'g'], [food.fat, 'Fat', 'g']].map(([v, l, u]) => (
      <div key={l} className="rounded-xl bg-white/70 py-2 text-center ring-1 ring-black/5">
        <div className="text-[15px] font-semibold tabular-nums">{v == null ? '—' : `${v}${u}`}</div>
        <div className="text-[11px] text-mute">{l}</div>
      </div>
    ))}
  </div>
);

export const Stars = ({ value = 0 }) => <span className="text-brand" aria-label={`${value} out of 5`}>{'★'.repeat(value)}<span className="text-neutral-300">{'★'.repeat(5 - value)}</span></span>;

export const PageHead = ({ title, sub, action }) => (
  <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
    <div><h1 className="font-serif text-3xl font-semibold sm:text-4xl">{title}</h1>{sub && <p className="mt-1 text-sm text-mute">{sub}</p>}</div>
    {action}
  </div>
);

export const Pager = ({ page, onPage }) => {
  if (!page) return null;
  const cur = page.page ?? page.currentPage ?? 1;
  const total = page.totalPages ?? page.pages ?? (page.total && page.limit ? Math.ceil(page.total / page.limit) : 1);
  if (total <= 1) return null;
  return (
    <div className="mt-5 flex items-center justify-center gap-3 text-sm">
      <button className="btn-ghost" disabled={cur <= 1} onClick={() => onPage(cur - 1)}>Previous</button>
      <span className="text-mute">Page {cur} of {total}</span>
      <button className="btn-ghost" disabled={cur >= total} onClick={() => onPage(cur + 1)}>Next</button>
    </div>
  );
};
