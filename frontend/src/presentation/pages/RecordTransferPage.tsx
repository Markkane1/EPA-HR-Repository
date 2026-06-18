import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { useGetEmployees } from '../../application/usecases/useGetEmployees';
import { useGetOffices } from '../../application/usecases/useGetOffices';
import { useGetOffice } from '../../application/usecases/useGetOffice';
import { useRecordTransfer } from '../../application/usecases/useRecordTransfer';
import { PageHeader } from '../components/shared/PageHeader';
import { BSBadge } from '../components/shared/BSBadge';
import { Save, Search, ArrowRight, CheckCircle2 } from 'lucide-react';
import { EmployeeListItem } from '../../domain/entities';

const schema = z.object({
  officeId: z.string().min(1, "Office is required"),
  positionId: z.string().min(1, "Position is required"),
  seatId: z.string().min(1, "Seat is required"),
  effectiveFrom: z.string().min(1, "Effective Date is required"),
  orderNumber: z.string().min(1, "Order Number is required"),
  remarks: z.string().optional()
});

type FormData = z.infer<typeof schema>;

export const RecordTransferPage = () => {
  const navigate = useNavigate();
  
  // Step 1 State
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedEmp, setSelectedEmp] = useState<EmployeeListItem | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  // Simple debounce
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(searchTerm), 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const { data: employees, loading: empLoading } = useGetEmployees({ search: debouncedSearch });
  
  // Step 2 Form
  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      effectiveFrom: new Date().toISOString().split('T')[0]
    }
  });

  const { data: offices } = useGetOffices();
  const selectedOfficeId = watch("officeId");
  const selectedPositionId = watch("positionId");
  
  const { data: officeDetails } = useGetOffice(selectedOfficeId);
  const { execute, loading: submitLoading, error: submitError } = useRecordTransfer();

  const availablePositions = officeDetails?.positions || [];
  const availableSeats = officeDetails?.seats.filter(s => s.positionId === selectedPositionId && s.status === 'vacant') || [];

  const onSubmit = async (data: FormData) => {
    if (!selectedEmp) return;
    try {
      const postData = {
        officeId: data.officeId,
        positionId: data.positionId,
        seatId: data.seatId,
        effectiveFrom: new Date(data.effectiveFrom),
        orderNumber: data.orderNumber,
        remarks: data.remarks
      };
      
      await execute(selectedEmp.id, postData);
      setShowSuccess(true);
      setTimeout(() => navigate(`/employees/${selectedEmp.id}`), 2000);
    } catch (err) {}
  };

  if (showSuccess) {
    return (
      <div className="max-w-3xl mx-auto py-12 flex flex-col items-center text-center">
        <CheckCircle2 className="w-16 h-16 text-green-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Transfer Recorded Successfully</h2>
        <p className="text-gray-500 mb-6">Redirecting to employee profile...</p>
        
        <div className="flex items-center gap-4 bg-white p-6 rounded-xl shadow-sm border border-gray-100 w-full justify-center">
          <div className="text-right flex-1">
            <p className="text-sm font-medium text-gray-500">From</p>
            <p className="font-bold text-gray-900">{selectedEmp?.currentOffice?.name || 'Unassigned'}</p>
          </div>
          <ArrowRight className="w-6 h-6 text-gray-400" />
          <div className="text-left flex-1">
            <p className="text-sm font-medium text-gray-500">To</p>
            <p className="font-bold text-blue-600">{officeDetails?.office.name}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <PageHeader title="Record Transfer" breadcrumb="Transfers / New" />
      
      {submitError && <div className="p-4 bg-red-50 text-red-700 rounded-lg">{submitError.message}</div>}

      {/* STEP 1: Search Employee */}
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
              <p className="text-sm text-gray-600 mt-1">Current Office: <span className="font-medium text-gray-900">{selectedEmp.currentOffice?.name || 'Unassigned'}</span></p>
            </div>
            <button 
              onClick={() => setSelectedEmp(null)} 
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Change Employee
            </button>
          </div>
        )}
      </div>

      {/* STEP 2: Transfer Details */}
      {selectedEmp && (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-2">2. New Posting Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New Office *</label>
              <select {...register("officeId")} className="w-full border border-gray-300 rounded-md p-2">
                <option value="">Select Office...</option>
                {offices?.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
              </select>
              {errors.officeId && <p className="text-red-500 text-xs mt-1">{errors.officeId.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Position *</label>
              <select {...register("positionId")} disabled={!selectedOfficeId} className="w-full border border-gray-300 rounded-md p-2 disabled:bg-gray-100">
                <option value="">Select Position...</option>
                {availablePositions.map(p => <option key={p.id} value={p.id}>{p.title} (BS-{p.basicScale})</option>)}
              </select>
              {errors.positionId && <p className="text-red-500 text-xs mt-1">{errors.positionId.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vacant Seat *</label>
              <select {...register("seatId")} disabled={!selectedPositionId} className="w-full border border-gray-300 rounded-md p-2 disabled:bg-gray-100">
                <option value="">Select Seat...</option>
                {availableSeats.map(s => <option key={s.id} value={s.id}>Seat #{s.seatNumber}</option>)}
              </select>
              {errors.seatId && <p className="text-red-500 text-xs mt-1">{errors.seatId.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Effective Date *</label>
              <input type="date" {...register("effectiveFrom")} className="w-full border border-gray-300 rounded-md p-2" />
              {errors.effectiveFrom && <p className="text-red-500 text-xs mt-1">{errors.effectiveFrom.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Order Number *</label>
              <input type="text" {...register("orderNumber")} className="w-full border border-gray-300 rounded-md p-2" />
              {errors.orderNumber && <p className="text-red-500 text-xs mt-1">{errors.orderNumber.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
              <input type="text" {...register("remarks")} className="w-full border border-gray-300 rounded-md p-2" />
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 flex justify-end">
            <button type="submit" disabled={submitLoading} className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors">
              <Save className="w-5 h-5" />
              {submitLoading ? 'Processing Transfer...' : 'Record Transfer'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
