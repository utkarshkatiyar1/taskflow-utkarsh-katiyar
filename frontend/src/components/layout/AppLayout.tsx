import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { ToastContainer } from '../ui/Toast';

export function AppLayout() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Navbar />
      <main className="max-w-screen-xl mx-auto px-4 sm:px-6 py-6">
        <Outlet />
      </main>
      <ToastContainer />
    </div>
  );
}
