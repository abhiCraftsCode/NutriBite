import { Check } from 'lucide-react';
import { dt, label, ORDER_FLOW } from '../utils/format';

/** Black status tile (ref 1) driven by real status history timestamps. */
export default function Timeline({ status, history = [] }) {
  const at = {}; history.forEach((h) => { at[h.status] = h.createdAt; });
  const cancelled = status === 'CANCELLED';
  const idx = ORDER_FLOW.indexOf(status);
  return (
    <section className="rounded-tile bg-ink p-6 text-white">
      <h2 className="text-lg font-medium">{cancelled ? 'Order cancelled' : 'Order progress'}</h2>
      <ol className="mt-5 grid gap-3 sm:grid-cols-6">
        {ORDER_FLOW.map((s, i) => {
          const reached = !cancelled && (i <= idx || at[s]);
          return (
            <li key={s} className="flex items-start gap-3 sm:block">
              <span className={`grid h-8 w-8 place-items-center rounded-full ${reached ? 'bg-brand' : 'bg-white/15'}`}>{reached && <Check size={15} />}</span>
              <div className="sm:mt-2"><div className={`text-sm ${reached ? '' : 'text-white/50'}`}>{label(s)}</div><div className="text-xs text-white/50">{at[s] ? dt(at[s]) : ''}</div></div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
