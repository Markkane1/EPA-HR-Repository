import { useParams, Link } from 'react-router-dom';
import { useGetOffice } from '../../application/usecases/useGetOffice';
import { useCreatePosition } from '../../application/usecases/useCreatePosition';
import { useDeletePosition } from '../../application/usecases/useDeletePosition';
import { useAuthContext } from '../contexts/AuthContext';
import { PageHeader } from '../components/shared/PageHeader';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';
import { EmptyState } from '../components/shared/EmptyState';
import { BSBadge } from '../components/shared/BSBadge';
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
    <>
      <PageHeader 
        title={office.name} 
        breadcrumb="Offices / Detail" 
        actionButton={<span className="inline-block py-1 px-2 rounded font-bold text-[75%] leading-none text-center whitespace-nowrap bg-[#36b9cc] text-white uppercase">{office.type}</span>}
      />

      <div className="bg-white rounded-[0.35rem] shadow-[0_0.15rem_1.75rem_0_rgba(58,59,69,0.15)] mb-6">
        <div className="p-5">
          <div className="text-[#858796] mb-4 font-bold">
            <i className="fas fa-map-marker-alt w-5 text-center mr-1"></i>
            {office.location}, {office.district}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 text-center mt-3 border-t border-[#e3e6f0] pt-4 gap-y-4">
            <div>
              <div className="text-[0.7rem] font-bold text-[#b7b9cc] uppercase mb-1">Sanctioned Seats</div>
              <div className="text-3xl mb-0 font-bold text-[#5a5c69]">{totalSeats}</div>
            </div>
            <div>
              <div className="text-[0.7rem] font-bold text-[#b7b9cc] uppercase mb-1">Occupied</div>
              <div className="text-3xl mb-0 font-bold text-[#1cc88a]">{occupiedSeats}</div>
            </div>
            <div>
              <div className="text-[0.7rem] font-bold text-[#b7b9cc] uppercase mb-1">Vacant</div>
              <div className="text-3xl mb-0 font-bold text-[#e74a3b]">{vacantSeats}</div>
            </div>
            <div>
              <div className="text-[0.7rem] font-bold text-[#b7b9cc] uppercase mb-1">Fill Rate</div>
              <div className="text-3xl mb-0 font-bold text-[#4e73df]">{fillRate}%</div>
            </div>
          </div>
        </div>
      </div>

      {isAdmin && (
        <div className="bg-white rounded-[0.35rem] shadow-[0_0.15rem_1.75rem_0_rgba(58,59,69,0.15)] mb-6 border-l-[0.25rem] border-[#4e73df] bg-[#f8f9fc]">
          <div className="p-5">
            <div className="flex items-center mb-4">
              <i className="fas fa-plus-circle text-xl text-[#4e73df] mr-2"></i>
              <h5 className="m-0 font-bold text-[#4e73df]">Add New Sanctioned Post</h5>
              {createSuccess && <span className="ml-auto inline-block py-1 px-2 rounded font-bold text-[75%] leading-none text-center whitespace-nowrap bg-[#1cc88a] text-white"><i className="fas fa-check-circle mr-1"></i>Success!</span>}
            </div>
            <form onSubmit={handleSubmit(onAddPosition)} className="flex flex-wrap items-start -mx-2">
              <div className="w-full md:w-5/12 px-2 mb-2">
                <input
                  {...register('title')}
                  placeholder="Post Title (e.g. Assistant Director)"
                  className="w-full h-[calc(1.5em+0.75rem+2px)] px-[0.75rem] py-[0.375rem] text-[1rem] font-normal leading-[1.5] text-[#6e707e] bg-white bg-clip-padding border border-[#d1d3e2] rounded-[0.35rem] outline-none focus:border-[#bac8f3] focus:ring focus:ring-[rgba(78,115,223,0.25)] transition-colors"
                />
                {errors.title && <small className="text-[#e74a3b]">{errors.title.message}</small>}
              </div>
              <div className="w-1/2 md:w-2/12 px-2 mb-2">
                <input
                  {...register('basicScale')}
                  type="number"
                  placeholder="BS (1-22)"
                  className="w-full h-[calc(1.5em+0.75rem+2px)] px-[0.75rem] py-[0.375rem] text-[1rem] font-normal leading-[1.5] text-[#6e707e] bg-white bg-clip-padding border border-[#d1d3e2] rounded-[0.35rem] outline-none focus:border-[#bac8f3] focus:ring focus:ring-[rgba(78,115,223,0.25)] transition-colors"
                />
                {errors.basicScale && <small className="text-[#e74a3b]">{errors.basicScale.message}</small>}
              </div>
              <div className="w-1/2 md:w-2/12 px-2 mb-2">
                <input
                  {...register('totalSeats')}
                  type="number"
                  placeholder="Seats"
                  className="w-full h-[calc(1.5em+0.75rem+2px)] px-[0.75rem] py-[0.375rem] text-[1rem] font-normal leading-[1.5] text-[#6e707e] bg-white bg-clip-padding border border-[#d1d3e2] rounded-[0.35rem] outline-none focus:border-[#bac8f3] focus:ring focus:ring-[rgba(78,115,223,0.25)] transition-colors"
                />
                {errors.totalSeats && <small className="text-[#e74a3b]">{errors.totalSeats.message}</small>}
              </div>
              <div className="w-full md:w-3/12 px-2 mb-2">
                <button
                  type="submit"
                  disabled={isCreating}
                  className="w-full h-[calc(1.5em+0.75rem+2px)] bg-[#4e73df] text-white text-[1rem] rounded-[0.35rem] hover:bg-[#2e59d9] transition-colors flex items-center justify-center outline-none border border-transparent font-normal cursor-pointer select-none"
                >
                  {isCreating ? <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" role="status" aria-hidden="true"></span> : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <h4 className="font-bold text-gray-900 mb-4 mt-10">Positions & Seats Mapping</h4>
      <div className="flex flex-col gap-6">
        {sortedPositions.map(pos => {
          const posSeats = seats.filter(s => s.positionId === pos.id);
          return (
            <div key={pos.id} className="bg-white rounded-[0.35rem] shadow-sm">
              <div className="px-5 py-4 border-b border-[#e3e6f0] flex flex-row items-center justify-between bg-[#f8f9fc] rounded-t-[0.35rem]">
                <div className="flex items-center flex-wrap gap-2">
                  <BSBadge bs={pos.basicScale || 0} />
                  <h6 className="m-0 font-bold text-gray-900">{pos.title}</h6>
                  <span className="text-sm text-gray-500">({pos.totalSeats} sanctioned seats)</span>
                </div>
                {isAdmin && (
                  <div className="relative group">
                    <a className="cursor-pointer px-2 py-1 outline-none text-[#d1d3e2] hover:text-[#858796] transition-colors" role="button">
                      <i className="fas fa-ellipsis-v fa-sm fa-fw"></i>
                    </a>
                    <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded shadow-lg py-2 border border-gray-100 hidden group-hover:block z-50">
                      <div className="px-4 py-2 text-xs font-bold text-[#b7b9cc] uppercase tracking-wider">Manage Position:</div>
                      <a className="block px-4 py-2 text-sm text-[#3a3b45] hover:bg-[#f8f9fc] hover:text-[#2e59d9] transition-colors cursor-pointer" onClick={(e) => { e.preventDefault(); handleEditPosition(pos); }}>
                        <i className="fas fa-edit fa-sm fa-fw mr-2 text-[#d1d3e2]"></i> Edit
                      </a>
                      <a className="block px-4 py-2 text-sm text-[#e74a3b] hover:bg-red-50 hover:text-red-700 transition-colors cursor-pointer" onClick={(e) => { e.preventDefault(); handleDeletePositionClick(pos.id); }}>
                        <i className="fas fa-trash fa-sm fa-fw mr-2"></i> Delete
                      </a>
                    </div>
                  </div>
                )}
              </div>
              <div className="p-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                  {posSeats.map(seat => {
                    if (seat.status === 'vacant') {
                      return (
                        <div key={seat.id} className="bg-gray-100 rounded-[0.35rem] py-3 px-4 flex flex-col justify-center items-center h-full min-h-[5rem]">
                          <div className="text-sm font-bold text-gray-500 mb-1">Seat {seat.seatNumber}</div>
                          <div className="text-xs uppercase tracking-widest font-bold text-gray-400">Vacant</div>
                        </div>
                      );
                    } else {
                      const occupantPosting = currentPostings.find(p => p.seatId === seat.id);
                      const occupant = occupantPosting ? currentOccupants.find(e => e.id === occupantPosting.employeeId) : null;
                      return (
                        <div key={seat.id} className="bg-[#1cc88a] rounded-[0.35rem] py-3 px-4 flex flex-col justify-center items-center shadow-sm h-full min-h-[5rem]">
                          <div className="text-sm font-bold text-white/80 mb-1">Seat {seat.seatNumber}</div>
                          {occupant ? (
                            <Link to={`/employees/${occupant.id}`} className="text-white no-underline hover:text-white/80 transition-colors flex flex-col items-center">
                              <div className="font-bold text-white text-center">{occupant.name}</div>
                              <div className="text-[0.7rem] text-white/70 mt-1">{occupant.cnic}</div>
                            </Link>
                          ) : (
                            <div className="text-[0.7rem] uppercase tracking-widest font-bold text-white/70 mt-1">Occupied</div>
                          )}
                        </div>
                      );
                    }
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {currentlyAttached.length > 0 && (
        <div className="mt-8 mb-10">
          <h4 className="font-bold text-gray-900 mb-4">Currently Attached Here</h4>
          <div className="bg-white rounded-[0.35rem] shadow-[0_0.15rem_1.75rem_0_rgba(58,59,69,0.15)] overflow-hidden">
            <ul className="m-0 p-0 list-none">
              {currentlyAttached.map(att => (
                <li key={att.id} className="px-5 py-4 border-b border-[#e3e6f0] last:border-b-0 flex justify-between items-center bg-white hover:bg-gray-50 transition-colors">
                  <div>
                    <div className="font-bold text-gray-900">Employee ID: {att.employeeId}</div>
                    <div className="text-sm text-[#858796] mt-1">{att.reason}</div>
                  </div>
                  <span className="inline-block py-1 px-3 rounded-full font-bold text-[75%] leading-none text-center whitespace-nowrap align-baseline bg-[#858796] text-white">Since {new Date(att.effectiveFrom).toLocaleDateString()}</span>
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
    </>
  );
};
