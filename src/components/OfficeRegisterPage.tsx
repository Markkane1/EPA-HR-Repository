import React from 'react';
import { Building2, FileStack, PlusCircle, ShieldCheck } from 'lucide-react';
import { OfficeSection } from './OfficeSection';
import { Office, Position, Seat, Employee, Posting, Attachment } from '../domain/entities';

interface OfficeRegisterPageProps {
  offices: Office[];
  positions: Position[];
  seats: Seat[];
  employees: Employee[];
  postings: Posting[];
  attachments: Attachment[];
  onAddOffice: (office: Omit<Office, 'id'>) => void | Promise<void>;
  onAddPositionAndSeats: (officeId: string, title: string, scale: string, seatCount: number) => void | Promise<void>;
  onSelectEmployee: (employeeId: string) => void;
  activeOfficeId: string;
  onSetActiveOfficeId: (id: string) => void;
}

export const OfficeRegisterPage: React.FC<OfficeRegisterPageProps> = ({
  offices,
  positions,
  seats,
  employees,
  postings,
  attachments,
  onAddOffice,
  onAddPositionAndSeats,
  onSelectEmployee,
  activeOfficeId,
  onSetActiveOfficeId,
}) => {
  return (
    <section className="space-y-6">
      <header className="rounded-3xl border border-emerald-100 bg-gradient-to-r from-emerald-900 via-emerald-800 to-emerald-950 p-5 text-white shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] text-emerald-100/90 font-mono">
              <Building2 className="h-4 w-4" />
              Office Register Module
            </div>
            <h2 className="text-xl font-black tracking-tight">Master office, position, and seat maintenance</h2>
            <p className="max-w-2xl text-xs text-emerald-100/85">This page acts as the dedicated office-management module with its own CRUD workflow for creating stations, posts, and sanctioned seat slots.</p>
          </div>
          <div className="grid gap-2 text-xs text-emerald-50/95 sm:grid-cols-3">
            <span className="rounded-2xl border border-white/10 bg-white/8 p-3"> <ShieldCheck className="mr-1 inline h-3.5 w-3.5" />Live office CRUD</span>
            <span className="rounded-2xl border border-white/10 bg-white/8 p-3"> <PlusCircle className="mr-1 inline h-3.5 w-3.5" />Seat matrix creation</span>
            <span className="rounded-2xl border border-white/10 bg-white/8 p-3"> <FileStack className="mr-1 inline h-3.5 w-3.5" />Full-page admin view</span>
          </div>
        </div>
      </header>

      <OfficeSection
        offices={offices}
        positions={positions}
        seats={seats}
        employees={employees}
        postings={postings}
        attachments={attachments}
        onAddOffice={onAddOffice}
        onAddPositionAndSeats={onAddPositionAndSeats}
        onSelectEmployee={onSelectEmployee}
        activeOfficeId={activeOfficeId}
        onSetActiveOfficeId={onSetActiveOfficeId}
      />
    </section>
  );
};
