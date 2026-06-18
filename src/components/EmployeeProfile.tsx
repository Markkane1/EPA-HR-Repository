import React, { useState, useMemo } from 'react';
import { Employee, Office, Position, Seat, Posting, Attachment } from '../domain/entities';
import {
  ArrowLeft,
  Printer,
  Calendar,
  Building2,
  Briefcase,
  User,
  Hash,
  ShieldAlert,
  ShieldCheck,
  UserX,
  FileText,
  Clock,
  ExternalLink,
  Phone,
  HelpCircle,
  FileCheck
} from 'lucide-react';

interface EmployeeProfileProps {
  employee: Employee;
  offices: Office[];
  positions: Position[];
  seats: Seat[];
  postings: Posting[];
  attachments: Attachment[];
  onBack: () => void;
  onRetireEmployee?: (id: string, date: string, order: string) => void;
  onPreFillTransfer?: (id: string) => void;
}

// Custom Date Format Helper
const formatDate = (dateStr: string | null) => {
  if (!dateStr) return 'Present';
  try {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const year = parts[0];
      const monthIndex = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      return `${day} ${months[monthIndex]} ${year}`;
    }
    return dateStr;
  } catch (e) {
    return dateStr;
  }
};

// Precise Duration Calculation Helper
const calculateDuration = (fromStr: string, toStr: string | null): string => {
  if (!fromStr) return '-';
  const start = new Date(fromStr);
  const end = toStr ? new Date(toStr) : new Date('2026-06-17'); // Simulated environment date: June 17, 2026
  
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return '-';
  
  let years = end.getFullYear() - start.getFullYear();
  let months = end.getMonth() - start.getMonth();
  let days = end.getDate() - start.getDate();
  
  if (days < 0) {
    months -= 1;
    // Calculate days in the previous month
    const previousMonth = new Date(end.getFullYear(), end.getMonth(), 0);
    days += previousMonth.getDate();
  }
  
  if (months < 0) {
    years -= 1;
    months += 12;
  }
  
  const parts: string[] = [];
  if (years > 0) {
    parts.push(`${years} yr${years > 1 ? 's' : ''}`);
  }
  if (months > 0) {
    parts.push(`${months} mo${months > 1 ? 's' : ''}`);
  }
  if (days > 0 || parts.length === 0) {
    parts.push(`${days} day${days !== 1 ? 's' : ''}`);
  }
  
  return parts.join(', ');
};

export const EmployeeProfile: React.FC<EmployeeProfileProps> = ({
  employee,
  offices,
  positions,
  seats,
  postings,
  attachments,
  onBack,
  onRetireEmployee,
  onPreFillTransfer,
}) => {
  const [activeTab, setActiveTab] = useState<'postings' | 'attachments'>('postings');

  // Find the current active permanent posting of the employee
  const currentPosting = useMemo(() => {
    return postings.find((p) => p.employeeId === employee.id && p.effectiveTo === null);
  }, [postings, employee]);

  // Find current position, seat, and office details matching current posting
  const currentPostingDetails = useMemo(() => {
    if (!currentPosting) return null;
    const seat = seats.find((s) => s.id === currentPosting.seatId);
    const position = seat ? positions.find((p) => p.id === seat.positionId) : null;
    const office = position ? offices.find((o) => o.id === position.officeId) : null;
    return { seat, position, office };
  }, [currentPosting, seats, positions, offices]);

  // Find any current active temporary attachment
  const currentActiveAttachment = useMemo(() => {
    return attachments.find((a) => a.employeeId === employee.id && a.effectiveTo === null);
  }, [attachments, employee]);

  // Find attached office details
  const currentActiveAttachmentOffice = useMemo(() => {
    if (!currentActiveAttachment) return null;
    return offices.find((o) => o.id === currentActiveAttachment.targetOfficeId);
  }, [currentActiveAttachment, offices]);

  // Chronological Posting History (Newest first)
  const postingHistory = useMemo(() => {
    return postings
      .filter((p) => p.employeeId === employee.id)
      .map((p) => {
        const seat = seats.find((s) => s.id === p.seatId);
        const position = seat ? positions.find((pos) => pos.id === seat.positionId) : null;
        const office = position ? offices.find((o) => o.id === position.officeId) : null;
        return {
          id: p.id,
          officeName: office ? office.name : 'Unknown Office',
          positionTitle: position ? position.title : 'Unspecified Position',
          seatName: seat ? seat.name : 'Allocated Chair',
          scale: position ? position.scale : employee.scale,
          effectiveFrom: p.effectiveFrom,
          effectiveTo: p.effectiveTo,
          orderNumber: p.orderNumber,
          duration: calculateDuration(p.effectiveFrom, p.effectiveTo),
        };
      })
      .sort((a, b) => b.effectiveFrom.localeCompare(a.effectiveFrom));
  }, [postings, employee, seats, positions, offices]);

  // Chronological Attachment History (Newest first)
  const attachmentHistory = useMemo(() => {
    return attachments
      .filter((a) => a.employeeId === employee.id)
      .map((a) => {
        const targetOffice = offices.find((o) => o.id === a.targetOfficeId);
        return {
          id: a.id,
          officeName: targetOffice ? targetOffice.name : 'Unknown Office',
          effectiveFrom: a.effectiveFrom,
          effectiveTo: a.effectiveTo,
          orderNumber: a.orderNumber,
          reason: a.reason,
          duration: calculateDuration(a.effectiveFrom, a.effectiveTo),
        };
      })
      .sort((a, b) => b.effectiveFrom.localeCompare(a.effectiveFrom));
  }, [attachments, employee, offices]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      
      {/* ACTION HEADER BAR: BACK & PRINT */}
      <div className="flex items-center justify-between border-b pb-4 mt-1 bg-white p-4 rounded-xl border border-slate-200/80 shadow-xxs print:hidden">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition duration-150 cursor-pointer border border-slate-300/40"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Personnel Ledger
        </button>

        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-800 hover:bg-emerald-950 text-white text-xs font-bold rounded-lg transition duration-150 cursor-pointer shadow-xxs align-middle"
        >
          <Printer className="w-4 h-4" />
          Print Service Book
        </button>
      </div>

      {/* SERVICE LEDGER DOCUMENT (THIS WHOLE CONTAINER WILL BE FORMATTED FOR PRINTING) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-xs relative print:p-0 print:border-none print:shadow-none font-sans">
        
        {/* PRINT ONLY: WATERMARK Secretariat Header */}
        <div className="hidden print:flex flex-col items-center text-center pb-6 mb-8 border-b-2 border-slate-800">
          <div className="border border-slate-900 px-3 py-1 font-serif text-xs font-bold uppercase tracking-wider leading-none">
            Punjab Civil Establishment Roster File
          </div>
          <h1 className="text-xl font-extrabold text-slate-900 mt-2 font-serif uppercase tracking-tight">
            Environmental Protection Agency, Government of Punjab
          </h1>
          <p className="text-xxxxs font-mono text-slate-500 uppercase tracking-widest mt-1">
            Civil Records Registry Code: e-PA/ESTB/{employee.id.toUpperCase()} • Generated on 17 June 2026
          </p>
        </div>

        {/* 1. HEADER PROFILE CARD */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          
          {/* PHOTO/AVATAR GRID */}
          <div className="md:col-span-3 flex flex-col items-center text-center justify-center p-4 border rounded-2xl bg-slate-50/50 relative">
            
            {/* High density colorful initials card */}
            <div className={`h-28 w-28 text-white rounded-full flex items-center justify-center font-black text-4xl shadow-md uppercase tracking-tight ${employee.photoColor}`}>
              {employee.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
            </div>

            <span className="text-xxxxs font-mono font-bold uppercase tracking-widest text-slate-400 mt-3">
              Government Employee ID
            </span>
            <span className="text-xxs font-mono font-bold text-slate-700 bg-white border px-2.5 py-1 rounded-sm mt-1">
              {employee.id}
            </span>

            {/* Print Friendly Status Indicator */}
            <div className="mt-4">
              {employee.status === 'active' ? (
                <span className="bg-emerald-100 text-emerald-800 text-[10px] border border-emerald-300/80 px-3 py-1 rounded-full font-black uppercase tracking-wider">
                  Active Officer
                </span>
              ) : employee.status === 'retired' ? (
                <span className="bg-rose-100 text-rose-800 text-[10px] border border-rose-300/80 px-3 py-1 rounded-full font-black uppercase tracking-wider">
                  Superannuated (Retired)
                </span>
              ) : (
                <span className="bg-slate-100 text-slate-600 text-[10px] border border-slate-300/80 px-3 py-1 rounded-full font-black uppercase tracking-wider">
                  Transferred Away
                </span>
              )}
            </div>

          </div>

          {/* BIO DETAILS GRID */}
          <div className="md:col-span-9 space-y-4">
            
            {/* Top Identity Block */}
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-800 font-mono block">
                Punjab Civil Officer Service Profile
              </span>
              <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight mt-0.5">
                {employee.name}
              </h1>
              <p className="text-xxs text-slate-500 font-medium">
                S/O or Spouse: <strong className="text-slate-800 font-semibold">{employee.fatherName}</strong>
              </p>
            </div>

            {/* Detail Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-6 pt-3 border-t border-slate-150/70 text-xxs tracking-normal leading-relaxed text-slate-600">
              
              <div>
                <span className="text-xxxxs font-bold text-slate-400 uppercase tracking-wider font-mono block">National CNIC Standard</span>
                <span className="font-extrabold text-slate-800 font-mono">{employee.cnic}</span>
              </div>

              <div>
                <span className="text-xxxxs font-bold text-slate-400 uppercase tracking-wider font-mono block">Basic Pay Scale Grade</span>
                <span className="font-extrabold text-slate-800">
                  🎖️ {employee.scale} (Establishment Roster)
                </span>
              </div>

              <div>
                <span className="text-xxxxs font-bold text-slate-400 uppercase tracking-wider font-mono block">Record Phone Contact</span>
                <span className="font-semibold text-slate-800">{employee.contactNumber || 'Not Logged'}</span>
              </div>

              <div>
                <span className="text-xxxxs font-bold text-slate-400 uppercase tracking-wider font-mono block">Logged Date Of Birth</span>
                <span className="font-semibold text-slate-850 flex items-center gap-1 mt-0.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  {formatDate(employee.dob)}
                </span>
              </div>

              <div>
                <span className="text-xxxxs font-bold text-slate-400 uppercase tracking-wider font-mono block">Official Service Joining (DOJ)</span>
                <span className="font-semibold text-slate-850 flex items-center gap-1 mt-0.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  {formatDate(employee.doj)}
                </span>
              </div>

              <div>
                <span className="text-xxxxs font-bold text-slate-400 uppercase tracking-wider font-mono block">Pension Service Length</span>
                <span className="font-semibold text-emerald-805 flex items-center gap-1 mt-0.5">
                  <Clock className="w-3.5 h-3.5 text-emerald-600 shrink-0 animate-pulse" />
                  {calculateDuration(employee.doj, employee.status === 'retired' ? (postingHistory[0]?.effectiveTo || '2026-06-17') : null)}
                </span>
              </div>

            </div>

            {/* CURRENT POSTING ASSIGNMENT SPOTLIGHT */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 mt-4 leading-normal">
              <span className="text-xxxxs font-bold uppercase tracking-widest text-slate-400 font-mono block mb-1">
                Current Standing Assignment Duty Status
              </span>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Permanent Post */}
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-700 block flex items-center gap-1">
                    📌 Permanent Home Posting Station:
                  </span>
                  {currentPostingDetails ? (
                    <div className="pl-4 border-l-2 border-slate-300">
                      <p className="text-xs font-bold text-slate-800 leading-tight">
                        {currentPostingDetails.office?.name}
                      </p>
                      <p className="text-xxs text-slate-500 font-medium mt-0.5">
                        {currentPostingDetails.position?.title} ({currentPostingDetails.seat?.name})
                      </p>
                      <p className="text-xxxxs text-slate-400 font-mono mt-0.5">
                        Assumed: {formatDate(currentPosting.effectiveFrom)} • Order: {currentPosting.orderNumber}
                      </p>
                    </div>
                  ) : (
                    <p className="text-xxs font-semibold text-slate-400 italic pl-4 border-l-2 border-slate-200">
                      {employee.status === 'retired' ? '❌ Superannuated — No Active Posting holds' : '⌛ No active permanent posting found'}
                    </p>
                  )}
                </div>

                {/* Temporary Attachment Status */}
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-700 block flex items-center gap-1">
                    ⚡ Temporary Deputed Attachment:
                  </span>
                  {currentActiveAttachment ? (
                    <div className="pl-4 border-l-2 border-rose-400 bg-rose-50/40 p-1.5 rounded-r">
                      <span className="inline-flex bg-rose-600 text-white font-mono text-xxxxs font-black px-1.5 py-0.5 rounded tracking-wider uppercase mb-1">
                        Attached Offsite
                      </span>
                      <p className="text-xs font-bold text-rose-950 leading-tight">
                        {currentActiveAttachmentOffice?.name}
                      </p>
                      <p className="text-xxxxs text-rose-800 font-medium mt-0.5 leading-snug">
                        Reason: {currentActiveAttachment.reason}
                      </p>
                      <p className="text-xxxxs text-rose-700 font-mono">
                        Deputed: {formatDate(currentActiveAttachment.effectiveFrom)} • Order: {currentActiveAttachment.orderNumber}
                      </p>
                    </div>
                  ) : (
                    <p className="text-xxs font-medium text-slate-450 italic pl-4 border-l-2 border-slate-200 pt-1">
                      🟢 No temporary attachment assigned. Currently serving at standard home posting station.
                    </p>
                  )}
                </div>

              </div>
            </div>

          </div>

        </div>

        {/* 2. TABBED OR STACKED TIMELINES SECTION */}
        <div className="mt-8 border-t border-slate-200 pt-6">
          
          {/* SCREEN ONLY TAB SWITCHER */}
          <div className="flex bg-slate-100 p-1 rounded-xl border max-w-md print:hidden mb-6">
            <button
              onClick={() => setActiveTab('postings')}
              className={`w-1/2 cursor-pointer py-2 px-3 rounded-lg text-xs font-extrabold flex items-center justify-center gap-2 transition duration-150 ${
                activeTab === 'postings'
                  ? 'bg-white text-emerald-900 shadow-sm border border-slate-250/35'
                  : 'text-slate-500 hover:text-slate-850'
              }`}
            >
              <FileCheck className="w-4 h-4" />
              Posting Ledger ({postingHistory.length})
            </button>
            <button
              onClick={() => setActiveTab('attachments')}
              className={`w-1/2 cursor-pointer py-2 px-3 rounded-lg text-xs font-extrabold flex items-center justify-center gap-2 transition duration-150 ${
                activeTab === 'attachments'
                  ? 'bg-white text-emerald-900 shadow-sm border border-slate-250/35'
                  : 'text-slate-500 hover:text-slate-850'
              }`}
            >
              <Building2 className="w-4 h-4" />
              Attachment Logs ({attachmentHistory.length})
            </button>
          </div>

          {/* SCREEN MODE RENDER (ONLY ACTIVE TAB SEEN ON SCREEN) */}
          <div className="print:hidden">
            
            {activeTab === 'postings' ? (
              
              /* POSTINGS TAB VIEW */
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b pb-2 mb-2">
                  <h3 className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5 uppercase tracking-wide">
                    📜 Permanent Posting Chronological Records
                  </h3>
                  <span className="text-xxxxs font-mono text-slate-400 font-bold uppercase">
                    Sorted: Newest-First
                  </span>
                </div>

                {postingHistory.length === 0 ? (
                  <p className="text-xxs text-slate-400 italic">No permanent posting entries recorded in database.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xxs border-collapse">
                      <thead>
                        <tr className="bg-slate-50 text-slate-500 uppercase tracking-widest font-mono font-bold border-b border-slate-200">
                          <th className="p-3 pl-4">Target Station / Office</th>
                          <th className="p-3">Position Title &amp; Seat Code</th>
                          <th className="p-3 text-center">BPS</th>
                          <th className="p-3">Timeline Dates</th>
                          <th className="p-3 text-center">Total Duration</th>
                          <th className="p-3 pr-4">Govt. Order Number</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {postingHistory.map((item, index) => (
                          <tr key={item.id} className="hover:bg-slate-50/50">
                            {/* Office Name */}
                            <td className="p-3 pl-4 font-bold text-slate-800">
                              {item.officeName}
                              {index === 0 && !item.effectiveTo && employee.status !== 'retired' && (
                                <span className="ml-2 inline-block bg-emerald-100 text-emerald-805 text-xxxxs font-mono font-black border border-emerald-350 px-1 py-0.5 rounded tracking-wide capitalize select-none">
                                  Present Seat
                                </span>
                              )}
                            </td>
                            {/* Title & Seat */}
                            <td className="p-3 text-slate-700 font-medium">
                              {item.positionTitle}
                              <span className="block text-xxxxs font-mono font-bold text-slate-450 uppercase tracking-wider">
                                🏢 {item.seatName}
                              </span>
                            </td>
                            {/* BPS */}
                            <td className="p-3 text-center font-mono font-bold text-slate-550">
                              {item.scale}
                            </td>
                            {/* Timeline Dates */}
                            <td className="p-3 font-mono text-slate-600">
                              {formatDate(item.effectiveFrom)} 
                              <span className="mx-1 text-slate-400">➔</span> 
                              {item.effectiveTo ? formatDate(item.effectiveTo) : <span className="text-emerald-800 font-bold">Present</span>}
                            </td>
                            {/* Duration */}
                            <td className="p-3 text-center text-slate-800 font-semibold bg-emerald-500/5 font-sans">
                              {item.duration}
                            </td>
                            {/* Order Number */}
                            <td className="p-3 font-mono text-slate-400 text-[10px] break-all pr-4">
                              {item.orderNumber}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ) : (
              
              /* ATTACHMENTS TAB VIEW */
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b pb-2 mb-2">
                  <h3 className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5 uppercase tracking-wide">
                    ⚡ Temporary Attachment Assignment Logs
                  </h3>
                  <span className="text-xxxxs font-mono text-slate-400 font-bold uppercase">
                    Sorted: Newest-First
                  </span>
                </div>

                {attachmentHistory.length === 0 ? (
                  <div className="p-6 text-center border border-dashed rounded-xl bg-slate-50/50">
                    <p className="text-xxs text-slate-400 italic">No temporary duty attachments assigned to this civil servant in the ledger index.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xxs border-collapse">
                      <thead>
                        <tr className="bg-slate-50 text-slate-500 uppercase tracking-widest font-mono font-bold border-b border-slate-200">
                          <th className="p-3 pl-4">Temporary Office/Site</th>
                          <th className="p-3">Timeline Dates</th>
                          <th className="p-3 text-center">Total Duration</th>
                          <th className="p-3">Reason for Deputation</th>
                          <th className="p-3 pr-4">Government Order Registration</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {attachmentHistory.map((item, index) => (
                          <tr key={item.id} className="hover:bg-slate-50/50">
                            {/* Attached Office Code */}
                            <td className="p-3 pl-4 font-bold text-slate-800">
                              {item.officeName}
                              {index === 0 && !item.effectiveTo && employee.status !== 'retired' && (
                                <span className="ml-2 inline-block bg-rose-100 text-rose-800 text-xxxxs font-mono font-black border border-rose-350 px-1 py-0.5 rounded tracking-wide uppercase select-none">
                                  Active Attach
                                </span>
                              )}
                            </td>
                            {/* Timeline Dates */}
                            <td className="p-3 font-mono text-slate-600">
                              {formatDate(item.effectiveFrom)} 
                              <span className="mx-1 text-slate-400">➔</span> 
                              {item.effectiveTo ? formatDate(item.effectiveTo) : <span className="text-rose-700 font-bold">Present (Active)</span>}
                            </td>
                            {/* Duration */}
                            <td className="p-3 text-center text-slate-800 font-semibold bg-rose-500/5 font-sans">
                              {item.duration}
                            </td>
                            {/* Reason */}
                            <td className="p-3 text-slate-550 leading-snug">
                              {item.reason}
                            </td>
                            {/* Order Number */}
                            <td className="p-3 font-mono text-[10px] break-all text-slate-400 pr-4">
                              {item.orderNumber}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

          </div>

          {/* PRINT ONLY MODE RENDER: BOTH POSTINGS AND ATTACHMENTS ARE PRINTED STACKED SECURELY */}
          <div className="hidden print:block space-y-8">
            
            {/* POSTINGS SECTION PRINT RECORD */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-900 border-b border-slate-900 pb-1 mt-6 uppercase tracking-wider font-serif">
                Section I: Permanent Place Of Service / Posting Ledger
              </h3>
              
              <table className="w-full text-left text-xxs border-collapse">
                <thead>
                  <tr className="border-b border-slate-700 text-slate-900 font-bold font-serif bg-slate-100/30">
                    <th className="py-2 px-1">Office Station Station Location</th>
                    <th className="py-2 px-1">Designated Charge / Title</th>
                    <th className="py-2 px-1 text-center">BPS</th>
                    <th className="py-2 px-1">Period Records (From - To)</th>
                    <th className="py-2 px-1 text-center">Computed Length</th>
                    <th className="py-2 px-1 text-right">Order Number Identifier</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-300">
                  {postingHistory.map((item) => (
                    <tr key={item.id} className="text-slate-850">
                      <td className="py-2.5 px-1 font-bold">{item.officeName}</td>
                      <td className="py-2.5 px-1 font-medium">{item.positionTitle} ({item.seatName})</td>
                      <td className="py-2.5 px-1 text-center font-mono font-bold">{item.scale}</td>
                      <td className="py-2.5 px-1 font-mono">
                        {formatDate(item.effectiveFrom)} - {item.effectiveTo ? formatDate(item.effectiveTo) : 'Present'}
                      </td>
                      <td className="py-2.5 px-1 text-center font-bold bg-slate-50">{item.duration}</td>
                      <td className="py-2.5 px-1 text-right font-mono text-[10px] text-slate-500">{item.orderNumber}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* ATTACHMENTS SECTION PRINT RECORD */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-900 border-b border-slate-900 pb-1 mt-6 uppercase tracking-wider font-serif">
                Section II: Temporary Deputed Duty Placements &amp; Attachments
              </h3>
              
              {attachmentHistory.length === 0 ? (
                <p className="text-xxs text-slate-400 italic font-mono">No offsite attachment records detected on this civil ledger profile.</p>
              ) : (
                <table className="w-full text-left text-xxs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-700 text-slate-900 font-bold font-serif bg-slate-100/30">
                      <th className="py-2 px-1">Attached Offsite Location office</th>
                      <th className="py-2 px-1">Duration Records (From - To)</th>
                      <th className="py-2 px-1 text-center">Interval Length</th>
                      <th className="py-2 px-1 font-medium">Recorded Placing Factor / Reason</th>
                      <th className="py-2 px-1 text-right">Notification Reference</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-300">
                    {attachmentHistory.map((item) => (
                      <tr key={item.id} className="text-slate-850">
                        <td className="py-2.5 px-1 font-bold">{item.officeName}</td>
                        <td className="py-2.5 px-1 font-mono">
                          {formatDate(item.effectiveFrom)} - {item.effectiveTo ? formatDate(item.effectiveTo) : 'Present'}
                        </td>
                        <td className="py-2.5 px-1 text-center font-bold bg-slate-50">{item.duration}</td>
                        <td className="py-2.5 px-1 text-slate-705 leading-snug">{item.reason}</td>
                        <td className="py-2.5 px-1 text-right font-mono text-[10px] text-slate-500">{item.orderNumber}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* PRINT SIGN-OFF AREA FOR ESTABLISHMENT UNIT */}
            <div className="pt-16 grid grid-cols-2 gap-12 font-serif text-slate-800">
              <div className="text-left">
                <p className="border-b border-slate-400 w-3/4 h-8"></p>
                <p className="text-[10px] font-bold uppercase tracking-wide mt-2">Drawn By (Roster Desk Specialist)</p>
                <p className="text-xxxxs font-mono text-slate-400">Establishment Branch, EPA Punjab Secretariat</p>
              </div>
              <div className="text-right flex flex-col items-end">
                <p className="border-b border-slate-400 w-3/4 h-8"></p>
                <p className="text-[10px] font-bold uppercase tracking-wide mt-2">Countersigned (Section Officer, Services)</p>
                <p className="text-xxxxs font-mono text-slate-400">Environment Protection Department, Govt. of Punjab</p>
              </div>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};
