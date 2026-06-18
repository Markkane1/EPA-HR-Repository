import { useState, useMemo } from 'react';
import { useGetDashboardStats } from '../../application/usecases/useGetDashboardStats';
import { useAuthContext } from '../contexts/AuthContext';
import { PageHeader } from '../components/shared/PageHeader';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';
import { EmptyState } from '../components/shared/EmptyState';
import { DataTable } from '../components/shared/DataTable';
import { Pagination } from '../components/shared/Pagination';
import { OfficeModal } from '../components/offices/OfficeModal';
import { Link } from 'react-router-dom';
import { Building, MapPin, LayoutGrid, List, Search, PlusCircle, Edit } from 'lucide-react';
import { Office } from '../../domain/entities';

export const OfficeListPage = () => {
  const { data, loading, error, mutate } = useGetDashboardStats();
  const { isAdmin } = useAuthContext();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [officeToEdit, setOfficeToEdit] = useState<Office | null>(null);
  const itemsPerPage = 12;

  // Simple debounce
  const [debouncedSearch, setDebouncedSearch] = useState('');
  useState(() => {
    const handler = setTimeout(() => setDebouncedSearch(searchTerm), 300);
    return () => clearTimeout(handler);
  });

  if (loading) return <LoadingSpinner />;
  if (error || !data) return <EmptyState message={error?.message || 'Failed to load offices'} />;

  const filteredOffices = data.allOffices.filter(stat => {
    const term = debouncedSearch.toLowerCase();
    return stat.office.name.toLowerCase().includes(term) || stat.office.district.toLowerCase().includes(term);
  });

  const paginatedOffices = viewMode === 'grid' 
    ? filteredOffices.slice((page - 1) * itemsPerPage, page * itemsPerPage)
    : filteredOffices;

  const handleEditClick = (office: Office, e: React.MouseEvent) => {
    e.preventDefault();
    setOfficeToEdit(office);
    setIsModalOpen(true);
  };

  const handleAddClick = () => {
    setOfficeToEdit(null);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Offices Directory" 
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
                <PlusCircle className="w-4 h-4" /> Add Office
              </button>
            )}
          </div>
        }
      />

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="relative">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search offices by name or district..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
          />
        </div>
      </div>
      
      {viewMode === 'grid' ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {paginatedOffices.map((stat) => (
          <Link key={stat.office.id} to={`/offices/${stat.office.id}`} className="block">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-50 text-blue-700 rounded-lg">
                    <Building className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 line-clamp-1" title={stat.office.name}>{stat.office.name}</h3>
                    <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full">{stat.office.type}</span>
                  </div>
                </div>
                {isAdmin && (
                  <button 
                    onClick={(e) => handleEditClick(stat.office, e)}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Edit Office"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                )}
              </div>
              
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
                <MapPin className="w-4 h-4" />
                {stat.office.location}, {stat.office.district}
              </div>

              <div className="grid grid-cols-3 gap-4 border-t border-gray-50 pt-4">
                <div className="text-center">
                  <p className="text-xs text-gray-500 font-medium">Sanctioned</p>
                  <p className="text-lg font-semibold text-gray-900">{stat.totalSeats}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500 font-medium">Occupied</p>
                  <p className="text-lg font-semibold text-green-600">{stat.occupiedSeats}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500 font-medium">Vacant</p>
                  <p className="text-lg font-semibold text-red-600">{stat.vacantSeats}</p>
                </div>
              </div>
            </div>
          </Link>
        ))}
          </div>
          
          <Pagination 
            currentPage={page} 
            totalItems={filteredOffices.length} 
            itemsPerPage={itemsPerPage} 
            onPageChange={setPage} 
          />
        </div>
      ) : (
        <DataTable 
          columns={[
            { key: 'name', label: 'Office', render: (_, row) => (
              <div>
                <Link to={`/offices/${row.office.id}`} className="font-semibold text-blue-600 hover:text-blue-800">{row.office.name}</Link>
                <p className="text-xs text-gray-500 mt-0.5">{row.office.type}</p>
              </div>
            )},
            { key: 'district', label: 'District', render: (_, row) => row.office.district },
            { key: 'totalSeats', label: 'Sanctioned Posts' },
            { key: 'occupiedSeats', label: 'Occupied' },
            { key: 'vacantSeats', label: 'Vacant' },
            { key: 'fillRate', label: 'Fill Rate', render: (_, row) => row.totalSeats ? Math.round((row.occupiedSeats / row.totalSeats) * 100) + '%' : '0%' },
            { key: 'actions', label: '', render: (_, row) => (
              <div className="flex items-center gap-3 justify-end">
                {isAdmin && (
                  <button 
                    onClick={(e) => handleEditClick(row.office, e)}
                    className="text-gray-400 hover:text-blue-600 font-medium text-sm flex items-center gap-1"
                  >
                    <Edit className="w-4 h-4" />
                    <span className="sr-only">Edit</span>
                  </button>
                )}
                <Link to={`/offices/${row.office.id}`} className="text-blue-600 hover:text-blue-800 font-medium text-sm">View Details</Link>
              </div>
            )}
          ]}
          data={filteredOffices}
          pagination={true}
          itemsPerPage={10}
        />
      )}

      {isAdmin && (
        <OfficeModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          officeToEdit={officeToEdit}
          onSuccess={mutate}
        />
      )}
    </div>
  );
};
