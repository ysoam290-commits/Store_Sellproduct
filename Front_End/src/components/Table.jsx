import React from 'react';
import Spinner from './Spinner';
import EmptyState from './EmptyState';

export default function Table({
  columns = [],
  data = [],
  loading = false,
  emptyTitle = 'No data available',
  emptyDescription = 'There are no records to display.',
  onEmptyAction,
  emptyActionLabel,
  keyExtractor = (item, index) => item.id || index,
  className = '',
}) {
  if (loading) {
    return (
      <div className="w-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 flex flex-col items-center justify-center min-h-[300px]">
        <Spinner size="lg" />
        <p className="mt-3 text-xs font-medium text-slate-500 dark:text-slate-400">
          Loading data...
        </p>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <EmptyState
        title={emptyTitle}
        description={emptyDescription}
        actionLabel={emptyActionLabel}
        onAction={onEmptyAction}
        className="my-4"
      />
    );
  }

  return (
    <div
      className={`w-full overflow-hidden bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm ${className}`}
    >
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-900/60 text-slate-500 dark:text-slate-400 uppercase text-[10px] font-bold tracking-wider">
              {columns.map((col, idx) => (
                <th
                  key={col.key || idx}
                  className={`px-4 sm:px-6 py-3.5 ${col.headerClassName || ''}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {data.map((item, rowIndex) => (
              <tr
                key={keyExtractor(item, rowIndex)}
                className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
              >
                {columns.map((col, colIndex) => (
                  <td
                    key={col.key || colIndex}
                    className={`px-4 sm:px-6 py-3.5 text-slate-700 dark:text-slate-200 align-middle ${
                      col.className || ''
                    }`}
                  >
                    {col.render ? col.render(item, rowIndex) : item[col.accessor]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

