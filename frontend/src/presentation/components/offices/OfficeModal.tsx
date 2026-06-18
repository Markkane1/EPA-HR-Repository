import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import { Modal } from '../shared/Modal';
import { useCreateOffice } from '../../../application/usecases/useCreateOffice';
import { useUpdateOffice } from '../../../application/usecases/useUpdateOffice';
import { Office } from '../../../domain/entities';

const schema = z.object({
  name: z.string().min(3, 'Name is required'),
  type: z.enum(['Directorate', 'Regional Office', 'Field Office']),
  location: z.string().min(3, 'Location is required'),
  district: z.string().min(3, 'District is required'),
});

type FormData = z.infer<typeof schema>;

interface OfficeModalProps {
  isOpen: boolean;
  onClose: () => void;
  officeToEdit?: Office | null;
  onSuccess: () => void;
}

export const OfficeModal = ({ isOpen, onClose, officeToEdit, onSuccess }: OfficeModalProps) => {
  const { createOffice, isLoading: isCreating, error: createError } = useCreateOffice();
  const { updateOffice, isLoading: isUpdating, error: updateError } = useUpdateOffice();

  const isEditMode = !!officeToEdit;
  const isLoading = isCreating || isUpdating;
  const error = createError || updateError;

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      type: 'Field Office'
    }
  });

  useEffect(() => {
    if (officeToEdit) {
      reset({
        name: officeToEdit.name,
        type: officeToEdit.type as any,
        location: officeToEdit.location,
        district: officeToEdit.district,
      });
    } else {
      reset({ type: 'Field Office', name: '', location: '', district: '' });
    }
  }, [officeToEdit, isOpen, reset]);

  const onSubmit = async (data: FormData) => {
    let success = false;
    if (isEditMode && officeToEdit) {
      const updated = await updateOffice(officeToEdit.id, data);
      success = !!updated;
    } else {
      const created = await createOffice(data);
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
      title={isEditMode ? 'Edit Office' : 'Add New Office'}
    >
      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2 col-span-2">
            <label className="text-sm font-medium text-gray-700">Office Name</label>
            <input
              {...register('name')}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="e.g. EPA Regional Office Lahore"
            />
            {errors.name && <p className="text-red-500 text-xs">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Office Type</label>
            <select
              {...register('type')}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="Directorate">Directorate</option>
              <option value="Regional Office">Regional Office</option>
              <option value="Field Office">Field Office</option>
            </select>
            {errors.type && <p className="text-red-500 text-xs">{errors.type.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">District</label>
            <input
              {...register('district')}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="e.g. Lahore"
            />
            {errors.district && <p className="text-red-500 text-xs">{errors.district.message}</p>}
          </div>

          <div className="space-y-2 col-span-2">
            <label className="text-sm font-medium text-gray-700">Full Address / Location</label>
            <input
              {...register('location')}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="e.g. National Hockey Stadium, Lahore"
            />
            {errors.location && <p className="text-red-500 text-xs">{errors.location.message}</p>}
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
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{isEditMode ? 'Updating...' : 'Creating...'}</span>
              </>
            ) : (
              <span>{isEditMode ? 'Update Office' : 'Create Office'}</span>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};
