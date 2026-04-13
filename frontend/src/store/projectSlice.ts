import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { projectsApi } from '../api/projects';
import { extractErrorMessage } from '../api/client';
import type { Project, ProjectWithTasks, CreateProjectPayload, UpdateProjectPayload } from '../types';

interface ProjectState {
  projects: Project[];
  currentProject: ProjectWithTasks | null;
  isLoading: boolean;
  isDetailLoading: boolean;
  error: string | null;
}

const initialState: ProjectState = {
  projects: [],
  currentProject: null,
  isLoading: false,
  isDetailLoading: false,
  error: null,
};

export const fetchProjects = createAsyncThunk('projects/fetchAll', async (_, { rejectWithValue }) => {
  try { return await projectsApi.list(); }
  catch (err) { return rejectWithValue(extractErrorMessage(err)); }
});

export const fetchProject = createAsyncThunk('projects/fetchOne', async (id: string, { rejectWithValue }) => {
  try { return await projectsApi.get(id); }
  catch (err) { return rejectWithValue(extractErrorMessage(err)); }
});

export const createProject = createAsyncThunk('projects/create', async (payload: CreateProjectPayload, { rejectWithValue }) => {
  try { return await projectsApi.create(payload); }
  catch (err) { return rejectWithValue(extractErrorMessage(err)); }
});

export const updateProject = createAsyncThunk(
  'projects/update',
  async ({ id, payload }: { id: string; payload: UpdateProjectPayload }, { rejectWithValue }) => {
    try { return await projectsApi.update(id, payload); }
    catch (err) { return rejectWithValue(extractErrorMessage(err)); }
  },
);

export const deleteProject = createAsyncThunk('projects/delete', async (id: string, { rejectWithValue }) => {
  try { await projectsApi.delete(id); return id; }
  catch (err) { return rejectWithValue(extractErrorMessage(err)); }
});

const projectSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {
    clearCurrentProject(state) { state.currentProject = null; },
    clearError(state) { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProjects.pending, (s) => { s.isLoading = true; s.error = null; })
      .addCase(fetchProjects.fulfilled, (s, { payload }) => { s.isLoading = false; s.projects = payload; })
      .addCase(fetchProjects.rejected, (s, { payload }) => { s.isLoading = false; s.error = payload as string; })

      .addCase(fetchProject.pending, (s) => { s.isDetailLoading = true; s.error = null; })
      .addCase(fetchProject.fulfilled, (s, { payload }) => { s.isDetailLoading = false; s.currentProject = payload; })
      .addCase(fetchProject.rejected, (s, { payload }) => { s.isDetailLoading = false; s.error = payload as string; })

      .addCase(createProject.fulfilled, (s, { payload }) => { s.projects.unshift(payload); })

      .addCase(updateProject.fulfilled, (s, { payload }) => {
        const idx = s.projects.findIndex((p) => p.id === payload.id);
        if (idx !== -1) s.projects[idx] = payload;
        if (s.currentProject?.id === payload.id) {
          s.currentProject = { ...s.currentProject, ...payload };
        }
      })

      .addCase(deleteProject.fulfilled, (s, { payload }) => {
        s.projects = s.projects.filter((p) => p.id !== payload);
        if (s.currentProject?.id === payload) s.currentProject = null;
      });
  },
});

export const { clearCurrentProject, clearError } = projectSlice.actions;
export default projectSlice.reducer;
