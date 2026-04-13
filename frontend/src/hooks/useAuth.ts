import { useAppSelector, useAppDispatch } from './useAppDispatch';
import { logout } from '../store/authSlice';
import { useNavigate } from 'react-router-dom';
import { useCallback } from 'react';

export function useAuth() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user, token, isLoading, error } = useAppSelector((s) => s.auth);

  const handleLogout = useCallback(() => {
    dispatch(logout());
    navigate('/login');
  }, [dispatch, navigate]);

  return { user, token, isLoading, error, isAuthenticated: !!token, logout: handleLogout };
}
