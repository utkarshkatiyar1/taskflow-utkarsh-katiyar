import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '../hooks/useAppDispatch';

export function ProtectedRoute() {
  const token = useAppSelector((s) => s.auth.token);
  return token ? <Outlet /> : <Navigate to="/login" replace />;
}

export function PublicOnlyRoute() {
  const token = useAppSelector((s) => s.auth.token);
  return token ? <Navigate to="/projects" replace /> : <Outlet />;
}
