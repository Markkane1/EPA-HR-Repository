import { useGetDashboardStats } from '../../application/usecases/useGetDashboardStats';
import { PageHeader } from '../components/shared/PageHeader';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';
import { EmptyState } from '../components/shared/EmptyState';
import { DataTable } from '../components/shared/DataTable';

export const DashboardPage = () => {
  const { data, loading, error } = useGetDashboardStats();

  if (loading) return <LoadingSpinner />;
  if (error || !data) return <EmptyState message={error?.message || 'Failed to load dashboard'} />;

  const statCards = [
    { label: 'Total Employees', value: data.totalEmployees, icon: 'fas fa-users', color: '#4e73df', border: 'border-[#4e73df]' },
    { label: 'Total Offices', value: data.totalOffices, icon: 'fas fa-building', color: '#36b9cc', border: 'border-[#36b9cc]' },
    { label: 'Vacant Seats', value: data.totalVacantSeats, icon: 'fas fa-exclamation-circle', color: '#e74a3b', border: 'border-[#e74a3b]' },
    { label: 'On Attachment', value: data.currentlyAttachedCount, icon: 'fas fa-paperclip', color: '#f6c23e', border: 'border-[#f6c23e]' },
  ];

  return (
    <>
      <PageHeader title="Dashboard" />
      
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-6">
        {statCards.map((stat, i) => (
          <div key={i} className={`bg-white rounded-[0.35rem] shadow-[0_0.15rem_1.75rem_0_rgba(58,59,69,0.15)] border-l-[0.25rem] ${stat.border} p-6 h-full flex items-center justify-between`}>
            <div>
              <div className="text-xs font-bold uppercase mb-1" style={{ color: stat.color }}>
                {stat.label}
              </div>
              <div className="text-xl font-bold text-[#5a5c69]">{stat.value}</div>
            </div>
            <div>
              <i className={`${stat.icon} text-[#dddfeb] text-3xl`} />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-[0.35rem] shadow-[0_0.15rem_1.75rem_0_rgba(58,59,69,0.15)] overflow-hidden">
          <div className="bg-[#f8f9fc] px-5 py-4 border-b border-[#e3e6f0]">
            <h6 className="m-0 font-bold text-[#4e73df]">Office Vacancy Summary</h6>
          </div>
          <div className="p-5">
            <DataTable 
              columns={[
                { key: 'office', label: 'Office', render: (_, row) => row.office.name },
                { key: 'district', label: 'District', render: (_, row) => row.office.district },
                { key: 'totalSeats', label: 'Sanctioned' },
                { key: 'occupiedSeats', label: 'Occupied' },
                { key: 'vacantSeats', label: 'Vacant' },
                { key: 'fillRate', label: 'Fill %', render: (_, row) => row.totalSeats ? Math.round((row.occupiedSeats / row.totalSeats) * 100) + '%' : '0%' }
              ]}
              data={data.allOffices}
              pagination={true}
              itemsPerPage={5}
            />
          </div>
        </div>

        <div className="bg-white rounded-[0.35rem] shadow-[0_0.15rem_1.75rem_0_rgba(58,59,69,0.15)] overflow-hidden">
          <div className="bg-[#f8f9fc] px-5 py-4 border-b border-[#e3e6f0]">
            <h6 className="m-0 font-bold text-[#4e73df]">Currently Attached Employees</h6>
          </div>
          <div className="p-5">
            <DataTable 
              columns={[
                { key: 'name', label: 'Employee', render: (_, row) => row.employee.name },
                { key: 'attachedTo', label: 'Attached To', render: (_, row) => row.attachedToOffice.name },
                { key: 'since', label: 'Since', render: (_, row) => new Date(row.attachment.effectiveFrom).toLocaleDateString() }
              ]}
              data={data.attachedEmployeesList}
              pagination={true}
              itemsPerPage={5}
            />
          </div>
        </div>
      </div>
    </>
  );
};
