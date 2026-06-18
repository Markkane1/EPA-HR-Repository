import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useGetEmployees } from '../../application/usecases/useGetEmployees';
import { PageHeader } from '../components/shared/PageHeader';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';
import { EmptyState } from '../components/shared/EmptyState';
import { DataTable } from '../components/shared/DataTable';
import { StatusBadge } from '../components/shared/StatusBadge';
import { BSBadge } from '../components/shared/BSBadge';
import { EmployeeModal } from '../components/employees/EmployeeModal';
import { useAuthContext } from '../contexts/AuthContext';
import { UserPlus, Search, Edit } from 'lucide-react';
import { EmployeeListItem } from '../../domain/entities';

export const EmployeeDirectoryPage = () => {
  const { isAdmin } = useAuthContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [employeeToEdit, setEmployeeToEdit] = useState<EmployeeListItem | null>(null);

  // Simple debounce
  useState(() => {
    const handler = setTimeout(() => setDebouncedSearch(searchTerm), 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const { data, loading, error, mutate } = useGetEmployees({ search: debouncedSearch });

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

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Employee Directory" 
        actionButton={
          isAdmin ? (
            <button 
              onClick={handleAddClick} 
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              <UserPlus className="w-4 h-4" /> Add Employee
            </button>
          ) : undefined
        }
      />

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="relative">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search by Name, CNIC, or Father's Name..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <DataTable 
          columns={[
            { key: 'name', label: 'Employee', render: (_, row) => (
              <div>
                <p className="font-semibold text-gray-900">{row.name}</p>
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
