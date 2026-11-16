import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({
  currentPage = 0,
  totalPages = 1,
  totalElements = 0,
  pageSize = 10,
  onPageChange,
}) {
  if (totalPages <= 1 && totalElements <= pageSize) return null;

  const startIdx = currentPage * pageSize + 1;
  const endIdx = Math.min((currentPage + 1) * pageSize, totalElements);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500">
      <div>
        Showing <span className="font-semibold text-slate-700 dark:text-slate-200">{startIdx}</span> to{' '}
        <span className="font-semibold text-slate-700 dark:text-slate-200">{endIdx}</span> of{' '}
        <span className="font-semibold text-slate-700 dark:text-slate-200">{totalElements}</span> results
      </div>

      <div className="flex items-center gap-1.5">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 0}
          className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          title="Previous Page"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {Array.from({ length: totalPages }).map((_, idx) => {
          // Display up to 5 surrounding pages
          if (
            idx === 0 ||
            idx === totalPages - 1 ||
            (idx >= currentPage - 1 && idx <= currentPage + 1)
          ) {
            const isActive = idx === currentPage;
            return (
              <button
                key={idx}
                onClick={() => onPageChange(idx)}
                className={`w-8 h-8 rounded-lg font-medium text-xs transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white font-semibold shadow-sm'
                    : 'border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                {idx + 1}
              </button>
            );
          }
          if (idx === currentPage - 2 || idx === currentPage + 2) {
            return (
              <span key={idx} className="px-1 text-slate-400">
                ...
              </span>
            );
          }
          return null;
        })}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages - 1}
          className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          title="Next Page"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
