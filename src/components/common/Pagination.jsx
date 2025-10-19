import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({ paginationInfo, onPageChange }) => {
  if (paginationInfo.totalPages <= 1) {
    return null;
  }

  const renderPageNumbers = () => {
    const { totalPages, currentPage } = paginationInfo;
    const pages = [];

    if (totalPages > 0) pages.push(1);
    if (currentPage > 4) pages.push('...');

    const startPage = Math.max(2, currentPage - 1);
    const endPage = Math.min(totalPages - 1, currentPage + 1);

    for (let i = startPage; i <= endPage; i++) {
      if (!pages.includes(i)) pages.push(i);
    }

    if (currentPage < totalPages - 3) pages.push('...');
    if (totalPages > 1 && !pages.includes(totalPages)) pages.push(totalPages);

    return pages.map((page, index) => (
      <button
        key={index}
        onClick={() => typeof page === 'number' && onPageChange(page)}
        disabled={page === '...'}
        aria-label={typeof page === 'number' ? `Go to page ${page}` : undefined}
        aria-current={page === currentPage ? 'page' : undefined}
        className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
          page === currentPage
            ? 'bg-gray-800 text-white'
            : page === '...'
            ? 'text-gray-500 cursor-default'
            : 'text-gray-400 hover:bg-gray-900'
        }`}
      >
        {page}
      </button>
    ));
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between p-4 lg:p-6 border-t border-gray-800 gap-4">
      <button
        onClick={() => onPageChange(Math.max(1, paginationInfo.currentPage - 1))}
        disabled={paginationInfo.currentPage === 1}
        className="flex items-center gap-2 px-4 py-2 border border-gray-700 rounded-lg hover:bg-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto justify-center"
        aria-label="Previous page"
      >
        <ChevronLeft className="w-4 h-4" />
        <span className="text-sm">Previous</span>
      </button>

      <div className="flex items-center gap-2 flex-wrap justify-center">
        {renderPageNumbers()}
      </div>

      <button
        onClick={() => onPageChange(Math.min(paginationInfo.totalPages, paginationInfo.currentPage + 1))}
        disabled={paginationInfo.currentPage === paginationInfo.totalPages}
        className="flex items-center gap-2 px-4 py-2 border border-gray-700 rounded-lg hover:bg-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto justify-center"
        aria-label="Next page"
      >
        <span className="text-sm">Next</span>
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
};

export default Pagination;
