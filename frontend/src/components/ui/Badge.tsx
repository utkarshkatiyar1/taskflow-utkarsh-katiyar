import React from 'react';
import type { TaskPriority, TaskStatus } from '../../types';

interface BadgeProps {
  children: React.ReactNode;
  className?: string;
}

export function Badge({ children, className = '' }: BadgeProps) {
  return (
    <span className={['inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium', className].join(' ')}>
      {children}
    </span>
  );
}

const priorityConfig: Record<TaskPriority, { label: string; classes: string; dot: string }> = {
  high: { label: 'High', classes: 'bg-red-50 text-red-700 border border-red-100', dot: 'bg-red-500' },
  medium: { label: 'Medium', classes: 'bg-amber-50 text-amber-700 border border-amber-100', dot: 'bg-amber-500' },
  low: { label: 'Low', classes: 'bg-slate-50 text-slate-600 border border-slate-200', dot: 'bg-slate-400' },
};

export function PriorityBadge({ priority }: { priority: TaskPriority }) {
  const { label, classes, dot } = priorityConfig[priority];
  return (
    <Badge className={classes}>
      <span className={['w-1.5 h-1.5 rounded-full shrink-0', dot].join(' ')} />
      {label}
    </Badge>
  );
}

const statusConfig: Record<TaskStatus, { label: string; classes: string }> = {
  todo: { label: 'To Do', classes: 'bg-slate-100 text-slate-600 border border-slate-200' },
  in_progress: { label: 'In Progress', classes: 'bg-blue-50 text-blue-700 border border-blue-100' },
  done: { label: 'Done', classes: 'bg-emerald-50 text-emerald-700 border border-emerald-100' },
};

export function StatusBadge({ status }: { status: TaskStatus }) {
  const { label, classes } = statusConfig[status];
  return <Badge className={classes}>{label}</Badge>;
}
