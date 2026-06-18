import { useState, useEffect } from 'react';
import { Office, Position, Seat, Employee, Posting, Attachment } from './types';
import {
  initialOffices,
  initialPositions,
  initialSeats,
  initialEmployees,
  initialPostings,
  initialAttachments,
} from './mockData';
import { Metrics } from './components/Metrics';
import { OfficeSection } from './components/OfficeSection';
import { PersonnelDirectory } from './components/PersonnelDirectory';
import { AdminDesk } from './components/AdminDesk';
import { 
  Building2, 
  Users2, 
  ShieldAlert, 
  FileSliders, 
  HelpCircle, 
  HardHat, 
  FileSpreadsheet, 
  Sparkles,
  LayoutDashboard,
  Link,
  UserPlus,
  ArrowRightLeft
} from 'lucide-react';

export default function App() {
  // Main Tab/Page State: 'dashboard' | 'personnel' | 'offices' | 'transfer' | 'attach' | 'onboard'
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Core Administrative States
  const [offices, setOffices] = useState<Office[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [seats, setSeats] = useState<Seat[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [postings, setPostings] = useState<Posting[]>([]);
  const [attachments, setAttachments] = useState<Attachment[]>([]);

  // Selection states for interconnectivity
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
  
  // Custom managed active office id for Office View page
  const [activeOfficeId, setActiveOfficeId] = useState<string>('dashboard');
  
  // Pre-fill state for Admin Desk transfers
  const [preFilledEmployeeId, setPreFilledEmployeeId] = useState<string | null>(null);

  // Initialize States from localStorage or fallback to mockData
  useEffect(() => {
    const localOffices = localStorage.getItem('epa_offices');
    const localPositions = localStorage.getItem('epa_positions');
    const localSeats = localStorage.getItem('epa_seats');
    const localEmployees = localStorage.getItem('epa_employees');
    const localPostings = localStorage.getItem('epa_postings');
    const localAttachments = localStorage.getItem('epa_attachments');

    if (localOffices) setOffices(JSON.parse(localOffices));
    else setOffices(initialOffices);

    if (localPositions) setPositions(JSON.parse(localPositions));
    else setPositions(initialPositions);

    if (localSeats) setSeats(JSON.parse(localSeats));
    else setSeats(initialSeats);

    if (localEmployees) setEmployees(JSON.parse(localEmployees));
    else setEmployees(initialEmployees);

    if (localPostings) setPostings(JSON.parse(localPostings));
    else setPostings(initialPostings);

    if (localAttachments) setAttachments(JSON.parse(localAttachments));
    else setAttachments(initialAttachments);
  }, []);

  // Sync to localStorage helper
  const syncToStorage = (key: string, data: any) => {
    localStorage.setItem(key, JSON.stringify(data));
  };

  // State mutation actions
  const handleAddOffice = (newOffice: Omit<Office, 'id'>) => {
    const updated: Office = {
      ...newOffice,
      id: `off-${Date.now()}`,
    };
    const nextOffices = [...offices, updated];
    setOffices(nextOffices);
    syncToStorage('epa_offices', nextOffices);
  };

  const handleCreatePositionAndSeats = (
    officeId: string,
    title: string,
    scale: string,
    seatsCount: number
  ) => {
    const newPosId = `pos-${Date.now()}`;
    const newPos: Position = {
      id: newPosId,
      officeId,
      title,
      scale,
      allocatedSeatsCount: seatsCount,
    };

    // Auto sprout individual seat records
    const generatedSeats: Seat[] = Array.from({ length: seatsCount }, (_, i) => ({
      id: `seat-${Date.now()}-${i + 1}`,
      positionId: newPosId,
      name: seatsCount === 1 ? 'Designated Seat' : `Seat - ${String.fromCharCode(65 + i)}`, // e.g. Seat - A, Seat - B
    }));

    const nextPositions = [...positions, newPos];
    const nextSeats = [...seats, ...generatedSeats];

    setPositions(nextPositions);
    setSeats(nextSeats);

    syncToStorage('epa_positions', nextPositions);
    syncToStorage('epa_seats', nextSeats);
  };

  const handleTransferEmployee = (
    employeeId: string,
    targetSeatId: string,
    effectiveDate: string,
    orderNumber: string,
    remarks?: string
  ) => {
    // 1. Close current active postings for this employee
    const nextPostings = postings.map((p) => {
      if (p.employeeId === employeeId && p.effectiveTo === null) {
        return {
          ...p,
          effectiveTo: effectiveDate,
        };
      }
      return p;
    });

    // 2. Open new posting record
    const newPostingRecord: Posting = {
      id: `post-${Date.now()}`,
      employeeId,
      seatId: targetSeatId,
      effectiveFrom: effectiveDate,
      effectiveTo: null,
      orderNumber,
      remarks: remarks || undefined,
    };

    const finalPostings = [...nextPostings, newPostingRecord];
    setPostings(finalPostings);
    syncToStorage('epa_postings', finalPostings);

    // Ensure status is active in case they were returned from another state
    const nextEmployees = employees.map((emp) => {
      if (emp.id === employeeId) {
        return { ...emp, status: 'active' as const };
      }
      return emp;
    });
    setEmployees(nextEmployees);
    syncToStorage('epa_employees', nextEmployees);
  };

  const handleAttachEmployee = (
    employeeId: string,
    targetOfficeId: string,
    effectiveFrom: string,
    orderNumber: string,
    reason: string,
    effectiveTo?: string | null
  ) => {
    const newAttachmentRecord: Attachment = {
      id: `attach-${Date.now()}`,
      employeeId,
      targetOfficeId,
      effectiveFrom,
      effectiveTo: effectiveTo || null,
      orderNumber,
      reason,
    };

    const nextAttachments = [...attachments, newAttachmentRecord];
    setAttachments(nextAttachments);
    syncToStorage('epa_attachments', nextAttachments);
  };

  const handleEndAttachment = (attachmentId: string, effectiveTo: string) => {
    const nextAttachments = attachments.map((a) => {
      if (a.id === attachmentId) {
        return {
          ...a,
          effectiveTo,
        };
      }
      return a;
    });
    setAttachments(nextAttachments);
    syncToStorage('epa_attachments', nextAttachments);
  };

  const handleOnboardEmployee = (
    newEmpData: Omit<Employee, 'id'>,
    initialSeatId: string | null,
    orderNumber: string,
    effectiveFrom?: string
  ) => {
    const newEmpId = `emp-${Date.now()}`;
    const newEmployee: Employee = {
      id: newEmpId,
      ...newEmpData,
    };

    const nextEmployees = [...employees, newEmployee];
    setEmployees(nextEmployees);
    syncToStorage('epa_employees', nextEmployees);

    // If a seat assignment is given immediately
    if (initialSeatId) {
      const initialPostingRecord: Posting = {
        id: `post-${Date.now()}`,
        employeeId: newEmpId,
        seatId: initialSeatId,
        effectiveFrom: effectiveFrom || newEmpData.doj,
        effectiveTo: null,
        orderNumber: orderNumber || 'Initial Appointment Order',
      };
      const nextPostings = [...postings, initialPostingRecord];
      setPostings(nextPostings);
      syncToStorage('epa_postings', nextPostings);
    }
  };

  const handleRetireEmployee = (employeeId: string, retireDate: string, orderNumber: string) => {
    // 1. Set status to retired
    const nextEmployees = employees.map((emp) => {
      if (emp.id === employeeId) {
        return {
          ...emp,
          status: 'retired' as const,
        };
      }
      return emp;
    });
    setEmployees(nextEmployees);
    syncToStorage('epa_employees', nextEmployees);

    // 2. Terminate active posting
    const nextPostings = postings.map((p) => {
      if (p.employeeId === employeeId && p.effectiveTo === null) {
        return {
          ...p,
          effectiveTo: retireDate,
        };
      }
      return p;
    });
    setPostings(nextPostings);
    syncToStorage('epa_postings', nextPostings);

    // 3. Terminate active temporary attachments
    const nextAttachments = attachments.map((a) => {
      if (a.employeeId === employeeId && a.effectiveTo === null) {
        return {
          ...a,
          effectiveTo: retireDate,
        };
      }
      return a;
    });
    setAttachments(nextAttachments);
    syncToStorage('epa_attachments', nextAttachments);
  };

  const clearRepositoryData = () => {
    if (window.confirm("Are you sure you want to restore the Punjab EPA personnel database to factory mock values? All custom postings, attachments, and onboarded servants will be reverted.")) {
      localStorage.clear();
      setOffices(initialOffices);
      setPositions(initialPositions);
      setSeats(initialSeats);
      setEmployees(initialEmployees);
      setPostings(initialPostings);
      setAttachments(initialAttachments);
      setSelectedEmployeeId(null);
      setPreFilledEmployeeId(null);
      setActiveOfficeId('dashboard');
      setActiveTab('dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans text-slate-800">
      
      {/* GOVERNMENT OFFICIAL PORTAL HEADER - Navy Blue style with Amber bottom border */}
      <header className="bg-blue-950 border-b-4 border-amber-500 text-white shadow-md relative z-10">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Logo Brand Layout */}
          <div className="flex items-center gap-3">
            <div className="bg-white p-2.5 rounded-full shadow-inner border border-amber-500/20 shrink-0">
              <span className="text-blue-950 font-black text-xxxxs font-serif uppercase leading-none select-none block text-center">
                Govt.<br/>Punjab
              </span>
            </div>
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="bg-amber-500 text-amber-950 text-xxxxs font-bold px-1.5 py-0.5 rounded uppercase tracking-widest font-mono">
                  Official Registry
                </span>
                <span className="text-xs text-blue-200 font-serif italic">
                  Environmental Protection Agency
                </span>
              </div>
              <h1 className="text-xl md:text-2xl font-black tracking-tight mt-0.5 font-sans">
                Punjab EPA Civil Personnel Ledger &amp; Posting Suite
              </h1>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={clearRepositoryData}
              className="text-white hover:bg-rose-700 bg-red-900 border border-red-800 font-bold font-sans text-xxxxs px-3.5 py-2 rounded-lg transition cursor-pointer"
            >
              🔄 Restore Factory Mock Data
            </button>
            <span className="text-xxs font-bold text-blue-200/80 font-mono tracking-wider bg-blue-900 px-3.5 py-2 rounded-lg border border-blue-800">
              📅 Local Clock: 2026-06-18
            </span>
          </div>

        </div>
      </header>

      {/* PORTAL INFO COMPLIANCE STRIP */}
      <div className="bg-blue-900 text-blue-100 font-medium font-sans text-xxs py-2 px-4 shadow-inner">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between gap-1.5">
          <p className="flex items-center gap-1">
            <span className="text-amber-400">🛡️</span> Punjab Environment, Green Development &amp; Civil Servants Secretariat Audit Registry.
          </p>
          <span className="text-xxxxs text-blue-300 font-mono uppercase">
            ESTABLISHED ORDER NO: S.OR(IV)4-12/2006 • SECURE RECORD DATABASE
          </span>
        </div>
      </div>

      {/* PRIMARY CONTAINER */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 space-y-6">

        {/* TOP LEVEL NAVIGATION LEDGER TADS */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-2.5 shadow-xxs flex flex-wrap items-center justify-between gap-3">
          
          <nav className="flex flex-wrap gap-1">
            
            <button
              onClick={() => {
                setActiveTab('dashboard');
                setActiveOfficeId('dashboard');
              }}
              className={`cursor-pointer px-4.5 py-2.5 rounded-xl text-xs font-extrabold transition duration-150 flex items-center gap-2 ${
                activeTab === 'dashboard'
                  ? 'bg-blue-950 text-white shadow-md'
                  : 'text-slate-650 hover:bg-slate-200/50 hover:text-slate-900'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </button>

            <button
              onClick={() => setActiveTab('personnel')}
              className={`cursor-pointer px-4.5 py-2.5 rounded-xl text-xs font-extrabold transition duration-150 flex items-center gap-2 ${
                activeTab === 'personnel'
                  ? 'bg-blue-950 text-white shadow-md'
                  : 'text-slate-650 hover:bg-slate-200/50 hover:text-slate-900'
              }`}
            >
              <Users2 className="w-4 h-4" />
              Employee Directory
            </button>

            <button
              onClick={() => {
                setActiveTab('offices');
                if (activeOfficeId === 'dashboard' && offices.length > 0) {
                  setActiveOfficeId(offices[0].id);
                }
              }}
              className={`cursor-pointer px-4.5 py-2.5 rounded-xl text-xs font-extrabold transition duration-150 flex items-center gap-2 ${
                activeTab === 'offices'
                  ? 'bg-blue-950 text-white shadow-md'
                  : 'text-slate-650 hover:bg-slate-200/50 hover:text-slate-900'
              }`}
            >
              <Building2 className="w-4 h-4" />
              Office View
            </button>

            <div className="w-px bg-slate-200 my-1 self-stretch mx-1 hidden sm:block"></div>

            <button
              onClick={() => setActiveTab('transfer')}
              className={`cursor-pointer px-4.5 py-2.5 rounded-xl text-xs font-extrabold transition duration-150 flex items-center gap-2 ${
                activeTab === 'transfer'
                  ? 'bg-amber-500 text-blue-950 shadow-md border border-amber-500'
                  : 'text-slate-650 hover:bg-slate-200/50 hover:text-slate-900'
              }`}
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
              Add Transfer
            </button>

            <button
              onClick={() => setActiveTab('attach')}
              className={`cursor-pointer px-4.5 py-2.5 rounded-xl text-xs font-extrabold transition duration-150 flex items-center gap-2 ${
                activeTab === 'attach'
                  ? 'bg-amber-500 text-blue-950 shadow-md border border-amber-500'
                  : 'text-slate-650 hover:bg-slate-200/50 hover:text-slate-900'
              }`}
            >
              <Link className="w-3.5 h-3.5" />
              Add Attachment
            </button>

            <button
              onClick={() => setActiveTab('onboard')}
              className={`cursor-pointer px-4.5 py-2.5 rounded-xl text-xs font-extrabold transition duration-150 flex items-center gap-2 ${
                activeTab === 'onboard'
                  ? 'bg-emerald-800 text-white shadow-md'
                  : 'text-slate-650 hover:bg-slate-200/50 hover:text-slate-900'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              Add Employee
            </button>

          </nav>

          {/* Real-Time Database Connection Help Strip */}
          <div className="hidden lg:flex items-center gap-2 text-xxxxs uppercase font-mono font-bold text-slate-400">
            <span className="h-2 w-2 rounded-full bg-blue-600 animate-ping"></span>
            <span>Punjab Civil Service System Live</span>
          </div>

        </div>

        {/* DYNAMIC CALCULATED ANALYTICS METRICS BAR */}
        <Metrics
          offices={offices}
          positions={positions}
          seats={seats}
          employees={employees}
          postings={postings}
          attachments={attachments}
        />

        {/* WORK BENCH SECTIONS CONTAINER */}
        <div className="transition-all duration-200 mt-6 min-h-[60vh]">
          
          {/* DASHBOARD AND OFFICE VIEW PAGES (SHARED COMPONENT EXQUISITE CONTROL) */}
          {(activeTab === 'dashboard' || activeTab === 'offices') && (
            <OfficeSection
              offices={offices}
              positions={positions}
              seats={seats}
              employees={employees}
              postings={postings}
              attachments={attachments}
              onAddOffice={handleAddOffice}
              onAddPositionAndSeats={handleCreatePositionAndSeats}
              onSelectEmployee={(empId) => {
                setSelectedEmployeeId(empId);
                setActiveTab('personnel');
              }}
              activeOfficeId={activeTab === 'dashboard' ? 'dashboard' : activeOfficeId}
              onSetActiveOfficeId={(id) => {
                if (id === 'dashboard') {
                  setActiveOfficeId('dashboard');
                  setActiveTab('dashboard');
                } else {
                  setActiveOfficeId(id);
                  setActiveTab('offices');
                }
              }}
            />
          )}

          {/* PERSONNEL LOGS DIRECTORY TAB */}
          {activeTab === 'personnel' && (
            <PersonnelDirectory
              offices={offices}
              positions={positions}
              seats={seats}
              employees={employees}
              postings={postings}
              attachments={attachments}
              selectedEmployeeId={selectedEmployeeId}
              onSelectEmployeeId={setSelectedEmployeeId}
              onRetireEmployee={handleRetireEmployee}
              onSetTab={(tab) => {
                if (tab === 'desk') setActiveTab('transfer');
                else if (tab === 'offices') setActiveTab('offices');
              }}
              onPreFillTransfer={(empId) => {
                setPreFilledEmployeeId(empId);
                setActiveTab('transfer');
              }}
            />
          )}

          {/* TRANSACTIONAL PAGES FOR ADMIN ACTIONS (INTEGRATED SUBTABS) */}
          {(activeTab === 'transfer' || activeTab === 'attach' || activeTab === 'onboard') && (
            <AdminDesk
              offices={offices}
              positions={positions}
              seats={seats}
              employees={employees}
              postings={postings}
              attachments={attachments}
              onTransferEmployee={handleTransferEmployee}
              onAttachEmployee={handleAttachEmployee}
              onEndAttachment={handleEndAttachment}
              onOnboardEmployee={handleOnboardEmployee}
              preFilledEmployeeId={preFilledEmployeeId}
              clearPreFilledEmployee={() => setPreFilledEmployeeId(null)}
              initialTab={activeTab === 'transfer' ? 'transfer' : activeTab === 'attach' ? 'attach' : 'onboard'}
            />
          )}

        </div>

      </main>

      {/* REGISTRY FOOTER COLLATERAL */}
      <footer className="mt-20 bg-blue-950 border-t border-slate-800 text-blue-200/60 py-8 text-xxs">
        <div className="max-w-7xl mx-auto px-4 md:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <p className="font-bold text-white">Environmental Protection Agency (EPA), Government of Punjab, Pakistan</p>
            <p className="mt-1 text-slate-400">Civil Servants Act, 1974 Personnel Database System Ledger Control.</p>
          </div>
          <div className="text-right text-slate-400 font-mono text-[9px]">
            <span>© {new Date().getFullYear()} Government of the Punjab. Secure Local Storage Persistence Active.</span>
          </div>
        </div>
      </footer>

    </div>
  );
}

