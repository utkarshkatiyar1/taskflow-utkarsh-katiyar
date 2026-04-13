import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { authApi } from '../api/auth';
import { setToken, setStoredUser, clearAuth, getToken, getStoredUser } from '../utils/storage';
import type { User, LoginCredentials, RegisterCredentials } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
}

function loadInitialState(): AuthState {
  const token = getToken();
  const raw = getStoredUser();
  const user: User | null = raw ? (JSON.parse(raw) as User) : null;
  return { user, token, isLoading: false, error: null };
}

export const loginUser = createAsyncThunk('auth/login', async (creds: LoginCredentials, { rejectWithValue }) => {
  try {
    const data = await authApi.login(creds);
    return data;
  } catch (err: unknown) {
    const msg = extractMsg(err);
    return rejectWithValue(msg);
  }
});

export const registerUser = createAsyncThunk('auth/register', async (creds: RegisterCredentials, { rejectWithValue }) => {
  try {
    const data = await authApi.register(creds);
    return data;
  } catch (err: unknown) {
    const msg = extractMsg(err);
    return rejectWithValue(msg);
  }
});

function extractMsg(err: unknown): string {
  if (err && typeof err === 'object') {
    // Axios error with a server response
    if ('response' in err) {
      const ax = err as { response?: { data?: { error?: string; fields?: Record<string, string> }; status?: number } };
      if (ax.response?.data?.fields) return Object.values(ax.response.data.fields).filter(Boolean).join(', ');
      if (ax.response?.data?.error) return ax.response.data.error;
      if (ax.response?.status === 401) return 'Invalid email or password';
    }
    // Axios network error (no response — server not reachable)
    if ('message' in err) {
      const msg = (err as { message: string }).message;
      if (msg === 'Network Error' || msg.includes('ECONNREFUSED')) {
        return 'Cannot reach the server. Run: node mock-server.mjs';
      }
      return msg;
    }
  }
  return 'Authentication failed';
}

const authSlice = createSlice({
  name: 'auth',
  initialState: loadInitialState(),
  reducers: {
    logout(state) {
      state.user = null;
      state.token = null;
      state.error = null;
      clearAuth();
    },
    clearError(state) {
      state.error = null;
    },
    setCredentials(state, action: PayloadAction<{ user: User; token: string }>) {
      state.user = action.payload.user;
      state.token = action.payload.token;
      setToken(action.payload.token);
      setStoredUser(action.payload.user);
    },
  },
  extraReducers: (builder) => {
    const pending = (state: AuthState) => { state.isLoading = true; state.error = null; };
    const rejected = (state: AuthState, action: { payload?: unknown }) => {
      state.isLoading = false;
      state.error = (action.payload as string) ?? 'Unknown error';
    };

    builder
      .addCase(loginUser.pending, pending)
      .addCase(loginUser.fulfilled, (state, { payload }) => {
        state.isLoading = false;
        state.user = payload.user;
        state.token = payload.token;
        setToken(payload.token);
        setStoredUser(payload.user);
      })
      .addCase(loginUser.rejected, rejected)
      .addCase(registerUser.pending, pending)
      .addCase(registerUser.fulfilled, (state, { payload }) => {
        state.isLoading = false;
        state.user = payload.user;
        state.token = payload.token;
        setToken(payload.token);
        setStoredUser(payload.user);
      })
      .addCase(registerUser.rejected, rejected);
  },
});

export const { logout, clearError, setCredentials } = authSlice.actions;
export default authSlice.reducer;
