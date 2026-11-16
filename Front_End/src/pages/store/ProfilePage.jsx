import React from 'react';
import { Link } from 'react-router-dom';
import { User, Shield, Info } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function ProfilePage() {
  const { user } = useAuth();
  const profile = user?.profile || {};
  const roleNames = (user?.roles || []).map((role) => String(role).replace(/^ROLE_/, ''));

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2"><User className="w-6 h-6 text-blue-600" />Your account</h1>
      <section className="mt-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 grid sm:grid-cols-2 gap-5">
        <div><small className="text-slate-500">Email</small><p className="font-semibold">{user?.email || '—'}</p></div>
        <div><small className="text-slate-500">Phone</small><p className="font-semibold">{user?.phone || '—'}</p></div>
        <div><small className="text-slate-500">Name</small><p className="font-semibold">{[profile.firstName, profile.lastName].filter(Boolean).join(' ') || 'Not provided'}</p></div>
        <div><small className="text-slate-500">Roles</small><p className="font-semibold flex items-center gap-1"><Shield className="w-4 h-4 text-blue-600" />{roleNames.join(', ') || 'USER'}</p></div>
      </section>
      <div className="mt-5 p-4 rounded-xl bg-blue-50 dark:bg-blue-950/30 text-blue-900 dark:text-blue-200 text-sm flex gap-3"><Info className="w-5 h-5 shrink-0" /><p>The backend currently has no profile read or update endpoint. This page shows the profile data returned at login; edits are not available yet.</p></div>
      <Link className="inline-block mt-5 text-sm font-semibold text-blue-600" to="/shop">Continue shopping →</Link>
    </main>
  );
}
