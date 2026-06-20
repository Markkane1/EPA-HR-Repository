import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useGetOffices } from '../../../application/usecases/useGetOffices';
import { useGetOffice } from '../../../application/usecases/useGetOffice';
import { useRecordTransfer } from '../../../application/usecases/useRecordTransfer';
import { Modal } from '../shared/Modal';
import { SearchableSelect } from '../shared/SearchableSelect';
import { groupOfficesByDivision } from '../../../domain/constants/punjabDivisions';

const schema = z.object({
  officeId: z.string().min(1, "Office is required"),
  positionId: z.string().min(1, "Position is required"),
  seatId: z.string().min(1, "Seat is required"),
  effectiveFrom: z.string().min(1, "Effective Date is required"),
  orderNumber: z.string().min(1, "Order Number is required"),
  remarks: z.string().optional()
});

type FormData = z.infer<typeof schema>;

interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  employeeId: string;
  onSuccess: () => void;
}

export const TransferModal = ({ isOpen, onClose, employeeId, onSuccess }: TransferModalProps) => {
  const [showSuccess, setShowSuccess] = useState(false);
  const { data: offices } = useGetOffices();
  const { execute, loading: submitLoading, error: submitError } = useRecordTransfer();

  const { register, handleSubmit, watch, formState: { errors }, reset, setValue } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      effectiveFrom: new Date().toISOString().split('T')[0]
    }
  });

  const selectedOfficeId = watch("officeId");
  const selectedPositionId = watch("positionId");
  const { data: officeDetails } = useGetOffice(selectedOfficeId);

  const availablePositions = officeDetails?.positions || [];
  const availableSeats = officeDetails?.seats.filter(s => s.positionId === selectedPositionId && s.status === 'vacant') || [];

  const handleClose = () => {
    reset();
    setShowSuccess(false);
    onClose();
  };

  const onSubmit = async (data: FormData) => {
    try {
      const postData = {
        officeId: data.officeId,
        positionId: data.positionId,
        seatId: data.seatId,
        effectiveFrom: new Date(data.effectiveFrom),
        orderNumber: data.orderNumber,
        remarks: data.remarks
      };
      
      const success = await execute(employeeId, postData);
      if (success) {
        setShowSuccess(true);
        onSuccess();
        setTimeout(() => handleClose(), 1500);
      }
    } catch (err) {}
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Record New Transfer" maxWidth="max-w-2xl">
      <div className="space-y-6 relative">
        {submitError && <div className="p-4 bg-red-50 text-red-700 rounded-lg">{submitError.message}</div>}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">New Office *</label>
              <SearchableSelect 
                groupedOptions={groupOfficesByDivision(offices)}
                value={selectedOfficeId || ''}
                onChange={(val) => setValue('officeId', val, { shouldValidate: true })}
                placeholder="Select Office..."
              />
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

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
              <input type="text" {...register("remarks")} className="w-full border border-gray-300 rounded-md p-2" />
            </div>
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
                  <span>Processing...</span>
                </>
              ) : showSuccess ? (
                <>
                  <i className="fas fa-check-circle"></i>
                  <span>Transferred!</span>
                </>
              ) : (
                <span>Record Transfer</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};
