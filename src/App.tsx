import { RouterProvider } from 'react-router-dom';
import { useEffect } from 'react';
import { router } from './routes';
import { useAppSelector } from './hooks/useAppDispatch';

function DarkModeSync() {
  const darkMode = useAppSelector((s) => s.ui.darkMode);
  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);
  return null;
}

export function App() {
  return (
    <>
      <DarkModeSync />
      <RouterProvider router={router} />
    </>
  );
}
