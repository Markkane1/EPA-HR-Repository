import React, { useState, useMemo } from 'react';
import { useGetDashboardStats } from '../../application/usecases/useGetDashboardStats';
import { useGetEmployees } from '../../application/usecases/useGetEmployees';
import { PageHeader } from '../components/shared/PageHeader';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';
import { EmptyState } from '../components/shared/EmptyState';
import { ALL_DIVISIONS, getDivisionForDistrict } from '../../domain/constants/punjabDivisions';
import { DataTable } from '../components/shared/DataTable';
import { useDebounce } from '../hooks/useDebounce';
import { Link } from 'react-router-dom';

type TabType = 'overview' | 'division' | 'district' | 'office' | 'attachments' | 'employees';

export const ReportsPage = () => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  
  const { data: statsData, loading: statsLoading, error: statsError } = useGetDashboardStats();
  const { data: employeesData, loading: empLoading, error: empError } = useGetEmployees({});

  const [empSearch, setEmpSearch] = useState('');
  const debouncedSearch = useDebounce(empSearch, 300);
  const [empDivisionFilter, setEmpDivisionFilter] = useState('');

  const loading = statsLoading || empLoading;
  const error = statsError || empError;

  // Aggregate Data
  const { divisionStats, districtStats, officeStats } = useMemo(() => {
    if (!statsData) return { divisionStats: [], districtStats: [], officeStats: [] };
    
    const divMap = new Map<string, any>();
    const distMap = new Map<string, any>();
    const offList: any[] = [];

    ALL_DIVISIONS.concat(['Other']).forEach(div => {
      divMap.set(div, { division: div, totalOffices: 0, totalSeats: 0, occupiedSeats: 0, vacantSeats: 0 });
    });

    statsData.allOffices.forEach(stat => {
      const div = getDivisionForDistrict(stat.office.district);
      const dist = stat.office.district || 'Unknown';
      
      const group = divMap.get(div);
      if (group) {
        group.totalOffices += 1;
        group.totalSeats += stat.totalSeats;
        group.occupiedSeats += stat.occupiedSeats;
        group.vacantSeats += stat.vacantSeats;
      }
      
      let distGroup = distMap.get(dist);
      if (!distGroup) {
        distGroup = { district: dist, division: div, totalOffices: 0, totalSeats: 0, occupiedSeats: 0, vacantSeats: 0 };
        distMap.set(dist, distGroup);
      }
      distGroup.totalOffices += 1;
      distGroup.totalSeats += stat.totalSeats;
      distGroup.occupiedSeats += stat.occupiedSeats;
      distGroup.vacantSeats += stat.vacantSeats;

      offList.push({
        id: stat.office.id,
        name: stat.office.name,
        type: stat.office.type,
        district: dist,
        division: div,
        totalSeats: stat.totalSeats,
        occupiedSeats: stat.occupiedSeats,
        vacantSeats: stat.vacantSeats
      });
    });

    return {
      divisionStats: Array.from(divMap.values()).filter(d => d.totalOffices > 0).sort((a, b) => b.totalOffices - a.totalOffices),
      districtStats: Array.from(distMap.values()).sort((a, b) => a.district.localeCompare(b.district)),
      officeStats: offList.sort((a, b) => a.name.localeCompare(b.name))
    };
  }, [statsData]);

  // Employee Reports Data
  const filteredEmployees = useMemo(() => {
    if (!employeesData) return [];
    return employeesData.filter(emp => {
      const officeDist = emp.currentOffice?.district || '';
      const div = getDivisionForDistrict(officeDist);
      const matchesDiv = !empDivisionFilter || div === empDivisionFilter;
      const term = debouncedSearch.toLowerCase();
      const matchesSearch = !term || 
        emp.name.toLowerCase().includes(term) || 
        emp.cnic.includes(term) || 
        (emp.currentOffice?.name || '').toLowerCase().includes(term);
      return matchesDiv && matchesSearch;
    });
  }, [employeesData, debouncedSearch, empDivisionFilter]);

  // Attachments Report Data
  const attachmentsData = useMemo(() => {
    if (!employeesData) return [];
    return employeesData.filter(emp => emp.activeAttachment);
  }, [employeesData]);

  const renderTabBtn = (id: TabType, icon: string, label: string) => (
    <button
      className={`px-4 py-3 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${activeTab === id ? 'border-[#4e73df] text-[#4e73df]' : 'border-transparent text-[#858796] hover:text-[#5a5c69]'}`}
      onClick={() => setActiveTab(id)}
    >
      <i className={`fas ${icon} mr-2`}></i> {label}
    </button>
  );

  const getFillPct = (occ: number, tot: number) => {
    const pct = tot ? Math.round((occ / tot) * 100) : 0;
    const color = pct >= 75 ? 'text-[#1cc88a]' : pct >= 40 ? 'text-[#f6c23e]' : 'text-[#e74a3b]';
    return <span className={`font-bold ${color}`}>{pct}%</span>;
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <EmptyState message={error.message || 'Failed to load reports data'} />;

  return (
    <div className="space-y-6 pb-6">
      <PageHeader title="Advanced Reports" />

      {/* Tabs */}
      <div className="flex border-b border-[#e3e6f0] mb-6 overflow-x-auto hide-scrollbar">
        {renderTabBtn('overview', 'fa-chart-pie', 'Overall Summary')}
        {renderTabBtn('division', 'fa-layer-group', 'Division-wise')}
        {renderTabBtn('district', 'fa-map-marker-alt', 'District-wise')}
        {renderTabBtn('office', 'fa-building', 'Office-wise')}
        {renderTabBtn('attachments', 'fa-paperclip', 'Attachments')}
        {renderTabBtn('employees', 'fa-users', 'Master List')}
      </div>

      {activeTab === 'overview' && statsData && (
        <div className="space-y-6 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-[0.35rem] shadow-[0_0.15rem_1.75rem_0_rgba(58,59,69,0.15)] p-5 border-l-[0.25rem] border-[#4e73df]">
              <div className="text-[0.7rem] font-bold text-[#4e73df] uppercase mb-1">Total Employees</div>
              <div className="text-2xl font-bold text-[#5a5c69]">{statsData.totalEmployees}</div>
            </div>
            <div className="bg-white rounded-[0.35rem] shadow-[0_0.15rem_1.75rem_0_rgba(58,59,69,0.15)] p-5 border-l-[0.25rem] border-[#1cc88a]">
              <div className="text-[0.7rem] font-bold text-[#1cc88a] uppercase mb-1">Total Offices</div>
              <div className="text-2xl font-bold text-[#5a5c69]">{statsData.totalOffices}</div>
            </div>
            <div className="bg-white rounded-[0.35rem] shadow-[0_0.15rem_1.75rem_0_rgba(58,59,69,0.15)] p-5 border-l-[0.25rem] border-[#36b9cc]">
              <div className="text-[0.7rem] font-bold text-[#36b9cc] uppercase mb-1">Total Sanctioned Seats</div>
              <div className="text-2xl font-bold text-[#5a5c69]">
                {statsData.allOffices.reduce((sum, o) => sum + o.totalSeats, 0)}
              </div>
            </div>
            <div className="bg-white rounded-[0.35rem] shadow-[0_0.15rem_1.75rem_0_rgba(58,59,69,0.15)] p-5 border-l-[0.25rem] border-[#f6c23e]">
              <div className="text-[0.7rem] font-bold text-[#f6c23e] uppercase mb-1">Currently Attached</div>
              <div className="text-2xl font-bold text-[#5a5c69]">{statsData.currentlyAttachedCount}</div>
            </div>
          </div>
          
          <div className="bg-white rounded-[0.35rem] shadow-[0_0.15rem_1.75rem_0_rgba(58,59,69,0.15)]">
            <div className="bg-gray-50 px-5 py-4 border-b border-[#e3e6f0]">
              <h6 className="m-0 font-bold text-[#4e73df]">Overall Vacancy Rate</h6>
            </div>
            <div className="p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-[#5a5c69]">Vacant Seats ({statsData.totalVacantSeats})</span>
                <span className="font-bold text-[#858796]">
                  {Math.round((statsData.totalVacantSeats / Math.max(1, statsData.allOffices.reduce((s,o)=>s+o.totalSeats,0))) * 100)}%
                </span>
              </div>
              <div className="h-4 bg-[#eaecf4] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#e74a3b]" 
                  style={{ width: `${(statsData.totalVacantSeats / Math.max(1, statsData.allOffices.reduce((s,o)=>s+o.totalSeats,0))) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'division' && (
        <div className="bg-white rounded-[0.35rem] shadow-[0_0.15rem_1.75rem_0_rgba(58,59,69,0.15)] animate-fade-in p-0">
          <DataTable
            columns={[
              { key: 'division', label: 'Division', render: (_, row) => <span className="font-bold text-[#5a5c69] uppercase">{row.division}</span> },
              { key: 'totalOffices', label: 'Total Offices', className: 'text-center' },
              { key: 'totalSeats', label: 'Sanctioned Posts', className: 'text-center' },
              { key: 'occupiedSeats', label: 'Occupied', className: 'text-center text-[#1cc88a] font-bold' },
              { key: 'vacantSeats', label: 'Vacant', className: 'text-center text-[#e74a3b] font-bold' },
              { key: 'fillRate', label: 'Fill %', className: 'text-center', render: (_, row) => getFillPct(row.occupiedSeats, row.totalSeats) }
            ]}
            data={divisionStats}
          />
        </div>
      )}

      {activeTab === 'district' && (
        <div className="bg-white rounded-[0.35rem] shadow-[0_0.15rem_1.75rem_0_rgba(58,59,69,0.15)] animate-fade-in p-0">
          <DataTable
            columns={[
              { key: 'district', label: 'District', render: (_, row) => <span className="font-bold text-[#5a5c69]">{row.district}</span> },
              { key: 'division', label: 'Division', render: (_, row) => <span className="text-[#858796] uppercase text-xs">{row.division}</span> },
              { key: 'totalOffices', label: 'Total Offices', className: 'text-center' },
              { key: 'totalSeats', label: 'Sanctioned Posts', className: 'text-center' },
              { key: 'occupiedSeats', label: 'Occupied', className: 'text-center text-[#1cc88a] font-bold' },
              { key: 'vacantSeats', label: 'Vacant', className: 'text-center text-[#e74a3b] font-bold' },
              { key: 'fillRate', label: 'Fill %', className: 'text-center', render: (_, row) => getFillPct(row.occupiedSeats, row.totalSeats) }
            ]}
            data={districtStats}
            pagination={true}
            itemsPerPage={15}
          />
        </div>
      )}

      {activeTab === 'office' && (
        <div className="bg-white rounded-[0.35rem] shadow-[0_0.15rem_1.75rem_0_rgba(58,59,69,0.15)] animate-fade-in p-0">
          <DataTable
            columns={[
              { key: 'name', label: 'Office Name', width: '30%', render: (_, row) => (
                <div>
                  <Link to={`/offices/${row.id}`} className="font-bold text-[#4e73df] hover:underline">{row.name}</Link>
                  <div className="text-xs text-[#858796] mt-1 uppercase">{row.type}</div>
                </div>
              )},
              { key: 'location', label: 'Location', render: (_, row) => (
                <div>
                  <div className="text-sm font-bold text-[#5a5c69]">{row.district}</div>
                  <div className="text-xs text-[#858796] uppercase">{row.division}</div>
                </div>
              )},
              { key: 'totalSeats', label: 'Sanctioned', className: 'text-center' },
              { key: 'occupiedSeats', label: 'Occupied', className: 'text-center text-[#1cc88a] font-bold' },
              { key: 'vacantSeats', label: 'Vacant', className: 'text-center text-[#e74a3b] font-bold' },
              { key: 'fillRate', label: 'Fill %', className: 'text-center', render: (_, row) => getFillPct(row.occupiedSeats, row.totalSeats) }
            ]}
            data={officeStats}
            pagination={true}
            itemsPerPage={15}
          />
        </div>
      )}

      {activeTab === 'attachments' && (
        <div className="bg-white rounded-[0.35rem] shadow-[0_0.15rem_1.75rem_0_rgba(58,59,69,0.15)] animate-fade-in p-0">
          <DataTable
            columns={[
              { key: 'employee', label: 'Employee', render: (_, row) => (
                <div>
                  <Link to={`/employees/${row.id}`} className="font-bold text-[#4e73df] hover:underline">{row.name}</Link>
                  <div className="text-xs text-[#858796] mt-1">BS-{row.basicScale || '-'} | {row.cnic}</div>
                </div>
              )},
              { key: 'substantive', label: 'Substantive Posting', width: '25%', render: (_, row) => (
                <div>
                  <div className="text-sm font-bold text-[#5a5c69]">{row.currentPosition?.title || 'Unknown Position'}</div>
                  <div className="text-xs text-[#858796] mt-1">{row.currentOffice?.name || 'Unknown Office'}</div>
                </div>
              )},
              { key: 'attachedTo', label: 'Attached To', width: '25%', render: (_, row) => {
                const attachedOfficeId = row.activeAttachment?.officeId;
                // Find office name from statsData
                const office = statsData?.allOffices.find(o => o.office.id === attachedOfficeId)?.office;
                return (
                  <div>
                    <div className="text-sm font-bold text-[#f6c23e]"><i className="fas fa-link mr-1"></i> Temporary Attachment</div>
                    <div className="text-xs text-[#858796] mt-1">{office?.name || 'Unknown Office'}</div>
                  </div>
                );
              }},
              { key: 'details', label: 'Details', render: (_, row) => (
                <div>
                  {row.activeAttachment?.orderNumber && (
                    <div className="text-xs font-bold text-[#5a5c69] mb-1">Order: {row.activeAttachment.orderNumber}</div>
                  )}
                  <div className="text-xs text-[#858796] italic">"{row.activeAttachment?.reason || 'No reason specified'}"</div>
                </div>
              )}
            ]}
            data={attachmentsData}
            pagination={true}
            itemsPerPage={10}
          />
        </div>
      )}

      {activeTab === 'employees' && (
        <div className="bg-white rounded-[0.35rem] shadow-[0_0.15rem_1.75rem_0_rgba(58,59,69,0.15)] animate-fade-in">
          <div className="p-4 border-b border-[#e3e6f0] flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#858796]"><i className="fas fa-search"></i></span>
              <input
                type="text"
                value={empSearch}
                onChange={e => setEmpSearch(e.target.value)}
                placeholder="Search employees by name, CNIC, or office..."
                className="w-full pl-10 pr-4 py-1.5 text-sm bg-gray-100 border-0 rounded-[0.35rem] text-[#6e707e] outline-none focus:ring-0 focus:bg-white focus:border-[#bac8f3] focus:ring-[rgba(78,115,223,0.25)] transition-colors"
              />
            </div>
            <select
              value={empDivisionFilter}
              onChange={(e) => setEmpDivisionFilter(e.target.value)}
              className="w-full md:w-auto px-4 py-1.5 text-sm bg-gray-100 border-0 rounded-[0.35rem] text-[#6e707e] outline-none focus:ring-0 focus:bg-white focus:border-[#bac8f3] focus:ring-[rgba(78,115,223,0.25)] transition-colors"
            >
              <option value="">All Divisions</option>
              {ALL_DIVISIONS.map(div => <option key={div} value={div}>{div}</option>)}
              <option value="Other">Other</option>
            </select>
          </div>
          <DataTable
            columns={[
              { key: 'name', label: 'Employee', render: (_, row) => (
                <div>
                  <Link to={`/employees/${row.id}`} className="font-bold text-[#4e73df] hover:underline">{row.name}</Link>
                  <div className="text-xs text-[#858796] mt-1">{row.cnic}</div>
                </div>
              )},
              { key: 'scale', label: 'BS', width: '10%', className: 'text-center', render: (_, row) => (
                <span className="inline-block px-2 py-0.5 bg-[#4e73df] text-white text-xs font-bold rounded">BS-{row.basicScale || '-'}</span>
              )},
              { key: 'posting', label: 'Current Posting', width: '35%', render: (_, row) => (
                row.currentOffice ? (
                  <div>
                    <div className="text-sm font-bold text-[#5a5c69]">{row.currentPosition?.title || 'Unknown Position'}</div>
                    <div className="text-xs text-[#858796] mt-1">{row.currentOffice.name}</div>
                  </div>
                ) : <span className="text-sm text-gray-400 italic">Unposted</span>
              )},
              { key: 'location', label: 'District & Division', width: '25%', render: (_, row) => {
                const dist = row.currentOffice?.district || '-';
                const div = row.currentOffice ? getDivisionForDistrict(row.currentOffice.district) : '-';
                return (
                  <div>
                    <div className="text-sm font-bold text-[#5a5c69]">{dist}</div>
                    <div className="text-xs text-[#858796] uppercase mt-1">{div}</div>
                  </div>
                );
              }},
            ]}
            data={filteredEmployees}
            pagination={true}
            itemsPerPage={15}
          />
        </div>
      )}
    </div>
  );
};
