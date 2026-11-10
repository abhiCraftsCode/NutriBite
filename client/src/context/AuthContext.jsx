import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { authApi } from '../services';
import { TOKEN_KEY } from '../services/api';

const Ctx = createContext(null);
export const useAuth = () => useContext(Ctx);
const pickUser = (d) => d?.user || d;

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [booting, setBooting] = useState(!!localStorage.getItem(TOKEN_KEY));

  const logout = useCallback(() => { localStorage.removeItem(TOKEN_KEY); setUser(null); }, []);

  useEffect(() => {
    if (!localStorage.getItem(TOKEN_KEY)) return;
    authApi.me().then((d) => setUser(pickUser(d))).catch(logout).finally(() => setBooting(false));
  }, [logout]);

  useEffect(() => {
    window.addEventListener('auth:expired', logout);
    return () => window.removeEventListener('auth:expired', logout);
  }, [logout]);

  const establish = async (d) => {
    const token = d?.token || d?.accessToken;
    if (!token) throw { message: 'The server did not return a session token.' };
    localStorage.setItem(TOKEN_KEY, token);
    const u = d.user ? d.user : pickUser(await authApi.me());
    setUser(u);
    return u;
  };
  const login = async (b) => establish(await authApi.login(b));
  const register = async (b) => establish(await authApi.register(b));

  return <Ctx.Provider value={{ user, booting, login, register, logout, setUser }}>{children}</Ctx.Provider>;
}
