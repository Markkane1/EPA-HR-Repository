import React, { useState, useEffect } from 'react';
import { Pagination } from './Pagination';

export const DataTable = ({ 
  columns, 
  data,
  pagination = false,
  itemsPerPage = 10
}: { 
  columns: { key: string, label: string, render?: (val: any, row: any) => React.ReactNode }[], 
  data: any[],
  pagination?: boolean,
  itemsPerPage?: number
}) => {
  const [page, setPage] = useState(1);

  // Reset page when data changes significantly
  useEffect(() => {
    setPage(1);
  }, [data.length]);

  const displayData = pagination 
    ? data.slice((page - 1) * itemsPerPage, page * itemsPerPage)
    : data;

  return (
  <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm bg-white">
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gray-50/80">
        <tr>
          {columns.map(col => (
            <th key={col.key} className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">{col.label}</th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200">
        {data.length === 0 ? (
          <tr>
            <td colSpan={columns.length} className="px-6 py-12 text-center text-sm text-gray-500">
              No records found.
            </td>
          </tr>
        ) : (
          displayData.map((row, i) => (
            <tr key={row.id || i} className="hover:bg-gray-50/50 transition-colors">
              {columns.map(col => (
                <td key={col.key} className="whitespace-nowrap py-4 pl-4 pr-3 text-sm text-gray-600 sm:pl-6">
                  {col.render ? col.render(row[col.key], row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))
        )}
      </tbody>
    </table>
    {pagination && (
      <Pagination 
        currentPage={page} 
        totalItems={data.length} 
        itemsPerPage={itemsPerPage} 
        onPageChange={setPage} 
      />
    )}
  </div>
  );
};
