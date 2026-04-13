import { useState, useMemo, useCallback, useEffect } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import { KanbanColumn } from './KanbanColumn';
import { TaskCardOverlay } from './TaskCard';
import { TaskModal } from './TaskModal';
import { TaskFilters } from './TaskFilters';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppDispatch';
import { optimisticStatusUpdate, revertTaskStatus, updateTask } from '../../store/taskSlice';
import { useToast } from '../../hooks/useToast';
import { usersApi } from '../../api/users';
import type { Task, TaskStatus, User } from '../../types';

const COLUMNS: Array<{ id: TaskStatus; label: string; dotColor: string; bgColor: string; borderColor: string }> = [
  { id: 'todo', label: 'To Do', dotColor: 'bg-slate-400', bgColor: 'bg-slate-50/80 dark:bg-slate-800/40', borderColor: 'border-slate-200 dark:border-slate-700' },
  { id: 'in_progress', label: 'In Progress', dotColor: 'bg-blue-500', bgColor: 'bg-blue-50/60 dark:bg-blue-950/30', borderColor: 'border-blue-200 dark:border-blue-800' },
  { id: 'done', label: 'Done', dotColor: 'bg-emerald-500', bgColor: 'bg-emerald-50/60 dark:bg-emerald-950/30', borderColor: 'border-emerald-200 dark:border-emerald-800' },
];

interface KanbanBoardProps {
  projectId: string;
  currentUserId: string;
  currentUserName: string;
}

export function KanbanBoard({ projectId, currentUserId, currentUserName }: KanbanBoardProps) {
  const dispatch = useAppDispatch();
  const toast = useToast();
  const { tasks, isLoading } = useAppSelector((s) => s.tasks);

  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [assigneeFilters, setAssigneeFilters] = useState<string[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [createStatus, setCreateStatus] = useState<TaskStatus>('todo');
  const [allUsers, setAllUsers] = useState<User[]>([]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  useEffect(() => {
    usersApi.list().then(setAllUsers).catch((err) => {
      console.error('Failed to load users:', err?.message ?? err);
    });
  }, []);

  // Build assignee name map from all fetched users
  const assigneeNameMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const u of allUsers) map.set(u.id, u.name);
    // ensure current user is always present even if API lags
    if (!map.has(currentUserId)) map.set(currentUserId, currentUserName);
    return map;
  }, [allUsers, currentUserId, currentUserName]);

  const filteredTasks = useMemo(() => {
    if (assigneeFilters.length === 0) return tasks;
    return tasks.filter((t) => {
      if (assigneeFilters.includes('unassigned') && !t.assignee_id) return true;
      if (t.assignee_id && assigneeFilters.includes(t.assignee_id)) return true;
      return false;
    });
  }, [tasks, assigneeFilters]);

  const getColumnTasks = useCallback(
    (status: TaskStatus) => filteredTasks.filter((t) => t.status === status),
    [filteredTasks],
  );

  const handleDragStart = ({ active }: DragStartEvent) => {
    const task = tasks.find((t) => t.id === active.id);
    if (task) setActiveTask(task);
  };

  const handleDragEnd = async ({ active, over }: DragEndEvent) => {
    setActiveTask(null);
    if (!over) return;

    const draggedTask = tasks.find((t) => t.id === active.id);
    if (!draggedTask) return;

    // Determine target column: either a column id or another task's column
    const targetStatus = (COLUMNS.find((c) => c.id === over.id)?.id
      ?? tasks.find((t) => t.id === over.id)?.status) as TaskStatus | undefined;

    if (!targetStatus || targetStatus === draggedTask.status) return;

    const prevStatus = draggedTask.status;
    // Optimistic update
    dispatch(optimisticStatusUpdate({ taskId: draggedTask.id, status: targetStatus }));

    try {
      await dispatch(updateTask({ taskId: draggedTask.id, payload: { status: targetStatus } })).unwrap();
      toast.success(`Moved to ${COLUMNS.find((c) => c.id === targetStatus)?.label}`);
    } catch {
      dispatch(revertTaskStatus({ taskId: draggedTask.id, status: prevStatus }));
      toast.error('Failed to update task status');
    }
  };

  const openCreateModal = (status: TaskStatus = 'todo') => {
    setSelectedTask(null);
    setCreateStatus(status);
    setModalOpen(true);
  };

  const openEditModal = (task: Task) => {
    setSelectedTask(task);
    setModalOpen(true);
  };

  return (
    <div className="space-y-4">
      <TaskFilters
        assigneeFilters={assigneeFilters}
        onAssigneeFiltersChange={setAssigneeFilters}
        users={allUsers}
        currentUserId={currentUserId}
        totalCount={filteredTasks.length}
      />

      <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 sm:mx-0 sm:px-0">
          {COLUMNS.map((col) => (
            <KanbanColumn
              key={col.id}
              {...col}
              tasks={getColumnTasks(col.id)}
              isLoading={isLoading}
              assigneeNameMap={assigneeNameMap}
              onTaskClick={openEditModal}
              onAddTask={() => openCreateModal(col.id)}
            />
          ))}
        </div>
        <DragOverlay dropAnimation={{ duration: 200, easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)' }}>
          {activeTask && (
            <TaskCardOverlay
              task={activeTask}
              assigneeName={activeTask.assignee_id ? assigneeNameMap.get(activeTask.assignee_id) : undefined}
            />
          )}
        </DragOverlay>
      </DndContext>

      <TaskModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        projectId={projectId}
        currentUserId={currentUserId}
        users={allUsers}
        task={selectedTask}
        defaultStatus={createStatus}
      />
    </div>
  );
}
