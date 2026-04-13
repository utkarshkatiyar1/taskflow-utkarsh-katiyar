import { apiClient } from './client';
import type { Project, ProjectWithTasks, CreateProjectPayload, UpdateProjectPayload } from '../types';

export const projectsApi = {
  list: () =>
    apiClient.get<{ projects: Project[] }>('/projects').then((r) => r.data.projects),

  get: (id: string) =>
    apiClient.get<ProjectWithTasks>(`/projects/${id}`).then((r) => r.data),

  create: (payload: CreateProjectPayload) =>
    apiClient.post<Project>('/projects', payload).then((r) => r.data),

  update: (id: string, payload: UpdateProjectPayload) =>
    apiClient.patch<Project>(`/projects/${id}`, payload).then((r) => r.data),

  delete: (id: string) =>
    apiClient.delete(`/projects/${id}`),
};
