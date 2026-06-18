import React, { useState, useMemo, useEffect } from 'react';
import { Office, Position, Seat, Employee, Posting, Attachment } from '../types';
import { 
  Send, Users, Pin, Building2, AlertCircle, Calendar, 
  FileText, CheckCircle2, UserCheck, XCircle, PinOff, Info, 
  Search, Plus, User, FileSliders 
} from 'lucide-react';

interface AdminDeskProps {
  offices: Office[];
  positions: Position[];
  seats: Seat[];
  employees: Employee[];
  postings: Posting[];
  attachments: Attachment[];
  onTransferEmployee: (
    employeeId: string, 
    seatId: string, 
    date: string, 
    order: string, 
    remarks?: string
  ) => void;
  onAttachEmployee: (
    employeeId: string, 
    officeId: string, 
    date: string, 
    order: string, 
    reason: string, 
    effectiveTo?: string | null
  ) => void;
  onEndAttachment: (attachmentId: string, date: string) => void;
  onOnboardEmployee: (
    employee: Omit<Employee, 'id'>, 
    initialSeatId: string | null, 
    orderNumber: string,
    effectiveFrom?: string
  ) => void;
  preFilledEmployeeId: string | null;
  clearPreFilledEmployee: () => void;
  initialTab?: 'transfer' | 'attach' | 'onboard';
}

export const AdminDesk: React.FC<AdminDeskProps> = ({
  offices,
  positions,
  seats,
  employees,
  postings,
  attachments,
  onTransferEmployee,
  onAttachEmployee,
  onEndAttachment,
  onOnboardEmployee,
  preFilledEmployeeId,
  clearPreFilledEmployee,
  initialTab,
}) => {
  // Inner Subtabs: 'transfer' | 'attach' | 'onboard'
  const [panelTab, setPanelTab] = useState<'transfer' | 'attach' | 'onboard'>('transfer');

  // Sync with initialTab prop from parent
  useEffect(() => {
    if (initialTab) {
      setPanelTab(initialTab);
    }
  }, [initialTab]);

  // Success message alert
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Active employees
  const activeEmployees = useMemo(() => {
    return employees.filter((e) => e.status === 'active');
  }, [employees]);

  // Helper function to find current active posting details for any employee
  const getEmployeeCurrentPosting = (empId: string) => {
    const activePost = postings.find((p) => p.employeeId === empId && p.effectiveTo === null);
    if (!activePost) return null;

    const seat = seats.find((s) => s.id === activePost.seatId);
    const position = seat ? positions.find((pos) => pos.id === seat.positionId) : null;
    const office = position ? offices.find((o) => o.id === position.officeId) : null;

    return {
      posting: activePost,
      seat: seat || { name: 'Unknown Seat' },
      positionTitle: position ? position.title : 'Designation Unspecified',
      positionScale: position ? position.scale : 'BS-XX',
      officeName: office ? office.name : 'Office Unspecified',
      officeDistrict: office ? office.district : '',
    };
  };

  // List of vacant seats right now
  const vacantSeats = useMemo(() => {
    const activeSeatIds = postings.filter((p) => p.effectiveTo === null).map((p) => p.seatId);
    return seats.filter((s) => !activeSeatIds.includes(s.id)).map((seat) => {
      const pos = positions.find((p) => p.id === seat.positionId);
      const office = pos ? offices.find((o) => o.id === pos.officeId) : null;
      return {
        ...seat,
        positionTitle: pos ? pos.title : 'Unknown Designation',
        scale: pos ? pos.scale : 'BS',
        officeName: office ? office.name : 'Unknown Office',
      };
    });
  }, [seats, postings, positions, offices]);

  // ==========================================
  // FORM 1: TRANSFER FORM CONTROL STATE
  // ==========================================
  const [transferSearchQuery, setTransferSearchQuery] = useState('');
  const [transferShowDropdown, setTransferShowDropdown] = useState(false);
  const [transferEmpId, setTransferEmpId] = useState('');

  const [transferOfficeId, setTransferOfficeId] = useState('');
  const [transferPositionId, setTransferPositionId] = useState('');
  const [transferSeatId, setTransferSeatId] = useState('');
  const [transferDate, setTransferDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [transferOrder, setTransferOrder] = useState('SO(Estt)4-12/2026');
  const [transferRemarks, setTransferRemarks] = useState('');

  // Selected Transfer Employee Model
  const selectedTransferEmp = useMemo(() => {
    return employees.find((e) => e.id === transferEmpId);
  }, [employees, transferEmpId]);

  // Current active posting details of employee selected for transfer
  const transferCurrentPosting = useMemo(() => {
    if (!transferEmpId) return null;
    return getEmployeeCurrentPosting(transferEmpId);
  }, [transferEmpId, postings, seats, positions, offices]);

  // Cascading Positions based on select office
  const transferPositions = useMemo(() => {
    if (!transferOfficeId) return [];
    return positions.filter((p) => p.officeId === transferOfficeId);
  }, [positions, transferOfficeId]);

  // Cascading Vacant Seats based on selected position
  const transferVacantSeats = useMemo(() => {
    if (!transferPositionId) return [];
    // Seats belonging to this specific position
    const positionSeats = seats.filter((s) => s.positionId === transferPositionId);
    // Occupied seat IDs
    const activeSeatIds = postings.filter((p) => p.effectiveTo === null).map((p) => p.seatId);
    return positionSeats.filter((s) => !activeSeatIds.includes(s.id));
  }, [seats, postings, transferPositionId]);

  // Matching live employees for Transfer Autocomplete
  const matchingEmployeesForTransfer = useMemo(() => {
    const q = transferSearchQuery.toLowerCase().trim();
    if (!q) return [];
    return activeEmployees.filter((emp) => 
      emp.name.toLowerCase().includes(q) || 
      emp.cnic.replace(/-/g, '').includes(q.replace(/-/g, ''))
    );
  }, [activeEmployees, transferSearchQuery]);

  // Pre-filled employee effect react
  useEffect(() => {
    if (preFilledEmployeeId) {
      setTransferEmpId(preFilledEmployeeId);
      const emp = employees.find((e) => e.id === preFilledEmployeeId);
      if (emp) {
        setTransferSearchQuery(emp.name);
      }
      setPanelTab('transfer');
      const element = document.getElementById('admin-desk-box');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [preFilledEmployeeId, employees]);


  // ==========================================
  // FORM 2: ATTACHMENT FORM CONTROL STATE
  // ==========================================
  const [attachSearchQuery, setAttachSearchQuery] = useState('');
  const [attachShowDropdown, setAttachShowDropdown] = useState(false);
  const [attachEmpId, setAttachEmpId] = useState('');

  const [attachOfficeId, setAttachOfficeId] = useState('');
  const [attachDate, setAttachDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [attachDateTo, setAttachDateTo] = useState(''); // Optional effective to date
  const [attachOrder, setAttachOrder] = useState('DG(EPA)SO-91/2026');
  const [attachReason, setAttachReason] = useState('');

  // Selected Attachment Employee Model
  const selectedAttachEmp = useMemo(() => {
    return employees.find((e) => e.id === attachEmpId);
  }, [employees, attachEmpId]);

  // Current active posting details of employee selected for attachment
  const attachCurrentPosting = useMemo(() => {
    if (!attachEmpId) return null;
    return getEmployeeCurrentPosting(attachEmpId);
  }, [attachEmpId, postings, seats, positions, offices]);

  // Matching live employees for Attachment Autocomplete
  const matchingEmployeesForAttach = useMemo(() => {
    const q = attachSearchQuery.toLowerCase().trim();
    if (!q) return [];
    return activeEmployees.filter((emp) => 
      emp.name.toLowerCase().includes(q) || 
      emp.cnic.replace(/-/g, '').includes(q.replace(/-/g, ''))
    );
  }, [activeEmployees, attachSearchQuery]);


  // ==========================================
  // FORM 3: ONBOARDING FORM CONTROL STATE
  // ==========================================
  const [onboardName, setOnboardName] = useState('');
  const [onboardFather, setOnboardFather] = useState('');
  const [onboardCNIC, setOnboardCNIC] = useState('');
  const [onboardDOB, setOnboardDOB] = useState('');
  const [onboardDOJ, setOnboardDOJ] = useState('');
  const [onboardScale, setOnboardScale] = useState('BS-16');
  const [onboardPhone, setOnboardPhone] = useState('');
  const [onboardColor, setOnboardColor] = useState('bg-indigo-600');

  // Nested Cascading Initial Posting Fields
  const [onboardAssignSeat, setOnboardAssignSeat] = useState(false);
  const [onboardOfficeId, setOnboardOfficeId] = useState('');
  const [onboardPositionId, setOnboardPositionId] = useState('');
  const [onboardSeatId, setOnboardSeatId] = useState('');
  const [onboardDate, setOnboardDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [onboardOrder, setOnboardOrder] = useState('SO(Recruit-GP)1-20/2026');

  // Sync initial posting state when onboarding DOJ or checkbox active transitions
  useEffect(() => {
    if (onboardDOJ && !onboardDate) {
      setOnboardDate(onboardDOJ);
    }
  }, [onboardDOJ, onboardDate]);

  // Cascading Positions for Onboard Office
  const onboardPositions = useMemo(() => {
    if (!onboardOfficeId) return [];
    return positions.filter((p) => p.officeId === onboardOfficeId);
  }, [positions, onboardOfficeId]);

  // Cascading Vacant Seats for Onboard Position
  const onboardVacantSeats = useMemo(() => {
    if (!onboardPositionId) return [];
    const posSeats = seats.filter((s) => s.positionId === onboardPositionId);
    const activeSeatIds = postings.filter((p) => p.effectiveTo === null).map((p) => p.seatId);
    return posSeats.filter((s) => !activeSeatIds.includes(s.id));
  }, [seats, postings, onboardPositionId]);


  // ==========================================
  // GENERAL DATA ANALYSIS & CONFLICT REGISTRY
  // ==========================================
  const activeAttachmentsList = useMemo(() => {
    return attachments.filter((a) => a.effectiveTo === null || new Date(a.effectiveTo) >= new Date()).map((att) => {
      const emp = employees.find((e) => e.id === att.employeeId);
      const targetOff = offices.find((o) => o.id === att.targetOfficeId);
      
      const homeInfo = getEmployeeCurrentPosting(att.employeeId);

      return {
        ...att,
        employeeName: emp ? emp.name : 'Unknown Employee',
        employeeScale: emp ? emp.scale : 'BS',
        targetOfficeName: targetOff ? targetOff.name.split('(')[0] : 'Unknown Office',
        homePostingDisplay: homeInfo ? `${homeInfo.positionTitle} (Home: ${homeInfo.officeName.split('(')[0]})` : 'OSD/Unposted',
      };
    });
  }, [attachments, employees, offices, postings, seats, positions]);

  // Overlapping Attachments Conflicts Analysis (Same employee attached to overlapping duties)
  const attachmentConflicts = useMemo(() => {
    const tempConflictsByAttachmentId: Record<string, Array<{ otherOfficeName: string; otherRange: string; otherOrder: string }>> = {};

    attachments.forEach((a) => {
      attachments.forEach((b) => {
        if (a.id === b.id) return;
        if (a.employeeId !== b.employeeId) return;
        if (a.targetOfficeId === b.targetOfficeId) return; // distinct office attachment

        const s1 = a.effectiveFrom;
        const e1 = a.effectiveTo || '9999-12-31';
        const s2 = b.effectiveFrom;
        const e2 = b.effectiveTo || '9999-12-31';

        // Interval overlap condition: s1 <= e2 && s2 <= e1
        if (s1 <= e2 && s2 <= e1) {
          if (!tempConflictsByAttachmentId[a.id]) {
            tempConflictsByAttachmentId[a.id] = [];
          }
          const otherOffice = offices.find((o) => o.id === b.targetOfficeId);
          const otherOfficeName = otherOffice ? otherOffice.name.split('(')[0] : 'Unknown Office';
          const otherRange = b.effectiveTo ? `${b.effectiveFrom} to ${b.effectiveTo}` : `from ${b.effectiveFrom} onwards (Active)`;
          tempConflictsByAttachmentId[a.id].push({
            otherOfficeName,
            otherRange,
            otherOrder: b.orderNumber,
          });
        }
      });
    });

    return tempConflictsByAttachmentId;
  }, [attachments, offices]);

  // Total count of active attachments that currently have overlap conflicts
  const totalActiveConflictsCount = useMemo(() => {
    return Object.keys(attachmentConflicts).filter((id) => {
      const att = attachments.find((a) => a.id === id);
      return att && att.effectiveTo === null;
    }).length;
  }, [attachmentConflicts, attachments]);

  // Real-time conflict validation for Attachment form inputs being typed
  const dynamicFormConflicts = useMemo(() => {
    if (!attachEmpId || !attachOfficeId || !attachDate) return [];

    const result: Array<{ officeName: string; range: string; order: string }> = [];
    const newS = attachDate;
    const newE = attachDateTo || '9999-12-31';

    attachments.forEach((att) => {
      if (att.employeeId !== attachEmpId) return;
      if (att.targetOfficeId === attachOfficeId) return; // same office is not an overlap of different locations

      const existS = att.effectiveFrom;
      const existE = att.effectiveTo || '9999-12-31';

      if (newS <= existE && existS <= newE) {
        const off = offices.find((o) => o.id === att.targetOfficeId);
        const rangeStr = att.effectiveTo ? `${att.effectiveFrom} to ${att.effectiveTo}` : `from ${att.effectiveFrom} onwards (Active)`;
        result.push({
          officeName: off ? off.name.split('(')[0] : 'Unknown Office',
          range: rangeStr,
          order: att.orderNumber,
        });
      }
    });

    return result;
  }, [attachEmpId, attachOfficeId, attachDate, attachDateTo, attachments, offices]);

  // Demobilize states
  const [endingAttachId, setEndingAttachId] = useState<string | null>(null);
  const [endingAttachDate, setEndingAttachDate] = useState(() => new Date().toISOString().split('T')[0]);


  // ==========================================
  // DISPATCH SUBMISSION HANDLERS
  // ==========================================
  const handleTransferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!transferEmpId) {
      setErrorMsg("Please select an active employee using the Search Autocomplete.");
      return;
    }
    if (!transferSeatId) {
      setErrorMsg("Please specify a target new seat (you must select Target Office and Designation first).");
      return;
    }
    if (!transferDate) {
      setErrorMsg("Effective Date for transfer is required.");
      return;
    }
    if (!transferOrder.trim()) {
      setErrorMsg("Government transfer Order Number is required.");
      return;
    }

    // Double security check: Ensure target seat is actually vacant in local postings state
    const alreadyOccupied = postings.some((p) => p.seatId === transferSeatId && p.effectiveTo === null);
    if (alreadyOccupied) {
      setErrorMsg("Procedural Alert: The selected seat is already occupied by another active civil servant.");
      return;
    }

    // Legally assign transfer
    onTransferEmployee(
      transferEmpId, 
      transferSeatId, 
      transferDate, 
      transferOrder.trim(), 
      transferRemarks.trim() || undefined
    );

    const empName = selectedTransferEmp?.name || "SerVant";
    const targetSeatName = seats.find((s) => s.id === transferSeatId)?.name || 'Seat';
    const targetPos = positions.find((p) => p.id === transferPositionId)?.title || 'Designation';

    triggerSuccess(
      `Decree Compiled: ${empName} successfully transferred to ${targetPos} (${targetSeatName}) under order registry ${transferOrder}.`
    );

    // Reset Form Fields
    setTransferEmpId('');
    setTransferSearchQuery('');
    setTransferOfficeId('');
    setTransferPositionId('');
    setTransferSeatId('');
    setTransferRemarks('');
    clearPreFilledEmployee();
  };

  const handleAttachSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!attachEmpId) {
      setErrorMsg("Please search and select a servant to assign temporary duty.");
      return;
    }
    if (!attachOfficeId) {
      setErrorMsg("Please select a target Bureau Office for the attachment.");
      return;
    }
    if (!attachDate) {
      setErrorMsg("An Attachment Effective Date is required.");
      return;
    }
    if (!attachOrder.trim()) {
      setErrorMsg("Order number of attachment is required.");
      return;
    }
    if (!attachReason.trim()) {
      setErrorMsg("Please enter the specific reason/justification for temporary attachment.");
      return;
    }

    // Legally compile attachment
    onAttachEmployee(
      attachEmpId,
      attachOfficeId,
      attachDate,
      attachOrder.trim(),
      attachReason.trim(),
      attachDateTo || null
    );

    const empName = selectedAttachEmp?.name || "Employee";
    const targetOfficeName = offices.find((o) => o.id === attachOfficeId)?.name || "Bureau Office";
    triggerSuccess(
      `Temporary Attachment Authorised: ${empName} attached to ${targetOfficeName} on special assignment.`
    );

    // Reset fields
    setAttachEmpId('');
    setAttachSearchQuery('');
    setAttachOfficeId('');
    setAttachReason('');
    setAttachDateTo('');
  };

  const handleEndAttachmentSubmit = (e: React.FormEvent, attId: string) => {
    e.preventDefault();
    if (!endingAttachDate) return;
    onEndAttachment(attId, endingAttachDate);
    triggerSuccess("Historical temporary duty attachment closed legally. Normal posting index has been restored.");
    setEndingAttachId(null);
  };

  const handleOnboardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!onboardName.trim() || !onboardFather.trim() || !onboardCNIC.trim() || !onboardDOB || !onboardDOJ || !onboardPhone.trim()) {
      setErrorMsg("Computational criteria failed: Complete all core personal biography parameters.");
      return;
    }

    // CNIC Regex check
    const cleanCNIC = onboardCNIC.trim();
    const cnicPattern = /^\d{5}-\d{7}-\d{1}$/;
    if (!cnicPattern.test(cleanCNIC)) {
      setErrorMsg("Invalid Formatting: CNIC must follow government format: XXXXX-XXXXXXX-X (include all hyphens).");
      return;
    }

    // Validate if seat allocation fails
    if (onboardAssignSeat) {
      if (!onboardOfficeId) {
        setErrorMsg("Validation Alert: Target Office is required for immediate posting assignment.");
        return;
      }
      if (!onboardPositionId) {
        setErrorMsg("Validation Alert: Position Designation is required for immediate posting assignment.");
        return;
      }
      if (!onboardSeatId) {
        setErrorMsg("Validation Alert: Vacant Seat allocation is required for immediate posting assignment.");
        return;
      }
      if (!onboardDate) {
        setErrorMsg("Validation Alert: Initial Posting Effective Date is required.");
        return;
      }
      if (!onboardOrder.trim()) {
        setErrorMsg("Validation Alert: Initial Appointment Posting Order number is required.");
        return;
      }

      // Ensure vacant seat isn't taken
      const alreadyOccupied = postings.some((p) => p.seatId === onboardSeatId && p.effectiveTo === null);
      if (alreadyOccupied) {
        setErrorMsg("Procedural Failure: The selected starting seat was loaded by another active servant.");
        return;
      }
    }

    // Trigger state cascade dispatch
    onOnboardEmployee(
      {
        name: onboardName.trim(),
        fatherName: onboardFather.trim(),
        cnic: cleanCNIC,
        dob: onboardDOB,
        doj: onboardDOJ,
        scale: onboardScale,
        contactNumber: onboardPhone.trim(),
        photoColor: onboardColor,
        status: 'active',
      },
      onboardAssignSeat ? onboardSeatId : null,
      onboardOrder.trim(),
      onboardAssignSeat ? onboardDate : undefined
    );

    triggerSuccess(`Hiring Process Complete: New Civil Servant registered into EPA system as ${onboardName}.`);

    // Reset Form Fields
    setOnboardName('');
    setOnboardFather('');
    setOnboardCNIC('');
    setOnboardDOB('');
    setOnboardDOJ('');
    setOnboardPhone('');
    setOnboardAssignSeat(false);
    setOnboardOfficeId('');
    setOnboardPositionId('');
    setOnboardSeatId('');
  };

  const triggerSuccess = (text: string) => {
    setSuccessMsg(text);
    setErrorMsg(null);
    setTimeout(() => {
      setSuccessMsg(null);
    }, 7000);
  };

  return (
    <div id="admin-desk-box" className="space-y-6">

      {/* POPUP ALERT REGISTER */}
      {successMsg && (
        <div id="alert-success-banner" className="bg-emerald-800 text-white p-4.5 rounded-xl shadow-md border border-emerald-700 flex items-center justify-between transition animate-fadeIn">
          <div className="flex items-center gap-3 text-sm font-sans font-medium">
            <CheckCircle2 className="w-5 h-5 text-emerald-300 shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)} className="text-white/60 hover:text-white cursor-pointer px-2 text-md">
            ✕
          </button>
        </div>
      )}

      {errorMsg && (
        <div id="alert-error-banner" className="bg-rose-900 text-white p-4.5 rounded-xl shadow-md border border-rose-800 flex items-center justify-between transition animate-fadeIn">
          <div className="flex items-center gap-3 text-sm font-sans font-medium">
            <AlertCircle className="w-5 h-5 text-rose-300 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg(null)} className="text-white/60 hover:text-white cursor-pointer px-2 text-md">
            ✕
          </button>
        </div>
      )}

      {/* WORK BENCH WINDOW PANEL */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        
        {/* SUBTAB CONTROLS */}
        <div className="bg-slate-50 border-b border-slate-200 p-2 flex flex-wrap gap-1">
          <button
            id="tab-btn-transfer"
            onClick={() => {
              setPanelTab('transfer');
              setErrorMsg(null);
              clearPreFilledEmployee();
            }}
            className={`cursor-pointer px-4.5 py-3 rounded-lg text-xs font-extrabold transition duration-150 flex items-center gap-2 ${
              panelTab === 'transfer'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'
            }`}
          >
            <Send className="w-4 h-4 rotate-45" />
            RECORD A TRANSFER
          </button>

          <button
            id="tab-btn-attach"
            onClick={() => {
              setPanelTab('attach');
              setErrorMsg(null);
              clearPreFilledEmployee();
            }}
            className={`cursor-pointer px-4.5 py-3 rounded-lg text-xs font-extrabold transition duration-150 flex items-center gap-2 ${
              panelTab === 'attach'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'
            }`}
          >
            <Pin className="w-4 h-4 rotate-45" />
            RECORD AN ATTACHMENT
          </button>

          <button
            id="tab-btn-onboard"
            onClick={() => {
              setPanelTab('onboard');
              setErrorMsg(null);
              clearPreFilledEmployee();
            }}
            className={`cursor-pointer px-4.5 py-3 rounded-lg text-xs font-extrabold transition duration-150 flex items-center gap-2 ${
              panelTab === 'onboard'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'
            }`}
          >
            <Users className="w-4 h-4" />
            ADD NEW EMPLOYEE
          </button>
        </div>

        {/* WORKBENCH CONTENT CONTAINER */}
        <div className="p-6">
          
          {/* =======================================================
              1. TAB 1: RECORD A TRANSFER FORM
             ======================================================= */}
          {panelTab === 'transfer' && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <h3 className="text-md font-extrabold text-slate-800 flex items-center gap-2">
                  <Send className="w-5 h-5 text-emerald-800 rotate-45" />
                  Record Official Posting &amp; Transfer
                </h3>
                <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
                  Legally transfers an active civil servant to a new Office and Designation. This closes out the old posting record on the transfer day, and initializes subsequent records on the newly requested vacant seat.
                </p>
              </div>

              <form onSubmit={handleTransferSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-5 p-5 bg-slate-50 border border-slate-200 rounded-xl relative">
                
                {/* SELECT SERVANT WITH LIVE AUTOCOMPLETE */}
                <div className="md:col-span-12 lg:col-span-4 space-y-2 relative">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide font-mono">
                    1. Search &amp; Select Servant <span className="text-slate-400 font-normal">(Name or CNIC)</span> <span className="text-rose-500">*</span>
                  </label>
                  
                  {/* Backdrop Click-Catcher */}
                  {transferShowDropdown && (
                    <div className="fixed inset-0 z-40 bg-transparent" onClick={() => setTransferShowDropdown(false)} />
                  )}

                  <div className="relative z-50">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-4 w-4 text-slate-400" />
                    </div>
                    <input
                      type="text"
                      placeholder="Type name or CNIC (e.g. 35201-...)"
                      value={transferSearchQuery}
                      onChange={(e) => {
                        setTransferSearchQuery(e.target.value);
                        setTransferShowDropdown(true);
                        if (transferEmpId) {
                          setTransferEmpId('');
                          setTransferOfficeId('');
                          setTransferPositionId('');
                          setTransferSeatId('');
                        }
                      }}
                      onFocus={() => {
                        setTransferShowDropdown(true);
                      }}
                      className="w-full text-xs pl-9 pr-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-hidden focus:ring-1 focus:ring-emerald-700 font-sans"
                    />

                    {/* Live Autocomplete Dropdown overlay */}
                    {transferShowDropdown && matchingEmployeesForTransfer.length > 0 && (
                      <div className="absolute left-0 right-0 z-55 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-56 overflow-y-auto divide-y divide-slate-100">
                        {matchingEmployeesForTransfer.map((emp) => {
                          const statusPosting = getEmployeeCurrentPosting(emp.id);
                          const postText = statusPosting ? `@ ${statusPosting.officeName.split('(')[0]}` : '(OSD/Unposted)';
                          return (
                            <button
                              key={emp.id}
                              type="button"
                              onClick={() => {
                                setTransferEmpId(emp.id);
                                setTransferSearchQuery(emp.name);
                                setTransferShowDropdown(false);
                              }}
                              className="w-full text-left px-3 py-2 hover:bg-slate-50 text-xs flex flex-col transition cursor-pointer"
                            >
                              <span className="font-semibold text-slate-800">{emp.name} ({emp.scale})</span>
                              <span className="text-xxxxs text-slate-500 font-mono mt-0.5">CNIC: {emp.cnic} • {postText}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {/* Empty Query matching state */}
                    {transferShowDropdown && transferSearchQuery.trim() !== '' && matchingEmployeesForTransfer.length === 0 && !transferEmpId && (
                      <div className="absolute left-0 right-0 z-55 mt-1 bg-white border border-slate-200 rounded-lg p-3 shadow-lg text-center text-slate-400 text-xxs font-sans">
                        No active employee matching this query found
                      </div>
                    )}
                  </div>

                  {/* SELECTED EMPLOYEE INFO PREVIEW */}
                  {selectedTransferEmp && (
                    <div id="transfer-current-posting-preview" className="mt-3 p-3 bg-emerald-50/50 border border-emerald-100 rounded-lg text-xs space-y-2 animate-fadeIn">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className={`w-2.5 h-2.5 rounded-full ${selectedTransferEmp.photoColor}`} />
                          <strong className="text-slate-800 font-sans">{selectedTransferEmp.name}</strong>
                          <span className="bg-emerald-100 text-emerald-800 text-xxxxs font-mono font-bold px-1 py-0.5 rounded tracking-wider uppercase">
                            {selectedTransferEmp.scale}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setTransferEmpId('');
                            setTransferSearchQuery('');
                            setTransferOfficeId('');
                            setTransferPositionId('');
                            setTransferSeatId('');
                          }}
                          className="text-xxxxxs uppercase underline text-rose-600 hover:text-rose-950 font-extrabold cursor-pointer"
                        >
                          Clear Selection
                        </button>
                      </div>

                      <div className="text-slate-500 text-xxs font-mono flex flex-wrap gap-x-3 gap-y-0.5">
                        <span>CNIC: {selectedTransferEmp.cnic}</span>
                        <span>DOJ: {selectedTransferEmp.doj}</span>
                      </div>

                      <div className="pt-2 border-t border-emerald-100">
                        <strong className="block text-xxxxs text-slate-400 uppercase tracking-wider font-mono mb-1">Current Permanent Home Posting:</strong>
                        {transferCurrentPosting ? (
                          <div className="bg-white p-2 rounded border border-emerald-100 shadow-xxs">
                            <span className="block font-bold text-slate-800 text-xxs">🏢 {transferCurrentPosting.officeName}</span>
                            <span className="block text-slate-600 text-xxs mt-0.5 font-medium">{transferCurrentPosting.positionTitle} ({transferCurrentPosting.seat.name})</span>
                            <div className="flex flex-wrap items-center justify-between text-xxxxs text-slate-400 font-mono mt-1 border-t border-slate-50 pt-1">
                              <span>Active Since: {transferCurrentPosting.posting.effectiveFrom}</span>
                              <span>Order No: {transferCurrentPosting.posting.orderNumber}</span>
                            </div>
                          </div>
                        ) : (
                          <div className="p-2.5 rounded bg-orange-50 border border-orange-100/70 text-amber-900 font-medium text-xxs leading-relaxed">
                            ⚠️ Servant is currently Unposted (OSD). There is no active permanent seat posting to close out.
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* TARGET CASCADING SELECTORS */}
                <div className="md:col-span-12 lg:col-span-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                  
                  {/* CASCADING OFFICE */}
                  <div className="md:col-span-1">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1 font-mono">
                      2. Target New Office <span className="text-rose-500">*</span>
                    </label>
                    <select
                      required
                      value={transferOfficeId}
                      onChange={(e) => {
                        setTransferOfficeId(e.target.value);
                        setTransferPositionId('');
                        setTransferSeatId('');
                      }}
                      disabled={!transferEmpId}
                      className="w-full text-xs px-2.5 py-2 border border-slate-300 rounded-lg bg-white focus:outline-hidden disabled:bg-slate-100 disabled:text-slate-400 cursor-pointer"
                    >
                      <option value="">-- Choose Target Office --</option>
                      {offices.map((off) => (
                        <option key={off.id} value={off.id}>
                          {off.name} ({off.district})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* CASCADING DESIGNATION/POSITION */}
                  <div className="md:col-span-1">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1 font-mono">
                      3. New Position <span className="text-rose-500">*</span>
                    </label>
                    <select
                      required
                      value={transferPositionId}
                      onChange={(e) => {
                        setTransferPositionId(e.target.value);
                        setTransferSeatId('');
                      }}
                      disabled={!transferOfficeId}
                      className="w-full text-xs px-2.5 py-2 border border-slate-300 rounded-lg bg-white focus:outline-hidden disabled:bg-slate-100 disabled:text-slate-400 cursor-pointer"
                    >
                      <option value="">-- Select Designation --</option>
                      {transferPositions.map((pos) => (
                        <option key={pos.id} value={pos.id}>
                          {pos.title} ({pos.scale})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* CASCADING SEATS (VACANT ONLY) */}
                  <div className="md:col-span-1">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1 font-mono">
                      4. Seat (Vacant Only) <span className="text-rose-500">*</span>
                    </label>
                    <select
                      required
                      value={transferSeatId}
                      onChange={(e) => setTransferSeatId(e.target.value)}
                      disabled={!transferPositionId}
                      className="w-full text-xs px-2.5 py-2 border border-slate-300 rounded-lg bg-white focus:outline-hidden disabled:bg-slate-100 disabled:text-slate-400 cursor-pointer font-mono"
                    >
                      <option value="">-- Select Vacant Seat --</option>
                      {transferVacantSeats.map((seat) => (
                        <option key={seat.id} value={seat.id}>
                          {seat.name}
                        </option>
                      ))}
                    </select>
                    {transferPositionId && transferVacantSeats.length === 0 && (
                      <span className="text-xxxxs text-rose-600 block mt-1 font-sans">
                        ⚠️ No vacant seats available under this designation!
                      </span>
                    )}
                  </div>

                  {/* TRANSFER EFFECTIVE DATE */}
                  <div className="md:col-span-1">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1 font-mono">
                      5. Effective Date <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="date"
                      required
                      disabled={!transferEmpId}
                      value={transferDate}
                      onChange={(e) => setTransferDate(e.target.value)}
                      className="w-full text-xs px-2.5 py-2 border border-slate-300 rounded-lg bg-white focus:outline-hidden font-mono disabled:bg-slate-100 disabled:text-slate-400"
                    />
                  </div>

                  {/* TRANSFER ORDER NO */}
                  <div className="md:col-span-1">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1 font-mono">
                      6. New Order Code <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      disabled={!transferEmpId}
                      placeholder="e.g. SO(Estt)4-12/2026"
                      value={transferOrder}
                      onChange={(e) => setTransferOrder(e.target.value)}
                      className="w-full text-xs px-2.5 py-2 border border-slate-300 rounded-lg bg-white focus:outline-hidden disabled:bg-slate-100 disabled:text-slate-400 font-mono"
                    />
                  </div>

                  {/* REMARKS FIELD */}
                  <div className="md:col-span-1">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1 font-mono">
                      7. Special Remarks <span className="text-slate-400 font-normal">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Transfer on smuggling audit..."
                      disabled={!transferEmpId}
                      value={transferRemarks}
                      onChange={(e) => setTransferRemarks(e.target.value)}
                      className="w-full text-xs px-2.5 py-2 border border-slate-300 rounded-lg bg-white focus:outline-hidden disabled:bg-slate-100 disabled:text-slate-400"
                    />
                  </div>

                  {/* SUBMIT BUTTON */}
                  <div className="md:col-span-3 flex justify-end items-end pt-3 md:pt-0">
                    <button
                      type="submit"
                      disabled={!transferEmpId || !transferSeatId}
                      className="w-full md:w-auto px-6 py-2.5 text-xs text-white bg-emerald-800 hover:bg-emerald-900 focus:ring-2 focus:ring-offset-2 focus:ring-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed rounded-lg font-bold flex items-center justify-center transition shadow-xs cursor-pointer"
                    >
                      <UserCheck className="w-4 h-4 mr-1.5" />
                      Dispatch Official Transfer
                    </button>
                  </div>
                </div>

              </form>

              {/* AUDIT ADVISORY BANNER */}
              <div className="p-4 rounded-xl bg-orange-5075 border border-orange-100 flex gap-3 text-xs text-amber-900 leading-relaxed font-sans">
                <Info className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <span className="font-extrabold text-amber-950">Civil Secretariat Procedural Note:</span> Submitting this form closes the employee's current active permanent posting history automatically on the requested Effective Date (marking it as ended). It immediately provisions the chosen vacant seat registry ledger without leaving duplicate positions active.
                </div>
              </div>
            </div>
          )}


          {/* =======================================================
              2. TAB 2: RECORD AN ATTACHMENT FORM
             ======================================================= */}
          {panelTab === 'attach' && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <h3 className="text-md font-bold text-slate-800 flex items-center gap-2">
                  <Pin className="w-5 h-5 text-emerald-800 rotate-45" />
                  Record Temporary Duty Attachment Order
                </h3>
                <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
                  Temporary attachment assigns an active civil servant to look after immediate special file responsibilities in another office. <strong>Normal permanent postings remain intact, active, and unchanged.</strong>
                </p>
              </div>

              {/* OVERLAPPING ATTACHIMENT CONFLICT SUMMARY */}
              {totalActiveConflictsCount > 0 && (
                <div id="system-overlap-warning" className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex gap-3 shadow-xs">
                  <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block text-rose-950">⚠️ Active Attachment Overlap Conflict Warnings ({totalActiveConflictsCount} Active records)</span>
                    <span className="block mt-1 leading-relaxed">
                      Punjab administrative guidelines mandate that an officer cannot hold dual attachments at different locations during overlapping windows. Use the Attachments Register below to relieve officers of completed duties.
                    </span>
                  </div>
                </div>
              )}

              {/* ASSIGN ATTACHMENT ACTION */}
              <form onSubmit={handleAttachSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-4 p-5 bg-slate-50 border border-slate-200 rounded-xl relative">
                
                {/* ATTACHMENT SEARCH AUTOCONTRACT */}
                <div className="md:col-span-12 lg:col-span-4 space-y-2 relative">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide font-mono">
                    1. Search &amp; Select Servant <span className="text-slate-400 font-normal">(Name or CNIC)</span> <span className="text-rose-500">*</span>
                  </label>

                  {/* Backdrop Click-Catcher */}
                  {attachShowDropdown && (
                    <div className="fixed inset-0 z-40 bg-transparent" onClick={() => setAttachShowDropdown(false)} />
                  )}

                  <div className="relative z-50">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-4 w-4 text-slate-400" />
                    </div>
                    <input
                      type="text"
                      placeholder="Type Name or CNIC..."
                      value={attachSearchQuery}
                      onChange={(e) => {
                        setAttachSearchQuery(e.target.value);
                        setAttachShowDropdown(true);
                        if (attachEmpId) {
                          setAttachEmpId('');
                          setAttachOfficeId('');
                        }
                      }}
                      onFocus={() => {
                        setAttachShowDropdown(true);
                      }}
                      className="w-full text-xs pl-9 pr-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-hidden focus:ring-1 focus:ring-emerald-700"
                    />

                    {/* Autocomplete candidates layout overlay */}
                    {attachShowDropdown && matchingEmployeesForAttach.length > 0 && (
                      <div className="absolute left-0 right-0 z-55 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-56 overflow-y-auto divide-y divide-slate-100">
                        {matchingEmployeesForAttach.map((emp) => {
                          const statusPosting = getEmployeeCurrentPosting(emp.id);
                          const postText = statusPosting ? `@ ${statusPosting.officeName.split('(')[0]}` : '(OSD/Unposted)';
                          return (
                            <button
                              key={emp.id}
                              type="button"
                              onClick={() => {
                                setAttachEmpId(emp.id);
                                setAttachSearchQuery(emp.name);
                                setAttachShowDropdown(false);
                              }}
                              className="w-full text-left px-3 py-2 hover:bg-slate-50 text-xs flex flex-col transition cursor-pointer"
                            >
                              <span className="font-semibold text-slate-800">{emp.name} ({emp.scale})</span>
                              <span className="text-xxxxs text-slate-500 font-mono mt-0.5">CNIC: {emp.cnic} • {postText}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {/* No items matching state */}
                    {attachShowDropdown && attachSearchQuery.trim() !== '' && matchingEmployeesForAttach.length === 0 && !attachEmpId && (
                      <div className="absolute left-0 right-0 z-55 mt-1 bg-white border border-slate-200 rounded-lg p-3 shadow-lg text-center text-slate-400 text-xxs">
                        No active employee found matching this criteria
                      </div>
                    )}
                  </div>

                  {/* PREVIEW DETAILED COMPLIANT BOX */}
                  {selectedAttachEmp && (
                    <div id="attachment-selected-employee-card" className="mt-3 p-3 bg-slate-100 border border-slate-200 rounded-lg text-xs space-y-2 animate-fadeIn">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className={`w-2.5 h-2.5 rounded-full ${selectedAttachEmp.photoColor}`} />
                          <strong className="text-slate-800 font-sans">{selectedAttachEmp.name}</strong>
                          <span className="bg-slate-200 text-slate-700 text-xxxxs font-mono font-bold px-1 py-0.5 rounded tracking-wider uppercase">
                            {selectedAttachEmp.scale}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setAttachEmpId('');
                            setAttachSearchQuery('');
                            setAttachOfficeId('');
                          }}
                          className="text-xxxxxs uppercase underline text-rose-600 hover:text-rose-950 font-extrabold cursor-pointer"
                        >
                          Clear Selection
                        </button>
                      </div>

                      <div className="text-slate-500 text-xxs font-mono flex gap-x-3">
                        <span>CNIC: {selectedAttachEmp.cnic}</span>
                        <span>Phone: {selectedAttachEmp.contactNumber}</span>
                      </div>

                      <div className="pt-2 border-t border-slate-200">
                        <strong className="block text-xxxxs text-slate-400 uppercase tracking-wider font-mono mb-1">Permanent Normal posting (WILL remain unchanged):</strong>
                        {attachCurrentPosting ? (
                          <div className="bg-white p-2 border border-slate-200 rounded shadow-xxs font-sans text-xxs">
                            <span className="block font-bold text-slate-800">🏢 {attachCurrentPosting.officeName}</span>
                            <span className="block text-slate-600 font-medium mt-0.5">{attachCurrentPosting.positionTitle} (Designated Seat: {attachCurrentPosting.seat.name})</span>
                          </div>
                        ) : (
                          <div className="p-2.5 rounded bg-orange-50 border border-orange-150-100 text-amber-800 text-xxs">
                            ⚠️ Servant holds no permanent permanent station right now (OSD / Unposted).
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* FIELDS FOR ATTACHMENT */}
                <div className="md:col-span-12 lg:col-span-8 grid grid-cols-1 md:grid-cols-12 gap-4">
                  
                  {/* ATTACH TO OFFICE */}
                  <div className="md:col-span-6">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1 font-mono">
                      2. Target Attachment Office Bureau <span className="text-rose-500">*</span>
                    </label>
                    <select
                      required
                      value={attachOfficeId}
                      onChange={(e) => setAttachOfficeId(e.target.value)}
                      disabled={!attachEmpId}
                      className="w-full text-xs px-2.5 py-2 border border-slate-300 rounded-lg bg-white focus:outline-hidden disabled:bg-slate-100 disabled:text-slate-400 cursor-pointer"
                    >
                      <option value="">-- Choose Target Bureau --</option>
                      {offices.map((off) => (
                        <option key={off.id} value={off.id}>
                          {off.name} ({off.district})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* EFFECTIVE FROM */}
                  <div className="md:col-span-3">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1 font-mono">
                      3. Effective From <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="date"
                      required
                      disabled={!attachEmpId}
                      value={attachDate}
                      onChange={(e) => setAttachDate(e.target.value)}
                      className="w-full text-xs px-2.5 py-2 border border-slate-300 rounded-lg bg-white focus:outline-hidden font-mono disabled:bg-slate-100 disabled:text-slate-400"
                    />
                  </div>

                  {/* EFFECTIVE TO (OPTIONAL) */}
                  <div className="md:col-span-3">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1 font-mono">
                      4. Effective To <span className="text-slate-400 font-normal">(Optional)</span>
                    </label>
                    <input
                      type="date"
                      disabled={!attachEmpId}
                      placeholder="Indefinite duty"
                      value={attachDateTo}
                      onChange={(e) => setAttachDateTo(e.target.value)}
                      className="w-full text-xs px-2.5 py-2 border border-slate-300 rounded-lg bg-white focus:outline-hidden font-mono disabled:bg-slate-100 disabled:text-slate-400"
                    />
                  </div>

                  {/* ORDER NO */}
                  <div className="md:col-span-12">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1 font-mono">
                      5. Attachment Order Number <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      disabled={!attachEmpId}
                      placeholder="e.g. DG(EPA)SO-91/2026 or administrative SMOG command decree"
                      value={attachOrder}
                      onChange={(e) => setAttachOrder(e.target.value)}
                      className="w-full text-xs px-2.5 py-2 border border-slate-300 rounded-lg bg-white focus:outline-hidden disabled:bg-slate-100 disabled:text-slate-400 font-mono"
                    />
                  </div>

                  {/* REASON FOR ATTACHMENT */}
                  <div className="md:col-span-12">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1 font-mono">
                      6. Legal Purpose / Attachment Reason Description <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      required
                      rows={2}
                      disabled={!attachEmpId}
                      placeholder="Provide reasoning e.g., Set up and monitor specific industrial smelting filters near wagah border..."
                      value={attachReason}
                      onChange={(e) => setAttachReason(e.target.value)}
                      className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-hidden disabled:bg-slate-100 disabled:text-slate-400 font-sans"
                    />
                  </div>

                  {/* OVERLAP WARNING PANEL */}
                  {dynamicFormConflicts.length > 0 && (
                    <div id="dynamic-form-conflict-badge" className="md:col-span-12 p-4 bg-rose-50 border border-rose-200 rounded-lg flex gap-3 text-xs text-rose-900 shadow-xxs">
                      <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-extrabold text-rose-950 block">Procedural Advisory: Overlapping Attachment Detected!</span>
                        <p className="mt-0.5 leading-relaxed">
                          This officer already has conflicting temporary duties at the following locations with intersecting timelines:
                        </p>
                        <ul className="list-disc pl-5 mt-1 font-bold space-y-0.5">
                          {dynamicFormConflicts.map((conf, ci) => (
                            <li key={ci}>
                              🏢 Office: {conf.officeName} ({conf.range}, Order: {conf.order})
                            </li>
                          ))}
                        </ul>
                        <span className="block mt-1 text-xxxxs text-rose-700">
                          Please ensure you adjust either dates or relieve ongoing conflicting duty attachment files before saving.
                        </span>
                      </div>
                    </div>
                  )}

                  {/* SUBMIT BUTTON */}
                  <div className="md:col-span-12 flex justify-end">
                    <button
                      type="submit"
                      disabled={!attachEmpId || !attachOfficeId}
                      className="px-6 py-2.5 text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-900 focus:ring-2 focus:ring-offset-2 focus:ring-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed rounded-lg flex items-center justify-center transition shadow-xs cursor-pointer"
                    >
                      <Pin className="w-4 h-4 mr-1.5 rotate-45" />
                      Authorize Attachment Assignment
                    </button>
                  </div>
                </div>

              </form>

              {/* CURRENT ACTIVE ATTACHMENTS WITH CLOSE TRIGGER */}
              <div className="space-y-3.5 pt-4">
                <div className="border-b border-slate-100 pb-2 flex justify-between items-center">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                    Active Attachments Register ({activeAttachmentsList.length})
                  </h4>
                  <span className="text-xxxxs text-slate-400 font-mono bg-slate-100 px-2 py-0.5 rounded-sm">EPA Registry Rules Met</span>
                </div>

                {activeAttachmentsList.length === 0 ? (
                  <div className="p-6 text-center border border-dashed border-slate-200 rounded-lg text-slate-400 text-xs font-sans">
                    No active temporary attachments in registry book. All personnel serving permanents.
                  </div>
                ) : (
                  <div className="overflow-x-auto border border-slate-200 rounded-xl bg-white shadow-xs">
                    <table className="w-full text-left text-xs text-slate-600">
                      <thead className="bg-slate-50 text-xxs font-extrabold text-slate-400 uppercase tracking-wider border-b border-slate-200">
                        <tr>
                          <th className="p-3">Servant Name</th>
                          <th className="p-3 font-mono">Permanent station</th>
                          <th className="p-3 font-mono">attached station</th>
                          <th className="p-3 font-mono">Duration</th>
                          <th className="p-3">Order Code</th>
                          <th className="p-3 text-right">Teardown Relieve Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-sans">
                        {activeAttachmentsList.map((att) => {
                          const conflicts = attachmentConflicts[att.id];
                          const hasConflict = !!conflicts && conflicts.length > 0;
                          return (
                            <React.Fragment key={att.id}>
                              <tr className={`transition-all duration-150 ${hasConflict ? 'bg-rose-50 hover:bg-rose-100/70 border-l-4 border-l-rose-600' : 'hover:bg-slate-50'}`}>
                                <td className="p-3 font-extrabold text-slate-900">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span>{att.employeeName} ({att.employeeScale})</span>
                                    {hasConflict && (
                                      <span className="inline-flex items-center bg-rose-700 text-white text-xxxxs font-mono font-extrabold px-1.5 py-0.5 rounded tracking-wider uppercase">
                                        ⚠️ OVERLAP CONFLICT
                                      </span>
                                    )}
                                  </div>
                                </td>
                                <td className="p-3 text-xxs text-slate-500 font-mono">
                                  {att.homePostingDisplay}
                                </td>
                                <td className={`p-3 font-bold ${hasConflict ? 'text-rose-950' : 'text-slate-800'}`}>
                                  🏢 {att.targetOfficeName}
                                </td>
                                <td className="p-3 text-xxs text-slate-500 font-mono">
                                  {att.effectiveFrom} {att.effectiveTo ? `to ${att.effectiveTo}` : 'onwards'}
                                </td>
                                <td className="p-3 font-mono text-slate-400 text-xxs">{att.orderNumber}</td>
                                <td className="p-3 text-right">
                                  {endingAttachId === att.id ? (
                                    <form
                                      onSubmit={(e) => handleEndAttachmentSubmit(e, att.id)}
                                      className="flex items-center justify-end gap-1.5"
                                    >
                                      <div>
                                        <input
                                          type="date"
                                          required
                                          value={endingAttachDate}
                                          onChange={(e) => setEndingAttachDate(e.target.value)}
                                          className="text-xxxxs p-1.5 border border-slate-300 rounded-md font-mono bg-white h-7"
                                        />
                                      </div>
                                      <button
                                        type="submit"
                                        className="h-7 px-3 text-xxxxs font-bold text-white bg-rose-700 hover:bg-rose-800 rounded-md cursor-pointer flex items-center"
                                      >
                                        End attachment
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => setEndingAttachId(null)}
                                        className="h-7 px-2.5 text-xxxxs text-slate-500 bg-slate-100 rounded-md hover:bg-slate-200 cursor-pointer flex items-center"
                                      >
                                        ✕
                                      </button>
                                    </form>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setEndingAttachId(att.id);
                                        setEndingAttachDate(new Date().toISOString().split('T')[0]);
                                      }}
                                      className="text-xxxxs font-extrabold text-rose-700 hover:text-white bg-rose-50 hover:bg-rose-700 border border-rose-200 px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ml-auto shadow-xxs"
                                    >
                                      <PinOff className="w-3.5 h-3.5 rotate-45" />
                                      Relieve attachment
                                    </button>
                                  )}
                                </td>
                              </tr>
                              {hasConflict && (
                                <tr className="bg-rose-50/40">
                                  <td colSpan={6} className="px-6 py-2 pb-3.5 border-b border-rose-100">
                                    <div className="flex items-start gap-2 text-xxs text-rose-900 leading-normal pl-3 border-l-2 border-rose-400">
                                      <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                                      <div>
                                        <span className="font-extrabold">Overlap Conflict details associated with timelines:</span>
                                        <ul className="list-disc pl-5 mt-1 font-semibold text-rose-700 space-y-0.5">
                                          {conflicts.map((conf, ci) => (
                                            <li key={ci}>
                                              🏢 Connected Target: {conf.otherOfficeName} ({conf.otherRange}, Order: {conf.otherOrder})
                                            </li>
                                          ))}
                                        </ul>
                                      </div>
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </React.Fragment>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}


          {/* =======================================================
              3. TAB 3: ADD NEW EMPLOYEE WITH INITIAL POSTING
             ======================================================= */}
          {panelTab === 'onboard' && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <h3 className="text-md font-bold text-slate-800 flex items-center gap-2">
                  <Users className="w-5 h-5 text-emerald-800" />
                  Hire &amp; Onboard Civil Servant Record
                </h3>
                <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
                  Registers official biometric profile and details. You can assign them immediately to a vacant permanent seat using cascading selectors, or leave them as OSD/Unposted to resolve later.
                </p>
              </div>

              <form onSubmit={handleOnboardSubmit} className="space-y-5 bg-slate-50 border border-slate-200 p-5 rounded-xl">
                
                {/* BIO SECTION */}
                <div>
                  <h4 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-3 pb-1 border-b border-slate-200 font-mono">
                    Section A: Biometric &amp; Personal Profile Logs
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Servant Full Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Tariq Mahmood Qureshi"
                        value={onboardName}
                        onChange={(e) => setOnboardName(e.target.value)}
                        className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Father's Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Muhammad Shafiq"
                        value={onboardFather}
                        onChange={(e) => setOnboardFather(e.target.value)}
                        className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1 font-mono">
                        CNIC Number <span className="text-slate-400 font-normal">(xxxxx-xxxxxxx-x)</span> <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. 35201-1234567-9"
                        value={onboardCNIC}
                        onChange={(e) => setOnboardCNIC(e.target.value)}
                        className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-hidden font-mono"
                      />
                      <span className="text-xxxxs text-slate-400 block mt-0.5 font-sans">13 digits format with exact hyphens.</span>
                    </div>
                  </div>
                </div>

                {/* BIOLOGIC SECONDARY AND ACCENTS */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Date of Birth (DOB) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="date"
                      required
                      value={onboardDOB}
                      onChange={(e) => setOnboardDOB(e.target.value)}
                      className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg bg-white font-mono focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Date of Joining (DOJ) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="date"
                      required
                      value={onboardDOJ}
                      onChange={(e) => {
                        setOnboardDOJ(e.target.value);
                        // Default initial posting date to DOJ as a courtesy
                        if (!onboardDate) setOnboardDate(e.target.value);
                      }}
                      className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg bg-white font-mono focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Basic Scale (BS) Grade
                    </label>
                    <select
                      value={onboardScale}
                      onChange={(e) => setOnboardScale(e.target.value)}
                      className="w-full text-xs px-2.5 py-2 border border-slate-300 rounded-lg bg-white focus:outline-hidden cursor-pointer"
                    >
                      {Array.from({ length: 18 }, (_, k) => `BS-${k + 1}`).reverse().map((b) => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Contact Phone <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 0300-1234567"
                      value={onboardPhone}
                      onChange={(e) => setOnboardPhone(e.target.value)}
                      className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-hidden font-mono"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 font-sans">
                    Profile Vector Avatar Accent Color
                  </label>
                  <div className="flex flex-wrap gap-2.5">
                    {[
                      { color: 'bg-indigo-600', name: 'Royal Indigo' },
                      { color: 'bg-emerald-600', name: 'Forest Emerald' },
                      { color: 'bg-rose-600', name: 'Crimson Slate' },
                      { color: 'bg-amber-600', name: 'Amber Gold' },
                      { color: 'bg-teal-600', name: 'Teal Lagoon' },
                      { color: 'bg-sky-600', name: 'Sky Breez' },
                      { color: 'bg-fuchsia-600', name: 'Fuchsia glow' },
                    ].map((item) => (
                      <button
                        key={item.color}
                        type="button"
                        onClick={() => setOnboardColor(item.color)}
                        className={`h-8 px-3 text-xxxxs font-bold text-white rounded-full transition flex items-center gap-1.5 cursor-pointer ${item.color} ${
                          onboardColor === item.color ? 'ring-2 ring-slate-800 ring-offset-2 scale-102' : 'opacity-85'
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-white block" />
                        {item.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* INITIAL POSTING SECTION DETAILS */}
                <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm space-y-4">
                  <div className="flex items-center gap-2.5">
                    <input
                      type="checkbox"
                      id="check-assign-seat"
                      checked={onboardAssignSeat}
                      onChange={(e) => setOnboardAssignSeat(e.target.checked)}
                      className="h-4 w-4 text-emerald-700 focus:ring-emerald-600 border-slate-300 rounded cursor-pointer"
                    />
                    <label htmlFor="check-assign-seat" className="text-xs font-bold text-slate-800 cursor-pointer select-none font-sans">
                      Establish Initial Permanent Career Posting immediately during Onboarding
                    </label>
                  </div>
                  <p className="text-xxxxs text-slate-500 leading-normal max-w-2xl">
                    Assigning a starting permanent seat provisions their first Posting ledger index. Unchecking this holds them in OSD status.
                  </p>

                  {onboardAssignSeat && (
                    <div className="pt-4 border-t border-slate-100 grid grid-cols-1 md:grid-cols-12 gap-4 animate-fadeIn">
                      
                      {/* SELECT CASCADING OFFICE */}
                      <div className="md:col-span-4">
                        <label className="block text-xxxxs font-extrabold uppercase tracking-wide text-slate-500 mb-1 font-mono">
                          Select Target Starting Office <span className="text-rose-500">*</span>
                        </label>
                        <select
                          required={onboardAssignSeat}
                          value={onboardOfficeId}
                          onChange={(e) => {
                            setOnboardOfficeId(e.target.value);
                            setOnboardPositionId('');
                            setOnboardSeatId('');
                          }}
                          className="w-full text-xs px-2.5 py-2 border border-slate-300 rounded-lg bg-slate-50 focus:outline-hidden cursor-pointer"
                        >
                          <option value="">-- Choose Office --</option>
                          {offices.map((off) => (
                            <option key={off.id} value={off.id}>
                              {off.name} ({off.district})
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* SELECT CASCADING POSITION */}
                      <div className="md:col-span-4">
                        <label className="block text-xxxxs font-extrabold uppercase tracking-wide text-slate-500 mb-1 font-mono">
                          Select Designation Position <span className="text-rose-500">*</span>
                        </label>
                        <select
                          required={onboardAssignSeat}
                          value={onboardPositionId}
                          onChange={(e) => {
                            setOnboardPositionId(e.target.value);
                            setOnboardSeatId('');
                          }}
                          disabled={!onboardOfficeId}
                          className="w-full text-xs px-2.5 py-2 border border-slate-300 rounded-lg bg-slate-50 focus:outline-hidden disabled:bg-slate-100 disabled:cursor-not-allowed cursor-pointer"
                        >
                          <option value="">-- Select Designation --</option>
                          {onboardPositions.map((pos) => (
                            <option key={pos.id} value={pos.id}>
                              {pos.title} ({pos.scale})
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* SELECT CASCADING SEAT (VACANT SEAT ONLY) */}
                      <div className="md:col-span-4">
                        <label className="block text-xxxxs font-extrabold uppercase tracking-wide text-slate-500 mb-1 font-mono">
                          Allocated Vacant Seat <span className="text-rose-500">*</span>
                        </label>
                        <select
                          required={onboardAssignSeat}
                          value={onboardSeatId}
                          onChange={(e) => setOnboardSeatId(e.target.value)}
                          disabled={!onboardPositionId}
                          className="w-full text-xs px-2.5 py-2 border border-slate-300 rounded-lg bg-slate-50 focus:outline-hidden disabled:bg-slate-100 disabled:cursor-not-allowed cursor-pointer font-mono"
                        >
                          <option value="">-- Select Vacant Seat --</option>
                          {onboardVacantSeats.map((seat) => (
                            <option key={seat.id} value={seat.id}>
                              {seat.name}
                            </option>
                          ))}
                        </select>
                        {onboardPositionId && onboardVacantSeats.length === 0 && (
                          <span className="text-xxxxs text-rose-600 block mt-1 font-sans">
                            ⚠️ All seats under this designator are currently occupied!
                          </span>
                        )}
                      </div>

                      {/* EFFECTIVE DATE */}
                      <div className="md:col-span-6">
                        <label className="block text-xxxxs font-extrabold uppercase tracking-wide text-slate-500 mb-1 font-mono">
                          Posting Effective Date <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="date"
                          required={onboardAssignSeat}
                          value={onboardDate}
                          onChange={(e) => setOnboardDate(e.target.value)}
                          className="w-full text-xs px-2.5 py-2 border border-slate-300 rounded-lg bg-slate-50 focus:outline-hidden font-mono"
                        />
                      </div>

                      {/* ORDER NO */}
                      <div className="md:col-span-6">
                        <label className="block text-xxxxs font-extrabold uppercase tracking-wide text-slate-500 mb-1 font-mono">
                          Initial Appointing Order Number <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          required={onboardAssignSeat}
                          placeholder="e.g. SO(Recruit-GP)1-20/2026"
                          value={onboardOrder}
                          onChange={(e) => setOnboardOrder(e.target.value)}
                          className="w-full text-xs px-2.5 py-2 border border-slate-300 rounded-lg bg-slate-50 focus:outline-hidden font-mono"
                        />
                      </div>

                    </div>
                  )}
                </div>

                {/* DISPATCH ACTION */}
                <div className="flex justify-end pt-3">
                  <button
                    type="submit"
                    className="px-6 py-3 text-xs text-white bg-emerald-800 hover:bg-emerald-900 focus:ring-2 focus:ring-offset-2 focus:ring-emerald-700 rounded-lg font-bold flex items-center justify-center transition shadow-xs cursor-pointer"
                  >
                    <UserCheck className="w-5 h-5 mr-1.5" />
                    Onboard &amp; Initialise Record
                  </button>
                </div>
              </form>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
