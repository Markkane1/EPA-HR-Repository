import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useGetEmployee } from '../../application/usecases/useGetEmployee';
import { useGetPostingHistory } from '../../application/usecases/useGetPostingHistory';
import { useGetAttachmentHistory } from '../../application/usecases/useGetAttachmentHistory';
import { PageHeader } from '../components/shared/PageHeader';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';
import { EmptyState } from '../components/shared/EmptyState';
import { BSBadge } from '../components/shared/BSBadge';
import { StatusBadge } from '../components/shared/StatusBadge';
import { DataTable } from '../components/shared/DataTable';
import { User, Phone, Calendar, Briefcase, Paperclip, MapPin } from 'lucide-react';

export const EmployeeProfilePage = () => {
  const { id } = useParams<{ id: string }>();
  const { data: profile, loading: profileLoading, error: profileError } = useGetEmployee(id!);
  const { data: postingHistory, loading: postingLoading } = useGetPostingHistory(id!);
  const { data: attachmentHistory, loading: attachmentLoading } = useGetAttachmentHistory(id!);

  const [activeTab, setActiveTab] = useState<'postings' | 'attachments'>('postings');

  if (profileLoading) return <LoadingSpinner />;
  if (profileError || !profile) return <EmptyState message={profileError?.message || 'Employee not found'} />;

  const initials = profile.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

  return (
    <div className="space-y-6 pb-12">
      <PageHeader title="Employee Profile" breadcrumb="Employees / Profile" />

      {profile.currentAttachment && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg shadow-sm">
          <div className="flex items-center">
            <Paperclip className="w-5 h-5 text-yellow-600 mr-2" />
            <p className="text-sm font-medium text-yellow-800">
              Currently on Attachment at <span className="font-bold">{profile.currentAttachment.officeId}</span> (Order: {profile.currentAttachment.orderNumber || 'N/A'})
            </p>
          </div>
        </div>
      )}

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex gap-6 items-start">
        <div className="w-24 h-24 rounded-full bg-[#1e3a5f] text-white flex items-center justify-center text-3xl font-bold shadow-inner">
          {initials}
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{profile.name}</h1>
              <p className="text-gray-500 font-medium">S/D/W of {profile.fatherName || 'N/A'}</p>
            </div>
            <div className="flex gap-2">
              <BSBadge bs={profile.basicScale || 0} />
              <StatusBadge status={profile.status} />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-y-4 gap-x-8 text-sm">
            <div>
              <p className="text-gray-400 flex items-center gap-1 mb-1"><User className="w-4 h-4"/> CNIC</p>
              <p className="font-semibold text-gray-900">{profile.cnic}</p>
            </div>
            <div>
              <p className="text-gray-400 flex items-center gap-1 mb-1"><Phone className="w-4 h-4"/> Contact</p>
              <p className="font-semibold text-gray-900">{profile.contactNumber || 'N/A'}</p>
            </div>
            <div>
              <p className="text-gray-400 flex items-center gap-1 mb-1"><Calendar className="w-4 h-4"/> DOB</p>
              <p className="font-semibold text-gray-900">{profile.dob ? new Date(profile.dob).toLocaleDateString() : 'N/A'}</p>
            </div>
            <div>
              <p className="text-gray-400 flex items-center gap-1 mb-1"><Briefcase className="w-4 h-4"/> Joined</p>
              <p className="font-semibold text-gray-900">{profile.dateOfJoining ? new Date(profile.dateOfJoining).toLocaleDateString() : 'N/A'}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('postings')}
              className={`w-1/2 py-4 px-1 text-center border-b-2 font-medium text-sm transition-colors ${activeTab === 'postings' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            >
              Posting History
            </button>
            <button
              onClick={() => setActiveTab('attachments')}
              className={`w-1/2 py-4 px-1 text-center border-b-2 font-medium text-sm transition-colors ${activeTab === 'attachments' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            >
              Attachment History
            </button>
          </nav>
        </div>
        
        <div className="p-6">
          {activeTab === 'postings' ? (
            postingLoading ? <LoadingSpinner /> : (
              <DataTable 
                columns={[
                  { key: 'office', label: 'Office', render: (_, row) => row.office?.name || row.officeId },
                  { key: 'effectiveFrom', label: 'From', render: (val) => new Date(val).toLocaleDateString() },
                  { key: 'effectiveTo', label: 'To', render: (val) => val ? new Date(val).toLocaleDateString() : <span className="text-green-600 font-bold tracking-wider text-xs uppercase">Present</span> },
                  { key: 'orderNumber', label: 'Order No.' },
                  { key: 'remarks', label: 'Remarks' }
                ]}
                data={postingHistory || []}
              />
            )
          ) : (
            attachmentLoading ? <LoadingSpinner /> : (
              <DataTable 
                columns={[
                  { key: 'officeId', label: 'Attached To' },
                  { key: 'effectiveFrom', label: 'From', render: (val) => new Date(val).toLocaleDateString() },
                  { key: 'effectiveTo', label: 'To', render: (val) => val ? new Date(val).toLocaleDateString() : <span className="text-green-600 font-bold tracking-wider text-xs uppercase">Present</span> },
                  { key: 'orderNumber', label: 'Order No.' },
                  { key: 'reason', label: 'Reason' }
                ]}
                data={attachmentHistory || []}
              />
            )
          )}
        </div>
      </div>
    </div>
  );
};
