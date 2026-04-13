import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { PriorityBadge } from '../ui/Badge';
import { Avatar } from '../ui/Avatar';
import { formatDate, getDueDateStatus } from '../../utils/date';
import type { Task } from '../../types';

interface TaskCardProps {
  task: Task;
  assigneeName?: string;
  onClick: () => void;
}

export function TaskCard({ task, assigneeName, onClick }: TaskCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging: isSortableDragging } = useSortable({
    id: task.id,
    data: { task, type: 'task' },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const dueDateStatus = getDueDateStatus(task.due_date);

  const dueDateClasses: Record<string, string> = {
    overdue: 'text-rose-600 bg-rose-50',
    today: 'text-amber-600 bg-amber-50',
    tomorrow: 'text-blue-600 bg-blue-50',
    upcoming: 'text-slate-500 bg-slate-50',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={[
        'group bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700',
        'shadow-card hover:shadow-card-hover transition-all duration-200',
        'cursor-grab active:cursor-grabbing select-none',
        isSortableDragging ? 'opacity-40' : 'hover:-translate-y-0.5',
      ].join(' ')}
      onClick={onClick}
    >
      <div className="p-4">
        {/* Title */}
        <h4 className="text-sm font-medium text-slate-800 dark:text-slate-100 leading-snug mb-2 pr-6 line-clamp-2">
          {task.title}
        </h4>

        {/* Description snippet */}
        {task.description && (
          <p className="text-xs text-slate-400 dark:text-slate-500 mb-3 line-clamp-1">{task.description}</p>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between gap-2">
          <PriorityBadge priority={task.priority} />

          <div className="flex items-center gap-2">
            {/* Due date */}
            {task.due_date && dueDateStatus && (
              <span className={['text-[10px] font-medium px-1.5 py-0.5 rounded-md', dueDateClasses[dueDateStatus]].join(' ')}>
                {dueDateStatus === 'overdue' ? '⚠ ' : ''}
                {formatDate(task.due_date)}
              </span>
            )}

            {/* Assignee */}
            {assigneeName && <Avatar name={assigneeName} size="xs" />}
          </div>
        </div>
      </div>
    </div>
  );
}

/** Overlay card shown while dragging (no dnd-kit hooks) */
export function TaskCardOverlay({ task, assigneeName }: { task: Task; assigneeName?: string }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-blue-200 shadow-xl rotate-2 scale-105 p-4">
      <h4 className="text-sm font-medium text-slate-800 dark:text-slate-100 leading-snug mb-2 line-clamp-2">{task.title}</h4>
      <div className="flex items-center justify-between gap-2">
        <PriorityBadge priority={task.priority} />
        {assigneeName && <Avatar name={assigneeName} size="xs" />}
      </div>
    </div>
  );
}
