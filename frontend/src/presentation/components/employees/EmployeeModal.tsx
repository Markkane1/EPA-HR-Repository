import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import { Modal } from '../shared/Modal';
import { useCreateEmployee } from '../../../application/usecases/useCreateEmployee';
import { useUpdateEmployee } from '../../../application/usecases/useUpdateEmployee';
import { useGetOffices } from '../../../application/usecases/useGetOffices';
import { useGetOffice } from '../../../application/usecases/useGetOffice';
import { EmployeeProfile, EmployeeListItem } from '../../../domain/entities';

const baseSchema = {
  name: z.string().min(2, "Name is required"),
  fatherName: z.string().optional(),
  cnic: z.string().regex(/^\d{5}-\d{7}-\d{1}$/, "CNIC must be formatted as 00000-0000000-0"),
  basicScale: z.coerce.number().min(1).max(22),
};

const createSchema = z.object({
  ...baseSchema,
  officeId: z.string().min(1, "Office is required"),
  positionId: z.string().min(1, "Position is required"),
  seatId: z.string().min(1, "Seat is required")
});

const editSchema = z.object(baseSchema);

interface EmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  employeeToEdit?: EmployeeListItem | EmployeeProfile | null;
  onSuccess: () => void;
}

export const EmployeeModal = ({ isOpen, onClose, employeeToEdit, onSuccess }: EmployeeModalProps) => {
  const isEditMode = !!employeeToEdit;
  
  const { createEmployee, isLoading: isCreating, error: createError } = useCreateEmployee();
  const { updateEmployee, isLoading: isUpdating, error: updateError } = useUpdateEmployee();
  
  const isLoading = isCreating || isUpdating;
  const error = createError || updateError;

  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm<any>({
    resolver: zodResolver(isEditMode ? editSchema : createSchema)
  });

  const { data: offices } = useGetOffices();
  const selectedOfficeId = watch("officeId");
  const selectedPositionId = watch("positionId");
  
  const { data: officeDetails } = useGetOffice(selectedOfficeId);

  const availablePositions = officeDetails?.positions || [];
  const availableSeats = officeDetails?.seats.filter(s => s.positionId === selectedPositionId && s.status === 'vacant') || [];

  useEffect(() => {
    if (employeeToEdit) {
      reset({
        name: employeeToEdit.name,
        fatherName: employeeToEdit.fatherName || '',
        cnic: employeeToEdit.cnic,
        basicScale: employeeToEdit.basicScale,
      });
    } else {
      reset({ name: '', fatherName: '', cnic: '', basicScale: '', officeId: '', positionId: '', seatId: '' });
    }
  }, [employeeToEdit, isOpen, reset]);

  const onSubmit = async (data: any) => {
    let success = false;
    
    if (isEditMode && employeeToEdit) {
      const updated = await updateEmployee(employeeToEdit.id, {
        name: data.name,
        fatherName: data.fatherName,
        cnic: data.cnic,
        basicScale: data.basicScale,
      });
      success = !!updated;
    } else {
      const empData = {
        name: data.name,
        fatherName: data.fatherName,
        cnic: data.cnic,
        basicScale: data.basicScale,
        status: 'active'
      };
      const postData = {
        officeId: data.officeId,
        positionId: data.positionId,
        seatId: data.seatId,
        effectiveFrom: new Date()
      };
      
      const created = await createEmployee(empData, postData);
      success = !!created;
    }

    if (success) {
      onSuccess();
      onClose();
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={isEditMode ? 'Edit Employee Info' : 'Add New Employee'}
      maxWidth="max-w-4xl"
    >
      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg text-sm">
          {error.message || String(error)}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div>
          <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-2 mb-4">Personal Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
              <input {...register("name")} className="w-full border border-gray-300 rounded-md p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message as string}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Father's Name</label>
              <input {...register("fatherName")} className="w-full border border-gray-300 rounded-md p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">CNIC (00000-0000000-0) *</label>
              <input {...register("cnic")} placeholder="xxxxx-xxxxxxx-x" className="w-full border border-gray-300 rounded-md p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
              {errors.cnic && <p className="text-red-500 text-xs mt-1">{errors.cnic.message as string}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Basic Scale (BS) *</label>
              <input type="number" {...register("basicScale")} className="w-full border border-gray-300 rounded-md p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
              {errors.basicScale && <p className="text-red-500 text-xs mt-1">{errors.basicScale.message as string}</p>}
            </div>
          </div>
        </div>

        {!isEditMode && (
          <div>
            <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-2 mb-4">Initial Posting Assignment</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Office *</label>
                <select {...register("officeId")} className="w-full border border-gray-300 rounded-md p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                  <option value="">Select Office...</option>
                  {offices?.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
                </select>
                {errors.officeId && <p className="text-red-500 text-xs mt-1">{errors.officeId.message as string}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Position *</label>
                <select {...register("positionId")} disabled={!selectedOfficeId} className="w-full border border-gray-300 rounded-md p-2 disabled:bg-gray-100 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                  <option value="">Select Position...</option>
                  {availablePositions.map(p => <option key={p.id} value={p.id}>{p.title} (BS-{p.basicScale})</option>)}
                </select>
                {errors.positionId && <p className="text-red-500 text-xs mt-1">{errors.positionId.message as string}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vacant Seat *</label>
                <select {...register("seatId")} disabled={!selectedPositionId} className="w-full border border-gray-300 rounded-md p-2 disabled:bg-gray-100 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                  <option value="">Select Seat...</option>
                  {availableSeats.map(s => <option key={s.id} value={s.id}>Seat #{s.seatNumber}</option>)}
                </select>
                {errors.seatId && <p className="text-red-500 text-xs mt-1">{errors.seatId.message as string}</p>}
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end pt-4 border-t border-gray-100 space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{isEditMode ? 'Updating...' : 'Creating...'}</span>
              </>
            ) : (
              <span>{isEditMode ? 'Update Employee' : 'Save Employee'}</span>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};
