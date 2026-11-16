import { useEffect, useMemo, useState } from 'react';
import { AlertCircle, Search, Users } from 'lucide-react';
import axiosInstance from '../../api/axiosInstance';

const displayName = (user) => {
  const name = [user.profile?.firstName, user.profile?.lastName].filter(Boolean).join(' ').trim();
  return name || '—';
};

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    axiosInstance.get('/user')
      .then((response) => {
        const list = Array.isArray(response) ? response : response?.list;
        if (!Array.isArray(list)) throw new Error('The server returned an unexpected user list.');
        if (active) setUsers(list);
      })
      .catch((err) => {
        if (active) setError(err.message || 'Unable to load users.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, []);

  const filteredUsers = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return users;
    return users.filter((user) => [
      user.id,
      displayName(user),
      user.email,
      user.phone,
      ...(user.roles || []),
    ].some((value) => String(value ?? '').toLowerCase().includes(term)));
  }, [query, users]);

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Users</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {loading ? 'Loading accounts…' : `${filteredUsers.length} of ${users.length} users`}
          </p>
        </div>
        <label className="relative block w-full sm:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search users"
            className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          />
        </label>
      </div>

      {error ? (
        <div role="alert" className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/30 dark:text-red-200">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <div><p className="font-semibold">Could not load users</p><p className="mt-1">{error}</p></div>
        </div>
      ) : loading ? (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">Loading users…</div>
      ) : filteredUsers.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white px-6 py-12 text-center dark:border-slate-800 dark:bg-slate-900">
          <Users className="mx-auto h-8 w-8 text-slate-400" />
          <p className="mt-3 font-medium text-slate-800 dark:text-white">{users.length ? 'No users match your search' : 'No users found'}</p>
          {query && <button className="mt-2 text-sm font-medium text-blue-600" onClick={() => setQuery('')}>Clear search</button>}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <table className="min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-800">
            <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:bg-slate-800/60 dark:text-slate-400">
              <tr>
                <th className="px-5 py-3">User</th>
                <th className="px-5 py-3">Contact</th>
                <th className="px-5 py-3">Roles</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="text-slate-700 dark:text-slate-300">
                  <td className="whitespace-nowrap px-5 py-4">
                    <p className="font-medium text-slate-900 dark:text-white">{displayName(user)}</p>
                    <p className="mt-0.5 text-xs text-slate-500">ID {user.id}</p>
                  </td>
                  <td className="px-5 py-4">
                    <p>{user.email || '—'}</p>
                    {user.phone && <p className="mt-0.5 text-xs text-slate-500">{user.phone}</p>}
                  </td>
                  <td className="px-5 py-4">{user.roles?.length ? user.roles.map((role) => String(role).replace(/^ROLE_/, '')).join(', ') : '—'}</td>
                  <td className="px-5 py-4">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${user.active ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}`}>
                      {user.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-5 py-4">{user.createAt ? new Date(user.createAt).toLocaleDateString() : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
