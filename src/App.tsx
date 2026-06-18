import { useState } from 'react';
import { usePersonnelAppState } from './ui/hooks/usePersonnelAppState';
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
  const {
    offices,
    positions,
    seats,
    employees,
    postings,
    attachments,
    handleCreateOffice,
    handleCreatePositionAndSeats,
    handleTransferEmployee,
    handleAttachEmployee,
    handleEndAttachment,
    handleOnboardEmployee,
    handleRetireEmployee,
    handleRestoreFactoryData,
  } = usePersonnelAppState();

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
  const [activeOfficeId, setActiveOfficeId] = useState<string>('dashboard');
  const [preFilledEmployeeId, setPreFilledEmployeeId] = useState<string | null>(null);

  const clearRepositoryData = () => {
    if (window.confirm("Are you sure you want to restore the Punjab EPA personnel database to factory mock values? All custom postings, attachments, and onboarded servants will be reverted.")) {
      handleRestoreFactoryData();
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

