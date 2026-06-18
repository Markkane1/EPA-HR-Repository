import React, { useMemo, useState } from 'react';
import { ArrowRight, Lock, ShieldCheck, UserPlus } from 'lucide-react';

interface AuthPageProps {
  onSignIn: (email: string, password: string) => void;
  onRegister: (name: string, email: string, password: string) => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onSignIn, onRegister }) => {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const title = useMemo(() => (mode === 'signin' ? 'Sign in to the EPA Admin Console' : 'Create your EPA access account'), [mode]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (mode === 'signin') {
      onSignIn(email.trim(), password);
      return;
    }

    onRegister(name.trim(), email.trim(), password);
  };

  return (
    <section className="min-h-[70vh] rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <article className="rounded-3xl bg-gradient-to-br from-blue-950 via-blue-900 to-slate-900 p-6 text-white">
          <p className="text-[10px] uppercase tracking-[0.25em] text-blue-100/90 font-mono">Secure Access</p>
          <h2 className="mt-3 text-2xl font-black tracking-tight">Punjab EPA personnel portal</h2>
          <p className="mt-3 max-w-md text-sm text-blue-100/85">Use the secure sign-in and registration pages to access the personnel registry, office modules, and approval desk.</p>
          <ul className="mt-6 space-y-3 text-xs text-blue-100/90">
            <li className="flex items-start gap-2"><ShieldCheck className="mt-0.5 h-4 w-4 text-amber-300" />Role-based access for administrators, officers, and HR reviewers.</li>
            <li className="flex items-start gap-2"><Lock className="mt-0.5 h-4 w-4 text-amber-300" />Password-protected entry to the EPA operations workspace.</li>
            <li className="flex items-start gap-2"><UserPlus className="mt-0.5 h-4 w-4 text-amber-300" />Quick account creation for new department users.</li>
          </ul>
        </article>

        <article className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
          <div className="flex items-center justify-between gap-3 border-b border-slate-200 pb-4">
            <div>
              <p className="text-[10px] uppercase tracking-[0.25em] text-slate-400 font-mono">Authentication</p>
              <h3 className="text-xl font-black text-slate-900">{title}</h3>
            </div>
            <div className="rounded-full bg-white border border-slate-200 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-slate-500 font-mono">Demo mode</div>
          </div>

          <div className="mt-4 flex rounded-xl border border-slate-200 bg-white p-1">
            <button
              type="button"
              onClick={() => setMode('signin')}
              className={`flex-1 rounded-lg px-3 py-2 text-xs font-bold uppercase tracking-[0.18em] ${mode === 'signin' ? 'bg-blue-950 text-white' : 'text-slate-500 hover:bg-slate-100'}`}
            >
              Sign in
            </button>
            <button
              type="button"
              onClick={() => setMode('signup')}
              className={`flex-1 rounded-lg px-3 py-2 text-xs font-bold uppercase tracking-[0.18em] ${mode === 'signup' ? 'bg-blue-950 text-white' : 'text-slate-500 hover:bg-slate-100'}`}
            >
              Register
            </button>
          </div>

          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            {mode === 'signup' && (
              <label className="block text-xs text-slate-600">
                <span className="mb-1 block text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 font-mono">Full name</span>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 shadow-xs focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  placeholder="e.g. Ali Khan"
                />
              </label>
            )}

            <label className="block text-xs text-slate-600">
              <span className="mb-1 block text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 font-mono">Official email</span>
              <input
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 shadow-xs focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
                placeholder="user@epa.gov.pk"
              />
            </label>

            <label className="block text-xs text-slate-600">
              <span className="mb-1 block text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 font-mono">Password</span>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 shadow-xs focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
                placeholder={mode === 'signin' ? 'Enter your password' : 'Create a secure password'}
              />
            </label>

            <button
              type="submit"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-3 text-xs font-black uppercase tracking-[0.2em] text-white transition hover:bg-emerald-800"
            >
              {mode === 'signin' ? 'Sign in to portal' : 'Create account'}
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <p className="mt-4 text-[11px] text-slate-500">Tip: this demo flow stores your session locally so the dashboard remains accessible after login.</p>
        </article>
      </div>
    </section>
  );
};
