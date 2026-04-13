import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks/useAppDispatch';
import { fetchProject, clearCurrentProject } from '../store/projectSlice';
import { setTasks, clearTasks } from '../store/taskSlice';
import { KanbanBoard } from '../components/tasks/KanbanBoard';
import { ProjectModal } from '../components/projects/ProjectModal';
import { KanbanSkeleton } from '../components/ui/SkeletonLoader';
import { Button } from '../components/ui/Button';

export function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { currentProject, isDetailLoading, error } = useAppSelector((s) => s.projects);
  const user = useAppSelector((s) => s.auth.user);
  const [editModalOpen, setEditModalOpen] = useState(false);

  useEffect(() => {
    if (!id) { navigate('/projects'); return; }
    const load = async () => {
      const result = await dispatch(fetchProject(id));
      if (fetchProject.fulfilled.match(result)) {
        dispatch(setTasks(result.payload.tasks));
      }
    };
    load();
    return () => {
      dispatch(clearCurrentProject());
      dispatch(clearTasks());
    };
  }, [id, dispatch, navigate]);

  if (!id) return null;

  const isOwner = currentProject?.owner_id === user?.id;

  return (
    <div className="space-y-5">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-slate-400">
        <Link to="/projects" className="hover:text-slate-600 dark:hover:text-slate-300 transition-colors">Projects</Link>
        <span>/</span>
        <span className="text-slate-700 dark:text-slate-300 font-medium truncate max-w-[200px]">
          {isDetailLoading ? '...' : currentProject?.name ?? 'Project'}
        </span>
      </nav>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          {isDetailLoading ? (
            <div className="space-y-2">
              <div className="h-6 w-48 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" />
              <div className="h-4 w-72 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse" />
            </div>
          ) : currentProject ? (
            <>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white truncate">{currentProject.name}</h1>
              {currentProject.description && (
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">{currentProject.description}</p>
              )}
            </>
          ) : null}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {isOwner && currentProject && (
            <Button variant="secondary" size="sm" onClick={() => setEditModalOpen(true)}
              leftIcon={
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              }
            >
              Edit
            </Button>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-xl px-4 py-3 text-sm text-rose-700 dark:text-rose-400">
          {error} —{' '}
          <button onClick={() => navigate('/projects')} className="underline">
            Go back to projects
          </button>
        </div>
      )}

      {/* Kanban */}
      {isDetailLoading ? (
        <KanbanSkeleton />
      ) : currentProject && user ? (
        <KanbanBoard
          projectId={currentProject.id}
          currentUserId={user.id}
          currentUserName={user.name}
        />
      ) : null}

      {/* Edit project modal */}
      {currentProject && (
        <ProjectModal
          isOpen={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          project={currentProject}
        />
      )}
    </div>
  );
}
