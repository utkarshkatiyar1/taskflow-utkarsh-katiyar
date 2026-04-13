import { useCallback } from 'react';
import { useAppDispatch } from './useAppDispatch';
import { addToast, removeToast } from '../store/uiSlice';
import type { ToastItem } from '../types';

export function useToast() {
  const dispatch = useAppDispatch();

  const toast = useCallback(
    (type: ToastItem['type'], message: string, duration = 4000) => {
      const id = `toast_${Date.now()}_${Math.random().toString(36).slice(2)}`;
      dispatch(addToast({ id, type, message }));
      setTimeout(() => dispatch(removeToast(id)), duration);
    },
    [dispatch],
  );

  return {
    success: (msg: string) => toast('success', msg),
    error: (msg: string) => toast('error', msg),
    warning: (msg: string) => toast('warning', msg),
    info: (msg: string) => toast('info', msg),
  };
}
