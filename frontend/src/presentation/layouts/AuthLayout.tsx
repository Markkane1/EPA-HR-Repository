import { Outlet } from 'react-router-dom';

export function AuthLayout() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob" />
        <div className="absolute top-40 -left-40 w-96 h-96 bg-amber-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000" />
        <div className="absolute -bottom-40 left-20 w-96 h-96 bg-emerald-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000" />
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-950 text-white mb-4 shadow-xl shadow-blue-900/20">
            <span className="text-2xl font-serif font-bold">EPA</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Admin Dashboard</h1>
          <p className="text-sm text-slate-500 mt-2">Sign in to manage personnel and records</p>
        </div>

        {/* Dynamic Route Outlet for Login/Register forms */}
        <div className="bg-white/80 backdrop-blur-xl border border-white rounded-3xl shadow-2xl p-8 relative overflow-hidden">
          {/* subtle glass sheen */}
          <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-white/40 pointer-events-none" />
          
          <div className="relative z-10">
            <Outlet />
          </div>
        </div>

        {/* Footer info */}
        <p className="text-center text-xs text-slate-400 mt-8 font-medium">
          &copy; {new Date().getFullYear()} Government of Punjab. All rights reserved.
        </p>
      </div>
    </div>
  );
}
