import React from 'react';

export const Pagination = ({ 
  currentPage, 
  totalItems, 
  itemsPerPage, 
  onPageChange 
}: { 
  currentPage: number, 
  totalItems: number, 
  itemsPerPage: number, 
  onPageChange: (page: number) => void 
}) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  
  if (totalPages <= 1) return null;

  return (
    <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/30">
      <p className="text-sm text-gray-500">
        Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} entries
      </p>
      <div className="flex gap-2">
        <button 
          disabled={currentPage === 1} 
          onClick={() => onPageChange(currentPage - 1)}
          className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50 disabled:opacity-50 bg-white"
        >
          Previous
        </button>
        <button 
          disabled={currentPage === totalPages} 
          onClick={() => onPageChange(currentPage + 1)}
          className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50 disabled:opacity-50 bg-white"
        >
          Next
        </button>
      </div>
    </div>
  );
};
