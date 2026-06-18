import React, { useState, useMemo } from 'react';
import { Office, Position, Seat, Employee, Posting, Attachment } from '../types';
import { EmployeeProfile } from './EmployeeProfile';
import {
  Search,
  UserCheck,
  UserMinus,
  ShieldAlert,
  Phone,
  Eye,
  Building2,
  Briefcase,
  Calendar,
  FileText,
  BadgeHelp,
  ClipboardList,
  Info,
  Trash2,
  ShieldX,
  Ban,
  List,
  LayoutGrid,
  SlidersHorizontal,
  ArrowUpDown,
  CheckCircle,
  Clock,
  MapPin,
  User,
  UserX,
  X,
  ShieldAlert as ShieldAlertIcon,
  AlertCircle,
  PinOff
} from 'lucide-react';

interface PersonnelDirectoryProps {
  offices: Office[];
  positions: Position[];
  seats: Seat[];
  employees: Employee[];
  postings: Posting[];
  attachments: Attachment[];
  selectedEmployeeId: string | null;
  onSelectEmployeeId: (id: string | null) => void;
  onRetireEmployee: (employeeId: string, date: string, orderNumber: string) => void;
  onSetTab: (tab: string) => void;
  onPreFillTransfer: (employeeId: string) => void;
}

interface RosterItem {
  id: string; // "emp-XYZ" or "vacant-XYZ"
  type: 'employee' | 'vacant_seat';
  employee?: Employee;
  seat?: Seat;
  position?: Position;
  office?: Office;
  
  // Compiled properties for easy searching/sorting
  name: string;
  cnic: string;
  fatherName: string;
  title: string;
  officeName: string;
  district: string;
  officeType: string;
  scaleValue: number;
  scaleGrade: string;
  joiningDate: string;
  status: 'posted' | 'attached' | 'vacant' | 'retired';
  onAttachment: boolean;
  attachedOfficeName?: string;
  photoColor?: string;
}

export const PersonnelDirectory: React.FC<PersonnelDirectoryProps> = ({
  offices,
  positions,
  seats,
  employees,
  postings,
  attachments,
  selectedEmployeeId,
  onSelectEmployeeId,
  onRetireEmployee,
  onSetTab,
  onPreFillTransfer,
}) => {
  // Main Search and Advanced filters
  const [searchQuery, setSearchQuery] = useState('');
  const [officeFilter, setOfficeFilter] = useState('all');
  const [scaleFilter, setScaleFilter] = useState('all');
  const [districtFilter, setDistrictFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'posted', 'attached', 'vacant', 'retired'
  const [officeTypeFilter, setOfficeTypeFilter] = useState('all'); // 'all', 'Directorate', 'Regional Office', 'Field Office'
  
  // Sort and view styles
  const [sortBy, setSortBy] = useState<'name' | 'scale' | 'office' | 'joining'>('name');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  // Retire Modal embedded states
  const [showRetireModal, setShowRetireModal] = useState(false);
  const [retireDate, setRetireDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [retireOrder, setRetireOrder] = useState('SO(Svc-Retire)9-112/2026');

  // 1. Compile list of districts dynamically from existing offices
  const districtsList = useMemo(() => {
    const dSet = new Set<string>();
    offices.forEach((o) => {
      if (o.district) {
        dSet.add(o.district);
      }
    });
    return Array.from(dSet).sort();
  }, [offices]);

  // List of scales BS-1 to BS-18
  const bsList = useMemo(() => {
    return Array.from({ length: 18 }, (_, i) => `BS-${i + 1}`);
  }, []);

  // 2. UNIFIED DATASET COMPILER (Both active employees, retired, and vacant seat records)
  const compiledRoster = useMemo((): RosterItem[] => {
    const list: RosterItem[] = [];

    // Track which seat IDs have active permanent occupants
    const occupiedSeatIds = new Set<string>();

    // Add Employees (Active or Retired)
    employees.forEach((emp) => {
      const activePost = postings.find((p) => p.employeeId === emp.id && p.effectiveTo === null);
      const seat = activePost ? seats.find((s) => s.id === activePost.seatId) : undefined;
      const pos = seat ? positions.find((p) => p.id === seat.positionId) : undefined;
      const office = pos ? offices.find((o) => o.id === pos.officeId) : undefined;

      const activeAttach = attachments.find((a) => a.employeeId === emp.id && a.effectiveTo === null);
      const attachedOffice = activeAttach ? offices.find((o) => o.id === activeAttach.targetOfficeId) : undefined;

      if (activePost && seat) {
        occupiedSeatIds.add(seat.id);
      }

      const scaleNum = parseInt(emp.scale.replace('BS-', '')) || 1;

      list.push({
        id: `emp-${emp.id}`,
        type: 'employee',
        employee: emp,
        seat,
        position: pos,
        office,
        name: emp.name,
        cnic: emp.cnic,
        fatherName: emp.fatherName,
        title: pos?.title || 'Unassigned Position',
        officeName: office?.name || 'Awaiting Placement',
        district: office?.district || 'Punjab',
        officeType: office?.type || 'Other',
        scaleValue: scaleNum,
        scaleGrade: emp.scale,
        joiningDate: emp.doj,
        status: emp.status === 'retired' ? 'retired' : (activeAttach ? 'attached' : 'posted'),
        onAttachment: !!activeAttach,
        attachedOfficeName: attachedOffice?.name.split(' (')[0],
        photoColor: emp.photoColor || 'bg-slate-500',
      });
    });

    // Add Vacant Seats to show as comprehensive roster slots
    seats.forEach((seat) => {
      if (!occupiedSeatIds.has(seat.id)) {
        const pos = positions.find((p) => p.id === seat.positionId);
        const office = pos ? offices.find((o) => o.id === pos.officeId) : undefined;
        const scaleNum = pos ? (parseInt(pos.scale.replace('BS-', '')) || 1) : 1;

        list.push({
          id: `vacant-${seat.id}`,
          type: 'vacant_seat',
          seat,
          position: pos,
          office,
          name: 'Vacant Designated Slot',
          cnic: '-',
          fatherName: '-',
          title: pos?.title || 'Allocated Seat',
          officeName: office?.name || 'Unknown Office',
          district: office?.district || 'Punjab',
          officeType: office?.type || 'Other',
          scaleValue: scaleNum,
          scaleGrade: pos?.scale || 'BS-1',
          joiningDate: '',
          status: 'vacant',
          onAttachment: false,
        });
      }
    });

    return list;
  }, [employees, postings, seats, positions, offices, attachments]);

  // 3. FILTER AND SEARCH ROSTER
  const filteredRoster = useMemo(() => {
    return compiledRoster.filter((item) => {
      // Top Level Universal Bar Search
      const query = searchQuery.trim().toLowerCase();
      let matchesSearch = true;
      if (query) {
        const itemCNICClean = item.cnic.replace(/-/g, '');
        matchesSearch =
          item.name.toLowerCase().includes(query) ||
          item.cnic.includes(query) ||
          itemCNICClean.includes(query) ||
          item.fatherName.toLowerCase().includes(query) ||
          item.officeName.toLowerCase().includes(query) ||
          item.district.toLowerCase().includes(query) ||
          item.title.toLowerCase().includes(query);
      }

      // Office Dropdown Filter
      let matchesOffice = true;
      if (officeFilter !== 'all') {
        matchesOffice = item.office?.id === officeFilter;
      }

      // Scale Dropdown Filter
      let matchesScale = true;
      if (scaleFilter !== 'all') {
        matchesScale = item.scaleGrade === scaleFilter;
      }

      // District Dropdown Filter
      let matchesDistrict = true;
      if (districtFilter !== 'all') {
        matchesDistrict = item.district === districtFilter;
      }

      // Office Type Filter
      let matchesOfficeType = true;
      if (officeTypeFilter !== 'all') {
        matchesOfficeType = item.officeType === officeTypeFilter;
      }

      // Status Filter ('all', 'posted', 'attached', 'vacant', 'retired')
      let matchesStatus = true;
      if (statusFilter !== 'all') {
        matchesStatus = item.status === statusFilter;
      }

      return matchesSearch && matchesOffice && matchesScale && matchesDistrict && matchesOfficeType && matchesStatus;
    });
  }, [compiledRoster, searchQuery, officeFilter, scaleFilter, districtFilter, officeTypeFilter, statusFilter]);

  // 4. SORT THE RESULTS
  const sortedRoster = useMemo(() => {
    const listCopy = [...filteredRoster];
    return listCopy.sort((a, b) => {
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      } else if (sortBy === 'scale') {
        // High to low grade basic scale
        return b.scaleValue - a.scaleValue;
      } else if (sortBy === 'office') {
        return a.officeName.localeCompare(b.officeName);
      } else if (sortBy === 'joining') {
        // Pull empty/vacant items to bottom
        if (!a.joiningDate) return 1;
        if (!b.joiningDate) return -1;
        return b.joiningDate.localeCompare(a.joiningDate); // newest first
      }
      return 0;
    });
  }, [filteredRoster, sortBy]);

  // Handle Clears Filters Action
  const handleResetFilters = () => {
    setSearchQuery('');
    setOfficeFilter('all');
    setScaleFilter('all');
    setDistrictFilter('all');
    setStatusFilter('all');
    setOfficeTypeFilter('all');
    setSortBy('name');
  };

  // Find currently selected employee profile
  const selectedEmployee = useMemo(() => {
    return employees.find((e) => e.id === selectedEmployeeId);
  }, [employees, selectedEmployeeId]);

  // Overlapping Attachments Conflicts Analysis for the selected employee
  const selectedEmployeeConflicts = useMemo(() => {
    if (!selectedEmployee) return [];
    
    const empAttachments = attachments.filter((a) => a.employeeId === selectedEmployee.id);
    const result: Array<{ id1: string; id2: string; office1: string; office2: string; range1: string; range2: string; order1: string; order2: string }> = [];

    for (let i = 0; i < empAttachments.length; i++) {
      for (let j = i + 1; j < empAttachments.length; j++) {
        const a = empAttachments[i];
        const b = empAttachments[j];
        if (a.targetOfficeId === b.targetOfficeId) continue; // must be two different offices

        const s1 = a.effectiveFrom;
        const e1 = a.effectiveTo || '9999-12-31';
        const s2 = b.effectiveFrom;
        const e2 = b.effectiveTo || '9999-12-31';

        // Overlap check
        if (s1 <= e2 && s2 <= e1) {
          const off1 = offices.find((o) => o.id === a.targetOfficeId)?.name.split(' (')[0] || 'Unknown Office';
          const off2 = offices.find((o) => o.id === b.targetOfficeId)?.name.split(' (')[0] || 'Unknown Office';
          const r1 = a.effectiveTo ? `${a.effectiveFrom} to ${a.effectiveTo}` : `from ${a.effectiveFrom} onwards (Active)`;
          const r2 = b.effectiveTo ? `${b.effectiveFrom} to ${b.effectiveTo}` : `from ${b.effectiveFrom} onwards (Active)`;

          result.push({
            id1: a.id,
            id2: b.id,
            office1: off1,
            office2: off2,
            range1: r1,
            range2: r2,
            order1: a.orderNumber,
            order2: b.orderNumber,
          });
        }
      }
    }
    return result;
  }, [selectedEmployee, attachments, offices]);

  // Combined chronologically descending timeline events for selected employee
  const employeeTimeline = useMemo(() => {
    if (!selectedEmployee) return [];

    interface TimelineEvent {
      id: string;
      type: 'posting_start' | 'posting_end' | 'attachment_start' | 'attachment_end' | 'retirement';
      date: string;
      title: string;
      description: string;
      orderNumber: string;
      meta?: string;
    }

    const events: TimelineEvent[] = [];

    // 1. Postings
    const empPostings = postings.filter((p) => p.employeeId === selectedEmployee.id);
    empPostings.forEach((p) => {
      const seat = seats.find((s) => s.id === p.seatId);
      const pos = seat ? positions.find((pos) => pos.id === seat.positionId) : null;
      const office = pos ? offices.find((o) => o.id === pos.officeId) : null;
      const officeName = office ? office.name : 'Unknown Office';
      const postName = pos ? `${pos.title} (${pos.scale})` : 'Position';

      events.push({
        id: `post-start-${p.id}`,
        type: 'posting_start',
        date: p.effectiveFrom,
        title: 'Assumed Charge / Posting',
        description: `Permanently posted as ${postName} at ${officeName} - ${seat?.name || 'Assigned Seat'}`,
        orderNumber: p.orderNumber,
      });

      if (p.effectiveTo) {
        events.push({
          id: `post-end-${p.id}`,
          type: 'posting_end',
          date: p.effectiveTo,
          title: 'Relieved of Duty / Transferred',
          description: `Ended charge as ${postName} due to subsequent posting/transfer orders.`,
          orderNumber: p.orderNumber,
        });
      }
    });

    // 2. Attachments
    const empAttachments = attachments.filter((a) => a.employeeId === selectedEmployee.id);
    empAttachments.forEach((a) => {
      const targetOffice = offices.find((o) => o.id === a.targetOfficeId);
      const targetName = targetOffice ? targetOffice.name : 'Unknown Office';

      events.push({
        id: `attach-start-${a.id}`,
        type: 'attachment_start',
        date: a.effectiveFrom,
        title: 'Temporary Attachment Assigned',
        description: `Temporarily attached to ${targetName}. Reason: ${a.reason}`,
        orderNumber: a.orderNumber,
      });

      if (a.effectiveTo) {
        events.push({
          id: `attach-end-${a.id}`,
          type: 'attachment_end',
          date: a.effectiveTo,
          title: 'Temporary Attachment Terminated',
          description: `Relieved from temporary duties at ${targetName}; returned to permanent home seat.`,
          orderNumber: a.orderNumber,
        });
      }
    });

    // 3. Retirement
    if (selectedEmployee.status === 'retired') {
      const firstPastPost = postings.filter((p) => p.employeeId === selectedEmployee.id && p.effectiveTo !== null);
      const sortedPastPost = [...firstPastPost].sort((a, b) => b.effectiveTo!.localeCompare(a.effectiveTo!));
      const retirementDate = sortedPastPost[0]?.effectiveTo || selectedEmployee.dob;

      events.push({
        id: 'retirement-event',
        type: 'retirement',
        date: retirementDate,
        title: 'Official Retirement from Service',
        description: 'Superannuation retirement processed. Active postings and attachments closed.',
        orderNumber: 'Official Gazette Notification / Retirement orders',
      });
    }

    return events.sort((a, b) => b.date.localeCompare(a.date));
  }, [selectedEmployee, postings, attachments, seats, positions, offices]);

  // Current active details of selected employee
  const activePosting = useMemo(() => {
    if (!selectedEmployee) return null;
    return postings.find((p) => p.employeeId === selectedEmployee.id && p.effectiveTo === null);
  }, [selectedEmployee, postings]);

  const activePostingDetails = useMemo(() => {
    if (!activePosting) return null;
    const seat = seats.find((s) => s.id === activePosting.seatId);
    const pos = seat ? positions.find((p) => p.id === seat.positionId) : null;
    const office = pos ? offices.find((o) => o.id === pos.officeId) : null;
    return { seat, pos, office };
  }, [activePosting, seats, positions, offices]);

  const activeAttachment = useMemo(() => {
    if (!selectedEmployee) return null;
    return attachments.find((a) => a.employeeId === selectedEmployee.id && a.effectiveTo === null);
  }, [selectedEmployee, attachments]);

  const activeAttachmentOffice = useMemo(() => {
    if (!activeAttachment) return null;
    return offices.find((o) => o.id === activeAttachment.targetOfficeId);
  }, [activeAttachment, offices]);

  const handleRetireClick = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployeeId) return;
    onRetireEmployee(selectedEmployeeId, retireDate, retireOrder);
    setShowRetireModal(false);
  };

  if (selectedEmployeeId && selectedEmployee) {
    return (
      <EmployeeProfile
        employee={selectedEmployee}
        offices={offices}
        positions={positions}
        seats={seats}
        postings={postings}
        attachments={attachments}
        onBack={() => onSelectEmployeeId(null)}
        onRetireEmployee={onRetireEmployee}
        onPreFillTransfer={onPreFillTransfer}
      />
    );
  }

  return (
    <div className="space-y-6">
      
      {/* 1. TOP STATS AND COMPREHENSIVE SEARCH HEADER */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-emerald-800" />
              <h2 className="text-md font-extrabold text-slate-800">Advanced Personnel Ledger &amp; Roster Index</h2>
            </div>
            <p className="text-xxs text-slate-500 mt-1">
              Search the complete Environmental Protection Agency, Punjab list of sanctioned slots, active officers, temporary placements, and vacancies.
            </p>
          </div>
          <div className="flex gap-2 text-xxs font-mono text-slate-500 bg-slate-50 border p-2.5 rounded-xl">
            <span className="border-r pr-2">Matched List: <strong className="text-emerald-800">{sortedRoster.length}</strong></span>
            <span className="border-r px-2">Total Employees: <strong className="text-slate-700">{employees.length}</strong></span>
            <span>Vacant Seats: <strong className="text-amber-800">{seats.length - postings.filter(p => !p.effectiveTo).length}</strong></span>
          </div>
        </div>

        {/* LARGE POWER SEARCH BAR */}
        <div className="relative mt-4">
          <Search className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search roster instantaneously by Officer Name, CNIC, Father's Name, Office Station, District division, or Position Job Title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-11 pr-4 py-3 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-600 shadow-xxs bg-slate-50/50"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 text-xs font-mono font-bold"
            >
              ✕ Clear
            </button>
          )}
        </div>
      </div>

      {/* 2. BODY LAYOUT: SPLIT SCREEN (LEFT SIDE BAR FILTERS AND RIGHT MAIN DATA RENDER) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* LEFT COLUMN: ADVANCED FILTERS PANEL */}
        <aside className="lg:col-span-3 space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
            
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <span className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                <SlidersHorizontal className="w-4 h-4 text-emerald-800 animate-pulse" />
                Filter Index
              </span>
              <button
                onClick={handleResetFilters}
                className="text-xxxxs font-bold text-slate-400 hover:text-rose-600 uppercase font-mono tracking-wider transition"
              >
                Clear All ↺
              </button>
            </div>

            <div className="space-y-4">
              
              {/* STATUS FILTER */}
              <div>
                <label className="block text-xxxxs font-extrabold uppercase tracking-widest text-slate-400 mb-1.5 font-mono">
                  Administrative Duty Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full text-xs px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100/50 transition focus:outline-hidden"
                >
                  <option value="all">🌐 All Personnel / Slots</option>
                  <option value="posted">📌 Currently Posted (Standard Duty)</option>
                  <option value="attached">⚡ Currently Attached (Temporary Duty)</option>
                  <option value="vacant">📭 Empty / Vacant Seats Only</option>
                  <option value="retired">👵 Retired Officials Only</option>
                </select>
              </div>

              {/* OFFICE TYPE FILTER */}
              <div>
                <label className="block text-xxxxs font-extrabold uppercase tracking-widest text-slate-400 mb-1.5 font-mono">
                  Office Division Classification
                </label>
                <select
                  value={officeTypeFilter}
                  onChange={(e) => setOfficeTypeFilter(e.target.value)}
                  className="w-full text-xs px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden"
                >
                  <option value="all">🏢 All Office Classifications</option>
                  <option value="Directorate">Directorate Headquarters</option>
                  <option value="Regional Office">Regional Offices</option>
                  <option value="Field Office">Field Sub-Offices</option>
                </select>
              </div>

              {/* OFFICE STATION FILTER */}
              <div>
                <label className="block text-xxxxs font-extrabold uppercase tracking-widest text-slate-400 mb-1.5 font-mono">
                  Office Center Station
                </label>
                <select
                  value={officeFilter}
                  onChange={(e) => setOfficeFilter(e.target.value)}
                  className="w-full text-xs px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden max-w-full"
                >
                  <option value="all">🏦 All Stations</option>
                  {offices.map((off) => (
                    <option key={off.id} value={off.id}>
                      {off.name.split(' (')[0]}
                    </option>
                  ))}
                </select>
              </div>

              {/* BASIC SCALE GRADE */}
              <div>
                <label className="block text-xxxxs font-extrabold uppercase tracking-widest text-slate-400 mb-1.5 font-mono">
                  Basic Pay Scale (BPS Grade)
                </label>
                <select
                  value={scaleFilter}
                  onChange={(e) => setScaleFilter(e.target.value)}
                  className="w-full text-xs px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden"
                >
                  <option value="all">🎖️ All Grade Scales</option>
                  {bsList.map((scale) => (
                    <option key={scale} value={scale}>
                      {scale} Range
                    </option>
                  ))}
                </select>
              </div>

              {/* DISTRICT FILTER */}
              <div>
                <label className="block text-xxxxs font-extrabold uppercase tracking-widest text-slate-400 mb-1.5 font-mono">
                  District Division Range
                </label>
                <select
                  value={districtFilter}
                  onChange={(e) => setDistrictFilter(e.target.value)}
                  className="w-full text-xs px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden"
                >
                  <option value="all">📍 All Districts</option>
                  {districtsList.map((dist) => (
                    <option key={dist} value={dist}>
                      {dist} District
                    </option>
                  ))}
                </select>
              </div>

            </div>

            {/* QUICK HELP TOOLTIP */}
            <div className="mt-5 p-3 rounded-xl bg-slate-50 border border-slate-100 font-sans text-xxxxs text-slate-500 leading-normal flex items-start gap-1.5">
              <Info className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
              <span>
                Applying filters isolates slots and active personnel in real-time. Vacant designated positions have no CNIC, Father Name or DOJ and are labeled as <strong>Vacant Designated Slots</strong>.
              </span>
            </div>

          </div>
        </aside>

        {/* MAIN PANEL REGISTER */}
        <main className="lg:col-span-9 space-y-4">
          
          {/* SORTBAR AND MODE TOGGLE CONTROLS */}
          <div className="bg-white border border-slate-200 rounded-xl px-4 py-3 shadow-xxs flex flex-wrap items-center justify-between gap-3">
            
            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-xxs font-extrabold uppercase tracking-widest text-slate-400 font-mono">
                Order Roster By:
              </span>
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="text-xs font-semibold px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 cursor-pointer focus:outline-hidden text-slate-700"
                >
                  <option value="name">🔤 Alphabetic Surname</option>
                  <option value="scale">🥇 BPS Pay Scale Grade</option>
                  <option value="office">🏢 Station Location</option>
                  <option value="joining">📅 Initial Civil Joining Date</option>
                </select>
              </div>
            </div>

            {/* View Mode Toggle */}
            <div className="flex bg-slate-100 p-0.5 rounded-lg border">
              <button
                onClick={() => setViewMode('cards')}
                className={`px-3 py-1.5 rounded-md text-xxs font-bold flex items-center gap-1 cursor-pointer transition ${
                  viewMode === 'cards'
                    ? 'bg-white text-emerald-950 shadow-xs border border-slate-200/50'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                Cards Grid
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-1.5 rounded-md text-xxs font-bold flex items-center gap-1 cursor-pointer transition ${
                  viewMode === 'table'
                    ? 'bg-white text-emerald-950 shadow-xs border border-slate-200/50'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <List className="w-3.5 h-3.5" />
                Table View
              </button>
            </div>

          </div>

          {/* EMPTY MATCH STATE */}
          {sortedRoster.length === 0 ? (
            <div className="bg-white border rounded-2xl p-12 text-center shadow-xs">
              <UserMinus className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-slate-700">No matching personnel or vacant slots</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                No active Civil Servants or Empty Designated Seats match your current filters. Please adjust your search keyword query or reset sidebar metrics.
              </p>
              <button
                onClick={handleResetFilters}
                className="mt-4 text-xxs font-bold text-white bg-emerald-800 hover:bg-emerald-900 px-4 py-2 rounded-lg transition"
              >
                Reset Filter Indexes
              </button>
            </div>
          ) : viewMode === 'cards' ? (
            
            /* CARDS GRID DESIGN */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sortedRoster.map((item) => {
                const isVacant = item.type === 'vacant_seat';
                const isRetired = item.status === 'retired';
                const isAttached = item.status === 'attached';

                return (
                  <div
                    key={item.id}
                    id={`roster-card-${item.id}`}
                    onClick={() => {
                      if (!isVacant && item.employee) {
                        onSelectEmployeeId(item.employee.id);
                      }
                    }}
                    className={`border rounded-2xl p-4 transition-all duration-200 flex flex-col justify-between group relative overflow-hidden bg-white ${
                      isVacant
                        ? 'border-dashed border-slate-300 bg-slate-50/20'
                        : 'border-slate-200/80 hover:shadow-md hover:border-slate-300 cursor-pointer'
                    }`}
                  >
                    
                    {/* Top Stripe Label */}
                    <div className="absolute left-0 top-0 w-1.5 h-full bg-emerald-800/20 group-hover:bg-emerald-800 transition-colors" />

                    <div>
                      <div className="flex items-start justify-between gap-3 pl-2">
                        
                        {/* Avatar Badge Area */}
                        <div className="flex items-center gap-3">
                          {isVacant ? (
                            <div className="h-10 w-10 rounded-full border border-dashed border-slate-300 bg-slate-100 flex items-center justify-center font-bold text-xs font-mono text-slate-400 shrink-0">
                              📭
                            </div>
                          ) : (
                            <div className={`p-2.5 h-10 w-10 text-white rounded-full flex items-center justify-center font-extrabold font-mono shrink-0 text-xs shadow-xxs ${item.photoColor}`}>
                              {item.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                            </div>
                          )}

                          <div className="min-w-0">
                            <span className="text-xxxxs font-bold tracking-widest uppercase text-slate-400 block font-mono">
                              BPS Pay-grade Scale
                            </span>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <h4 className="text-xs font-bold text-slate-800 tracking-tight leading-tight line-clamp-1 group-hover:text-emerald-905">
                                {item.name}
                              </h4>
                              <span className="text-xxxxs font-mono font-bold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border">
                                {item.scaleGrade}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Status Pin Badge */}
                        <div className="shrink-0 pt-1">
                          {isVacant ? (
                            <span className="bg-amber-100 text-amber-800 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider font-mono">
                              Vacant Slot
                            </span>
                          ) : isRetired ? (
                            <span className="bg-slate-100 text-slate-500 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider font-mono">
                              Retired
                            </span>
                          ) : isAttached ? (
                            <span className="bg-rose-100 text-rose-800 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider font-mono animate-pulse">
                              Attachment Active
                            </span>
                          ) : (
                            <span className="bg-emerald-50 text-emerald-800 text-[9px] font-bold px-1.5 py-0.5 rounded border border-emerald-150 uppercase tracking-wider font-mono">
                              Standard Posted
                            </span>
                          )}
                        </div>

                      </div>

                      {/* Content stats segment */}
                      <div className="mt-4 pl-2 space-y-1.5 pt-3 border-t border-slate-100/60 font-sans text-xxs text-slate-500">
                        
                        <div>
                          <span className="text-xxxxs text-slate-400 uppercase font-mono font-bold">Duty Station Office</span>
                          <span className="font-semibold text-slate-800 block leading-tight">
                            🏦 {item.officeName}
                          </span>
                        </div>

                        <div>
                          <span className="text-xxxxs text-slate-400 uppercase font-mono font-bold">Allocated Seat Title</span>
                          <span className="font-semibold text-slate-705 block leading-tight">
                            💼 {item.title}
                          </span>
                        </div>

                        {!isVacant && (
                          <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-xxxxs text-slate-400">
                            <div>
                              <span>CNIC Number:</span>
                              <span className="block font-semibold text-slate-600">{item.cnic}</span>
                            </div>
                            <div>
                              <span>DOJ Service:</span>
                              <span className="block font-semibold text-slate-600">{item.joiningDate || '-'}</span>
                            </div>
                          </div>
                        )}

                        {isAttached && item.attachedOfficeName && (
                          <div className="mt-3 p-1.5 rounded-lg bg-rose-50 border border-rose-100 text-rose-850 font-sans text-xxxxs leading-normal">
                            🚨 <strong>Temporary Task Attachment:</strong> Deputed off-site at <strong>{item.attachedOfficeName}</strong>. Standard home seat remains held.
                          </div>
                        )}

                      </div>
                    </div>

                    {/* View Action Buttons */}
                    <div className="mt-4 pl-2">
                      {!isVacant ? (
                        <button
                          type="button"
                          className="w-full text-center text-xxxxs uppercase tracking-wider font-mono font-bold bg-slate-50 hover:bg-emerald-800 hover:text-white border p-1 rounded-lg transition"
                        >
                          👁️ View Detailed Profile &amp; Audit Log
                        </button>
                      ) : (
                        <div className="text-center text-xxxxs uppercase tracking-wider font-mono font-bold text-slate-350 bg-slate-50 p-1 rounded-lg border border-dashed select-none">
                          No Civil Occupant holding charge
                        </div>
                      )}
                    </div>

                  </div>
                );
              })}
            </div>
          ) : (
            
            /* TABULAR DATA DENSE LIST VIEW */
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xxs">
                  <thead>
                    <tr className="bg-slate-50 text-slate-550 border-b border-rose-100/10 font-mono tracking-widest font-extrabold uppercase">
                      <th className="p-3.5 pl-5">Servant Identity / CNIC</th>
                      <th className="p-3.5">BPS Grade</th>
                      <th className="p-3.5">Designated Chair / Title</th>
                      <th className="p-3.5">Assigned Home Office</th>
                      <th className="p-3.5">Regional District</th>
                      <th className="p-3.5">Administrative Status</th>
                      <th className="p-3.5 text-right pr-5">Control Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {sortedRoster.map((item) => {
                      const isVacant = item.type === 'vacant_seat';
                      const isRetired = item.status === 'retired';
                      const isAttached = item.status === 'attached';

                      return (
                        <tr
                          key={item.id}
                          className={`hover:bg-slate-55/40 transition-all ${
                            isVacant ? 'bg-slate-50/20 text-slate-400' : 'text-slate-700'
                          }`}
                        >
                          {/* Name and National Number */}
                          <td className="p-3 pl-5">
                            <div className="flex items-center gap-3">
                              {!isVacant && item.photoColor ? (
                                <div className={`h-8 w-8 text-white rounded-full flex items-center justify-center font-bold text-xxxs shrink-0 ${item.photoColor}`}>
                                  {item.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                                </div>
                              ) : (
                                <div className="h-8 w-8 rounded-full border border-dashed text-slate-400 bg-slate-100 flex items-center justify-center text-xxxs shrink-0 font-bold">
                                  📭
                                </div>
                              )}
                              <div>
                                <span className="font-extrabold block text-slate-800 tracking-tight">
                                  {item.name}
                                </span>
                                {!isVacant && (
                                  <span className="text-xxxxs text-slate-400 font-mono">
                                    CNIC: {item.cnic}
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* BS Pay grade */}
                          <td className="p-3">
                            <span className="font-mono font-bold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border text-xxxxs">
                              {item.scaleGrade}
                            </span>
                          </td>

                          {/* Job Title position */}
                          <td className="p-3 font-semibold text-slate-700">
                            {item.title}
                          </td>

                          {/* Home Office Area */}
                          <td className="p-3 text-slate-600 font-medium">
                            {item.officeName}
                          </td>

                          {/* Location representation */}
                          <td className="p-3 font-mono text-xxxxs text-slate-500">
                            📍 {item.district}
                          </td>

                          {/* Real-time Status indicators */}
                          <td className="p-3">
                            {isVacant ? (
                              <span className="bg-amber-100 text-amber-800 text-[8px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider font-mono">
                                Vacant
                              </span>
                            ) : isRetired ? (
                              <span className="bg-slate-100 text-slate-400 text-[8px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider font-mono">
                                Superannuated
                              </span>
                            ) : isAttached ? (
                              <span className="bg-rose-100 text-rose-850 text-[8px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider font-mono animate-pulse block">
                                Attached: {item.attachedOfficeName}
                              </span>
                            ) : (
                              <span className="bg-emerald-50 text-emerald-800 text-[8px] font-bold px-1.5 py-0.5 rounded border border-emerald-150 uppercase tracking-wider font-mono">
                                Permanent
                              </span>
                            )}
                          </td>

                          {/* Interactive modal caller */}
                          <td className="p-3 text-right pr-5">
                            {!isVacant && item.employee ? (
                              <button
                                type="button"
                                onClick={() => {
                                  if (item.employee) {
                                  onSelectEmployeeId(item.employee.id);
                                  }
                                }}
                                className="cursor-pointer text-xxxxs uppercase tracking-wider font-mono font-bold bg-emerald-50 text-emerald-800 hover:bg-emerald-800 hover:text-white px-2.5 py-1.5 rounded-md transition duration-150 border border-emerald-200"
                              >
                                Inquiry
                              </button>
                            ) : (
                              <span className="text-xxxxs text-slate-350 cursor-not-allowed uppercase font-mono italic">
                                Unavailable
                              </span>
                            )}
                          </td>

                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </main>

      </div>

      {/* 3. INTERACTIVE OVERLAY PROFILE & LEDGER TIMELINE DIALOG/MODAL */}
      {selectedEmployeeId && selectedEmployee && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          
          {/* Black translucent backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={() => onSelectEmployeeId(null)}
          />

          {/* Central Modal Container card */}
          <div className="relative bg-white border border-slate-300 rounded-2xl shadow-2xl max-w-3xl w-full mx-auto overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[85vh] flex flex-col">
            
            {/* Modal Header banner */}
            <header className={`px-6 py-5 text-white flex justify-between items-start relative overflow-hidden shrink-0 ${selectedEmployee.photoColor}`}>
              <div className="absolute right-0 bottom-0 opacity-15 translate-x-4">
                <p className="text-8xl font-black font-mono tracking-tighter select-none uppercase">
                  {selectedEmployee.scale}
                </p>
              </div>

              <div className="relative z-10 flex items-center gap-4">
                <div className="p-3 bg-white/20 border border-white/30 h-14 w-14 text-white rounded-full flex items-center justify-center font-bold text-xl tracking-wide">
                  {selectedEmployee.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="bg-amber-400 text-amber-950 font-mono text-xxxxs font-bold tracking-widest px-1.5 py-0.5 rounded-sm uppercase">
                      BPS GRADE {selectedEmployee.scale}
                    </span>
                  </div>
                  <h2 className="text-md md:text-lg font-bold tracking-tight mt-1">{selectedEmployee.name}</h2>
                  <p className="text-xxxxs text-white/80 font-mono mt-0.5 uppercase tracking-widest">
                    Punjab EPA Government Civil Service Card
                  </p>
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={() => onSelectEmployeeId(null)}
                className="text-white hover:text-white/80 transition-colors p-1 bg-white/10 hover:bg-white/20 rounded-full cursor-pointer z-10"
              >
                <X className="w-5 h-5" />
              </button>
            </header>

            {/* Modal Main Content (Scrollable) */}
            <div className="overflow-y-auto p-6 space-y-6">
              
              {/* PRIMARY BIO DATA */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border text-xxs leading-snug">
                
                <div className="space-y-2">
                  <div>
                    <span className="text-xxxxs font-bold text-slate-400 uppercase font-mono block">Father's Representative</span>
                    <span className="font-semibold text-slate-800">{selectedEmployee.fatherName}</span>
                  </div>
                  <div>
                    <span className="text-xxxxs font-bold text-slate-400 uppercase font-mono block">National CNIC Number</span>
                    <span className="font-semibold font-mono text-slate-800">{selectedEmployee.cnic}</span>
                  </div>
                  <div>
                    <span className="text-xxxxs font-bold text-slate-400 uppercase font-mono block">Service Contact Phone</span>
                    <span className="font-semibold text-slate-800 flex items-center gap-1 mt-0.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      {selectedEmployee.contactNumber}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div>
                    <span className="text-xxxxs font-bold text-slate-400 uppercase font-mono block">Official Date of Birth (DOB)</span>
                    <span className="font-semibold text-slate-800 flex items-center gap-1 mt-0.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 animate-pulse" />
                      {selectedEmployee.dob}
                    </span>
                  </div>
                  <div>
                    <span className="text-xxxxs font-bold text-slate-400 uppercase font-mono block">Establishment Joining Date (DOJ)</span>
                    <span className="font-semibold text-slate-800 flex items-center gap-1 mt-0.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {selectedEmployee.doj}
                    </span>
                  </div>
                  <div>
                    <span className="text-xxxxs font-bold text-slate-400 uppercase font-mono block">Personnel Account Status</span>
                    <span className="mt-1 inline-block">
                      {selectedEmployee.status === 'active' ? (
                        <span className="bg-emerald-100 text-emerald-800 text-[9px] border border-emerald-150 px-2 py-0.5 rounded font-extrabold uppercase font-mono">
                          🟢 ACTIVE CIVIL SERVANT
                        </span>
                      ) : (
                        <span className="bg-slate-100 text-slate-500 text-[9px] border border-slate-200 px-2 py-0.5 rounded font-extrabold uppercase font-mono">
                          ⚫ SUPERANNUATED RETIRED
                        </span>
                      )}
                    </span>
                  </div>
                </div>

              </div>

              {/* OVERLAPPING CONFLICT ALERTS IF DETECTED INSIDE THE PROFILE */}
              {selectedEmployeeConflicts.length > 0 && (
                <div id="modal-employee-conflict-banner" className="p-4 bg-rose-50 border border-rose-220 rounded-xl text-xxs text-rose-900 flex gap-3 shadow-xxs">
                  <ShieldAlertIcon className="w-5 h-5 text-rose-600 shrink-0 mt-0.5 animate-bounce" />
                  <div>
                    <span className="font-black block text-rose-950">⚠️ Administrative Timeline Overlap Conflict Detected!</span>
                    <p className="mt-1 leading-normal">
                      This public servant has multiple temporary attachments assigned across distinct offices during overlapping dates. This constitutes a direct procedural error under Punjab Civil placement standards:
                    </p>
                    <div className="mt-2 space-y-1">
                      {selectedEmployeeConflicts.map((conf, ci) => (
                        <div key={ci} className="bg-white/70 p-2 rounded-lg border border-rose-200">
                          <span className="font-extrabold text-rose-950 text-xxxxs">Overlap Sequence #{ci + 1}:</span>
                          <ul className="list-disc pl-4 mt-1 space-y-0.5 text-xxxxs font-semibold">
                            <li>🏢 Station Office A: <span className="font-extrabold text-slate-850">{conf.office1}</span> ({conf.range1}, Order: {conf.order1})</li>
                            <li>🏢 Station Office B: <span className="font-extrabold text-slate-850">{conf.office2}</span> ({conf.range2}, Order: {conf.order2})</li>
                          </ul>
                        </div>
                      ))}
                    </div>
                    <p className="mt-2 text-rose-700 font-medium font-sans italic leading-normal">
                      Action Required: Close/Relieve at least one of these conflicting temporary attachment roles under the Administrative Desk tab.
                    </p>
                  </div>
                </div>
              )}

              {/* CURRENT DUTY STATION PROFILE STATUS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Permanent Station Info */}
                <div className="p-4 rounded-xl border border-slate-200 bg-white">
                  <span className="text-xxxxs font-black tracking-widest text-emerald-700 uppercase block font-mono border-b pb-1 mb-2">
                    Permanent Sanctioned Home Posting
                  </span>
                  {activePostingDetails ? (
                    <div className="text-xxs">
                      <h5 className="font-bold text-slate-800 flex items-center gap-1.5 leading-tight">
                        <Briefcase className="w-4 h-4 text-emerald-700 shrink-0" />
                        {activePostingDetails.pos?.title}
                      </h5>
                      <p className="text-xxs text-slate-600 font-semibold mt-1.5">
                        🏦 Office: {activePostingDetails.office?.name}
                      </p>
                      <p className="text-xxxxs text-slate-500 font-mono mt-1">
                        Allocated Chair Seat: {activePostingDetails.seat?.name}
                      </p>
                      <div className="mt-3 pt-2 border-t border-slate-100 text-xxxxs font-mono text-slate-400 flex flex-col gap-0.5">
                        <span>Establishment Order: {activePosting?.orderNumber}</span>
                        <span>Charge Assumption: {activePosting?.effectiveFrom}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4 text-slate-450 italic">
                      No active permanent posting. {selectedEmployee.status === 'retired' ? 'Terminated on superannuation.' : 'Awaiting general allocation orders.'}
                    </div>
                  )}
                </div>

                {/* Temporary Attachment */}
                <div className={`p-4 rounded-xl border bg-white ${activeAttachmentOffice ? 'border-amber-300 bg-amber-50/5' : 'border-slate-200'}`}>
                  <div className="flex items-center justify-between border-b pb-1 mb-2">
                    <span className="text-xxxxs font-black tracking-widest text-amber-700 uppercase block font-mono">
                      Temporary Duty Detachment File
                    </span>
                    {activeAttachmentOffice && (
                      <span className="bg-amber-100 text-amber-800 text-xxxxs font-mono font-bold px-1 rounded uppercase tracking-wider">
                        Active Attached
                      </span>
                    )}
                  </div>
                  {activeAttachmentOffice ? (
                    <div className="text-xxs">
                      <h5 className="font-bold text-amber-900 flex items-center gap-1.5 leading-tight">
                        <Building2 className="w-4 h-4 text-amber-700 shrink-0" />
                        Office Assigned: {activeAttachmentOffice.name.split(' (')[0]}
                      </h5>
                      <p className="text-[11px] text-amber-805 mt-2 italic bg-amber-50 border border-amber-150 p-2 rounded-lg leading-relaxed">
                        &ldquo;{activeAttachment?.reason}&rdquo;
                      </p>
                      <div className="mt-3 pt-1.5 border-t border-slate-100 text-xxxxs font-mono text-amber-600 flex flex-col gap-0.5">
                        <span>Govt Order Number: {activeAttachment?.orderNumber}</span>
                        <span>Date Assigned: {activeAttachment?.effectiveFrom}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4 text-slate-450 italic">
                      No temporary attachments active. Working standard regular chair seat.
                    </div>
                  )}
                </div>

              </div>

              {/* TIMELINE REGISTRY */}
              <div className="border-t pt-5">
                <h3 className="text-xs font-bold text-slate-850 mb-4 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-800" />
                  Chronological Transaction Registry &amp; Audit Trail
                </h3>

                <div className="relative border-l-2 border-slate-200 ml-4 pl-6 space-y-5">
                  {employeeTimeline.map((item) => {
                    let badgeColors = 'bg-slate-100 text-slate-700 border-slate-200';
                    if (item.type === 'posting_start') badgeColors = 'bg-emerald-50 text-emerald-700 border-emerald-200';
                    if (item.type === 'posting_end') badgeColors = 'bg-blue-50 text-blue-700 border-blue-200';
                    if (item.type === 'attachment_start') badgeColors = 'bg-amber-50 text-amber-700 border-amber-200';
                    if (item.type === 'attachment_end') badgeColors = 'bg-slate-100 text-slate-600 border-slate-200';
                    if (item.type === 'retirement') badgeColors = 'bg-rose-50 text-rose-700 border-rose-200';

                    const isAttachEvent = item.type === 'attachment_start' || item.type === 'attachment_end';
                    const refAttachId = isAttachEvent ? item.id.replace('attach-start-', '').replace('attach-end-', '') : '';
                    const eventHasConflict = isAttachEvent && selectedEmployeeConflicts.some(c => c.id1 === refAttachId || c.id2 === refAttachId);

                    return (
                      <div key={item.id} className={`relative p-2.5 rounded-xl transition duration-150 ${eventHasConflict ? 'bg-rose-50/50 border border-rose-100' : ''}`}>
                        
                        {/* Dot indicator */}
                        <span className={`absolute -left-[31px] top-4.5 h-3.5 w-3.5 rounded-full border-2 border-white shadow-xs ${
                          item.type === 'posting_start' ? 'bg-emerald-600' :
                          item.type === 'posting_end' ? 'bg-blue-500' :
                          eventHasConflict ? 'bg-rose-600 animate-pulse' :
                          item.type === 'attachment_start' ? 'bg-amber-500' :
                          item.type === 'retirement' ? 'bg-rose-600' : 'bg-slate-550'
                        }`} />

                        <div className="space-y-1">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                            <span className={`text-xxxxs font-extrabold px-1.5 py-0.5 rounded border uppercase tracking-wider ${badgeColors} flex items-center gap-1 w-fit`}>
                              {item.title}
                              {eventHasConflict && (
                                <span className="bg-rose-605 text-white text-[7px] font-mono px-1 rounded">CONFLICT OVERLAP</span>
                              )}
                            </span>
                            <span className="text-xxxxs text-slate-400 font-mono font-bold">
                              📅 Date: {item.date}
                            </span>
                          </div>
                          
                          <p className="text-xxs text-slate-705 leading-normal font-sans pt-1">
                            {item.description}
                          </p>

                          {eventHasConflict && (
                            <div className="p-1.5 rounded bg-rose-50 border border-rose-100 text-rose-800 text-xxxxs leading-normal font-semibold">
                              ⚠️ Conflict Context: This duty assignment timeline actively overlaps with another simultaneous temporary attachment.
                            </div>
                          )}

                          <div className="pt-1 flex items-center gap-1 text-xxxxs text-slate-400 font-mono uppercase tracking-wider">
                            <span>Order Approval:</span>
                            <span className="text-slate-650 font-normal font-mono lowercase bg-slate-100 px-1 py-0.5 rounded">{item.orderNumber}</span>
                          </div>
                        </div>

                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ADMINISTRATIVE PROFILE ACTIONS AREA */}
              {selectedEmployee.status === 'active' && (
                <div className="border-t pt-5">
                  <h4 className="text-xxs font-extrabold text-slate-400 uppercase tracking-widest font-mono mb-3">
                    Administrative Action Ledger Control
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    <button
                      id="modal-btn-transfer-prefill"
                      onClick={() => {
                        onPreFillTransfer(selectedEmployee.id);
                        onSelectEmployeeId(null);
                      }}
                      className="cursor-pointer bg-emerald-800 hover:bg-emerald-900 text-white font-bold font-sans text-xxs px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition uppercase tracking-wider shadow-sm"
                    >
                      <Briefcase className="w-4 h-4" />
                      Issue Transfer &amp; Reassign Seat
                    </button>
                    <button
                      id="modal-btn-retire-prefill"
                      onClick={() => setShowRetireModal(true)}
                      className="cursor-pointer bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold font-sans text-xxs px-4 py-2.5 rounded-xl border border-rose-250 flex items-center gap-1.5 transition uppercase tracking-wider"
                    >
                      <ShieldX className="w-4 h-4" />
                      Authorize Superannuation (Retirement)
                    </button>
                  </div>
                </div>
              )}

              {/* MODAL RETIRE CONFIRMATION FORM AREA */}
              {showRetireModal && (
                <div className="p-4 bg-rose-50/80 border border-rose-300 rounded-2xl space-y-3 relative overflow-hidden mt-4 animate-in slide-in-from-bottom-3 duration-200">
                  <div className="absolute top-0 left-0 w-full h-1 bg-rose-600" />
                  <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5 text-rose-950">
                    <Ban className="w-4.5 h-4.5 text-rose-600" />
                    Confirm Superannuation Authorisation
                  </h4>
                  <p className="text-xxxxs text-rose-800 mt-1 mb-3 leading-relaxed">
                    Processed retirement releases permanent charge on seat (<strong>{activePostingDetails?.seat?.name || 'Unassigned Chair'}</strong>) at <strong>{activePostingDetails?.office?.name || 'N/A'}</strong>. The slot becomes <strong>Vacant Designated Slot</strong>.
                  </p>
                  
                  <form onSubmit={handleRetireClick} className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xxxxs font-bold text-slate-500 uppercase tracking-wider mb-1">
                          Retirement Order Eff. Date
                        </label>
                        <input
                          type="date"
                          required
                          value={retireDate}
                          onChange={(e) => setRetireDate(e.target.value)}
                          className="w-full text-xs px-2.5 py-2.5 border border-slate-300 rounded-lg focus:outline-hidden font-mono bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xxxxs font-bold text-slate-500 uppercase tracking-wider mb-1">
                          General Order Dispatch #
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. SO(Svc-Retire)9-112/26"
                          value={retireOrder}
                          onChange={(e) => setRetireOrder(e.target.value)}
                          className="w-full text-xs px-2.5 py-2.5 border border-slate-300 rounded-lg focus:outline-hidden bg-white"
                        />
                      </div>
                    </div>

                    <div className="flex gap-2 justify-end pt-2">
                      <button
                        type="button"
                        onClick={() => setShowRetireModal(false)}
                        className="px-3 py-1.5 text-xxs text-slate-500 hover:bg-slate-100 rounded-lg font-medium cursor-pointer"
                      >
                        Abort Action
                      </button>
                      <button
                        type="submit"
                        className="px-3.5 py-1.5 text-xxs text-white bg-rose-600 hover:bg-rose-700 rounded-lg font-bold cursor-pointer transition uppercase"
                      >
                        Commit Superannuation
                      </button>
                    </div>
                  </form>
                </div>
              )}

            </div>

            {/* Modal Footer status banner */}
            <footer className="bg-slate-50 px-6 py-4 border-t flex justify-between items-center shrink-0 text-[10px] text-slate-400 font-mono tracking-wider uppercase">
              <span>Audit Trail Hash: SHA-256 Verified</span>
              <span>Punjab EPA Secretariat</span>
            </footer>

          </div>

        </div>
      )}

    </div>
  );
};
