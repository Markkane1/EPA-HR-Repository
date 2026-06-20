import React, { useState, useEffect } from 'react';
import { Pagination } from './Pagination';

export interface TableColumn {
  key: string;
  label: string;
  width?: string;
  className?: string;
  render?: (val: any, row: any) => React.ReactNode;
}

export const DataTable = ({ 
  columns, 
  data,
  pagination = false,
  itemsPerPage = 10
}: { 
  columns: TableColumn[];
  data: any[];
  pagination?: boolean;
  itemsPerPage?: number;
}) => {
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [data.length]);

  const displayData = pagination 
    ? data.slice((page - 1) * itemsPerPage, page * itemsPerPage)
    : data;

  return (
    <div className="w-full">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px] border-collapse text-[#858796] border border-[#e3e6f0]" style={{ tableLayout: 'fixed' }}>
          <colgroup>
            {columns.map(col => (
              <col key={col.key} style={col.width ? { width: col.width } : undefined} />
            ))}
          </colgroup>
          <thead className="bg-[#f8f9fc]">
            <tr>
              {columns.map(col => (
                <th
                  key={col.key}
                  className={`border border-[#e3e6f0] p-3 text-left text-sm font-bold text-[#5a5c69] ${col.className || ''}`}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="text-center text-gray-500 py-6 border border-[#e3e6f0]">
                  No records found.
                </td>
              </tr>
            ) : (
              displayData.map((row, i) => (
                <tr key={row.id || i} className="hover:bg-gray-50 transition-colors">
                  {columns.map(col => (
                    <td
                      key={col.key}
                      className={`border border-[#e3e6f0] p-3 text-sm ${col.className || ''}`}
                    >
                      {col.render ? col.render(row[col.key], row) : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
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
