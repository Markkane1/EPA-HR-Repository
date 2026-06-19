import React from 'react';

export const Pagination = ({ 
  currentPage, 
  totalItems, 
  itemsPerPage, 
  onPageChange 
}: { 
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  if (totalPages <= 1) return null;

  // Build page number list with ellipsis
  const pages: (number | '...')[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (currentPage > 3) pages.push('...');
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      pages.push(i);
    }
    if (currentPage < totalPages - 2) pages.push('...');
    pages.push(totalPages);
  }

  const start = (currentPage - 1) * itemsPerPage + 1;
  const end = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between mt-4">
      <div className="mb-4 sm:mb-0 text-sm text-[#858796]">
        Showing <strong className="text-[#5a5c69] font-bold">{start}</strong> to <strong className="text-[#5a5c69] font-bold">{end}</strong> of{' '}
        <strong className="text-[#5a5c69] font-bold">{totalItems}</strong> entries
      </div>

      <ul className="flex items-center m-0 p-0 list-none text-sm">
        <li className={`${currentPage === 1 ? 'opacity-50 pointer-events-none' : ''}`}>
          <button 
            className="px-3 py-1.5 border border-[#e3e6f0] text-[#4e73df] bg-white hover:bg-gray-100 transition-colors rounded-l-md outline-none"
            onClick={() => onPageChange(currentPage - 1)}
          >
            Previous
          </button>
        </li>

        {pages.map((p, i) =>
          p === '...' ? (
            <li key={`ellipsis-${i}`} className="opacity-50 pointer-events-none">
              <span className="px-3 py-1.5 border border-[#e3e6f0] border-l-0 text-[#858796] bg-white block">…</span>
            </li>
          ) : (
            <li key={p}>
              <button 
                className={`px-3 py-1.5 border border-[#e3e6f0] border-l-0 transition-colors outline-none ${
                  currentPage === p 
                    ? 'bg-[#4e73df] text-white' 
                    : 'bg-white text-[#4e73df] hover:bg-gray-100'
                }`}
                onClick={() => onPageChange(p as number)}
              >
                {p}
              </button>
            </li>
          )
        )}

        <li className={`${currentPage === totalPages ? 'opacity-50 pointer-events-none' : ''}`}>
          <button 
            className="px-3 py-1.5 border border-[#e3e6f0] border-l-0 text-[#4e73df] bg-white hover:bg-gray-100 transition-colors rounded-r-md outline-none"
            onClick={() => onPageChange(currentPage + 1)}
          >
            Next
          </button>
        </li>
      </ul>
    </div>
  );
};
