import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

export default function Pagination({
  currentPage = 1,
  totalPages = 1,
  totalElements,
  pageSize = 10,
  onPageChange,
  zeroIndexed = false,
  className = '',
}) {
  // Normalize to 1-indexed for internal calculations and UI display
  const activePage = zeroIndexed ? currentPage + 1 : currentPage;
  const countPages = Math.max(1, totalPages || 1);

  if (countPages <= 1 && (!totalElements || totalElements <= pageSize)) {
    return null;
  }

  const handlePage = (page) => {
    if (page < 1 || page > countPages) return;
    onPageChange(zeroIndexed ? page - 1 : page);
  };

  // Generate visible page numbers
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, activePage - Math.floor(maxVisible / 2));
    let end = Math.min(countPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div
      className={`flex flex-col sm:flex-row items-center justify-between gap-4 py-3 px-2 text-xs text-slate-500 dark:text-slate-400 ${className}`}
    >
      {/* Items Count Summary */}
      <div className="font-medium">
        {totalElements !== undefined ? (
          <span>
            Showing{' '}
            <strong className="text-slate-700 dark:text-slate-200">
              {totalElements === 0 ? 0 : (activePage - 1) * pageSize + 1}
            </strong>{' '}
            to{' '}
            <strong className="text-slate-700 dark:text-slate-200">
              {Math.min(activePage * pageSize, totalElements)}
            </strong>{' '}
            of{' '}
            <strong className="text-slate-700 dark:text-slate-200">
              {totalElements}
            </strong>{' '}
            entries
          </span>
        ) : (
          <span>
            Page <strong className="text-slate-700 dark:text-slate-200">{activePage}</strong> of{' '}
            <strong className="text-slate-700 dark:text-slate-200">{countPages}</strong>
          </span>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => handlePage(1)}
          disabled={activePage === 1}
          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          title="First page"
          aria-label="First page"
        >
          <ChevronsLeft className="w-4 h-4" />
        </button>

        <button
          onClick={() => handlePage(activePage - 1)}
          disabled={activePage === 1}
          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          title="Previous page"
          aria-label="Previous page"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {getPageNumbers().map((page) => (
          <button
            key={page}
            onClick={() => handlePage(page)}
            className={`min-w-[32px] h-8 px-2 text-xs font-semibold rounded-lg transition-all ${
              activePage === page
                ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {page}
          </button>
        ))}

        <button
          onClick={() => handlePage(activePage + 1)}
          disabled={activePage === countPages}
          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          title="Next page"
          aria-label="Next page"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        <button
          onClick={() => handlePage(countPages)}
          disabled={activePage === countPages}
          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          title="Last page"
          aria-label="Last page"
        >
          <ChevronsRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

