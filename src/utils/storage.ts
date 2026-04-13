const TOKEN_KEY = 'taskflow_token';
const USER_KEY = 'taskflow_user';

export const getToken = (): string | null => localStorage.getItem(TOKEN_KEY);

export const setToken = (token: string): void => localStorage.setItem(TOKEN_KEY, token);

export const getStoredUser = (): string | null => localStorage.getItem(USER_KEY);

export const setStoredUser = (user: object): void =>
  localStorage.setItem(USER_KEY, JSON.stringify(user));

export const clearAuth = (): void => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

export const getDarkMode = (): boolean => localStorage.getItem('taskflow_dark') === 'true';

export const setDarkMode = (value: boolean): void =>
  localStorage.setItem('taskflow_dark', String(value));
