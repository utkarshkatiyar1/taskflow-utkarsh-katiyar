import { apiClient } from './client';
import type { Task, CreateTaskPayload, UpdateTaskPayload, TaskStatus } from '../types';

interface TaskFilters {
  status?: TaskStatus;
  assignee?: string;
}

export const tasksApi = {
  list: (projectId: string, filters?: TaskFilters) =>
    apiClient
      .get<{ tasks: Task[] }>(`/projects/${projectId}/tasks`, { params: filters })
      .then((r) => r.data.tasks),

  create: (projectId: string, payload: CreateTaskPayload) =>
    apiClient.post<Task>(`/projects/${projectId}/tasks`, payload).then((r) => r.data),

  update: (taskId: string, payload: UpdateTaskPayload) =>
    apiClient.patch<Task>(`/tasks/${taskId}`, payload).then((r) => r.data),

  delete: (taskId: string) =>
    apiClient.delete(`/tasks/${taskId}`),
};
