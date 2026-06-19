import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useGetEmployee } from '../../application/usecases/useGetEmployee';
import { useGetPostingHistory } from '../../application/usecases/useGetPostingHistory';
import { useGetAttachmentHistory } from '../../application/usecases/useGetAttachmentHistory';
import { useEndAttachment } from '../../application/usecases/useEndAttachment';
import { useAuthContext } from '../contexts/AuthContext';
import { PageHeader } from '../components/shared/PageHeader';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';
import { EmptyState } from '../components/shared/EmptyState';
import { BSBadge } from '../components/shared/BSBadge';
import { StatusBadge } from '../components/shared/StatusBadge';
import { DataTable } from '../components/shared/DataTable';
import { ConfirmModal } from '../components/shared/ConfirmModal';
import { TransferModal } from '../components/employees/TransferModal';
import { AttachmentModal } from '../components/employees/AttachmentModal';

export const EmployeeProfilePage = () => {
  const { id } = useParams<{ id: string }>();
  const { data: profile, loading: profileLoading, error: profileError } = useGetEmployee(id!);
  const { data: postingHistory, loading: postingLoading } = useGetPostingHistory(id!);
  const { data: attachmentHistory, loading: attachmentLoading, mutate: mutateAttachments } = useGetAttachmentHistory(id!);
  const { execute: endAttachment, loading: endLoading } = useEndAttachment();
  const { isAdmin } = useAuthContext();

  const [activeTab, setActiveTab] = useState<'postings' | 'attachments'>('postings');
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isAttachmentModalOpen, setIsAttachmentModalOpen] = useState(false);
  const [attachmentToEnd, setAttachmentToEnd] = useState<string | null>(null);

  if (profileLoading) return <LoadingSpinner />;
  if (profileError || !profile) return <EmptyState message={profileError?.message || 'Employee not found'} />;

  const initials = profile.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

  const handleEndAttachment = async () => {
    if (!attachmentToEnd) return;
    const success = await endAttachment(attachmentToEnd);
    if (success) {
      mutateAttachments();
      setAttachmentToEnd(null);
    }
  };

  return (
    <>
      <PageHeader 
        title="Employee Profile" 
        breadcrumb="Employees / Profile" 
      />

      {profile.currentAttachment && (
        <div className="bg-[#f6c23e]/10 border-l-[0.25rem] border-[#f6c23e] text-[#858796] p-4 rounded-md mb-6 shadow-sm flex items-center">
          <i className="fas fa-paperclip text-xl mr-3 text-[#f6c23e]"></i>
          <span className="font-bold">
            Currently on Attachment at {profile.currentAttachment.officeId} (Order: {profile.currentAttachment.orderNumber || 'N/A'})
          </span>
        </div>
      )}

      <div className="bg-white rounded-[0.35rem] shadow-[0_0.15rem_1.75rem_0_rgba(58,59,69,0.15)] mb-6">
        <div className="p-5">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <div className="flex-shrink-0">
              <div className="w-20 h-20 rounded-full bg-[#4e73df] text-white flex items-center justify-center shadow-md text-3xl font-bold">
                {initials}
              </div>
            </div>
            <div className="flex-1 w-full text-center md:text-left">
              <div className="flex flex-col md:flex-row justify-between items-center md:items-start mb-4 gap-4">
                <div>
                  <h1 className="text-2xl mb-1 text-gray-900 font-bold m-0">{profile.name}</h1>
                  <p className="text-[#858796] mb-0">S/D/W of {profile.fatherName || 'N/A'}</p>
                </div>
                <div className="flex gap-2 justify-center">
                  <BSBadge bs={profile.basicScale || 0} />
                  <StatusBadge status={profile.status} />
                </div>
              </div>

              <hr className="my-4 border-[#e3e6f0]" />

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-sm text-[#5a5c69]">
                <div>
                  <div className="text-[#858796] text-xs uppercase font-bold mb-1">
                    <i className="fas fa-id-card mr-1"></i> CNIC
                  </div>
                  <div className="font-bold">{profile.cnic}</div>
                </div>
                <div>
                  <div className="text-[#858796] text-xs uppercase font-bold mb-1">
                    <i className="fas fa-phone mr-1"></i> Contact
                  </div>
                  <div className="font-bold">{profile.contactNumber || 'N/A'}</div>
                </div>
                <div>
                  <div className="text-[#858796] text-xs uppercase font-bold mb-1">
                    <i className="fas fa-calendar mr-1"></i> DOB
                  </div>
                  <div className="font-bold">{profile.dob ? new Date(profile.dob).toLocaleDateString() : 'N/A'}</div>
                </div>
                <div>
                  <div className="text-[#858796] text-xs uppercase font-bold mb-1">
                    <i className="fas fa-briefcase mr-1"></i> Joined
                  </div>
                  <div className="font-bold">{profile.dateOfJoining ? new Date(profile.dateOfJoining).toLocaleDateString() : 'N/A'}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[0.35rem] shadow-[0_0.15rem_1.75rem_0_rgba(58,59,69,0.15)] mb-6">
        <div className="px-5 pt-3 border-b border-[#e3e6f0]">
          <ul className="flex flex-wrap list-none m-0 p-0 border-0">
            <li>
              <button 
                className={`px-4 py-2 border-0 bg-transparent text-[1rem] outline-none transition-colors ${activeTab === 'postings' ? 'font-bold text-[#4e73df] border-b-2 border-[#4e73df]' : 'text-[#858796] hover:text-[#5a5c69]'}`}
                onClick={() => setActiveTab('postings')}
              >
                Posting History
              </button>
            </li>
            <li>
              <button 
                className={`px-4 py-2 border-0 bg-transparent text-[1rem] outline-none transition-colors ${activeTab === 'attachments' ? 'font-bold text-[#4e73df] border-b-2 border-[#4e73df]' : 'text-[#858796] hover:text-[#5a5c69]'}`}
                onClick={() => setActiveTab('attachments')}
              >
                Attachment History
              </button>
            </li>
          </ul>
        </div>
        
        <div className="p-5">
          {activeTab === 'postings' ? (
            <>
              {isAdmin && (
                <div className="mb-4 text-right">
                  <button 
                    onClick={() => setIsTransferModalOpen(true)}
                    className="inline-block px-3 py-1.5 text-sm font-normal text-white bg-[#4e73df] hover:bg-[#2e59d9] rounded-[0.35rem] shadow-sm transition-colors"
                  >
                    <i className="fas fa-plus fa-sm text-white/50 mr-1"></i> Record Transfer
                  </button>
                </div>
              )}
              {postingLoading ? <LoadingSpinner /> : (
              <DataTable 
                columns={[
                  { key: 'office', label: 'Office', render: (_, row) => row.office?.name || row.officeId },
                  { key: 'effectiveFrom', label: 'From', render: (val) => new Date(val).toLocaleDateString() },
                  { key: 'effectiveTo', label: 'To', render: (val) => val ? new Date(val).toLocaleDateString() : <span className="inline-block py-1 px-2 rounded font-bold text-[75%] leading-none text-center whitespace-nowrap bg-[#1cc88a] text-white uppercase">Present</span> },
                  { key: 'orderNumber', label: 'Order No.' },
                  { key: 'remarks', label: 'Remarks' }
                ]}
                data={postingHistory || []}
              />
            )}
            </>
          ) : (
            <>
              {isAdmin && (
                <div className="mb-4 text-right">
                  <button 
                    onClick={() => setIsAttachmentModalOpen(true)}
                    className="inline-block px-3 py-1.5 text-sm font-normal text-white bg-[#4e73df] hover:bg-[#2e59d9] rounded-[0.35rem] shadow-sm transition-colors"
                  >
                    <i className="fas fa-plus fa-sm text-white/50 mr-1"></i> Record Attachment
                  </button>
                </div>
              )}
              {attachmentLoading ? <LoadingSpinner /> : (
              <DataTable 
                columns={[
                  { key: 'officeId', label: 'Attached To' },
                  { key: 'effectiveFrom', label: 'From', render: (val) => new Date(val).toLocaleDateString() },
                  { key: 'effectiveTo', label: 'To', render: (val) => val ? new Date(val).toLocaleDateString() : <span className="inline-block py-1 px-2 rounded font-bold text-[75%] leading-none text-center whitespace-nowrap bg-[#1cc88a] text-white uppercase">Present</span> },
                  { key: 'orderNumber', label: 'Order No.' },
                  { key: 'reason', label: 'Reason' },
                  { key: 'actions', label: '', className: 'text-right', render: (_, row) => (
                    isAdmin && !row.effectiveTo ? (
                      <button 
                        onClick={() => setAttachmentToEnd(row.id)}
                        className="inline-block px-2 py-1 text-sm font-normal text-white bg-[#e74a3b] hover:bg-[#e02d1b] rounded-[0.35rem] shadow-sm transition-colors"
                      >
                        End Attachment
                      </button>
                    ) : null
                  )}
                ]}
                data={attachmentHistory || []}
              />
            )}
            </>
          )}
        </div>
      </div>

      {isAdmin && (
        <>
          <TransferModal
            isOpen={isTransferModalOpen}
            onClose={() => setIsTransferModalOpen(false)}
            employeeId={profile.id}
            onSuccess={() => window.location.reload()}
          />
          <AttachmentModal
            isOpen={isAttachmentModalOpen}
            onClose={() => setIsAttachmentModalOpen(false)}
            employee={profile}
            onSuccess={() => { mutateAttachments(); window.location.reload(); }}
          />
          <ConfirmModal
            isOpen={!!attachmentToEnd}
            onClose={() => setAttachmentToEnd(null)}
            onConfirm={handleEndAttachment}
            title="End Attachment"
            message="Are you sure you want to end this attachment? This will mark it as completed today."
            confirmText="End Attachment"
            isDestructive={true}
            isLoading={endLoading}
          />
        </>
      )}
    </>
  );
};
