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
import { UserPlus, Search, Edit, LayoutGrid, List, User, Briefcase, Phone, Filter } from 'lucide-react';
import { EmployeeListItem } from '../../domain/entities';

export const EmployeeDirectoryPage = () => {
  const { isAdmin } = useAuthContext();
  
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [page, setPage] = useState(1);
  const itemsPerPage = 12;

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [bsFilter, setBsFilter] = useState('all');

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [employeeToEdit, setEmployeeToEdit] = useState<EmployeeListItem | null>(null);

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const { data, loading, error, mutate } = useGetEmployees({ 
    search: debouncedSearch,
    status: statusFilter !== 'all' ? statusFilter : undefined,
    basicScale: bsFilter !== 'all' ? parseInt(bsFilter) : undefined
  });

  const handleEditClick = (employee: EmployeeListItem, e: React.MouseEvent) => {
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

  const paginatedEmployees = viewMode === 'grid' && data
    ? data.slice((page - 1) * itemsPerPage, page * itemsPerPage)
    : data || [];

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Employee Directory" 
        actionButton={
          <div className="flex items-center gap-3">
            <div className="flex bg-white rounded-lg border border-gray-200 p-1 shadow-sm">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-blue-50 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                title="Grid View"
              >
                <LayoutGrid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-blue-50 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                title="List View"
              >
                <List className="w-5 h-5" />
              </button>
            </div>
            {isAdmin && (
              <button 
                onClick={handleAddClick} 
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                <UserPlus className="w-4 h-4" /> Add Employee
              </button>
            )}
          </div>
        }
      />

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search by Name, CNIC, or Father's Name..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-3 flex-wrap">
          {/* Status Filter */}
          <div className={`flex items-center gap-2 border rounded-lg px-3 py-2 transition-colors ${
            statusFilter !== 'all'
              ? 'bg-blue-50 border-blue-300 text-blue-700'
              : 'bg-gray-50 border-gray-200 text-gray-700'
          }`}>
            <Filter className={`w-4 h-4 flex-shrink-0 ${statusFilter !== 'all' ? 'text-blue-500' : 'text-gray-400'}`} />
            <select
              className="bg-transparent text-sm font-medium outline-none cursor-pointer"
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="retired">Retired</option>
              <option value="transferred">Transferred</option>
            </select>
            {statusFilter !== 'all' && (
              <button
                onClick={() => { setStatusFilter('all'); setPage(1); }}
                className="ml-1 text-blue-400 hover:text-blue-700 transition-colors leading-none"
                title="Clear status filter"
              >
                ✕
              </button>
            )}
          </div>

          {/* BS Filter */}
          <div className={`flex items-center gap-2 border rounded-lg px-3 py-2 transition-colors ${
            bsFilter !== 'all'
              ? 'bg-blue-50 border-blue-300 text-blue-700'
              : 'bg-gray-50 border-gray-200 text-gray-700'
          }`}>
            <span className="text-sm font-medium text-gray-500">BS:</span>
            <select
              className="bg-transparent text-sm font-medium outline-none cursor-pointer w-16"
              value={bsFilter}
              onChange={(e) => { setBsFilter(e.target.value); setPage(1); }}
            >
              <option value="all">All</option>
              {[...Array(22)].map((_, i) => (
                <option key={i + 1} value={i + 1}>{i + 1}</option>
              ))}
            </select>
            {bsFilter !== 'all' && (
              <button
                onClick={() => { setBsFilter('all'); setPage(1); }}
                className="ml-1 text-blue-400 hover:text-blue-700 transition-colors leading-none"
                title="Clear BS filter"
              >
                ✕
              </button>
            )}
          </div>

          {/* Active filter count badge */}
          {(statusFilter !== 'all' || bsFilter !== 'all') && (
            <span className="text-xs bg-blue-600 text-white font-semibold px-2 py-1 rounded-full">
              {[statusFilter !== 'all', bsFilter !== 'all'].filter(Boolean).length} filter{[statusFilter !== 'all', bsFilter !== 'all'].filter(Boolean).length > 1 ? 's' : ''} active
            </span>
          )}
        </div>
      </div>

      {viewMode === 'grid' ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {paginatedEmployees.map(emp => {
              const initials = emp.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
              return (
                <Link key={emp.id} to={`/employees/${emp.id}`} className="block">
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow p-6 flex flex-col h-full relative group">
                    {isAdmin && (
                      <button 
                        onClick={(e) => handleEditClick(emp, e)}
                        className="absolute top-4 right-4 p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                        title="Edit Employee"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    )}
                    <div className="flex flex-col items-center text-center flex-1">
                      <div className="w-16 h-16 rounded-full bg-[#1e3a5f] text-white flex items-center justify-center text-xl font-bold shadow-inner mb-4">
                        {initials}
                      </div>
                      <h3 className="font-bold text-gray-900 mb-1 line-clamp-1" title={emp.name}>{emp.name}</h3>
                      <p className="text-xs text-gray-500 mb-3">{emp.cnic}</p>
                      
                      <div className="flex gap-2 mb-4">
                        <BSBadge bs={emp.basicScale || 0} />
                        <StatusBadge status={emp.status} />
                      </div>

                      <div className="w-full space-y-2 text-sm text-gray-600 mt-auto pt-4 border-t border-gray-50 text-left">
                        <div className="flex items-start gap-2">
                          <Briefcase className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                          <span className="line-clamp-2">{emp.currentOffice?.name || 'Unassigned'}</span>
                        </div>
                        {emp.contactNumber && (
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-gray-400 shrink-0" />
                            <span>{emp.contactNumber}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
          {data && data.length > itemsPerPage && (
            <Pagination 
              currentPage={page} 
              totalItems={data.length} 
              itemsPerPage={itemsPerPage} 
              onPageChange={setPage} 
            />
          )}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <DataTable 
            columns={[
              { key: 'name', label: 'Employee', render: (_, row) => (
                <div>
                  <Link to={`/employees/${row.id}`} className="font-semibold text-blue-600 hover:text-blue-800">{row.name}</Link>
                  <p className="text-xs text-gray-500">{row.cnic}</p>
                </div>
              )},
              { key: 'basicScale', label: 'BS', render: (val) => <BSBadge bs={val || 0} /> },
              { key: 'currentOffice', label: 'Office', render: (_, row) => row.currentOffice?.name || 'Unassigned' },
              { key: 'status', label: 'Status', render: (val) => <StatusBadge status={val} /> },
              { key: 'actions', label: '', render: (_, row) => (
                <div className="flex items-center gap-3 justify-end">
                  {isAdmin && (
                    <button 
                      onClick={(e) => handleEditClick(row, e)}
                      className="text-gray-400 hover:text-blue-600 font-medium text-sm flex items-center gap-1"
                      title="Edit Employee"
                    >
                      <Edit className="w-4 h-4" />
                      <span className="sr-only">Edit</span>
                    </button>
                  )}
                  <Link to={`/employees/${row.id}`} className="text-blue-600 hover:text-blue-800 font-medium text-sm">View Profile</Link>
                </div>
              )}
            ]}
            data={data || []}
            pagination={true}
            itemsPerPage={20}
          />
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
    </div>
  );
};
