import { Button } from './Button';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
}

function DefaultIcon() {
  return (
    <svg className="w-12 h-12 text-slate-300" fill="none" viewBox="0 0 48 48">
      <rect x="6" y="6" width="36" height="36" rx="8" stroke="currentColor" strokeWidth="2" />
      <path d="M15 20h18M15 27h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="34" cy="34" r="8" fill="currentColor" fillOpacity=".1" stroke="currentColor" strokeWidth="2" />
      <path d="M31 34h6M34 31v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center animate-fade-in">
      <div className="mb-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60">
        {icon ?? <DefaultIcon />}
      </div>
      <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200 mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs">{description}</p>
      )}
      {action && (
        <div className="mt-4">
          <Button onClick={action.onClick}>{action.label}</Button>
        </div>
      )}
    </div>
  );
}

export function ProjectsEmptyState({ onCreateProject }: { onCreateProject: () => void }) {
  return (
    <EmptyState
      icon={
        <svg className="w-12 h-12 text-slate-300" fill="none" viewBox="0 0 48 48">
          <rect x="4" y="10" width="28" height="28" rx="6" stroke="currentColor" strokeWidth="2" />
          <rect x="16" y="18" width="28" height="22" rx="6" fill="currentColor" fillOpacity=".08" stroke="currentColor" strokeWidth="2" />
          <path d="M30 28h-8M26 24v8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      }
      title="No projects yet"
      description="Create your first project to start organizing tasks with your team."
      action={{ label: '+ New Project', onClick: onCreateProject }}
    />
  );
}

export function TasksEmptyState({ onCreateTask }: { onCreateTask: () => void }) {
  return (
    <EmptyState
      icon={
        <svg className="w-10 h-10 text-slate-300" fill="none" viewBox="0 0 40 40">
          <rect x="4" y="4" width="32" height="32" rx="6" stroke="currentColor" strokeWidth="2" />
          <path d="M13 20h14M20 13v14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      }
      title="No tasks here"
      description="Add a task to get started."
      action={{ label: '+ Add Task', onClick: onCreateTask }}
    />
  );
}
