import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Building, ArrowRightLeft, Paperclip, UserPlus, LogOut } from 'lucide-react';
import { useAuthContext } from '../contexts/AuthContext';

export const MainLayout = () => {
  const location = useLocation();
  const { currentUser, isAdmin, logout } = useAuthContext();

  const navLinks = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Employees', path: '/employees', icon: Users },
    { name: 'Offices', path: '/offices', icon: Building },
    ...(isAdmin ? [
      { name: 'New Transfer', path: '/transfers/new', icon: ArrowRightLeft },
      { name: 'New Attachment', path: '/attachments/new', icon: Paperclip },
    ] : [])
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col shadow-sm z-20">
        <div className="h-16 flex flex-col justify-center px-6 bg-[#1e3a5f] text-white">
          <span className="font-bold tracking-wider text-lg">EPA PUNJAB</span>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path || (link.path !== '/' && location.pathname.startsWith(link.path));
            return (
              <Link
                key={link.name}
                to={link.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${isActive ? 'bg-blue-50 text-blue-700 shadow-sm' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-blue-700' : 'text-gray-400'}`} />
                {link.name}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-[#1e3a5f] shadow-md flex justify-between items-center px-8 z-10 text-white shrink-0">
          <h1 className="text-xl font-semibold tracking-wide">Personnel Repository</h1>
          
          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-sm font-bold">{currentUser?.name}</p>
              <p className="text-xs text-blue-200 uppercase tracking-wider">{currentUser?.role}</p>
            </div>
            <button 
              onClick={logout}
              className="flex items-center gap-2 text-sm font-medium text-blue-200 hover:text-white transition-colors border-l border-blue-800 pl-6 py-2"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
