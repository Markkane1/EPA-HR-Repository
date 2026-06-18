import { useGetDashboardStats } from '../../application/usecases/useGetDashboardStats';
import { PageHeader } from '../components/shared/PageHeader';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';
import { EmptyState } from '../components/shared/EmptyState';
import { DataTable } from '../components/shared/DataTable';
import { Users, Building, AlertCircle, Paperclip } from 'lucide-react';

export const DashboardPage = () => {
  const { data, loading, error } = useGetDashboardStats();

  if (loading) return <LoadingSpinner />;
  if (error || !data) return <EmptyState message={error?.message || 'Failed to load dashboard'} />;

  const statCards = [
    { label: 'Total Employees', value: data.totalEmployees, icon: Users, color: 'text-blue-600' },
    { label: 'Total Offices', value: data.totalOffices, icon: Building, color: 'text-indigo-600' },
    { label: 'Vacant Seats', value: data.totalVacantSeats, icon: AlertCircle, color: 'text-red-600' },
    { label: 'On Attachment', value: data.currentlyAttachedCount, icon: Paperclip, color: 'text-yellow-600' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center gap-4">
            <div className={`p-4 rounded-full bg-gray-50 ${stat.color}`}>
              <stat.icon className="w-8 h-8" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">Office Vacancy Summary</h2>
          </div>
          <div className="p-4 flex-1">
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

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">Currently Attached Employees</h2>
          </div>
          <div className="p-4 flex-1">
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
    </div>
  );
};
