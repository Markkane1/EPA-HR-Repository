import React from 'react';
import { Office, Position, Seat, Employee, Posting, Attachment } from '../domain/entities';
import { Building2, Award, Users, Pocket, Briefcase, Zap } from 'lucide-react';

interface MetricsProps {
  offices: Office[];
  positions: Position[];
  seats: Seat[];
  employees: Employee[];
  postings: Posting[];
  attachments: Attachment[];
}

export const Metrics: React.FC<MetricsProps> = ({
  offices,
  positions,
  seats,
  employees,
  postings,
  attachments,
}) => {
  // Calculated stats
  const totalOffices = offices.length;
  const totalPositions = positions.length;
  const totalSeats = seats.length;

  // Active postings right now (effectiveTo is null)
  const activePostings = postings.filter((p) => p.effectiveTo === null);
  const occupiedSeatsCount = activePostings.length;
  const vacantSeatsCount = Math.max(0, totalSeats - occupiedSeatsCount);

  // Active employees
  const activeEmployees = employees.filter((e) => e.status === 'active').length;

  // Active temporary attachments right now (effectiveTo is null)
  const activeAttachmentsCount = attachments.filter((a) => a.effectiveTo === null).length;

  const statItems = [
    {
      id: "metric-offices",
      label: 'Offices Registered',
      value: totalOffices,
      description: 'Directorates & Field offices',
      icon: Building2,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-100',
    },
    {
      id: "metric-positions",
      label: 'Designated Titles',
      value: totalPositions,
      description: 'BS-16 to BS-19 designations',
      icon: Award,
      color: 'text-indigo-600 bg-indigo-50 border-indigo-100',
    },
    {
      id: "metric-seats",
      label: 'Sanctioned Seats',
      value: totalSeats,
      description: `${occupiedSeatsCount} Occupied • ${vacantSeatsCount} Vacant`,
      icon: Briefcase,
      color: 'text-amber-600 bg-amber-50 border-amber-100',
    },
    {
      id: "metric-active-personnel",
      label: 'Active Personnel',
      value: activeEmployees,
      description: `${employees.filter(e => e.status === 'retired').length} Retired / Transferred`,
      icon: Users,
      color: 'text-sky-600 bg-sky-50 border-sky-100',
    },
    {
      id: "metric-attachments",
      label: 'Active Attachments',
      value: activeAttachmentsCount,
      description: 'Temporary field support',
      icon: Zap,
      color: 'text-rose-600 bg-rose-50 border-rose-100',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
      {statItems.map((item) => {
        const IconComponent = item.icon;
        return (
          <div
            key={item.id}
            id={item.id}
            className={`p-4 rounded-xl border bg-white shadow-xs flex items-start space-x-4 transition hover:shadow-md`}
          >
            <div className={`p-3 rounded-lg ${item.color.split(' ')[1]} ${item.color.split(' ')[0]}`}>
              <IconComponent className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                {item.label}
              </p>
              <h3 className="text-2xl font-bold font-mono text-slate-800 mt-1">
                {item.value}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {item.description}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
