import React, { useState, useMemo } from 'react';
import { Office, Position, Seat, Employee, Posting, Attachment } from '../domain/entities';
import {
  Building2,
  Plus,
  Users,
  FolderTree,
  Layers,
  AlertCircle,
  Info,
  ChevronRight,
  UserMinus,
  Pin,
  BarChart3,
  TrendingUp,
  PieChart,
  CheckCircle,
  X,
  ArrowRight
} from 'lucide-react';

interface OfficeSectionProps {
  offices: Office[];
  positions: Position[];
  seats: Seat[];
  employees: Employee[];
  postings: Posting[];
  attachments: Attachment[];
  onAddOffice: (office: Omit<Office, 'id'>) => void | Promise<void>;
  onAddPositionAndSeats: (officeId: string, title: string, scale: string, seatsCount: number) => void | Promise<void>;
  onSelectEmployee: (employeeId: string) => void;
  activeOfficeId?: string;
  onSetActiveOfficeId?: (id: string) => void;
}

export const OfficeSection: React.FC<OfficeSectionProps> = ({
  offices,
  positions,
  seats,
  employees,
  postings,
  attachments,
  onAddOffice,
  onAddPositionAndSeats,
  onSelectEmployee,
  activeOfficeId: propActiveOfficeId,
  onSetActiveOfficeId,
}) => {
  // Navigation active tab: 'dashboard' or specific officeId
  const [internalActiveOfficeId, setInternalActiveOfficeId] = useState<string>('dashboard');
  const activeOfficeId = propActiveOfficeId !== undefined ? propActiveOfficeId : internalActiveOfficeId;
  const setActiveOfficeId = onSetActiveOfficeId !== undefined ? onSetActiveOfficeId : setInternalActiveOfficeId;

  // Office creation form state
  const [showAddOfficeModal, setShowAddOfficeModal] = useState(false);
  const [officeName, setOfficeName] = useState('');
  const [officeType, setOfficeType] = useState<'Directorate' | 'Regional' | 'Field Office'>('Directorate');
  const [officeLocation, setOfficeLocation] = useState('');
  const [officeDistrict, setOfficeDistrict] = useState('');

  // Position creation form state
  const [showAddPositionModal, setShowAddPositionModal] = useState(false);
  const [posTitle, setPosTitle] = useState('');
  const [posScale, setPosScale] = useState('BS-17');
  const [posSeatsCount, setPosSeatsCount] = useState(1);

  // 1. DYNAMIC METRIC ENGINE FOR INDIVIDUAL OFFICES & THE GLOBALS
  const officeMetrics = useMemo(() => {
    return offices.map((office) => {
      const officePositions = positions.filter((p) => p.officeId === office.id);
      const officeSeats = seats.filter((s) => officePositions.some((p) => p.id === s.positionId));
      
      const activePostings = postings.filter(
        (p) => p.effectiveTo === null && officeSeats.some((s) => s.id === p.seatId)
      );

      const totalSanctioned = officeSeats.length;
      const totalOccupied = activePostings.length;
      const totalVacant = Math.max(0, totalSanctioned - totalOccupied);
      const fillRate = totalSanctioned > 0 ? Math.round((totalOccupied / totalSanctioned) * 100) : 0;

      return {
        officeId: office.id,
        officeName: office.name,
        officeType: office.type,
        district: office.district,
        location: office.location,
        sanctioned: totalSanctioned,
        occupied: totalOccupied,
        vacant: totalVacant,
        fillRate,
      };
    });
  }, [offices, positions, seats, postings]);

  // Aggregated Grand Totals for Master summary dashboard
  const masterStats = useMemo(() => {
    let sanctioned = 0;
    let occupied = 0;
    let vacant = 0;

    officeMetrics.forEach((m) => {
      sanctioned += m.sanctioned;
      occupied += m.occupied;
      vacant += m.vacant;
    });

    const fillRate = sanctioned > 0 ? Math.round((occupied / sanctioned) * 100) : 0;

    return {
      sanctioned,
      occupied,
      vacant,
      fillRate,
    };
  }, [officeMetrics]);

  // Selected office instance matching navigations
  const selectedOffice = useMemo(() => {
    if (activeOfficeId === 'dashboard') return null;
    return offices.find((o) => o.id === activeOfficeId) || null;
  }, [offices, activeOfficeId]);

  // Active selected metrics summary
  const selectedOfficeMetrics = useMemo(() => {
    if (!selectedOffice) return null;
    return officeMetrics.find((m) => m.officeId === selectedOffice.id) || null;
  }, [selectedOffice, officeMetrics]);

  // Selected office positions & structured seats
  const selectedOfficePositions = useMemo(() => {
    if (!selectedOffice) return [];
    return positions.filter((p) => p.officeId === selectedOffice.id);
  }, [positions, selectedOffice]);

  // Group Selected Office Positions by BPS Grade Scale sorted numerically descending (BS-18 down to BS-1)
  const groupedPositionsByBps = useMemo(() => {
    const groups: { [scale: string]: Position[] } = {};

    selectedOfficePositions.forEach((pos) => {
      if (!groups[pos.scale]) {
        groups[pos.scale] = [];
      }
      groups[pos.scale].push(pos);
    });

    return Object.keys(groups)
      .sort((a, b) => {
        const numA = parseInt(a.replace('BS-', ''), 10) || 0;
        const numB = parseInt(b.replace('BS-', ''), 10) || 0;
        return numB - numA; // high grades first
      })
      .map((scale) => ({
        scale,
        positionsList: groups[scale],
      }));
  }, [selectedOfficePositions]);

  // Active office temporary attachments under general orders
  const activeOfficeAttachments = useMemo(() => {
    if (!selectedOffice) return [];
    return attachments.filter(
      (a) => a.targetOfficeId === selectedOffice.id && a.effectiveTo === null
    );
  }, [attachments, selectedOffice]);

  // Handle Create Office Submission
  const handleCreateOfficeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!officeName || !officeLocation || !officeDistrict) return;
    onAddOffice({
      name: officeName,
      type: officeType,
      location: officeLocation,
      district: officeDistrict,
    });
    setOfficeName('');
    setOfficeLocation('');
    setOfficeDistrict('');
    setShowAddOfficeModal(false);
  };

  // Handle Create Position Submission
  const handleCreatePositionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!posTitle || !selectedOffice) return;
    onAddPositionAndSeats(selectedOffice.id, posTitle, posScale, Number(posSeatsCount));
    setPosTitle('');
    setPosScale('BS-17');
    setPosSeatsCount(1);
    setShowAddPositionModal(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      
      {/* LEFT COLUMN: SIDEBAR NAVIGATION */}
      <aside className="lg:col-span-3 space-y-4">
        
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4">
          <div className="flex justify-between items-center border-b pb-3 mb-3">
            <h3 className="text-xs font-black text-slate-800 flex items-center gap-1.5 uppercase tracking-wide">
              <Building2 className="w-4.5 h-4.5 text-emerald-800" />
              Offices Directory
            </h3>
            <button
              id="sidebar-btn-new-office"
              onClick={() => setShowAddOfficeModal(true)}
              className="text-white bg-emerald-800 hover:bg-emerald-950 px-2 py-1 rounded-md text-[10px] uppercase tracking-wider font-mono font-bold flex items-center gap-1 cursor-pointer transition"
            >
              <Plus className="w-3 h-3" />
              New Office
            </button>
          </div>

          <p className="text-xxs text-slate-500 leading-normal mb-4">
            Navigate through individual EPA subdivisions to monitor local BPS structural vacancies.
          </p>

          <nav className="space-y-1.5 max-h-[58vh] overflow-y-auto pr-1">
            
            {/* MASTER ACCOUNT DASHBOARD SELECTOR BUTTON */}
            <button
              onClick={() => setActiveOfficeId('dashboard')}
              className={`w-full text-left p-2.5 rounded-xl border text-xxs transition duration-150 flex items-center justify-between font-bold cursor-pointer ${
                activeOfficeId === 'dashboard'
                  ? 'bg-emerald-800 text-white border-emerald-900 shadow-xs'
                  : 'bg-slate-50 border-slate-200/60 hover:bg-slate-100 text-slate-700'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <BarChart3 className="w-3.5 h-3.5" />
                📊 Master Summary Dashboard
              </span>
              <span className={`px-1.5 py-0.5 rounded font-mono text-[9px] ${activeOfficeId === 'dashboard' ? 'bg-emerald-950 text-emerald-300' : 'bg-slate-200 text-slate-600'}`}>
                {masterStats.fillRate}% Fill
              </span>
            </button>

            <div className="h-px bg-slate-100 my-2"></div>

            {/* OFFICES ACCORDION LIST */}
            {officeMetrics.map((met) => {
              const isActive = activeOfficeId === met.officeId;
              const typeColor =
                met.officeType === 'Directorate'
                  ? 'bg-purple-50 text-purple-700 border-purple-100'
                  : met.officeType === 'Regional'
                  ? 'bg-blue-50 text-blue-700 border-blue-100'
                  : 'bg-amber-50 text-amber-700 border-amber-100';

              return (
                <button
                  key={met.officeId}
                  onClick={() => setActiveOfficeId(met.officeId)}
                  className={`w-full text-left p-2.5 rounded-xl border transition duration-150 flex flex-col justify-start relative cursor-pointer ${
                    isActive
                      ? 'bg-emerald-50/60 border-emerald-700 ring-2 ring-emerald-500/5'
                      : 'bg-white border-slate-100 hover:bg-slate-55'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-sm border uppercase font-mono tracking-wider ${isActive ? 'bg-emerald-950/20 text-emerald-950 border-emerald-900/10' : typeColor}`}>
                      {met.officeType.split(' ')[0]}
                    </span>
                    <span className={`text-[9px] font-mono font-bold ${isActive ? 'text-emerald-900' : 'text-slate-500'}`}>
                      {met.occupied}/{met.sanctioned} Seats
                    </span>
                  </div>

                  <h4 className={`text-xxs font-extrabold mt-1.5 line-clamp-2 leading-snug ${isActive ? 'text-emerald-950' : 'text-slate-800'}`}>
                    {met.officeName.split(' (')[0]}
                  </h4>

                  <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden mt-2">
                    <div
                      className={`h-full rounded-full ${met.fillRate > 80 ? 'bg-emerald-600' : met.fillRate > 50 ? 'bg-blue-500' : 'bg-amber-550'}`}
                      style={{ width: `${met.fillRate}%` }}
                    />
                  </div>
                </button>
              );
            })}

          </nav>

        </div>

        {/* MODAL MODAL: NEW OFFICE ADDED ON SIDE PANEL */}
        {showAddOfficeModal && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl p-4 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-emerald-800"></div>
            <div className="flex justify-between items-center border-b pb-2 mb-3">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">Add Division Office</h4>
              <button
                type="button"
                onClick={() => setShowAddOfficeModal(false)}
                className="text-slate-450 hover:text-slate-600 p-0.5 rounded-full"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateOfficeSubmit} className="space-y-3">
              <div>
                <label className="block text-xxxxs uppercase tracking-widest font-mono font-bold text-slate-400 mb-1">
                  Office Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Regional Office Sahiwal"
                  value={officeName}
                  onChange={(e) => setOfficeName(e.target.value)}
                  className="w-full text-xs px-2.5 py-1.5 border border-slate-250 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-emerald-500 bg-slate-50/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xxxxs uppercase tracking-widest font-mono font-bold text-slate-400 mb-1">
                    Classification
                  </label>
                  <select
                    value={officeType}
                    onChange={(e) => setOfficeType(e.target.value as any)}
                    className="w-full text-xs px-2 py-1.5 bg-slate-50 border border-slate-250 rounded-lg focus:outline-hidden"
                  >
                    <option value="Directorate">Directorate</option>
                    <option value="Regional">Regional</option>
                    <option value="Field Office">Field Office</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xxxxs uppercase tracking-widest font-mono font-bold text-slate-400 mb-1">
                    District Range
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sahiwal"
                    value={officeDistrict}
                    onChange={(e) => setOfficeDistrict(e.target.value)}
                    className="w-full text-xs px-2.5 py-1.5 border border-slate-250 rounded-lg focus:outline-hidden bg-slate-50/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xxxxs uppercase tracking-widest font-mono font-bold text-slate-400 mb-1">
                  Physical Office Address
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Scheme No. 2, Sahiwal"
                  value={officeLocation}
                  onChange={(e) => setOfficeLocation(e.target.value)}
                  className="w-full text-xs px-2.5 py-1.5 border border-slate-250 rounded-lg focus:outline-hidden bg-slate-50/50"
                />
              </div>

              <div className="flex gap-2 justify-end pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddOfficeModal(false)}
                  className="px-2.5 py-1.5 text-xxs text-slate-500 hover:bg-slate-100 rounded-md font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 text-xxs text-white bg-emerald-800 hover:bg-emerald-900 rounded-md font-bold cursor-pointer"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        )}

      </aside>

      {/* RIGHT COLUMN: MAIN CONTENT SPACE */}
      <main className="lg:col-span-9 space-y-6">
        
        {/* ======================================================== */}
        {/* VIEW 1: MASTER SUMMARY ALL-OFFICES DASHBOARD */}
        {/* ======================================================== */}
        {activeOfficeId === 'dashboard' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            
            {/* Aggregate Stats Bar */}
            <div className="bg-white border rounded-2xl p-5 shadow-xs grid grid-cols-2 md:grid-cols-4 gap-4">
              
              <div className="space-y-1">
                <span className="text-xxxxs font-bold text-slate-400 uppercase tracking-widest font-mono">
                  Sanctioned Posts
                </span>
                <p className="text-xl font-extrabold text-slate-850 flex items-center gap-1.5">
                  💼 {masterStats.sanctioned}
                </p>
                <span className="text-xxxxs text-slate-400 font-mono">
                  EPA Total Civil Chairs
                </span>
              </div>

              <div className="space-y-1 border-l pl-4 border-slate-100">
                <span className="text-xxxxs font-bold text-slate-400 uppercase tracking-widest font-mono">
                  Occupied (Active)
                </span>
                <p className="text-xl font-extrabold text-emerald-800 flex items-center gap-1.5">
                  🟢 {masterStats.occupied}
                </p>
                <span className="text-xxxxs text-emerald-600 font-mono font-bold">
                  Currently Holding Charge
                </span>
              </div>

              <div className="space-y-1 border-l pl-4 border-slate-100">
                <span className="text-xxxxs font-bold text-slate-400 uppercase tracking-widest font-mono">
                  Vacant Seats
                </span>
                <p className="text-xl font-extrabold text-slate-500 flex items-center gap-1.5">
                  📭 {masterStats.vacant}
                </p>
                <span className="text-xxxxs text-slate-400 font-mono">
                  Ready For New Posting
                </span>
              </div>

              <div className="space-y-1 border-l pl-4 border-slate-100">
                <span className="text-xxxxs font-bold text-slate-400 uppercase tracking-widest font-mono">
                  Overall Fill Rate
                </span>
                <p className="text-xl font-extrabold text-emerald-950 flex items-center gap-1.5">
                  📈 {masterStats.fillRate}%
                </p>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-1">
                  <div className="bg-emerald-805 h-full" style={{ width: `${masterStats.fillRate}%` }} />
                </div>
              </div>

            </div>

            {/* Grid of All Offices with Vacancy Stats */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-emerald-800" />
                    Punjab EPA General Offices Vacancy Matrix
                  </h3>
                  <p className="text-xxxxs text-slate-500 font-mono mt-0.5">
                    Live civil service fill-rates across Directorate, Regional and Subdivision field stations.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {officeMetrics.map((met) => {
                  return (
                    <div
                      key={met.officeId}
                      className="bg-white border hover:border-emerald-700/50 hover:shadow-xs transition duration-200 rounded-2xl p-4 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="text-[8px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono font-bold uppercase tracking-wider border">
                              {met.officeType}
                            </span>
                            <h4 className="text-xs font-bold text-slate-800 tracking-tight mt-1.5 pr-4 leading-snug">
                              {met.officeName}
                            </h4>
                          </div>
                          <div className="text-right">
                            <span className="text-xs font-extrabold text-slate-800 block">
                              {met.fillRate}%
                            </span>
                            <span className="text-[8px] text-slate-400 font-mono block">
                              Fill Rate
                            </span>
                          </div>
                        </div>

                        {/* Bar statistics chart */}
                        <div className="grid grid-cols-3 gap-2 border-t border-b py-3 my-3 border-slate-100 font-mono text-xxxxs text-slate-400 leading-snug">
                          <div>
                            <span>Sanctioned Seats</span>
                            <span className="block font-bold text-slate-700 mt-0.5">{met.sanctioned}</span>
                          </div>
                          <div>
                            <span>Occupied (Active)</span>
                            <span className="block font-bold text-emerald-800 mt-0.5">🟢 {met.occupied}</span>
                          </div>
                          <div>
                            <span>Vacant Chairs</span>
                            <span className="block font-bold text-slate-500 mt-0.5">📭 {met.vacant}</span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => setActiveOfficeId(met.officeId)}
                        className="w-full mt-1.5 text-center text-xxxxs uppercase tracking-wider font-mono font-bold text-slate-500 bg-slate-50 hover:bg-emerald-800 hover:text-white hover:border-emerald-850 p-1.5 rounded-lg border transition duration-150 flex items-center justify-center gap-1 cursor-pointer"
                      >
                        Inspect Office Seats Grid
                        <ArrowRight className="w-3 h-3" />
                      </button>

                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        )}

        {/* ======================================================== */}
        {/* VIEW 2: DETAILED OFFICE SEAT & POSITION SCHEDULER */}
        {/* ======================================================== */}
        {activeOfficeId !== 'dashboard' && selectedOffice && selectedOfficeMetrics && (
          <div className="space-y-6 animate-in fade-in duration-250">
            
            {/* OFFICE SUMMARY HIGHLIGHT BAR BANNER */}
            <div className="bg-gradient-to-r from-emerald-800 to-emerald-950 text-white rounded-2xl p-5 shadow-xs relative overflow-hidden">
              <div className="absolute right-0 bottom-0 opacity-10 translate-x-4 translate-y-4 pointer-events-none">
                <Building2 className="w-48 h-48" />
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-white/15 text-white font-heavy text-xxxxs font-mono px-2 py-0.5 rounded uppercase tracking-widest backdrop-blur-xs border border-white/10">
                    {selectedOffice.type} STATION
                  </span>
                  <span className="bg-emerald-900/60 text-emerald-200 font-mono text-xxxxs font-bold px-2 py-0.5 rounded border border-emerald-800/20">
                    DISTRICT RANGE: {selectedOffice.district}
                  </span>
                </div>
                <h2 className="text-md md:text-lg font-black tracking-tight leading-snug">
                  {selectedOffice.name}
                </h2>
                <p className="text-xxs text-emerald-100/80 font-mono mt-1 flex items-center gap-1">
                  📍 Physical Location: {selectedOffice.location}
                </p>
              </div>
            </div>

            {/* THREE COLUMN SUMMARY STATISTICS BAR */}
            <div className="bg-white border rounded-2xl p-4 shadow-xxs grid grid-cols-2 md:grid-cols-4 gap-4 items-center">
              
              <div className="space-y-0.5">
                <span className="text-xxxxs font-bold text-slate-400 uppercase tracking-widest font-mono">
                  Sanctioned Posts
                </span>
                <p className="text-md font-extrabold text-slate-850">
                  💼 {selectedOfficeMetrics.sanctioned} Seats
                </p>
              </div>

              <div className="space-y-0.5 border-l pl-4 border-slate-100">
                <span className="text-xxxxs font-bold text-slate-405 uppercase tracking-widest font-mono">
                  Occupied Chairs
                </span>
                <p className="text-md font-extrabold text-emerald-800">
                  🟢 {selectedOfficeMetrics.occupied} Active
                </p>
              </div>

              <div className="space-y-0.5 border-l pl-4 border-slate-100">
                <span className="text-xxxxs font-bold text-slate-405 uppercase tracking-widest font-mono">
                  Vacant Chairs
                </span>
                <p className="text-md font-extrabold text-slate-500">
                  📭 {selectedOfficeMetrics.vacant} Empty
                </p>
              </div>

              <div className="space-y-0.5 border-l pl-4 border-slate-100">
                <span className="text-xxxxs font-bold text-slate-405 uppercase tracking-widest font-mono">
                  Fill Rate Ratio
                </span>
                <div className="flex items-center gap-2">
                  <p className="text-md font-extrabold text-slate-800 font-mono">
                    {selectedOfficeMetrics.fillRate}%
                  </p>
                  <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden max-w-[80px]">
                    <div className="bg-emerald-700 h-full" style={{ width: `${selectedOfficeMetrics.fillRate}%` }}></div>
                  </div>
                </div>
              </div>

            </div>

            {/* ACTIVE TEMPORARY ATTACHMENTS FOR SELECTED OFFICE */}
            {activeOfficeAttachments.length > 0 && (
              <div className="p-4 bg-amber-50/50 border border-amber-200 rounded-2xl text-xxs tracking-normal leading-relaxed text-amber-900">
                <div className="flex items-center gap-2 font-bold text-amber-955 mb-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-ping"></span>
                  ⚡ Temporarily Deputed Attached Personnel ({activeOfficeAttachments.length})
                </div>
                <p className="text-xxxxs font-sans text-slate-500 mb-3 leading-snug">
                  Under standard rules, these officers are holding temporary duty attached to Sahiwal/Lahore offices, but their sanctioned permanent home seats remain situated inside their specific original deployment divisions.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {activeOfficeAttachments.map((att) => {
                    const emp = employees.find((e) => e.id === att.employeeId);
                    if (!emp) return null;
                    return (
                      <div
                        key={att.id}
                        onClick={() => onSelectEmployee(emp.id)}
                        className="bg-white border hover:shadow-xxs border-amber-230 rounded-xl p-3 flex justify-between items-start transition cursor-pointer group"
                      >
                        <div>
                          <span className="font-extrabold text-amber-900 text-xxs border-b border-dashed border-amber-300 group-hover:text-emerald-800">
                            {emp.name} ({emp.scale})
                          </span>
                          <p className="text-xxxxs text-slate-500 mt-1">Notification Order: {att.orderNumber}</p>
                          <p className="text-xxxxs italic text-slate-400 mt-0.5">Factor: &ldquo;{att.reason}&rdquo;</p>
                        </div>
                        <span className="text-[9px] font-mono text-slate-450 bg-slate-50 px-1 py-0.5 rounded">
                          Since {att.effectiveFrom}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* HIERARCHICAL POSITION DESIGN REGISTRY GROUPED BY BPS */}
            <div className="bg-white border rounded-2xl p-5 shadow-xs space-y-6">
              
              <div className="flex justify-between items-center border-b pb-4 mb-2">
                <div>
                  <h3 className="text-xs font-black text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                    <FolderTree className="w-5 h-5 text-emerald-850" />
                    BPS Grading Position &amp; Seat Matrix
                  </h3>
                  <p className="text-xxxxs text-slate-500 font-sans mt-0.5">
                    Structure shows civil service posts grouped by Basic Pay Scale Grade from high (BS-18) to low (BS-1).
                  </p>
                </div>

                <button
                  onClick={() => setShowAddPositionModal(true)}
                  className="bg-slate-800 hover:bg-slate-950 text-white text-[10px] uppercase font-mono tracking-wider font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Position &amp; Seats
                </button>
              </div>

              {selectedOfficePositions.length === 0 ? (
                <div className="p-12 border-2 border-dashed border-slate-200 rounded-2xl text-center">
                  <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <h4 className="text-xxs font-extrabold text-slate-700 uppercase">No positions registered yet</h4>
                  <p className="text-xxs text-slate-400 mt-1 max-w-sm mx-auto">
                    Use the Add Position action button to instantiate civil posts (e.g., Inspector BS-17) and automatically sprout seat slots.
                  </p>
                </div>
              ) : (
                
                /* BS GRADE LEVEL ENVELOPS */
                <div className="space-y-6">
                  {groupedPositionsByBps.map((bpsGroup) => {
                    return (
                      <div key={bpsGroup.scale} className="space-y-3">
                        
                        {/* Grade Header */}
                        <div className="bg-slate-50 border-l-4 border-emerald-800 px-3 py-1.5 rounded-r flex items-center justify-between">
                          <span className="text-[10px] font-black text-slate-800 uppercase tracking-widest font-mono">
                            🎖️ Scale Class Grade: {bpsGroup.scale} Group
                          </span>
                          <span className="text-[9px] font-mono text-slate-400">
                            Count: {bpsGroup.positionsList.length} Designation {bpsGroup.positionsList.length === 1 ? 'type' : 'types'}
                          </span>
                        </div>

                        {/* Positions listed in this group */}
                        <div className="grid grid-cols-1 gap-4 pl-1">
                          {bpsGroup.positionsList.map((position) => {
                            const posSeats = seats.filter((s) => s.positionId === position.id);
                            
                            // Calculate occupied vacancy totals for this position
                            let occupiedCount = 0;
                            const seatRepresentations = posSeats.map((seat) => {
                              const activePosting = postings.find(
                                (p) => p.seatId === seat.id && p.effectiveTo === null
                              );
                              const occupant = activePosting
                                ? employees.find((e) => e.id === activePosting.employeeId)
                                : null;
                              
                              if (occupant) occupiedCount += 1;

                              return {
                                seat,
                                occupant,
                                activePosting,
                              };
                            });

                            const vacantCount = Math.max(0, posSeats.length - occupiedCount);

                            return (
                              <div
                                key={position.id}
                                className="bg-white border rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/15 transition-all duration-150"
                              >
                                
                                {/* Designation Data Text */}
                                <div className="space-y-1">
                                  <h4 className="text-xs font-black text-slate-800">
                                    {position.title} ({position.scale})
                                  </h4>
                                  <div className="flex items-center gap-3 text-xxxxs font-mono text-slate-405">
                                    <span>Sanctioned Seats: <strong>{posSeats.length}</strong></span>
                                    <span>•</span>
                                    <span className="text-emerald-800">Occupied: <strong>{occupiedCount}</strong></span>
                                    <span>•</span>
                                    <span className="text-amber-800">Vacant: <strong>{vacantCount}</strong></span>
                                  </div>
                                </div>

                                {/* SEATS INDIVIDUAL BOXES REPRESENTATION (GREEN/GRAY SMALL BOXES) */}
                                <div className="flex items-center gap-2 flex-wrap min-w-[200px]">
                                  {seatRepresentations.map((repr, idx) => {
                                    const seatLetter = String.fromCharCode(65 + idx);
                                    
                                    if (repr.occupant) {
                                      return (
                                        <div
                                          key={repr.seat.id}
                                          className="relative group"
                                        >
                                          {/* GREEN OCCUPIED BUTTON */}
                                          <button
                                            onClick={() => onSelectEmployee(repr.occupant!.id)}
                                            className="h-8 w-8 text-xxs font-mono font-bold rounded-lg bg-emerald-700 hover:bg-emerald-900 border border-emerald-900 text-white flex items-center justify-center cursor-pointer transition shadow-xxs"
                                          >
                                            {seatLetter}
                                          </button>

                                          {/* FLOATING HOVER TOOLTIP */}
                                          <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 hidden group-hover:block bg-slate-900 text-white text-[10px] p-2.5 rounded-lg shadow-xl z-30 w-52 text-left leading-normal pointer-events-none animate-in fade-in slide-in-from-bottom-1 duration-100">
                                            <p className="font-extrabold text-xxs border-b border-slate-700 pb-1 mb-1 text-emerald-300">
                                              {repr.occupant.name}
                                            </p>
                                            <p className="text-slate-300 font-medium">Designated Chair: {position.title}</p>
                                            <p className="text-slate-400 font-mono text-xxxxs mt-1">Seat Assignment: {repr.seat.name}</p>
                                            <p className="text-slate-400 font-mono text-xxxxs">Assumed Charge: {repr.activePosting?.effectiveFrom}</p>
                                            <p className="text-slate-400 font-mono text-xxxxs truncate">Order ID: {repr.activePosting?.orderNumber}</p>
                                            <p className="text-[8px] italic text-amber-300 mt-1 font-sans">Click to inspect service timeline ledger ➔</p>
                                            {/* Tooltip pointer */}
                                            <div className="w-2 h-2 bg-slate-900 rotate-45 absolute top-full -mt-1 left-1/2 -translate-x-1/2"></div>
                                          </div>
                                        </div>
                                      );
                                    } else {
                                      return (
                                        <div
                                          key={repr.seat.id}
                                          className="relative group"
                                        >
                                          {/* GRAY VACANT BOX */}
                                          <div
                                            className="h-8 w-8 text-xxs font-mono font-bold rounded-lg border border-dashed border-slate-300 bg-slate-100 text-slate-400 flex items-center justify-center select-none"
                                          >
                                            {seatLetter}
                                          </div>

                                          {/* Tooltip for vacancy */}
                                          <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 hidden group-hover:block bg-slate-800 text-white text-[10px] py-1 px-2.5 rounded shadow-xl z-30 w-36 text-center pointer-events-none font-medium">
                                            <span>📭 Seat Vacant ({repr.seat.name})</span>
                                            <div className="w-1.5 h-1.5 bg-slate-800 rotate-45 absolute top-full -mt-[3px] left-1/2 -translate-x-1/2"></div>
                                          </div>
                                        </div>
                                      );
                                    }
                                  })}
                                </div>

                              </div>
                            );
                          })}
                        </div>

                      </div>
                    );
                  })}
                </div>
              )}

            </div>

          </div>
        )}

      </main>

      {/* MODAL / COLLAPSIBLE: NEW POSITION INJECT MODAL */}
      {showAddPositionModal && selectedOffice && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs"
            onClick={() => setShowAddPositionModal(false)}
          />

          <div className="relative bg-white border border-slate-300 rounded-2xl shadow-2xl max-w-md w-full mx-auto overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="absolute top-0 left-0 w-full h-1 bg-slate-800"></div>
            
            <header className="px-5 py-4 border-b flex justify-between items-center">
              <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <FolderTree className="w-4 h-4 text-slate-705" />
                Define Civil Position Posts &amp; Seats
              </h4>
              <button
                type="button"
                onClick={() => setShowAddPositionModal(false)}
                className="text-slate-400 hover:text-slate-600 rounded-full"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </header>

            <form onSubmit={handleCreatePositionSubmit} className="p-5 space-y-4">
              
              <p className="text-xxs text-slate-500 leading-normal">
                Adding an official post defines the sanctioned civil service seats database list (e.g. 3 inspector seats creates Seat-A, Seat-B, Seat-C under this office).
              </p>

              <div>
                <label className="block text-xxxxs uppercase tracking-widest font-mono font-bold text-slate-400 mb-1">
                  Civil Designation Job Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Environmental Chemist"
                  value={posTitle}
                  onChange={(e) => setPosTitle(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-350 rounded-lg focus:outline-hidden bg-slate-50/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xxxxs uppercase tracking-widest font-mono font-bold text-slate-400 mb-1">
                    BPS Grading BS Scale
                  </label>
                  <select
                    value={posScale}
                    onChange={(e) => setPosScale(e.target.value)}
                    className="w-full text-xs px-2 py-2 bg-slate-50 border border-slate-350 rounded-lg focus:outline-hidden"
                  >
                    {Array.from({ length: 18 }, (_, k) => `BS-${k + 1}`).reverse().map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xxxxs uppercase tracking-widest font-mono font-bold text-slate-400 mb-1">
                    Sanctioned Seats Quantity
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    required
                    value={posSeatsCount}
                    onChange={(e) => setPosSeatsCount(Math.max(1, Number(e.target.value)))}
                    className="w-full text-xs px-3 py-2 border border-slate-350 rounded-lg focus:outline-hidden bg-slate-50/50"
                  />
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowAddPositionModal(false)}
                  className="px-3 py-2 text-xxs text-slate-500 hover:bg-slate-100 rounded-md font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xxs text-white bg-slate-800 hover:bg-slate-900 rounded-md font-bold cursor-pointer"
                >
                  Create &amp; Sprout Seats
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
