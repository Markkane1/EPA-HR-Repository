import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useGetEmployees } from '../../application/usecases/useGetEmployees';
import { PageHeader } from '../components/shared/PageHeader';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';
import { EmptyState } from '../components/shared/EmptyState';
import { DataTable } from '../components/shared/DataTable';
import { Pagination } from '../components/shared/Pagination';
import { StatusBadge } from '../components/shared/StatusBadge';
import { BSBadge } from '../components/shared/BSBadge';
import { EmployeeModal } from '../components/employees/EmployeeModal';
import { useAuthContext } from '../contexts/AuthContext';

export const EmployeeDirectoryPage = () => {
  const { isAdmin } = useAuthContext();
  
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [page, setPage] = useState(1);

  // Items per page differs by view
  const itemsPerPage = viewMode === 'grid' ? 12 : 20;

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [bsFilter, setBsFilter] = useState('all');

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [employeeToEdit, setEmployeeToEdit] = useState<any | null>(null);

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Reset page when filters or view change
  useEffect(() => { setPage(1); }, [statusFilter, bsFilter, viewMode]);

  const { data, loading, error, mutate } = useGetEmployees({ 
    search: debouncedSearch,
    status: statusFilter !== 'all' ? statusFilter : undefined,
    basicScale: bsFilter !== 'all' ? parseInt(bsFilter) : undefined
  });

  const handleEditClick = (employee: any, e: React.MouseEvent) => {
    e.preventDefault();
    setEmployeeToEdit(employee);
    setIsModalOpen(true);
  };

  const handleAddClick = () => {
    setEmployeeToEdit(null);
    setIsModalOpen(true);
  };

  if (loading && !data?.length) return <LoadingSpinner />;
  if (error) return <EmptyState message={error.message} />;

  const allEmployees = data || [];
  const totalItems = allEmployees.length;
  const paginatedEmployees = allEmployees.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  return (
    <>
      <PageHeader 
        title="Employee Directory" 
        actionButton={
          <div className="flex items-center gap-2">
            <div className="flex shadow-sm mr-3 rounded-[0.35rem] overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-1.5 text-sm transition-colors border ${viewMode === 'grid' ? 'bg-[#4e73df] text-white border-[#4e73df]' : 'bg-white text-[#858796] border-[#e3e6f0] hover:bg-gray-50'}`}
                title="Grid View"
              >
                <i className="fas fa-th-large"></i>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1.5 text-sm transition-colors border-y border-r ${viewMode === 'list' ? 'bg-[#4e73df] text-white border-[#4e73df] border-l border-l-[#4e73df] -ml-px' : 'bg-white text-[#858796] border-[#e3e6f0] border-l-0 hover:bg-gray-50'}`}
                title="List View"
              >
                <i className="fas fa-list"></i>
              </button>
            </div>
            {isAdmin && (
              <button 
                onClick={handleAddClick} 
                className="inline-block px-3 py-1.5 text-sm font-normal text-white bg-[#4e73df] hover:bg-[#2e59d9] rounded-[0.35rem] shadow-sm transition-colors"
              >
                <i className="fas fa-user-plus fa-sm text-white/50 mr-2"></i> Add Employee
              </button>
            )}
          </div>
        }
      />

      {/* Filters Card */}
      <div className="bg-white rounded-[0.35rem] shadow-[0_0.15rem_1.75rem_0_rgba(58,59,69,0.15)] mb-6">
        <div className="p-4">
          <div className="flex flex-wrap items-center justify-between -mx-2">
            <div className="w-full md:w-1/2 px-2 mb-3 md:mb-0">
              <div className="relative flex w-full flex-wrap items-stretch">
                <div className="flex -mr-px">
                  <span className="flex items-center px-4 py-1.5 text-sm bg-gray-100 border-0 rounded-l-[0.35rem]"><i className="fas fa-search text-[#858796]"></i></span>
                </div>
                <input 
                  type="text" 
                  className="flex-auto w-[1%] bg-gray-100 border-0 rounded-r-[0.35rem] px-4 py-1.5 text-sm text-[#6e707e] outline-none focus:ring-0 focus:bg-white focus:border-[#bac8f3] focus:ring-[rgba(78,115,223,0.25)] transition-colors" 
                  placeholder="Search by Name, CNIC, or Father's Name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <div className="w-full md:w-1/2 px-2 flex items-center md:justify-end flex-wrap gap-2">
              {/* Status Filter */}
              <select
                className="w-auto h-[calc(1.5em+0.5rem+2px)] px-2 py-1 text-sm font-normal text-[#6e707e] bg-white bg-clip-padding border border-[#d1d3e2] rounded-[0.2rem] outline-none focus:border-[#bac8f3] focus:ring focus:ring-[rgba(78,115,223,0.25)] transition-colors mr-2"
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="retired">Retired</option>
                <option value="transferred">Transferred</option>
              </select>

              {/* BS Filter */}
              <div className="relative flex items-stretch w-auto mr-2">
                <div className="flex -mr-px">
                  <span className="flex items-center px-3 py-1 text-sm bg-[#eaecf4] border border-[#d1d3e2] text-[#6e707e] rounded-l-[0.2rem]">BS</span>
                </div>
                <select
                  className="flex-auto w-[1%] h-[calc(1.5em+0.5rem+2px)] px-2 py-1 text-sm font-normal text-[#6e707e] bg-white bg-clip-padding border border-[#d1d3e2] rounded-r-[0.2rem] outline-none focus:border-[#bac8f3] focus:ring focus:ring-[rgba(78,115,223,0.25)] transition-colors"
                  value={bsFilter}
                  onChange={(e) => { setBsFilter(e.target.value); setPage(1); }}
                >
                  <option value="all">All</option>
                  {[...Array(22)].map((_, i) => (
                    <option key={i + 1} value={i + 1}>{i + 1}</option>
                  ))}
                </select>
              </div>

              {(statusFilter !== 'all' || bsFilter !== 'all') && (
                <button
                  className="inline-block px-2 py-1 text-sm font-normal text-white bg-[#e74a3b] hover:bg-[#e02d1b] rounded-[0.2rem] transition-colors ml-2"
                  onClick={() => { setStatusFilter('all'); setBsFilter('all'); setPage(1); }}
                  title="Clear Filters"
                >
                  <i className="fas fa-times"></i>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 mb-6">
          {paginatedEmployees.map(emp => {
            const initials = emp.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase();
            return (
              <div key={emp.id} className="h-full">
                <Link to={`/employees/${emp.id}`} className="no-underline h-full block">
                  <div className="bg-white rounded-[0.35rem] shadow-sm hover:shadow-[0_0.5rem_1rem_rgba(0,0,0,0.15)] transition-shadow h-full border-b-[0.25rem] border-[#4e73df] py-2 relative group">
                    {isAdmin && (
                      <button 
                        onClick={(e) => handleEditClick(emp, e)}
                        className="inline-block px-2 py-1 text-sm bg-white hover:bg-gray-100 text-[#4e73df] rounded shadow-sm transition-colors absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 focus:opacity-100"
                        title="Edit Employee"
                      >
                        <i className="fas fa-edit text-[#4e73df]"></i>
                      </button>
                    )}
                    <div className="p-5 text-center">
                      <div className="w-16 h-16 rounded-full bg-[#4e73df] text-white shadow-sm flex items-center justify-center text-2xl font-bold mx-auto mb-3">
                        {initials}
                      </div>
                      <h5 className="font-bold text-gray-900 truncate" title={emp.name}>{emp.name}</h5>
                      <p className="text-xs text-[#858796] mb-3">{emp.cnic}</p>
                      
                      <div className="mb-3 flex justify-center items-center gap-1">
                        <BSBadge bs={emp.basicScale || 0} />
                        <StatusBadge status={emp.status} />
                      </div>

                      <hr className="my-4 border-[#e3e6f0]" />
                      <div className="text-left text-xs text-gray-800">
                        <div className="mb-2 truncate">
                          <i className="fas fa-briefcase w-4 text-center text-gray-400 mr-1"></i>
                          {emp.currentOffice?.name || 'Unassigned'}
                        </div>
                        {emp.contactNumber && (
                          <div className="truncate">
                            <i className="fas fa-phone w-4 text-center text-gray-400 mr-1"></i>
                            {emp.contactNumber}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-[0.35rem] shadow-[0_0.15rem_1.75rem_0_rgba(58,59,69,0.15)] mb-6">
          <div className="p-0">
            <DataTable 
              columns={[
                { key: 'name', label: 'Employee', width: '35%', render: (_, row) => (
                  <div>
                    <Link to={`/employees/${row.id}`} className="font-bold text-[#4e73df] block truncate">{row.name}</Link>
                    <div className="text-sm text-[#858796] mt-1">{row.cnic}</div>
                  </div>
                )},
                { key: 'basicScale', label: 'BS', width: '10%', render: (val) => <BSBadge bs={val || 0} /> },
                { key: 'currentOffice', label: 'Office', width: '25%', render: (_, row) => (
                  <span className="truncate block">{row.currentOffice?.name || <span className="text-[#858796] italic">Unassigned</span>}</span>
                )},
                { key: 'status', label: 'Status', width: '15%', render: (val) => <StatusBadge status={val} /> },
                { key: 'actions', label: '', width: '15%', className: 'text-right', render: (_, row) => (
                  <div className="flex justify-end items-center">
                    {isAdmin && (
                      <button 
                        onClick={(e) => handleEditClick(row, e)}
                        className="inline-block px-2 py-1 text-sm bg-[#f8f9fc] hover:bg-[#e2e6ea] text-[#4e73df] rounded transition-colors mr-2"
                        title="Edit Employee"
                      >
                        <i className="fas fa-edit text-[#4e73df]"></i>
                      </button>
                    )}
                    <Link to={`/employees/${row.id}`} className="inline-block px-2 py-1 text-sm font-normal text-[#4e73df] border border-[#4e73df] hover:bg-[#4e73df] hover:text-white rounded-[0.35rem] transition-colors">View</Link>
                  </div>
                )}
              ]}
              data={paginatedEmployees}
              pagination={false}
            />
          </div>
        </div>
      )}

      {/* Unified Pagination */}
      {totalItems > 0 && (
        <div className="bg-white rounded-[0.35rem] shadow-sm mb-6">
          <div className="p-4 py-2">
            <Pagination
              currentPage={page}
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
              onPageChange={setPage}
            />
          </div>
        </div>
      )}

      {isAdmin && (
        <EmployeeModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          employeeToEdit={employeeToEdit}
          onSuccess={mutate}
        />
      )}
    </>
  );
};
