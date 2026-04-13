import { useNavigate } from 'react-router-dom';
import { formatDate } from '../../utils/date';
import type { Project } from '../../types';

interface ProjectCardProps {
  project: Project;
  taskCount?: number;
}

const CARD_ACCENTS = [
  'bg-blue-500',
  'bg-emerald-500',
  'bg-amber-500',
  'bg-rose-500',
  'bg-teal-500',
];

function getAccent(id: string) {
  let h = 0;
  for (const c of id) h = (h * 31 + c.charCodeAt(0)) % CARD_ACCENTS.length;
  return CARD_ACCENTS[Math.abs(h)];
}

function ProjectIcon({ color }: { color: string }) {
  return (
    <div className={['w-10 h-10 rounded-xl flex items-center justify-center shadow-sm', color].join(' ')}>
      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 20 20">
        <rect x="3" y="3" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <rect x="10" y="3" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <rect x="3" y="10" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <rect x="10" y="10" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    </div>
  );
}

export function ProjectCard({ project, taskCount }: ProjectCardProps) {
  const navigate = useNavigate();
  const accent = getAccent(project.id);

  return (
    <div
      onClick={() => navigate(`/projects/${project.id}`)}
      className="group bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-card hover:shadow-card-hover transition-all duration-200 hover:-translate-y-1 cursor-pointer p-6 flex flex-col gap-4 animate-fade-in"
    >
      <div className="flex items-start justify-between">
        <ProjectIcon color={accent} />
        {taskCount !== undefined && (
          <span className="text-xs font-medium text-slate-400 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 px-2 py-0.5 rounded-full">
            {taskCount} task{taskCount !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      <div>
        <h3 className="font-semibold text-slate-900 dark:text-slate-100 group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors text-sm mb-1 line-clamp-1">
          {project.name}
        </h3>
        {project.description ? (
          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">{project.description}</p>
        ) : (
          <p className="text-xs text-slate-300 dark:text-slate-600 italic">No description</p>
        )}
      </div>

      <div className="flex items-center gap-1 mt-auto pt-2 border-t border-slate-50 dark:border-slate-700/50">
        <svg className="w-3 h-3 text-slate-400" fill="none" viewBox="0 0 12 12">
          <rect x="1" y="1" width="10" height="10" rx="2" stroke="currentColor" strokeWidth="1" />
          <path d="M4 1v10M1 4h10" stroke="currentColor" strokeWidth="1" />
        </svg>
        <span className="text-[11px] text-slate-400">Created {formatDate(project.created_at)}</span>
        <span className="ml-auto text-[11px] text-blue-500 dark:text-blue-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
          Open →
        </span>
      </div>
    </div>
  );
}
