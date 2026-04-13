import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks/useAppDispatch';
import { fetchProjects } from '../store/projectSlice';
import { ProjectCard } from '../components/projects/ProjectCard';
import { ProjectModal } from '../components/projects/ProjectModal';
import { ProjectCardSkeleton } from '../components/ui/SkeletonLoader';
import { ProjectsEmptyState } from '../components/ui/EmptyState';
import { Button } from '../components/ui/Button';

export function ProjectsPage() {
  const dispatch = useAppDispatch();
  const { projects, isLoading, error } = useAppSelector((s) => s.projects);
  const user = useAppSelector((s) => s.auth.user);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchProjects());
  }, [dispatch]);

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">
            {user ? `Welcome back, ${user.name.split(' ')[0]} 👋` : 'Projects'}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {projects.length > 0
              ? `You have ${projects.length} project${projects.length !== 1 ? 's' : ''}`
              : 'Create a project to get started'}
          </p>
        </div>
        <Button
          onClick={() => setModalOpen(true)}
          leftIcon={
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          }
        >
          New Project
        </Button>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-xl px-4 py-3 text-sm text-rose-700 dark:text-rose-400">
          {error}
        </div>
      )}

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[0, 1, 2, 3, 4, 5].map((i) => <ProjectCardSkeleton key={i} />)}
        </div>
      ) : projects.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-card">
          <ProjectsEmptyState onCreateProject={() => setModalOpen(true)} />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}

      <ProjectModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
