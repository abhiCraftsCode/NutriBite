import axios from 'axios';

export const TOKEN_KEY = 'nutribite_token';
const api = axios.create({ baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1' });

api.interceptors.request.use((cfg) => {
  const t = localStorage.getItem(TOKEN_KEY);
  if (t) cfg.headers.Authorization = `Bearer ${t}`;
  return cfg;
});

/** Normalises every failure into { status, message, details[] } — never a stack trace. */
api.interceptors.response.use(
  (r) => r,
  (err) => {
    const status = err.response?.status || 0;
    const body = err.response?.data;
    let message = body?.message || body?.error;
    const raw = body?.errors || body?.details;
    const details = Array.isArray(raw)
      ? raw.map((e) => (typeof e === 'string' ? e : `${e.field || e.path?.join?.('.') || ''} ${e.message || ''}`.trim()))
      : [];
    if (!message) {
      message = status === 0 ? 'Cannot reach the server. Check your connection and try again.'
        : status === 401 ? 'Your session has expired. Please sign in again.'
        : status === 403 ? 'You do not have permission to do that.'
        : status === 404 ? 'We could not find what you were looking for.'
        : status === 409 ? 'That conflicts with the current state (stock or status changed).'
        : status >= 500 ? 'Something went wrong on our side. Please retry.'
        : 'The request could not be completed.';
    }
    const isAuthCall = /\/auth\/(login|register)/.test(err.config?.url || '');
    if (status === 401 && !isAuthCall) window.dispatchEvent(new Event('auth:expired'));
    return Promise.reject({ status, message, details });
  }
);

/** Response adapters: backend wraps in { success, message, data } on most routes. */
export const unwrap = (res) => {
  const b = res?.data;
  return b && typeof b === 'object' && !Array.isArray(b) && 'data' in b ? b.data : b;
};
export const listOf = (d, ...keys) => {
  if (Array.isArray(d)) return d;
  if (!d || typeof d !== 'object') return [];
  for (const k of keys) if (Array.isArray(d[k])) return d[k];
  const first = Object.values(d).find(Array.isArray);
  return first || [];
};
export const pageOf = (res) => {
  const b = res?.data || {};
  const d = unwrap(res) || {};
  return d.pagination || b.pagination || d.meta || b.meta || null;
};
export default api;
