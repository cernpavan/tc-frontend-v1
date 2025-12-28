import { memo, useMemo } from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import clsx from 'clsx';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
  showPageInfo?: boolean;
  totalItems?: number;
  itemsPerPage?: number;
}

// Generate page numbers to display with ellipsis
function getPageNumbers(currentPage: number, totalPages: number): (number | 'ellipsis')[] {
  const pages: (number | 'ellipsis')[] = [];

  if (totalPages <= 7) {
    // Show all pages if 7 or less
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
  } else {
    // Always show first page
    pages.push(1);

    if (currentPage <= 3) {
      // Near start: 1 2 3 4 ... last
      pages.push(2, 3, 4, 'ellipsis', totalPages);
    } else if (currentPage >= totalPages - 2) {
      // Near end: 1 ... n-3 n-2 n-1 n
      pages.push('ellipsis', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
    } else {
      // Middle: 1 ... prev curr next ... last
      pages.push('ellipsis', currentPage - 1, currentPage, currentPage + 1, 'ellipsis', totalPages);
    }
  }

  return pages;
}

const Pagination = memo(function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  isLoading = false,
  showPageInfo = true,
  totalItems,
  itemsPerPage = 15,
}: PaginationProps) {
  const pageNumbers = useMemo(
    () => getPageNumbers(currentPage, totalPages),
    [currentPage, totalPages]
  );

  // Don't show pagination if only 1 page
  if (totalPages <= 1) return null;

  const canGoPrev = currentPage > 1;
  const canGoNext = currentPage < totalPages;

  // Calculate item range for display
  const startItem = totalItems ? (currentPage - 1) * itemsPerPage + 1 : null;
  const endItem = totalItems ? Math.min(currentPage * itemsPerPage, totalItems) : null;

  return (
    <div className="flex flex-col items-center gap-3 py-4">
      {/* Page info */}
      {showPageInfo && totalItems && startItem && endItem && (
        <p className="text-sm text-dark-400">
          Showing <span className="font-medium text-dark-200">{startItem}</span> -{' '}
          <span className="font-medium text-dark-200">{endItem}</span> of{' '}
          <span className="font-medium text-dark-200">{totalItems}</span> confessions
        </p>
      )}

      {/* Pagination controls */}
      <nav
        className="flex items-center gap-1 sm:gap-1.5"
        role="navigation"
        aria-label="Pagination"
      >
        {/* First page button (desktop only) */}
        <button
          onClick={() => onPageChange(1)}
          disabled={!canGoPrev || isLoading}
          className={clsx(
            'hidden sm:flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-200',
            canGoPrev && !isLoading
              ? 'text-dark-300 hover:text-white hover:bg-dark-700 active:scale-95'
              : 'text-dark-600 cursor-not-allowed'
          )}
          aria-label="Go to first page"
          title="First page"
        >
          <ChevronsLeft size={18} />
        </button>

        {/* Previous button */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={!canGoPrev || isLoading}
          className={clsx(
            'flex items-center justify-center px-2 sm:px-3 h-9 rounded-lg gap-1 transition-all duration-200',
            canGoPrev && !isLoading
              ? 'text-dark-300 hover:text-white hover:bg-dark-700 active:scale-95'
              : 'text-dark-600 cursor-not-allowed'
          )}
          aria-label="Go to previous page"
        >
          <ChevronLeft size={18} />
          <span className="hidden sm:inline text-sm font-medium">Prev</span>
        </button>

        {/* Page numbers */}
        <div className="flex items-center gap-0.5 sm:gap-1">
          {pageNumbers.map((page, index) =>
            page === 'ellipsis' ? (
              <span
                key={`ellipsis-${index}`}
                className="w-8 h-9 flex items-center justify-center text-dark-500"
                aria-hidden="true"
              >
                ...
              </span>
            ) : (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                disabled={page === currentPage || isLoading}
                className={clsx(
                  'min-w-[36px] h-9 px-2 rounded-lg text-sm font-medium transition-all duration-200',
                  page === currentPage
                    ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/25'
                    : 'text-dark-300 hover:text-white hover:bg-dark-700 active:scale-95'
                )}
                aria-label={`Page ${page}`}
                aria-current={page === currentPage ? 'page' : undefined}
              >
                {page}
              </button>
            )
          )}
        </div>

        {/* Next button */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!canGoNext || isLoading}
          className={clsx(
            'flex items-center justify-center px-2 sm:px-3 h-9 rounded-lg gap-1 transition-all duration-200',
            canGoNext && !isLoading
              ? 'text-dark-300 hover:text-white hover:bg-dark-700 active:scale-95'
              : 'text-dark-600 cursor-not-allowed'
          )}
          aria-label="Go to next page"
        >
          <span className="hidden sm:inline text-sm font-medium">Next</span>
          <ChevronRight size={18} />
        </button>

        {/* Last page button (desktop only) */}
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={!canGoNext || isLoading}
          className={clsx(
            'hidden sm:flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-200',
            canGoNext && !isLoading
              ? 'text-dark-300 hover:text-white hover:bg-dark-700 active:scale-95'
              : 'text-dark-600 cursor-not-allowed'
          )}
          aria-label="Go to last page"
          title="Last page"
        >
          <ChevronsRight size={18} />
        </button>
      </nav>
    </div>
  );
});

export default Pagination;
