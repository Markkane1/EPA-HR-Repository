import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Building, Shield, UserCog, LogOut, ChevronRight } from 'lucide-react';
import { useAuthContext } from '../contexts/AuthContext';

interface NavLink {
  name: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  permission?: string;
  section?: string;
}

const allNavLinks: NavLink[] = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard, permission: 'dashboard.read' },
  { name: 'Employees', path: '/employees', icon: Users, permission: 'employees.read' },
  { name: 'Offices', path: '/offices', icon: Building, permission: 'offices.read' },
  { name: 'User Management', path: '/settings/users', icon: UserCog, permission: 'users.read', section: 'Settings' },
  { name: 'Role Management', path: '/settings/roles', icon: Shield, permission: 'roles.write', section: 'Settings' },
];

export const MainLayout = () => {
  const location = useLocation();
  const { currentUser, hasPermission, logout } = useAuthContext();

  const visibleLinks = allNavLinks.filter(link => !link.permission || hasPermission(link.permission));

  const mainLinks = visibleLinks.filter(l => !l.section);
  const settingsLinks = visibleLinks.filter(l => l.section === 'Settings');

  const renderLink = (link: NavLink) => {
    const Icon = link.icon;
    const isActive = location.pathname === link.path || (link.path !== '/' && location.pathname.startsWith(link.path));
    return (
      <Link
        key={link.name}
        to={link.path}
        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group ${
          isActive
            ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
            : 'text-slate-300 hover:bg-slate-700 hover:text-white'
        }`}
      >
        <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'}`} />
        <span className="flex-1">{link.name}</span>
        {isActive && <ChevronRight className="w-4 h-4 opacity-60" />}
      </Link>
    );
  };

  return (
    <div className="flex h-screen bg-slate-100">
      {/* Sidebar */}
      <div className="w-64 bg-slate-900 flex flex-col shadow-2xl z-20 flex-shrink-0">
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-slate-700/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-xs">EPA</span>
            </div>
            <div>
              <p className="text-white font-bold text-sm tracking-wide leading-none">EPA Punjab</p>
              <p className="text-slate-400 text-xs mt-0.5">HR Repository</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
          {mainLinks.map(renderLink)}

          {settingsLinks.length > 0 && (
            <div className="pt-4 mt-4 border-t border-slate-700/50">
              <p className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Settings</p>
              {settingsLinks.map(renderLink)}
            </div>
          )}
        </nav>

        {/* User Info */}
        <div className="border-t border-slate-700/50 p-3">
          <div className="flex items-center gap-3 px-2 py-2 rounded-lg">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs font-bold">
                {currentUser?.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">{currentUser?.name}</p>
              <p className="text-slate-400 text-xs truncate">{currentUser?.role?.name || 'No Role'}</p>
            </div>
            <button
              onClick={logout}
              title="Sign Out"
              className="text-slate-400 hover:text-red-400 transition-colors p-1 rounded"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-slate-200 flex justify-between items-center px-8 z-10 shadow-sm flex-shrink-0">
          <div>
            <h1 className="text-lg font-semibold text-slate-800">
              {allNavLinks.find(l => l.path === location.pathname || (l.path !== '/' && location.pathname.startsWith(l.path)))?.name || 'EPA Punjab HR'}
            </h1>
            <p className="text-xs text-slate-400">Personnel Repository System</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-semibold text-slate-700">{currentUser?.name}</p>
              <p className="text-xs text-blue-600 font-medium">{currentUser?.role?.name || '—'}</p>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6 bg-slate-50">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
