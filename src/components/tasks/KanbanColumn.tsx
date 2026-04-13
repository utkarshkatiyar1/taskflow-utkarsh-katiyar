import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { TaskCard } from './TaskCard';
import { TasksEmptyState } from '../ui/EmptyState';
import { TaskCardSkeleton } from '../ui/SkeletonLoader';
import type { Task, TaskStatus } from '../../types';

interface KanbanColumnProps {
  id: TaskStatus;
  label: string;
  dotColor: string;
  bgColor: string;
  borderColor: string;
  tasks: Task[];
  isLoading?: boolean;
  assigneeNameMap: Map<string, string>;
  onTaskClick: (task: Task) => void;
  onAddTask: () => void;
}

export function KanbanColumn({
  id,
  label,
  dotColor,
  bgColor,
  borderColor,
  tasks,
  isLoading,
  assigneeNameMap,
  onTaskClick,
  onAddTask,
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      className={[
        'flex flex-col rounded-2xl border transition-colors duration-200 min-w-[272px] w-72 flex-shrink-0',
        bgColor,
        borderColor,
        isOver ? 'ring-2 ring-blue-400 ring-offset-2' : '',
      ].join(' ')}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-black/5 dark:border-white/5">
        <div className="flex items-center gap-2">
          <span className={['w-2 h-2 rounded-full', dotColor].join(' ')} />
          <h3 className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">{label}</h3>
          <span className="text-xs font-medium text-slate-400 bg-white/60 dark:bg-slate-700/60 px-1.5 py-0.5 rounded-full">
            {tasks.length}
          </span>
        </div>
        <button
          onClick={onAddTask}
          className="w-6 h-6 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-white dark:hover:bg-slate-700 flex items-center justify-center transition-colors text-base leading-none"
          title="Add task"
        >
          +
        </button>
      </div>

      {/* Task List */}
      <div ref={setNodeRef} className="flex-1 p-3 space-y-2 min-h-[120px]">
        {isLoading ? (
          <>
            <TaskCardSkeleton />
            <TaskCardSkeleton />
          </>
        ) : (
          <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                assigneeName={task.assignee_id ? assigneeNameMap.get(task.assignee_id) : undefined}
                onClick={() => onTaskClick(task)}
              />
            ))}
          </SortableContext>
        )}

        {!isLoading && tasks.length === 0 && (
          <TasksEmptyState onCreateTask={onAddTask} />
        )}
      </div>
    </div>
  );
}
