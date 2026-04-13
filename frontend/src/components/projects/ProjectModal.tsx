import { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input, Textarea } from '../ui/Input';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { useToast } from '../../hooks/useToast';
import { createProject, updateProject, deleteProject } from '../../store/projectSlice';
import { useNavigate } from 'react-router-dom';
import type { Project } from '../../types';

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  project?: Project | null;
}

export function ProjectModal({ isOpen, onClose, project }: ProjectModalProps) {
  const dispatch = useAppDispatch();
  const toast = useToast();
  const navigate = useNavigate();
  const isEdit = !!project;

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [nameError, setNameError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setName(project?.name ?? '');
      setDescription(project?.description ?? '');
      setNameError('');
    }
  }, [isOpen, project]);

  const handleSubmit = async () => {
    if (!name.trim()) { setNameError('Project name is required'); return; }
    setNameError('');
    setIsSaving(true);
    try {
      if (isEdit && project) {
        await dispatch(updateProject({ id: project.id, payload: { name: name.trim(), description: description.trim() || undefined } })).unwrap();
        toast.success('Project updated');
      } else {
        const created = await dispatch(createProject({ name: name.trim(), description: description.trim() || undefined })).unwrap();
        toast.success('Project created');
        navigate(`/projects/${created.id}`);
      }
      onClose();
    } catch (err) {
      toast.error(typeof err === 'string' ? err : 'Failed to save project');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!project) return;
    setIsDeleting(true);
    try {
      await dispatch(deleteProject(project.id)).unwrap();
      toast.success('Project deleted');
      navigate('/projects');
      onClose();
    } catch {
      toast.error('Failed to delete project');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? 'Edit Project' : 'New Project'} size="sm">
      <div className="p-6 space-y-4">
        <Input
          label="Project name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Website Redesign"
          required
          error={nameError}
          autoFocus
          onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit(); }}
        />
        <Textarea
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What is this project about? (optional)"
          rows={3}
        />
      </div>

      <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 rounded-b-2xl">
        {isEdit ? (
          <Button variant="danger" size="sm" onClick={handleDelete} isLoading={isDeleting}>Delete Project</Button>
        ) : (
          <div />
        )}
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={onClose}>Cancel</Button>
          <Button size="sm" onClick={handleSubmit} isLoading={isSaving}>
            {isEdit ? 'Save' : 'Create Project'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
