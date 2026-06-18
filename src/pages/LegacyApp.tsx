import { useState } from 'react';
import { usePersonnelAppState } from '../ui/hooks/usePersonnelAppState';
import { Metrics } from '../components/Metrics';
import { OfficeRegisterPage } from '../components/OfficeRegisterPage';
import { PersonnelDirectoryPage } from '../components/PersonnelDirectoryPage';
import { AdminDesk } from '../components/AdminDesk';
import { AuthPage } from '../components/AuthPage';
import { 
  Building2, 
  Users2, 
  ShieldAlert, 
  LayoutDashboard,
} from 'lucide-react';

export function LegacyApp() {
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
  } = usePersonnelAppState();

  const [activeView, setActiveView] = useState<'dashboard' | 'offices' | 'personnel' | 'admin' | 'auth'>('auth');
  const [activeAdminTab, setActiveAdminTab] = useState<'transfer' | 'attach' | 'onboard'>('transfer');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
  const [activeOfficeId, setActiveOfficeId] = useState<string>('dashboard');
  const [preFilledEmployeeId, setPreFilledEmployeeId] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const clearRepositoryData = () => {
    setSelectedEmployeeId(null);
    setPreFilledEmployeeId(null);
    setActiveOfficeId('dashboard');
    setActiveView('auth');
    setIsAuthenticated(false);
  };

  const handleSignIn = (email: string, password: string) => {
    if (!email || !password) return;
    setIsAuthenticated(true);
    setActiveView('dashboard');
  };

  const handleRegister = (name: string, email: string, password: string) => {
    if (!name || !email || !password) return;
    setIsAuthenticated(true);
    setActiveView('dashboard');
  };

  const totalActiveEmployees = employees.filter((employee) => employee.status === 'active').length;
  const totalVacantSeats = seats.filter((seat) => !postings.some((posting) => posting.seatId === seat.id && posting.effectiveTo === null)).length;
  const totalAttachments = attachments.filter((attachment) => attachment.effectiveTo === null).length;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-800">
      
      {/* GOVERNMENT OFFICIAL PORTAL HEADER - Navy Blue style with Amber bottom border */}
      <header className="bg-blue-950 border-b-4 border-amber-500 text-white shadow-md relative z-10">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Logo Brand Layout */}
          <div className="flex items-center gap-3">
            <div className="bg-white p-2.5 rounded-full shadow-inner border border-amber-500/20 shrink-0">
              <span className="text-blue-950 font-black text-[0.5rem] font-serif uppercase leading-none select-none block text-center">
                Govt.<br/>Punjab
              </span>
            </div>
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="bg-amber-500 text-amber-950 text-[0.5rem] font-bold px-1.5 py-0.5 rounded uppercase tracking-widest font-mono">
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
              className="text-white hover:bg-rose-700 bg-red-900 border border-red-800 font-bold font-sans text-[0.5rem] px-3.5 py-2 rounded-lg transition cursor-pointer"
            >
              🔄 Reset View
            </button>
            <span className="text-[0.6rem] font-bold text-blue-200/80 font-mono tracking-wider bg-blue-900 px-3.5 py-2 rounded-lg border border-blue-800">
              📅 Local Clock: 2026-06-18
            </span>
          </div>

        </div>
      </header>

      {/* PORTAL INFO COMPLIANCE STRIP */}
      <div className="bg-blue-900 text-blue-100 font-medium font-sans text-[0.6rem] py-2 px-4 shadow-inner">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between gap-1.5">
          <p className="flex items-center gap-1">
            <span className="text-amber-400">🛡️</span> Punjab Environment, Green Development &amp; Civil Servants Secretariat Audit Registry.
          </p>
          <span className="text-[0.5rem] text-blue-300 font-mono uppercase">
            ESTABLISHED ORDER NO: S.OR(IV)4-12/2006 • SECURE RECORD DATABASE
          </span>
        </div>
      </div>

      {/* PRIMARY CONTAINER */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 space-y-6">

        <div className="grid lg:grid-cols-[280px_1fr] gap-6 items-start">
          <aside className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm sticky top-4">
            <div className="mb-4">
              <p className="text-[0.5rem] uppercase tracking-[0.25em] text-slate-400 font-mono">Admin Console</p>
              <h2 className="text-lg font-black text-slate-900 mt-1">Punjab EPA Operations</h2>
              <p className="text-xs text-slate-500 mt-1">Dedicated pages for master data, employee records, and approvals.</p>
            </div>

            <nav className="space-y-2">
              <button
                type="button"
                onClick={() => setActiveView('auth')}
                className={`w-full text-left rounded-xl border p-3 transition ${activeView === 'auth' ? 'bg-blue-950 text-white border-blue-950 shadow-sm' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'}`}
              >
                <span className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wide"><ShieldAlert className="w-4 h-4" />Auth Pages</span>
                <span className={`mt-1 block text-[0.5rem] ${activeView === 'auth' ? 'text-blue-100' : 'text-slate-500'}`}>Sign in and register for portal access</span>
              </button>
              {[
                { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, desc: 'Live summary and master overview' },
                { id: 'offices', label: 'Office Register', icon: Building2, desc: 'Office, position, and seat maintenance' },
                { id: 'personnel', label: 'Personnel Directory', icon: Users2, desc: 'Read, update, retire, and review staff' },
                { id: 'admin', label: 'Admin Desk', icon: ShieldAlert, desc: 'Transfers, attachments, and onboarding' },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveView(item.id as typeof activeView);
                      if (item.id === 'offices' && activeOfficeId === 'dashboard' && offices.length > 0) {
                        setActiveOfficeId(offices[0].id);
                      }
                      if (item.id === 'admin') setActiveAdminTab('transfer');
                    }}
                    className={`w-full text-left rounded-xl border p-3 transition ${
                      activeView === item.id
                        ? 'bg-blue-950 text-white border-blue-950 shadow-sm'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wide"><Icon className="w-4 h-4" />{item.label}</span>
                    <span className={`mt-1 block text-[0.5rem] ${activeView === item.id ? 'text-blue-100' : 'text-slate-500'}`}>{item.desc}</span>
                  </button>
                );
              })}
            </nav>

            <div className="mt-4 rounded-xl bg-amber-50 border border-amber-200 p-3 text-xs text-amber-900">
              <p className="font-extrabold uppercase tracking-[0.18em]">Operational Focus</p>
              <ul className="mt-2 space-y-1 text-[0.5rem] text-amber-900/90">
                <li>• Separate master-data pages for offices, staff, and approvals.</li>
                <li>• Dedicated CRUD flows for transfer, attachment, and onboarding.</li>
                <li>• Reduced clutter with page-level summaries instead of one dense screen.</li>
              </ul>
            </div>
          </aside>

          <section className="space-y-6">
            <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">
              {[
                { label: 'Active Employees', value: totalActiveEmployees, tone: 'bg-emerald-50 text-emerald-900 border-emerald-200' },
                { label: 'Offices Registered', value: offices.length, tone: 'bg-blue-50 text-blue-900 border-blue-200' },
                { label: 'Vacant Seats', value: totalVacantSeats, tone: 'bg-amber-50 text-amber-900 border-amber-200' },
                { label: 'Live Attachments', value: totalAttachments, tone: 'bg-violet-50 text-violet-900 border-violet-200' },
              ].map((card) => (
                <article key={card.label} className={`rounded-2xl border p-4 shadow-sm ${card.tone}`}>
                  <p className="text-[0.5rem] uppercase tracking-[0.2em] font-mono">{card.label}</p>
                  <p className="mt-2 text-3xl font-black">{card.value}</p>
                </article>
              ))}
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div>
                  <p className="text-[0.5rem] uppercase tracking-[0.2em] text-slate-400 font-mono">Current View</p>
                  <h3 className="text-xl font-black text-slate-900">{activeView === 'dashboard' ? 'Executive Dashboard' : activeView === 'offices' ? 'Master Office Register' : activeView === 'personnel' ? 'Personnel Directory' : 'Admin Desk & Operations'}</h3>
                </div>
                <button
                  onClick={clearRepositoryData}
                  className="text-white hover:bg-rose-700 bg-red-900 border border-red-800 font-bold text-[0.5rem] px-3 py-2 rounded-lg transition cursor-pointer"
                >
                  🔄 Reset View
                </button>
              </div>

              <div className="mt-4">
                {activeView === 'auth' && (
                  <AuthPage onSignIn={handleSignIn} onRegister={handleRegister} />
                )}

                {activeView === 'dashboard' && (
                  <div className="space-y-6">
                    <Metrics offices={offices} positions={positions} seats={seats} employees={employees} postings={postings} attachments={attachments} />
                    <OfficeRegisterPage offices={offices} positions={positions} seats={seats} employees={employees} postings={postings} attachments={attachments} onAddOffice={handleCreateOffice} onAddPositionAndSeats={handleCreatePositionAndSeats} onSelectEmployee={(empId) => { setSelectedEmployeeId(empId); setActiveView('personnel'); }} activeOfficeId={activeOfficeId} onSetActiveOfficeId={(id) => { if (id === 'dashboard') { setActiveOfficeId('dashboard'); setActiveView('dashboard'); } else { setActiveOfficeId(id); setActiveView('offices'); } }} />
                  </div>
                )}

                {activeView === 'offices' && (
                  <OfficeRegisterPage offices={offices} positions={positions} seats={seats} employees={employees} postings={postings} attachments={attachments} onAddOffice={handleCreateOffice} onAddPositionAndSeats={handleCreatePositionAndSeats} onSelectEmployee={(empId) => { setSelectedEmployeeId(empId); setActiveView('personnel'); }} activeOfficeId={activeOfficeId} onSetActiveOfficeId={(id) => { if (id === 'dashboard') { setActiveOfficeId('dashboard'); setActiveView('dashboard'); } else { setActiveOfficeId(id); setActiveView('offices'); } }} />
                )}

                {activeView === 'personnel' && (
                  <PersonnelDirectoryPage offices={offices} positions={positions} seats={seats} employees={employees} postings={postings} attachments={attachments} selectedEmployeeId={selectedEmployeeId} onSelectEmployeeId={setSelectedEmployeeId} onRetireEmployee={handleRetireEmployee} onPreFillTransfer={(empId) => { setPreFilledEmployeeId(empId); setActiveView('admin'); setActiveAdminTab('transfer'); }} />
                )}

                {activeView === 'admin' && (
                  <AdminDesk offices={offices} positions={positions} seats={seats} employees={employees} postings={postings} attachments={attachments} onTransferEmployee={handleTransferEmployee} onAttachEmployee={handleAttachEmployee} onEndAttachment={handleEndAttachment} onOnboardEmployee={handleOnboardEmployee} preFilledEmployeeId={preFilledEmployeeId} clearPreFilledEmployee={() => setPreFilledEmployeeId(null)} initialTab={activeAdminTab} />
                )}
              </div>
            </div>
          </section>
        </div>


      </main>

      {/* REGISTRY FOOTER COLLATERAL */}
      <footer className="mt-20 bg-blue-950 border-t border-slate-800 text-blue-200/60 py-8 text-[0.6rem]">
        <div className="max-w-7xl mx-auto px-4 md:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <p className="font-bold text-white">Environmental Protection Agency (EPA), Government of Punjab, Pakistan</p>
            <p className="mt-1 text-slate-400">Civil Servants Act, 1974 Personnel Database System Ledger Control.</p>
          </div>
          <div className="text-right text-slate-400 font-mono text-[9px]">
            <span>© {new Date().getFullYear()} Government of the Punjab. API-backed personnel database active.</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
