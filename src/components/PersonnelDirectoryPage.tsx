import React from 'react';
import { Users2, ShieldCheck, SearchCheck, ClipboardList } from 'lucide-react';
import { PersonnelDirectory } from './PersonnelDirectory';
import { Office, Position, Seat, Employee, Posting, Attachment } from '../domain/entities';

interface PersonnelDirectoryPageProps {
  offices: Office[];
  positions: Position[];
  seats: Seat[];
  employees: Employee[];
  postings: Posting[];
  attachments: Attachment[];
  selectedEmployeeId: string | null;
  onSelectEmployeeId: (id: string | null) => void;
  onRetireEmployee: (employeeId: string, date: string, orderNumber: string) => void;
  onPreFillTransfer: (employeeId: string) => void;
}

export const PersonnelDirectoryPage: React.FC<PersonnelDirectoryPageProps> = ({
  offices,
  positions,
  seats,
  employees,
  postings,
  attachments,
  selectedEmployeeId,
  onSelectEmployeeId,
  onRetireEmployee,
  onPreFillTransfer,
}) => {
  return (
    <section className="space-y-6">
      <header className="rounded-3xl border border-blue-100 bg-gradient-to-r from-blue-950 via-blue-900 to-slate-900 p-5 text-white shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] text-blue-100/90 font-mono">
              <Users2 className="h-4 w-4" />
              Personnel Directory Module
            </div>
            <h2 className="text-xl font-black tracking-tight">Full-page roster, vacancy, and personnel review workspace</h2>
            <p className="max-w-2xl text-xs text-blue-100/85">This module isolates employee search, detailed profiles, and retirement workflows into a dedicated page for faster operational review.</p>
          </div>
          <div className="grid gap-2 text-xs text-blue-50/95 sm:grid-cols-3">
            <span className="rounded-2xl border border-white/10 bg-white/8 p-3"> <SearchCheck className="mr-1 inline h-3.5 w-3.5" />Smart roster filters</span>
            <span className="rounded-2xl border border-white/10 bg-white/8 p-3"> <ClipboardList className="mr-1 inline h-3.5 w-3.5" />Timeline audit review</span>
            <span className="rounded-2xl border border-white/10 bg-white/8 p-3"> <ShieldCheck className="mr-1 inline h-3.5 w-3.5" />Retirement controls</span>
          </div>
        </div>
      </header>

      <PersonnelDirectory
        offices={offices}
        positions={positions}
        seats={seats}
        employees={employees}
        postings={postings}
        attachments={attachments}
        selectedEmployeeId={selectedEmployeeId}
        onSelectEmployeeId={onSelectEmployeeId}
        onRetireEmployee={onRetireEmployee}
        onSetTab={() => undefined}
        onPreFillTransfer={onPreFillTransfer}
      />
    </section>
  );
};
