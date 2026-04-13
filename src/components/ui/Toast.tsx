import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useAppSelector, useAppDispatch } from '../../hooks/useAppDispatch';
import { removeToast } from '../../store/uiSlice';
import type { ToastItem } from '../../types';

const icons: Record<ToastItem['type'], string> = {
  success: '✓',
  error: '✕',
  warning: '⚠',
  info: 'ℹ',
};

const styles: Record<ToastItem['type'], string> = {
  success: 'bg-emerald-50 border-emerald-200 text-emerald-800',
  error: 'bg-rose-50 border-rose-200 text-rose-800',
  warning: 'bg-amber-50 border-amber-200 text-amber-800',
  info: 'bg-blue-50 border-blue-200 text-blue-800',
};

const iconStyles: Record<ToastItem['type'], string> = {
  success: 'bg-emerald-500 text-white',
  error: 'bg-rose-500 text-white',
  warning: 'bg-amber-500 text-white',
  info: 'bg-blue-500 text-white',
};

function ToastCard({ toast }: { toast: ToastItem }) {
  const dispatch = useAppDispatch();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 10);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      className={[
        'flex items-start gap-3 px-4 py-3 rounded-xl border shadow-lg max-w-sm w-full transition-all duration-300',
        styles[toast.type],
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2',
      ].join(' ')}
    >
      <div className={['w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5', iconStyles[toast.type]].join(' ')}>
        {icons[toast.type]}
      </div>
      <p className="text-sm font-medium flex-1">{toast.message}</p>
      <button
        onClick={() => dispatch(removeToast(toast.id))}
        className="shrink-0 opacity-60 hover:opacity-100 transition-opacity text-lg leading-none mt-0.5"
      >
        ×
      </button>
    </div>
  );
}

export function ToastContainer() {
  const toasts = useAppSelector((s) => s.ui.toasts);

  if (toasts.length === 0) return null;

  return createPortal(
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div key={t.id} className="pointer-events-auto">
          <ToastCard toast={t} />
        </div>
      ))}
    </div>,
    document.body,
  );
}
