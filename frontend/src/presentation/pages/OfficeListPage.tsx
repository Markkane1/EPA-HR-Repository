import { useState } from 'react';
import { useGetDashboardStats } from '../../application/usecases/useGetDashboardStats';
import { useAuthContext } from '../contexts/AuthContext';
import { PageHeader } from '../components/shared/PageHeader';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';
import { EmptyState } from '../components/shared/EmptyState';
import { DataTable } from '../components/shared/DataTable';
import { Pagination } from '../components/shared/Pagination';
import { OfficeModal } from '../components/offices/OfficeModal';
import { Link } from 'react-router-dom';
import { useDebounce } from '../hooks/useDebounce';
import { ALL_DIVISIONS, getDivisionForDistrict } from '../../domain/constants/punjabDivisions';

export const OfficeListPage = () => {
  const { data, loading, error, mutate } = useGetDashboardStats();
  const { isAdmin } = useAuthContext();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [divisionFilter, setDivisionFilter] = useState('');
  const [sortBy, setSortBy] = useState('name_asc');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [officeToEdit, setOfficeToEdit] = useState<any | null>(null);
  const itemsPerPage = 12;

  const debouncedSearch = useDebounce(searchTerm, 300);

  if (loading) return <LoadingSpinner />;
  if (error || !data) return <EmptyState message={error?.message || 'Failed to load offices'} />;

  const filteredOffices = data.allOffices
    .filter(stat => {
      const term = debouncedSearch.toLowerCase();
      const matchesSearch = stat.office.name.toLowerCase().includes(term) || stat.office.district.toLowerCase().includes(term);
      const officeDiv = getDivisionForDistrict(stat.office.district);
      const matchesDivision = !divisionFilter || officeDiv === divisionFilter;
      return matchesSearch && matchesDivision;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name_asc': return a.office.name.localeCompare(b.office.name);
        case 'name_desc': return b.office.name.localeCompare(a.office.name);
        case 'district_asc': return a.office.district.localeCompare(b.office.district);
        case 'district_desc': return b.office.district.localeCompare(a.office.district);
        case 'sanctioned_desc': return b.totalSeats - a.totalSeats;
        case 'vacant_desc': return b.vacantSeats - a.vacantSeats;
        default: return 0;
      }
    });

  const paginatedOffices = viewMode === 'grid' 
    ? filteredOffices.slice((page - 1) * itemsPerPage, page * itemsPerPage)
    : filteredOffices;

  const handleEditClick = (office: any, e: React.MouseEvent) => {
    e.preventDefault();
    setOfficeToEdit(office);
    setIsModalOpen(true);
  };

  const handleAddClick = () => {
    setOfficeToEdit(null);
    setIsModalOpen(true);
  };

  return (
    <>
      <PageHeader 
        title="Offices Directory" 
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
                <i className="fas fa-plus fa-sm text-white/50 mr-2"></i> Add Office
              </button>
            )}
          </div>
        }
      />

      {/* Search Card */}
      <div className="bg-white rounded-[0.35rem] shadow-[0_0.15rem_1.75rem_0_rgba(58,59,69,0.15)] mb-6">
        <div className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1 flex flex-wrap items-stretch">
              <div className="flex -mr-px">
                <span className="flex items-center px-4 py-1.5 text-sm bg-gray-100 border-0 rounded-l-[0.35rem]"><i className="fas fa-search text-[#858796]"></i></span>
              </div>
              <input 
                type="text" 
                className="flex-auto w-[1%] bg-gray-100 border-0 rounded-r-[0.35rem] px-4 py-1.5 text-sm text-[#6e707e] outline-none focus:ring-0 focus:bg-white focus:border-[#bac8f3] focus:ring-[rgba(78,115,223,0.25)] transition-colors" 
                placeholder="Search offices by name or district..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                }}
              />
            </div>
            <select
              value={divisionFilter}
              onChange={(e) => {
                setDivisionFilter(e.target.value);
                setPage(1);
              }}
              className="w-full md:w-auto px-4 py-1.5 text-sm bg-gray-100 border-0 rounded-[0.35rem] text-[#6e707e] outline-none focus:ring-0 focus:bg-white focus:border-[#bac8f3] focus:ring-[rgba(78,115,223,0.25)] transition-colors"
            >
              <option value="">All Divisions</option>
              {ALL_DIVISIONS.map(div => <option key={div} value={div}>{div}</option>)}
              <option value="Other">Other</option>
            </select>
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setPage(1);
              }}
              className="w-full md:w-auto px-4 py-1.5 text-sm bg-gray-100 border-0 rounded-[0.35rem] text-[#6e707e] outline-none focus:ring-0 focus:bg-white focus:border-[#bac8f3] focus:ring-[rgba(78,115,223,0.25)] transition-colors"
            >
              <option value="name_asc">Sort by Name (A-Z)</option>
              <option value="name_desc">Sort by Name (Z-A)</option>
              <option value="district_asc">Sort by District (A-Z)</option>
              <option value="district_desc">Sort by District (Z-A)</option>
              <option value="sanctioned_desc">Sanctioned Seats (High-Low)</option>
              <option value="vacant_desc">Vacant Seats (High-Low)</option>
            </select>
          </div>
        </div>
      </div>
      
      {viewMode === 'grid' ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-6">
            {paginatedOffices.map((stat) => (
              <div key={stat.office.id} className="h-full">
                <Link to={`/offices/${stat.office.id}`} className="no-underline h-full block">
                  <div className="bg-white rounded-[0.35rem] shadow-sm hover:shadow-[0_0.5rem_1rem_rgba(0,0,0,0.15)] transition-shadow h-full border-l-[0.25rem] border-[#4e73df] py-2">
                    <div className="p-5">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center flex-1 min-w-0 mr-2">
                          <div className="mr-3 flex-shrink-0">
                            <div className="bg-[#4e73df] text-white shadow-sm w-10 h-10 rounded-full flex items-center justify-center">
                              <i className="fas fa-building"></i>
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h5 className="font-bold text-gray-900 mb-1 truncate" title={stat.office.name}>{stat.office.name}</h5>
                            <span className="inline-block py-1 px-2 rounded font-bold text-[75%] leading-none text-center whitespace-nowrap bg-[#4e73df] text-white uppercase">{stat.office.type}</span>
                          </div>
                        </div>
                        {isAdmin && (
                          <button 
                            onClick={(e) => handleEditClick(stat.office, e)}
                            className="inline-block px-2 py-1 text-sm bg-[#f8f9fc] hover:bg-[#e2e6ea] text-[#4e73df] rounded transition-colors flex-shrink-0"
                            title="Edit Office"
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                        )}
                      </div>
                      
                      <div className="text-xs font-bold uppercase mb-3 text-[#858796]">
                        <i className="fas fa-map-marker-alt mr-1"></i>
                        {stat.office.location}, {stat.office.district}
                      </div>

                      <div className="grid grid-cols-3 text-center mt-3 border-t border-[#e3e6f0] pt-3">
                        <div>
                          <div className="text-[0.7rem] font-bold text-[#b7b9cc] uppercase mb-1">Sanctioned</div>
                          <div className="text-xl mb-0 font-bold text-[#5a5c69]">{stat.totalSeats}</div>
                        </div>
                        <div>
                          <div className="text-[0.7rem] font-bold text-[#b7b9cc] uppercase mb-1">Occupied</div>
                          <div className="text-xl mb-0 font-bold text-[#1cc88a]">{stat.occupiedSeats}</div>
                        </div>
                        <div>
                          <div className="text-[0.7rem] font-bold text-[#b7b9cc] uppercase mb-1">Vacant</div>
                          <div className="text-xl mb-0 font-bold text-[#e74a3b]">{stat.vacantSeats}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
          
          <div className="bg-white rounded-[0.35rem] shadow-sm mb-6">
            <div className="p-4 py-2">
              <Pagination 
                currentPage={page} 
                totalItems={filteredOffices.length} 
                itemsPerPage={itemsPerPage} 
                onPageChange={setPage} 
              />
            </div>
          </div>
        </>
      ) : (
        <div className="bg-white rounded-[0.35rem] shadow-[0_0.15rem_1.75rem_0_rgba(58,59,69,0.15)] mb-6">
          <div className="p-0">
            <DataTable 
              columns={[
                { key: 'name', label: 'Office', width: '30%', render: (_, row) => (
                  <div>
                    <Link to={`/offices/${row.office.id}`} className="font-bold text-[#4e73df] block truncate">{row.office.name}</Link>
                    <span className="inline-block py-1 px-2 rounded font-bold text-[75%] leading-none text-center whitespace-nowrap bg-[#4e73df] text-white mt-1">{row.office.type}</span>
                  </div>
                )},
                { key: 'district', label: 'District / Location', width: '22%', render: (_, row) => (
                  <span className="truncate block text-[#858796]">{row.office.district}</span>
                )},
                { key: 'totalSeats',    label: 'Sanctioned', width: '10%', className: 'text-center', render: (_, row) => <span className="font-bold text-[#5a5c69]">{row.totalSeats}</span> },
                { key: 'occupiedSeats', label: 'Occupied',   width: '10%', className: 'text-center', render: (_, row) => <span className="font-bold text-[#1cc88a]">{row.occupiedSeats}</span> },
                { key: 'vacantSeats',   label: 'Vacant',     width: '10%', className: 'text-center', render: (_, row) => <span className="font-bold text-[#e74a3b]">{row.vacantSeats}</span> },
                { key: 'fillRate', label: 'Fill %', width: '8%', className: 'text-center', render: (_, row) => {
                  const pct = row.totalSeats ? Math.round((row.occupiedSeats / row.totalSeats) * 100) : 0;
                  return (
                    <span className={`font-bold ${pct >= 75 ? 'text-[#1cc88a]' : pct >= 40 ? 'text-[#f6c23e]' : 'text-[#e74a3b]'}`}>
                      {pct}%
                    </span>
                  );
                }},
                { key: 'actions', label: '', width: '10%', className: 'text-right', render: (_, row) => (
                  <div className="flex justify-end items-center">
                    {isAdmin && (
                      <button 
                        onClick={(e) => handleEditClick(row.office, e)}
                        className="inline-block px-2 py-1 text-sm bg-[#f8f9fc] hover:bg-[#e2e6ea] text-[#4e73df] rounded transition-colors mr-2"
                        title="Edit Office"
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                    )}
                    <Link to={`/offices/${row.office.id}`} className="inline-block px-2 py-1 text-sm font-normal text-[#4e73df] border border-[#4e73df] hover:bg-[#4e73df] hover:text-white rounded-[0.35rem] transition-colors">View</Link>
                  </div>
                )}
              ]}
              data={filteredOffices}
              pagination={true}
              itemsPerPage={10}
            />
          </div>
        </div>
      )}

      {isAdmin && (
        <OfficeModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          officeToEdit={officeToEdit}
          onSuccess={mutate}
        />
      )}
    </>
  );
};
