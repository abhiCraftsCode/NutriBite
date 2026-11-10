import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loading } from '../components/ui';
import { homeFor } from '../utils/format';

export function RequireRole({ role, children }) {
  const { user, booting } = useAuth();
  const loc = useLocation();
  if (booting) return <Loading />;
  if (!user) return <Navigate to="/login" state={{ from: loc.pathname }} replace />;
  if (user.role !== role) return <Navigate to={homeFor(user.role)} replace />;
  return children;
}
export function GuestOnly({ children }) {
  const { user, booting } = useAuth();
  if (booting) return <Loading />;
  return user ? <Navigate to={homeFor(user.role)} replace /> : children;
}
