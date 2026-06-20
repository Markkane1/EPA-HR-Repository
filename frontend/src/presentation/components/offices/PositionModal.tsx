import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '../shared/Modal';
import { useUpdatePosition } from '../../../application/usecases/useUpdatePosition';

const schema = z.object({
  title: z.string().min(3, 'Title is required'),
  basicScale: z.coerce.number().min(1).max(22),
  totalSeats: z.coerce.number().min(1, 'At least 1 seat required')
});

type FormData = z.infer<typeof schema>;

interface PositionModalProps {
  isOpen: boolean;
  onClose: () => void;
  officeId: string;
  positionToEdit: any; // using any for simplicity, or Position if available
  onSuccess: () => void;
}

export const PositionModal = ({ isOpen, onClose, officeId, positionToEdit, onSuccess }: PositionModalProps) => {
  const { updatePosition, isLoading, error } = useUpdatePosition();
  const [showSuccess, setShowSuccess] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema)
  });

  useEffect(() => {
    if (isOpen) setShowSuccess(false);
    if (positionToEdit) {
      reset({
        title: positionToEdit.title,
        basicScale: positionToEdit.basicScale,
        totalSeats: positionToEdit.totalSeats,
      });
    }
  }, [positionToEdit, isOpen, reset]);

  const onSubmit = async (data: FormData) => {
    if (positionToEdit) {
      const success = await updatePosition(officeId, positionToEdit.id, data);
      if (success) {
        setShowSuccess(true);
        onSuccess();
        setTimeout(() => {
          onClose();
        }, 1500);
      }
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Edit Position"
      maxWidth="max-w-md"
    >
      <div className="space-y-6 relative">
        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Position Title</label>
          <input
            {...register('title')}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="e.g. Assistant Director"
          />
          {errors.title && <p className="text-red-500 text-xs">{errors.title.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Basic Scale (BS)</label>
            <input
              {...register('basicScale')}
              type="number"
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            {errors.basicScale && <p className="text-red-500 text-xs">{errors.basicScale.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Total Sanctioned Seats</label>
            <input
              {...register('totalSeats')}
              type="number"
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            {errors.totalSeats && <p className="text-red-500 text-xs">{errors.totalSeats.message}</p>}
          </div>
        </div>

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
            disabled={isLoading || showSuccess}
            className={`px-4 py-2 text-white rounded-lg transition-all duration-300 text-sm font-medium flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed ${showSuccess ? 'bg-green-600' : 'bg-blue-600 hover:bg-blue-700'}`}
          >
            {isLoading ? (
              <>
                <i className="fas fa-circle-notch fa-spin"></i>
                <span>Updating...</span>
              </>
            ) : showSuccess ? (
              <>
                <i className="fas fa-check-circle"></i>
                <span>Updated!</span>
              </>
            ) : (
              <span>Update Position</span>
            )}
          </button>
        </div>
      </form>
      </div>
    </Modal>
  );
};
