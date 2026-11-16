import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { Boxes, Sun, Moon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AuthLayout({ children }) {
  const { darkMode, toggleDarkMode } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
      {/* Top Bar with Dark Mode Toggle & Home Link */}
      <div className="absolute top-4 right-4 flex items-center gap-2">
        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
          title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link to="/" className="flex items-center justify-center gap-2.5 mb-6 group">
          <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/25 group-hover:scale-105 transition-transform">
            <Boxes className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-slate-100">
              NIT ELECTRONICS
            </span>
            <span className="text-[10px] text-blue-600 dark:text-blue-400 font-mono tracking-wider font-semibold">
              STORE & MANAGEMENT
            </span>
          </div>
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-slate-900 py-8 px-6 shadow-xl shadow-slate-200/50 dark:shadow-none sm:rounded-2xl border border-slate-200 dark:border-slate-800 sm:px-10">
          {children || <Outlet />}
        </div>
      </div>
    </div>
  );
}

