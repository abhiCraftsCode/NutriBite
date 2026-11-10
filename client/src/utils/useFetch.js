import { useCallback, useEffect, useState } from 'react';

/** Small data hook: { data, loading, error, reload }. */
export default function useFetch(fn, deps = []) {
  const [state, set] = useState({ data: null, loading: true, error: null });
  const run = useCallback(() => {
    set((s) => ({ ...s, loading: true, error: null }));
    return fn().then((data) => set({ data, loading: false, error: null }))
      .catch((error) => set({ data: null, loading: false, error }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  useEffect(() => { run(); }, [run]);
  return { ...state, reload: run };
}
