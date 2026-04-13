import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { tasksApi } from '../api/tasks';
import { extractErrorMessage } from '../api/client';
import type { Task, CreateTaskPayload, UpdateTaskPayload, TaskStatus } from '../types';

interface TaskState {
  tasks: Task[];
  isLoading: boolean;
  error: string | null;
}

const initialState: TaskState = { tasks: [], isLoading: false, error: null };

export const fetchTasks = createAsyncThunk(
  'tasks/fetchAll',
  async (projectId: string, { rejectWithValue }) => {
    try { return await tasksApi.list(projectId); }
    catch (err) { return rejectWithValue(extractErrorMessage(err)); }
  },
);

export const createTask = createAsyncThunk(
  'tasks/create',
  async ({ projectId, payload }: { projectId: string; payload: CreateTaskPayload }, { rejectWithValue }) => {
    try { return await tasksApi.create(projectId, payload); }
    catch (err) { return rejectWithValue(extractErrorMessage(err)); }
  },
);

export const updateTask = createAsyncThunk(
  'tasks/update',
  async ({ taskId, payload }: { taskId: string; payload: UpdateTaskPayload }, { rejectWithValue }) => {
    try { return await tasksApi.update(taskId, payload); }
    catch (err) { return rejectWithValue(extractErrorMessage(err)); }
  },
);

export const deleteTask = createAsyncThunk(
  'tasks/delete',
  async (taskId: string, { rejectWithValue }) => {
    try { await tasksApi.delete(taskId); return taskId; }
    catch (err) { return rejectWithValue(extractErrorMessage(err)); }
  },
);

const taskSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    setTasks(state, action: PayloadAction<Task[]>) {
      state.tasks = action.payload;
    },
    optimisticStatusUpdate(state, action: PayloadAction<{ taskId: string; status: TaskStatus }>) {
      const task = state.tasks.find((t) => t.id === action.payload.taskId);
      if (task) task.status = action.payload.status;
    },
    revertTaskStatus(state, action: PayloadAction<{ taskId: string; status: TaskStatus }>) {
      const task = state.tasks.find((t) => t.id === action.payload.taskId);
      if (task) task.status = action.payload.status;
    },
    clearTasks(state) { state.tasks = []; },
    clearError(state) { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTasks.pending, (s) => { s.isLoading = true; s.error = null; })
      .addCase(fetchTasks.fulfilled, (s, { payload }) => { s.isLoading = false; s.tasks = payload; })
      .addCase(fetchTasks.rejected, (s, { payload }) => { s.isLoading = false; s.error = payload as string; })

      .addCase(createTask.fulfilled, (s, { payload }) => { s.tasks.push(payload); })

      .addCase(updateTask.fulfilled, (s, { payload }) => {
        const idx = s.tasks.findIndex((t) => t.id === payload.id);
        if (idx !== -1) s.tasks[idx] = payload;
      })
      .addCase(updateTask.rejected, (s, { payload }) => { s.error = payload as string; })

      .addCase(deleteTask.fulfilled, (s, { payload }) => {
        s.tasks = s.tasks.filter((t) => t.id !== payload);
      });
  },
});

export const { setTasks, optimisticStatusUpdate, revertTaskStatus, clearTasks, clearError } = taskSlice.actions;
export default taskSlice.reducer;
