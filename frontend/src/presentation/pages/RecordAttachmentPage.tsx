import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useGetEmployees } from '../../application/usecases/useGetEmployees';
import { useGetOffices } from '../../application/usecases/useGetOffices';
import { useGetDashboardStats } from '../../application/usecases/useGetDashboardStats';
import { useRecordAttachment } from '../../application/usecases/useRecordAttachment';
import { useEndAttachment } from '../../application/usecases/useEndAttachment';
import { PageHeader } from '../components/shared/PageHeader';
import { DataTable } from '../components/shared/DataTable';
import { BSBadge } from '../components/shared/BSBadge';
import { Save, Search, CheckCircle2 } from 'lucide-react';
import { EmployeeListItem } from '../../domain/entities';

const schema = z.object({
  officeId: z.string().min(1, "Office to attach to is required"),
  effectiveFrom: z.string().min(1, "Effective Date is required"),
  effectiveTo: z.string().optional(),
  orderNumber: z.string().min(1, "Order Number is required"),
  reason: z.string().min(1, "Reason is required")
});

type FormData = z.infer<typeof schema>;

export const RecordAttachmentPage = () => {
  // Global active attachments table state
  const { data: dashboardData, loading: dashboardLoading } = useGetDashboardStats();
  const [activeAttachments, setActiveAttachments] = useState<any[]>([]);

  useEffect(() => {
    if (dashboardData?.attachedEmployeesList) {
      setActiveAttachments(dashboardData.attachedEmployeesList);
    }
  }, [dashboardData]);

  // Step 1 State
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedEmp, setSelectedEmp] = useState<EmployeeListItem | null>(null);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(searchTerm), 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const { data: employees } = useGetEmployees({ search: debouncedSearch });
  
  // Step 2 Form
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      effectiveFrom: new Date().toISOString().split('T')[0]
    }
  });

  const { data: offices } = useGetOffices();
  const { execute, loading: submitLoading, error: submitError } = useRecordAttachment();
  const { execute: endAttachment, loading: endLoading } = useEndAttachment();

  const handleEndAttachment = async (attachmentId: string) => {
    if (!window.confirm("Are you sure you want to end this attachment?")) return;
    try {
      await endAttachment(attachmentId);
      // Optimistic UI update
      setActiveAttachments(prev => prev.filter(att => att.attachment.id !== attachmentId));
    } catch (err) {
      alert("Failed to end attachment");
    }
  };

  const onSubmit = async (data: FormData) => {
    if (!selectedEmp) return;
    try {
      const attData = {
        employeeId: selectedEmp.id,
        officeId: data.officeId,
        effectiveFrom: new Date(data.effectiveFrom),
        effectiveTo: data.effectiveTo ? new Date(data.effectiveTo) : undefined,
        orderNumber: data.orderNumber,
        reason: data.reason
      };
      
      const newAtt = await execute(attData);
      
      // Update local state to reflect new attachment
      const assignedOffice = offices?.find(o => o.id === data.officeId);
      if (assignedOffice) {
        setActiveAttachments(prev => [{
          employee: selectedEmp,
          attachment: newAtt,
          attachedToOffice: assignedOffice
        }, ...prev]);
      }
      
      setSelectedEmp(null);
      setSearchTerm('');
      reset();
      alert("Attachment recorded successfully!");
    } catch (err) {}
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      <PageHeader title="Record Attachment" breadcrumb="Attachments / New" />

      {submitError && <div className="p-4 bg-red-50 text-red-700 rounded-lg">{submitError.message}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Form */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-2 mb-4">1. Select Employee</h2>
            
            {!selectedEmp ? (
              <div>
                <div className="relative mb-4">
                  <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    type="text" 
                    placeholder="Search by Name or CNIC to select..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                {debouncedSearch && employees && employees.length > 0 && (
                  <div className="max-h-60 overflow-y-auto border border-gray-100 rounded-lg shadow-sm">
                    {employees.map(emp => (
                      <button 
                        key={emp.id}
                        onClick={() => setSelectedEmp(emp)}
                        className="w-full text-left p-3 hover:bg-gray-50 border-b border-gray-50 flex justify-between items-center"
                      >
                        <div>
                          <p className="font-semibold text-gray-900">{emp.name}</p>
                          <p className="text-xs text-gray-500">{emp.cnic}</p>
                        </div>
                        <BSBadge bs={emp.basicScale || 0} />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-between bg-blue-50/50 p-4 rounded-lg border border-blue-100">
                <div>
                  <p className="font-bold text-gray-900">{selectedEmp.name} <span className="text-sm font-normal text-gray-500 ml-2">({selectedEmp.cnic})</span></p>
                  <p className="text-sm text-gray-600 mt-1">Home Office: <span className="font-medium text-gray-900">{selectedEmp.currentOffice?.name || 'Unassigned'}</span></p>
                </div>
                <button 
                  onClick={() => setSelectedEmp(null)} 
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  Change
                </button>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className={`space-y-6 bg-white p-6 rounded-xl shadow-sm border border-gray-100 transition-opacity ${!selectedEmp ? 'opacity-50 pointer-events-none' : ''}`}>
            <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-2">2. Attachment Details</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Attach To Office *</label>
                <select {...register("officeId")} className="w-full border border-gray-300 rounded-md p-2">
                  <option value="">Select Destination Office...</option>
                  {offices?.filter(o => o.id !== selectedEmp?.currentPosting?.officeId).map(o => (
                    <option key={o.id} value={o.id}>{o.name}</option>
                  ))}
                </select>
                {errors.officeId && <p className="text-red-500 text-xs mt-1">{errors.officeId.message}</p>}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Effective From *</label>
                  <input type="date" {...register("effectiveFrom")} className="w-full border border-gray-300 rounded-md p-2" />
                  {errors.effectiveFrom && <p className="text-red-500 text-xs mt-1">{errors.effectiveFrom.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Effective To</label>
                  <input type="date" {...register("effectiveTo")} className="w-full border border-gray-300 rounded-md p-2 text-gray-500" />
                  <p className="text-xs text-gray-400 mt-1">Leave blank for indefinite</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Order Number *</label>
                <input type="text" {...register("orderNumber")} className="w-full border border-gray-300 rounded-md p-2" />
                {errors.orderNumber && <p className="text-red-500 text-xs mt-1">{errors.orderNumber.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reason *</label>
                <textarea {...register("reason")} rows={2} className="w-full border border-gray-300 rounded-md p-2" />
                {errors.reason && <p className="text-red-500 text-xs mt-1">{errors.reason.message}</p>}
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 flex justify-end">
              <button type="submit" disabled={submitLoading} className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors w-full justify-center">
                <Save className="w-5 h-5" />
                {submitLoading ? 'Recording...' : 'Record Attachment'}
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Active Attachments */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col overflow-hidden h-full">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
            <h2 className="text-lg font-bold text-gray-900">Active System Attachments</h2>
            <p className="text-sm text-gray-500 mt-1">Manage all currently active attachments across Punjab.</p>
          </div>
          <div className="flex-1 p-0 overflow-y-auto max-h-[700px]">
            <DataTable 
              columns={[
                { key: 'employee', label: 'Employee', render: (_, row) => (
                  <div>
                    <p className="font-semibold text-gray-900">{row.employee.name}</p>
                    <p className="text-xs text-gray-500">Since {new Date(row.attachment.effectiveFrom).toLocaleDateString()}</p>
                  </div>
                )},
                { key: 'attachedTo', label: 'Attached To', render: (_, row) => row.attachedToOffice.name },
                { key: 'actions', label: '', render: (_, row) => (
                  <button 
                    onClick={() => handleEndAttachment(row.attachment.id)}
                    disabled={endLoading}
                    className="text-red-600 hover:text-red-800 text-sm font-medium bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                  >
                    End Attachment
                  </button>
                )}
              ]}
              data={activeAttachments}
              pagination={true}
              itemsPerPage={10}
            />
            {activeAttachments.length === 0 && !dashboardLoading && (
              <div className="p-8 text-center text-gray-500">
                No active attachments found.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
