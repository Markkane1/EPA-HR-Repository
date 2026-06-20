import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useGetOffices } from '../../../application/usecases/useGetOffices';
import { useRecordAttachment } from '../../../application/usecases/useRecordAttachment';
import { Modal } from '../shared/Modal';
import { Employee } from '../../../domain/entities';
import { SearchableSelect } from '../shared/SearchableSelect';
import { groupOfficesByDivision } from '../../../domain/constants/punjabDivisions';

const schema = z.object({
  officeId: z.string().min(1, "Office to attach to is required"),
  effectiveFrom: z.string().min(1, "Effective Date is required"),
  effectiveTo: z.string().optional(),
  orderNumber: z.string().min(1, "Order Number is required"),
  reason: z.string().min(1, "Reason is required")
});

type FormData = z.infer<typeof schema>;

interface AttachmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: Employee;
  onSuccess: () => void;
}

export const AttachmentModal = ({ isOpen, onClose, employee, onSuccess }: AttachmentModalProps) => {
  const [showSuccess, setShowSuccess] = useState(false);
  const { data: offices } = useGetOffices();
  const { execute, loading: submitLoading, error: submitError } = useRecordAttachment();

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      effectiveFrom: new Date().toISOString().split('T')[0]
    }
  });

  const selectedOfficeId = watch("officeId");

  const handleClose = () => {
    reset();
    setShowSuccess(false);
    onClose();
  };

  const onSubmit = async (data: FormData) => {
    try {
      const attData = {
        employeeId: employee.id,
        officeId: data.officeId,
        effectiveFrom: new Date(data.effectiveFrom),
        effectiveTo: data.effectiveTo ? new Date(data.effectiveTo) : undefined,
        orderNumber: data.orderNumber,
        reason: data.reason
      };
      
      const newAtt = await execute(attData);
      if (newAtt) {
        setShowSuccess(true);
        onSuccess();
        setTimeout(() => handleClose(), 1500);
      }
    } catch (err) {}
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Record New Attachment" maxWidth="max-w-md">
      <div className="space-y-6 relative">
        {submitError && <div className="p-4 bg-red-50 text-red-700 rounded-lg">{submitError.message}</div>}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Attach To Office *</label>
            <SearchableSelect 
              groupedOptions={groupOfficesByDivision(offices?.filter(o => o.id !== employee.currentPosting?.officeId))}
              value={selectedOfficeId || ''}
              onChange={(val) => setValue('officeId', val, { shouldValidate: true })}
              placeholder="Select Destination Office..."
            />
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

          <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitLoading || showSuccess}
              className={`px-6 py-2 text-white rounded-lg transition-all duration-300 text-sm font-medium flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed ${showSuccess ? 'bg-green-600' : 'bg-blue-600 hover:bg-blue-700'}`}
            >
              {submitLoading ? (
                <>
                  <i className="fas fa-circle-notch fa-spin"></i>
                  <span>Recording...</span>
                </>
              ) : showSuccess ? (
                <>
                  <i className="fas fa-check-circle"></i>
                  <span>Attached!</span>
                </>
              ) : (
                <span>Record Attachment</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};
