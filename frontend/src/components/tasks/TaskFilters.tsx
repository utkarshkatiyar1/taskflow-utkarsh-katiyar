import { useRef, useEffect, useState } from 'react';
import type { User } from '../../types';
import { Avatar } from '../ui/Avatar';

interface TaskFiltersProps {
  assigneeFilters: string[];
  onAssigneeFiltersChange: (vals: string[]) => void;
  users: User[];
  currentUserId: string;
  totalCount: number;
}

export function TaskFilters({
  assigneeFilters,
  onAssigneeFiltersChange,
  users,
  currentUserId,
  totalCount,
}: TaskFiltersProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const toggle = (value: string) => {
    onAssigneeFiltersChange(
      assigneeFilters.includes(value)
        ? assigneeFilters.filter((v) => v !== value)
        : [...assigneeFilters, value],
    );
  };

  const activeCount = assigneeFilters.length;

  return (
    <div className="flex items-center gap-3">
      {/* Dropdown trigger */}
      <div ref={ref} className="relative">
        <button
          onClick={() => setOpen((v) => !v)}
          className={[
            'flex items-center gap-2 h-8 px-3 rounded-lg border text-xs font-medium transition-colors',
            activeCount > 0
              ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-600 text-blue-700 dark:text-blue-300'
              : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300',
          ].join(' ')}
        >
          <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 16 16" stroke="currentColor">
            <circle cx="6" cy="4" r="2.5" strokeWidth="1.5" />
            <path d="M1 13c0-2.761 2.239-4 5-4s5 1.239 5 4" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M11 7l1.5 1.5L15 6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Assignee
          {activeCount > 0 && (
            <span className="bg-blue-600 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] font-semibold leading-none">
              {activeCount}
            </span>
          )}
          <svg
            className={['w-3 h-3 shrink-0 transition-transform', open ? 'rotate-180' : ''].join(' ')}
            fill="none" viewBox="0 0 10 6" stroke="currentColor"
          >
            <path d="M1 1l4 4 4-4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {/* Dropdown */}
        {open && (
          <div className="absolute top-full left-0 mt-1 w-52 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg z-30 py-1 animate-fade-in">
            {/* Users */}
            {users.map((user) => {
              const checked = assigneeFilters.includes(user.id);
              const isMe = user.id === currentUserId;
              return (
                <button
                  key={user.id}
                  onClick={() => toggle(user.id)}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                >
                  <Checkbox checked={checked} />
                  <Avatar name={user.name} size="xs" />
                  <span className="truncate">{isMe ? `${user.name} (me)` : user.name}</span>
                </button>
              );
            })}

            {/* Divider + Unassigned */}
            {users.length > 0 && <div className="my-1 border-t border-slate-100 dark:border-slate-700" />}
            <button
              onClick={() => toggle('unassigned')}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
            >
              <Checkbox checked={assigneeFilters.includes('unassigned')} />
              <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-600 flex items-center justify-center shrink-0">
                <svg className="w-3 h-3 text-slate-500 dark:text-slate-400" fill="none" viewBox="0 0 12 12" stroke="currentColor">
                  <circle cx="6" cy="4" r="2" strokeWidth="1.5" />
                  <path d="M2 10c0-2 1.8-3 4-3s4 1 4 3" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </span>
              <span>Unassigned</span>
            </button>

            {/* Clear */}
            {activeCount > 0 && (
              <>
                <div className="my-1 border-t border-slate-100 dark:border-slate-700" />
                <button
                  onClick={() => { onAssigneeFiltersChange([]); setOpen(false); }}
                  className="w-full px-3 py-2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 text-left transition-colors"
                >
                  Clear filters
                </button>
              </>
            )}
          </div>
        )}
      </div>

      <span className="text-xs text-slate-400">
        {totalCount} task{totalCount !== 1 ? 's' : ''}
      </span>
    </div>
  );
}

function Checkbox({ checked }: { checked: boolean }) {
  return (
    <span className={[
      'w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors',
      checked
        ? 'bg-blue-600 border-blue-600'
        : 'border-slate-300 dark:border-slate-500',
    ].join(' ')}>
      {checked && (
        <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 10 8">
          <path d="M1 4l3 3 5-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </span>
  );
}
