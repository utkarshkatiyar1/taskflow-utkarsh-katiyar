import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { getDarkMode, setDarkMode } from '../utils/storage';
import type { ToastItem } from '../types';

interface UIState {
  toasts: ToastItem[];
  darkMode: boolean;
}

const initialState: UIState = {
  toasts: [],
  darkMode: getDarkMode(),
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    addToast(state, action: PayloadAction<ToastItem>) {
      state.toasts.push(action.payload);
    },
    removeToast(state, action: PayloadAction<string>) {
      state.toasts = state.toasts.filter((t) => t.id !== action.payload);
    },
    toggleDarkMode(state) {
      state.darkMode = !state.darkMode;
      setDarkMode(state.darkMode);
    },
  },
});

export const { addToast, removeToast, toggleDarkMode } = uiSlice.actions;
export default uiSlice.reducer;
