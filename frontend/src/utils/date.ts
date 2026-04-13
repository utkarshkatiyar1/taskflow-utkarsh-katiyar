import { format, formatDistanceToNow, isPast, isToday, isTomorrow, parseISO } from 'date-fns';

export function formatDate(dateStr: string | undefined): string {
  if (!dateStr) return '';
  try {
    const date = parseISO(dateStr);
    return format(date, 'MMM d, yyyy');
  } catch {
    return '';
  }
}

export function formatRelative(dateStr: string): string {
  try {
    return formatDistanceToNow(parseISO(dateStr), { addSuffix: true });
  } catch {
    return '';
  }
}

export function getDueDateStatus(dateStr: string | undefined): 'overdue' | 'today' | 'tomorrow' | 'upcoming' | null {
  if (!dateStr) return null;
  try {
    const date = parseISO(dateStr);
    if (isToday(date)) return 'today';
    if (isTomorrow(date)) return 'tomorrow';
    if (isPast(date)) return 'overdue';
    return 'upcoming';
  } catch {
    return null;
  }
}

export function toInputDate(dateStr: string | undefined): string {
  if (!dateStr) return '';
  try {
    return format(parseISO(dateStr), 'yyyy-MM-dd');
  } catch {
    return '';
  }
}
