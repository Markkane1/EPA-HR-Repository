import { useState, useRef, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuthContext } from '../contexts/AuthContext';

interface NavLink {
  name: string;
  path: string;
  faIcon: string;
  permission?: string;
  section?: string;
}

const allNavLinks: NavLink[] = [
  { name: 'Dashboard',       path: '/',                faIcon: 'fas fa-fw fa-tachometer-alt', permission: 'dashboard.read' },
  { name: 'Employees',       path: '/employees',       faIcon: 'fas fa-fw fa-users',          permission: 'employees.read' },
  { name: 'Offices',         path: '/offices',         faIcon: 'fas fa-fw fa-building',       permission: 'offices.read' },
  { name: 'Reports',         path: '/reports',         faIcon: 'fas fa-fw fa-chart-bar',      permission: 'dashboard.read' },
  { name: 'User Management', path: '/settings/users',  faIcon: 'fas fa-fw fa-user-cog',       permission: 'users.read',  section: 'Settings' },
  { name: 'Role Management', path: '/settings/roles',  faIcon: 'fas fa-fw fa-shield-alt',     permission: 'roles.write', section: 'Settings' },
];

export const MainLayout = () => {
  const location = useLocation();
  const { currentUser, hasPermission, logout } = useAuthContext();
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(() => window.innerWidth >= 768);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const visibleLinks = allNavLinks.filter(link => !link.permission || hasPermission(link.permission));
  const mainLinks = visibleLinks.filter(l => !l.section);
  const settingsLinks = visibleLinks.filter(l => l.section === 'Settings');

  const isActive = (path: string) =>
    path === '/'
      ? location.pathname === '/'
      : location.pathname.startsWith(path);

  const currentPageName =
    allNavLinks.find(l => isActive(l.path))?.name || 'EPA Punjab HR';

  const userInitials = currentUser?.name
    ? currentUser.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : 'U';

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const renderNavLink = (link: NavLink) => {
    const active = isActive(link.path);
    return (
      <li key={link.name} className="relative">
        <Link 
          onClick={() => {
            if (window.innerWidth < 768) {
              setSidebarOpen(false);
            }
          }}
          className={`flex ${sidebarOpen ? 'flex-row items-center gap-3 px-4 py-3' : 'flex-col items-center justify-center gap-1 px-2 py-3'} mx-2 rounded-md transition-colors ${active ? 'bg-white/10 text-white font-bold' : 'text-white/80 hover:text-white hover:bg-white/5'}`} 
          to={link.path}
        >
          <i className={`${link.faIcon} text-center ${sidebarOpen ? 'w-5 text-base' : 'text-lg'} ${active ? 'text-white' : 'text-white/70'}`}></i>
          <span className={`${sidebarOpen ? 'text-sm' : 'text-[0.65rem] text-center w-full leading-tight'}`}>{link.name}</span>
        </Link>
      </li>
    );
  };

  return (
    <div className="flex w-full min-h-screen bg-[#f8f9fc] font-sans text-[#858796]">

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ========== SIDEBAR ========== */}
      <div 
        className={`bg-gradient-to-b from-[#4e73df] to-[#224abe] flex-shrink-0 flex-col transition-all duration-300 ease-in-out z-30
          fixed md:relative inset-y-0 left-0 h-full
          ${sidebarOpen ? 'w-[14rem] translate-x-0 flex' : '-translate-x-full md:translate-x-0 w-[14rem] md:w-[6.5rem] hidden md:flex'}
        `}
      >
        {/* Sidebar Brand */}
        <Link
          className="flex items-center justify-center h-[4.375rem] text-white no-underline font-bold text-lg px-4"
          to="/"
        >
          <div className="text-3xl rotate-[-15deg] mr-2">
            <i className="fas fa-leaf"></i>
          </div>
          <div className={`whitespace-nowrap ${sidebarOpen ? 'block' : 'hidden md:hidden'}`}>
            EPA Punjab <sup className="font-normal text-sm">HR</sup>
          </div>
        </Link>

        <hr className="border-white/15 my-0 mx-4" />

        <ul className="flex flex-col gap-1 py-4 m-0 p-0 list-none">
          {/* Main Nav Links */}
          {mainLinks.map(renderNavLink)}

          {/* Settings Section */}
          {settingsLinks.length > 0 && (
            <>
              <hr className="border-white/15 my-3 mx-4" />
              <div className={`text-white/40 text-[0.65rem] font-bold uppercase px-6 pb-2 ${sidebarOpen ? 'block' : 'hidden'}`}>Settings</div>
              {settingsLinks.map(renderNavLink)}
            </>
          )}
        </ul>

        {/* Sidebar Toggler */}
        <div className="mt-auto pb-4 flex justify-center hidden md:flex">
          <button 
            className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 text-white border-0 flex items-center justify-center transition-colors"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <i className={`fas fa-angle-${sidebarOpen ? 'left' : 'right'}`}></i>
          </button>
        </div>
      </div>
      {/* ========== END SIDEBAR ========== */}

      {/* ========== CONTENT WRAPPER ========== */}
      <div className="flex flex-col flex-1 overflow-hidden">

        {/* Main Content */}
        <div className="flex-1 flex flex-col">

          {/* ========== TOPBAR ========== */}
          <nav className="h-[4.375rem] bg-white flex items-center justify-between px-6 shadow-[0_.15rem_1.75rem_0_rgba(58,59,69,.15)] z-10 mb-6">

            {/* Sidebar Toggle (Mobile) */}
            <button
              className="md:hidden text-primary bg-transparent border-0 mr-3"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <i className="fa fa-bars text-xl"></i>
            </button>

            {/* Page Title (desktop) */}
            <span className="hidden sm:block text-[#5a5c69] font-bold mr-auto">
              {currentPageName}
            </span>

            {/* Topbar Navbar */}
            <ul className="flex items-center m-0 p-0 list-none ml-auto h-full">

              <div className="hidden sm:block w-[1px] h-8 bg-[#e3e6f0] mx-4"></div>

              {/* User Dropdown */}
              <li className="relative h-full flex items-center" ref={dropdownRef}>
                <button
                  className="flex items-center gap-3 bg-transparent border-0 h-full px-2 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => setUserDropdownOpen(o => !o)}
                >
                  <span className="hidden lg:block text-[#858796] text-sm">
                    {currentUser?.name}
                  </span>
                  {/* Avatar circle */}
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-br from-primary to-gray-400 text-white font-bold text-xs shadow-sm"
                  >
                    {userInitials}
                  </div>
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded shadow-lg py-2 border border-gray-100 animate-fade-in origin-top-right z-50">
                    <div className="px-4 py-2 text-center border-b border-gray-100 mb-2">
                      <strong className="text-[#5a5c69] text-sm">{currentUser?.name}</strong>
                      <br />
                      <span className="text-xs text-gray-500">{currentUser?.role?.name || 'No Role'}</span>
                    </div>
                    <button
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors flex items-center gap-2"
                      onClick={() => { setUserDropdownOpen(false); logout(); }}
                    >
                      <i className="fas fa-sign-out-alt fa-sm fa-fw text-red-400"></i>
                      Logout
                    </button>
                  </div>
                )}
              </li>
            </ul>
          </nav>
          {/* ========== END TOPBAR ========== */}

          {/* ========== PAGE CONTENT ========== */}
          <div className="px-4 sm:px-6 w-full flex-1">
            <Outlet />
          </div>
          {/* ========== END PAGE CONTENT ========== */}

        </div>

        {/* Footer */}
        <footer className="bg-white py-6 mt-auto">
          <div className="container mx-auto">
            <div className="text-center text-sm text-gray-500">
              <span>
                &copy; {new Date().getFullYear()} Government of Punjab &mdash; EPA HR Repository
              </span>
            </div>
          </div>
        </footer>

      </div>
      {/* ========== END CONTENT WRAPPER ========== */}

    </div>
  );
};
