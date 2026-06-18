import { Users2, Building2, Briefcase, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../ui/components/Card';

export function DashboardHome() {
  const stats = [
    { label: 'Total Personnel', value: '2,451', icon: Users2, trend: '+12%', color: 'text-blue-600', bg: 'bg-blue-100' },
    { label: 'Active Offices', value: '48', icon: Building2, trend: 'Stable', color: 'text-emerald-600', bg: 'bg-emerald-100' },
    { label: 'Open Positions', value: '156', icon: Briefcase, trend: '-5%', color: 'text-amber-600', bg: 'bg-amber-100' },
    { label: 'Pending Transfers', value: '32', icon: FileText, trend: '+8%', color: 'text-rose-600', bg: 'bg-rose-100' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black tracking-tight text-slate-900">Executive Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">Overview of the EPA Personnel & Ledger System</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <Card key={i} className="border-none shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">{stat.label}</p>
                    <p className="text-3xl font-black mt-2 text-slate-800">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <span className={`font-bold ${stat.trend.startsWith('+') ? 'text-emerald-600' : stat.trend.startsWith('-') ? 'text-rose-600' : 'text-slate-500'}`}>
                    {stat.trend}
                  </span>
                  <span className="text-slate-500 ml-2">from last month</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Activity & Charts Placeholder */}
      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-none shadow-md">
          <CardHeader>
            <CardTitle>Personnel Distribution</CardTitle>
            <CardDescription>Staff allocation across regional offices</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center h-64 bg-slate-50/50 rounded-b-2xl border-t border-slate-100">
            <p className="text-sm text-slate-400 font-medium flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Chart Visualization Area
            </p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md">
          <CardHeader>
            <CardTitle>Recent Updates</CardTitle>
            <CardDescription>Latest system activities</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="p-4 hover:bg-slate-50 transition-colors">
                  <p className="text-sm font-bold text-slate-800">New Transfer Order Issued</p>
                  <p className="text-xs text-slate-500 mt-1">John Doe transferred to Lahore Head Office.</p>
                  <p className="text-xs text-slate-400 mt-2 font-mono">2 hours ago</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
