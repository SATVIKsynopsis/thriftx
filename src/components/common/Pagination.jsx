"use client";
import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTheme } from "next-themes"; // ✅ allows dynamic theme detection

const Pagination = ({ paginationInfo, onPageChange, forceLight = false }) => {
  const { theme, systemTheme } = useTheme();
  const currentTheme = forceLight ? "light" : theme === "system" ? systemTheme : theme;

  if (paginationInfo.totalPages <= 1) return null;

  const renderPageNumbers = () => {
    const { totalPages, currentPage } = paginationInfo;
    const pages = [];

    if (totalPages > 0) pages.push(1);
    if (currentPage > 4) pages.push("...");

    const startPage = Math.max(2, currentPage - 1);
    const endPage = Math.min(totalPages - 1, currentPage + 1);

    for (let i = startPage; i <= endPage; i++) {
      if (!pages.includes(i)) pages.push(i);
    }

    if (currentPage < totalPages - 3) pages.push("...");
    if (totalPages > 1 && !pages.includes(totalPages)) pages.push(totalPages);

    return pages.map((page, index) => {
      const isActive = page === currentPage;
      const isEllipsis = page === "...";

      const baseClasses =
        "w-10 h-10 rounded-lg text-sm font-medium transition-colors duration-200";

      const themeClasses =
        currentTheme === "dark"
          ? isActive
            ? "bg-white text-black"
            : isEllipsis
            ? "text-gray-400 cursor-default"
            : "text-gray-300 hover:bg-gray-800"
          : isActive
          ? "bg-black text-white"
          : isEllipsis
          ? "text-gray-500 cursor-default"
          : "text-gray-600 hover:bg-gray-200";

      return (
        <button
          key={index}
          onClick={() => typeof page === "number" && onPageChange(page)}
          disabled={isEllipsis}
          aria-label={typeof page === "number" ? `Go to page ${page}` : undefined}
          aria-current={isActive ? "page" : undefined}
          className={`${baseClasses} ${themeClasses}`}
        >
          {page}
        </button>
      );
    });
  };

  return (
    <div
      className={`flex flex-col sm:flex-row items-center justify-between p-4 lg:p-6 border-t gap-4
      ${
        currentTheme === "dark"
          ? "border-gray-800 bg-black text-white"
          : "border-gray-200 bg-white text-black"
      }`}
    >
      {/* Previous Button */}
      <button
        onClick={() =>
          onPageChange(Math.max(1, paginationInfo.currentPage - 1))
        }
        disabled={paginationInfo.currentPage === 1}
        className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto justify-center
          ${
            currentTheme === "dark"
              ? "border-gray-700 hover:bg-gray-800"
              : "border-gray-300 hover:bg-gray-200"
          }`}
        aria-label="Previous page"
      >
        <ChevronLeft className="w-4 h-4" />
        <span className="text-sm">Previous</span>
      </button>

      {/* Page Numbers */}
      <div className="flex items-center gap-2 flex-wrap justify-center">
        {renderPageNumbers()}
      </div>

      {/* Next Button */}
      <button
        onClick={() =>
          onPageChange(
            Math.min(
              paginationInfo.totalPages,
              paginationInfo.currentPage + 1
            )
          )
        }
        disabled={paginationInfo.currentPage === paginationInfo.totalPages}
        className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto justify-center
          ${
            currentTheme === "dark"
              ? "border-gray-700 hover:bg-gray-800"
              : "border-gray-300 hover:bg-gray-200"
          }`}
        aria-label="Next page"
      >
        <span className="text-sm">Next</span>
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
};

export default Pagination;
