import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Building2, 
  Users2, 
  ShieldAlert, 
  Menu,
  X,
  LogOut,
  Bell,
  Settings
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Office Register', href: '/admin/offices', icon: Building2 },
  { name: 'Personnel', href: '/admin/personnel', icon: Users2 },
  { name: 'Admin Desk', href: '/admin/desk', icon: ShieldAlert },
];

export function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-800">
      
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden" 
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-blue-950 text-white flex flex-col transition-transform duration-300 ease-in-out shadow-2xl
        lg:static lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Brand */}
        <div className="flex items-center justify-between p-6 border-b border-blue-900/50">
          <div className="flex items-center gap-3">
            <div className="bg-white p-2 rounded-xl shadow-inner border border-amber-500/20">
              <span className="text-blue-950 font-black text-xs font-serif uppercase leading-none block text-center">
                Govt.<br/>Punjab
              </span>
            </div>
            <div>
              <span className="text-xs text-blue-200 font-serif italic block leading-tight">
                EPA Registry
              </span>
              <span className="font-bold tracking-wide text-sm text-white">Admin Portal</span>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-blue-200 hover:text-white transition">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          <p className="px-4 text-xs font-bold uppercase tracking-wider text-blue-400 mb-4">Modules</p>
          {navigation.map((item) => {
            const isActive = location.pathname === item.href || (item.href !== '/admin' && location.pathname.startsWith(item.href));
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 group
                  ${isActive 
                    ? 'bg-amber-500 text-amber-950 shadow-md translate-x-1' 
                    : 'text-blue-100 hover:bg-blue-900 hover:text-white'}
                `}
              >
                <item.icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110' : 'group-hover:scale-110 opacity-80'}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-blue-900/50">
          <div className="bg-blue-900 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-800 flex items-center justify-center font-bold text-sm border border-blue-700 shadow-inner">
                JD
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-white">Jane Doe</span>
                <span className="text-xs text-blue-300">Director HR</span>
              </div>
            </div>
            <button className="text-blue-300 hover:text-rose-400 transition" title="Log Out">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-h-0 overflow-hidden relative">
        
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-30 px-4 md:px-8 py-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 text-slate-500 hover:text-slate-800 transition">
              <Menu className="w-6 h-6" />
            </button>
            <div>
              <h2 className="text-xl font-black tracking-tight text-slate-800">
                {navigation.find(n => n.href === location.pathname)?.name || 'Dashboard'}
              </h2>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative p-2 text-slate-500 hover:text-blue-600 transition bg-slate-100 hover:bg-blue-50 rounded-full">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border border-white"></span>
            </button>
            <button className="p-2 text-slate-500 hover:text-blue-600 transition bg-slate-100 hover:bg-blue-50 rounded-full">
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Outlet />
          </div>
        </div>
      </main>

    </div>
  );
}
