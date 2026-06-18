import { useParams, Link } from 'react-router-dom';
import { useGetOffice } from '../../application/usecases/useGetOffice';
import { useCreatePosition } from '../../application/usecases/useCreatePosition';
import { useDeletePosition } from '../../application/usecases/useDeletePosition';
import { useAuthContext } from '../contexts/AuthContext';
import { PageHeader } from '../components/shared/PageHeader';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';
import { EmptyState } from '../components/shared/EmptyState';
import { BSBadge } from '../components/shared/BSBadge';
import { MapPin, PlusCircle, Loader2, Edit, Trash2, CheckCircle2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import { PositionModal } from '../components/offices/PositionModal';
import { ConfirmModal } from '../components/shared/ConfirmModal';

const positionSchema = z.object({
  title: z.string().min(3, 'Title is required'),
  basicScale: z.coerce.number().min(1).max(22),
  totalSeats: z.coerce.number().min(1, 'At least 1 seat required')
});

type PositionFormData = z.infer<typeof positionSchema>;

export const OfficeDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { data, loading: getLoading, error, mutate } = useGetOffice(id!);
  const { isAdmin } = useAuthContext();
  const { createPosition, isLoading: isCreating } = useCreatePosition();
  const { deletePosition, isLoading: isDeleting } = useDeletePosition();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [positionToEdit, setPositionToEdit] = useState<any>(null);
  const [positionToDelete, setPositionToDelete] = useState<string | null>(null);
  const [createSuccess, setCreateSuccess] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<PositionFormData>({
    resolver: zodResolver(positionSchema)
  });

  const onAddPosition = async (formData: PositionFormData) => {
    const success = await createPosition(id!, formData);
    if (success) {
      reset();
      setCreateSuccess(true);
      mutate(); // refresh data
      setTimeout(() => setCreateSuccess(false), 3000);
    }
  };

  const handleDeletePositionClick = (positionId: string) => {
    setPositionToDelete(positionId);
  };

  const confirmDeletePosition = async () => {
    if (!positionToDelete) return;
    const success = await deletePosition(id!, positionToDelete);
    if (success) {
      mutate();
      setPositionToDelete(null);
    } else {
      alert('Failed to delete position. Ensure all seats are vacant.');
      setPositionToDelete(null);
    }
  };

  const handleEditPosition = (position: any) => {
    setPositionToEdit(position);
    setIsModalOpen(true);
  };

  if (getLoading) return <LoadingSpinner />;
  if (error || !data) return <EmptyState message={error?.message || 'Failed to load office details'} />;

  const { office, positions, seats, currentOccupants, currentlyAttached, currentPostings } = data;

  const totalSeats = positions.reduce((sum, p) => sum + p.totalSeats, 0);
  const vacantSeats = seats.filter(s => s.status === 'vacant').length;
  const occupiedSeats = totalSeats - vacantSeats;
  const fillRate = totalSeats ? Math.round((occupiedSeats / totalSeats) * 100) : 0;

  const sortedPositions = [...positions].sort((a, b) => (b.basicScale || 0) - (a.basicScale || 0));

  return (
    <div className="space-y-6 pb-12">
      <PageHeader 
        title={office.name} 
        breadcrumb="Offices / Detail" 
        actionButton={<span className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full">{office.type}</span>}
      />

      <div className="flex items-center gap-2 text-gray-600 mb-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
        <MapPin className="w-5 h-5 text-gray-400" />
        <span className="font-medium">{office.location}, {office.district}</span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div><p className="text-sm text-gray-500 font-medium">Sanctioned Seats</p><p className="text-3xl font-bold text-gray-900 mt-1">{totalSeats}</p></div>
        <div><p className="text-sm text-gray-500 font-medium">Occupied</p><p className="text-3xl font-bold text-green-600 mt-1">{occupiedSeats}</p></div>
        <div><p className="text-sm text-gray-500 font-medium">Vacant</p><p className="text-3xl font-bold text-red-600 mt-1">{vacantSeats}</p></div>
        <div><p className="text-sm text-gray-500 font-medium">Fill Rate</p><p className="text-3xl font-bold text-blue-600 mt-1">{fillRate}%</p></div>
      </div>

      {isAdmin && (
        <div className="bg-blue-50/50 p-6 rounded-xl border border-blue-100 shadow-sm mt-8">
          <div className="flex items-center gap-2 mb-4">
            <PlusCircle className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-blue-900">Add New Sanctioned Post</h3>
            {createSuccess && <span className="ml-auto flex items-center gap-1 text-sm font-medium text-green-600"><CheckCircle2 className="w-4 h-4"/> Success!</span>}
          </div>
          <form onSubmit={handleSubmit(onAddPosition)} className="flex items-start gap-4">
            <div className="flex-1">
              <input
                {...register('title')}
                placeholder="Post Title (e.g. Assistant Director)"
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
            </div>
            <div className="w-32">
              <input
                {...register('basicScale')}
                type="number"
                placeholder="BS (1-22)"
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              {errors.basicScale && <p className="text-red-500 text-xs mt-1">{errors.basicScale.message}</p>}
            </div>
            <div className="w-32">
              <input
                {...register('totalSeats')}
                type="number"
                placeholder="Seats"
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              {errors.totalSeats && <p className="text-red-500 text-xs mt-1">{errors.totalSeats.message}</p>}
            </div>
            <button
              type="submit"
              disabled={isCreating}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center h-[42px]"
            >
              {isCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create'}
            </button>
          </form>
        </div>
      )}

      <div className="space-y-6 mt-8">
        <h2 className="text-xl font-bold text-gray-900">Positions & Seats Mapping</h2>
        {sortedPositions.map(pos => {
          const posSeats = seats.filter(s => s.positionId === pos.id);
          return (
            <div key={pos.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 relative group">
              <div className="flex items-center justify-between mb-6 border-b border-gray-50 pb-4">
                <div className="flex items-center gap-4">
                  <BSBadge bs={pos.basicScale || 0} />
                  <h3 className="text-lg font-semibold text-gray-900">{pos.title}</h3>
                  <span className="text-sm text-gray-500">({pos.totalSeats} sanctioned seats)</span>
                </div>
                {isAdmin && (
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      type="button"
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleEditPosition(pos); }}
                      className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit Position"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button 
                      type="button"
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDeletePositionClick(pos.id); }}
                      disabled={isDeleting}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                      title="Delete Position"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {posSeats.map(seat => {
                  if (seat.status === 'vacant') {
                    return (
                      <div key={seat.id} className="p-4 rounded-lg bg-gray-50 border border-gray-200 flex flex-col items-center justify-center min-h-[120px]">
                        <p className="text-sm font-medium text-gray-500">Seat {seat.seatNumber}</p>
                        <p className="text-xs text-gray-400 uppercase mt-2 tracking-widest font-bold">Vacant</p>
                      </div>
                    );
                  } else {
                    const occupantPosting = currentPostings.find(p => p.seatId === seat.id);
                    const occupant = occupantPosting ? currentOccupants.find(e => e.id === occupantPosting.employeeId) : null;
                    return (
                      <div key={seat.id} className="p-4 rounded-lg bg-green-50/50 border border-green-200 flex flex-col items-center justify-center min-h-[120px] hover:shadow-md transition-shadow">
                        <p className="text-sm font-medium text-green-800 mb-2">Seat {seat.seatNumber}</p>
                        {occupant ? (
                          <Link to={`/employees/${occupant.id}`} className="text-center group block">
                            <p className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{occupant.name}</p>
                            <p className="text-xs text-gray-500 mt-1">{occupant.cnic}</p>
                          </Link>
                        ) : (
                          <p className="text-xs text-green-600 uppercase mt-2 tracking-widest font-bold">Occupied</p>
                        )}
                      </div>
                    );
                  }
                })}
              </div>
            </div>
          );
        })}
      </div>

      {currentlyAttached.length > 0 && (
        <div className="mt-8 space-y-4">
          <h2 className="text-xl font-bold text-gray-900">Currently Attached Here</h2>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <ul className="divide-y divide-gray-100">
              {currentlyAttached.map(att => (
                <li key={att.id} className="py-3 flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Employee ID: {att.employeeId}</p>
                    <p className="text-xs text-gray-500">{att.reason}</p>
                  </div>
                  <span className="text-xs text-gray-400">Since {new Date(att.effectiveFrom).toLocaleDateString()}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {isAdmin && (
        <PositionModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          officeId={id!}
          positionToEdit={positionToEdit}
          onSuccess={mutate}
        />
      )}

      {isAdmin && (
        <ConfirmModal
          isOpen={!!positionToDelete}
          onClose={() => setPositionToDelete(null)}
          onConfirm={confirmDeletePosition}
          title="Delete Position"
          message="Are you sure you want to completely delete this position? This will delete all vacant seats associated with it. This action cannot be undone."
          confirmText="Delete Position"
          isDestructive={true}
          isLoading={isDeleting}
        />
      )}
    </div>
  );
};
