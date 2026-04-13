import { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input, Textarea } from '../ui/Input';
import { Select } from '../ui/Select';
import { PriorityBadge, StatusBadge } from '../ui/Badge';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { useToast } from '../../hooks/useToast';
import { createTask, updateTask, deleteTask } from '../../store/taskSlice';
import { toInputDate, formatRelative } from '../../utils/date';
import type { Task, TaskPriority, TaskStatus, User } from '../../types';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  currentUserId: string;
  users: User[];
  task?: Task | null;
  defaultStatus?: TaskStatus;
}

const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
];

const STATUS_OPTIONS = [
  { value: 'todo', label: 'To Do' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'done', label: 'Done' },
];

export function TaskModal({ isOpen, onClose, projectId, currentUserId, users, task, defaultStatus = 'todo' }: TaskModalProps) {
  const dispatch = useAppDispatch();
  const toast = useToast();
  const isEdit = !!task;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TaskStatus>('todo');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [assigneeId, setAssigneeId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [titleError, setTitleError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setTitle(task?.title ?? '');
      setDescription(task?.description ?? '');
      setStatus(task?.status ?? defaultStatus);
      setPriority(task?.priority ?? 'medium');
      setAssigneeId(task?.assignee_id ?? '');
      setDueDate(toInputDate(task?.due_date));
      setTitleError('');
    }
  }, [isOpen, task, defaultStatus]);

  const handleSubmit = async () => {
    if (!title.trim()) { setTitleError('Title is required'); return; }
    setTitleError('');
    setIsSaving(true);
    try {
      if (isEdit && task) {
        await dispatch(updateTask({
          taskId: task.id,
          payload: {
            title: title.trim(),
            description: description.trim() || undefined,
            status,
            priority,
            assignee_id: assigneeId || null,
            due_date: dueDate || null,
          },
        })).unwrap();
        toast.success('Task updated');
      } else {
        await dispatch(createTask({
          projectId,
          payload: {
            title: title.trim(),
            description: description.trim() || undefined,
            priority,
            assignee_id: assigneeId || undefined,
            due_date: dueDate || undefined,
          },
        })).unwrap();
        toast.success('Task created');
      }
      onClose();
    } catch (err) {
      toast.error(typeof err === 'string' ? err : 'Failed to save task');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!task) return;
    setIsDeleting(true);
    try {
      await dispatch(deleteTask(task.id)).unwrap();
      toast.success('Task deleted');
      onClose();
    } catch {
      toast.error('Failed to delete task');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? 'Edit Task' : 'New Task'} size="md">
      <div className="p-6 space-y-4">
        {isEdit && task && (
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-700">
            <StatusBadge status={task.status} />
            <PriorityBadge priority={task.priority} />
            <span className="text-xs text-slate-400 ml-auto">{formatRelative(task.updated_at)}</span>
          </div>
        )}

        <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="What needs to be done?" required error={titleError} />
        <Textarea label="Description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Add more details..." rows={3} />

        <div className="grid grid-cols-2 gap-3">
          <Select label="Priority" value={priority} onChange={(e) => setPriority(e.target.value as TaskPriority)} options={PRIORITY_OPTIONS} />
          {isEdit && (
            <Select label="Status" value={status} onChange={(e) => setStatus(e.target.value as TaskStatus)} options={STATUS_OPTIONS} />
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input label="Due Date" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          <Select
            label="Assignee"
            value={assigneeId}
            onChange={(e) => setAssigneeId(e.target.value)}
            options={[
              { value: '', label: 'Unassigned' },
              ...users.map((u) => ({
                value: u.id,
                label: u.id === currentUserId ? `${u.name} (me)` : u.name,
              })),
            ]}
          />
        </div>
      </div>

      <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 rounded-b-2xl">
        {isEdit ? (
          <Button variant="danger" size="sm" onClick={handleDelete} isLoading={isDeleting}>Delete</Button>
        ) : (
          <div />
        )}
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={onClose}>Cancel</Button>
          <Button size="sm" onClick={handleSubmit} isLoading={isSaving}>
            {isEdit ? 'Save Changes' : 'Create Task'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
