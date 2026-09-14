'use client';

import React, { useState } from 'react';
import { Wallet, Sparkles, Lock, Mail, User, Eye, EyeOff, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { AppUser } from '@/lib/types';
import { loginUser, signupUser } from '@/lib/appwrite';
import { useTheme } from '@/components/ThemeProvider';

interface AuthScreenProps {
  onLoginSuccess: (user: AppUser) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLoginSuccess }) => {
  const { theme, toggleTheme } = useTheme();
  const [tab, setTab] = useState<'login' | 'signup'>('login');
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email || !password) {
      setErrorMessage('Email dan password wajib diisi.');
      return;
    }

    if (tab === 'signup' && !name) {
      setErrorMessage('Nama lengkap wajib diisi untuk pendaftaran.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password minimal 6 karakter.');
      return;
    }

    setLoading(true);

    try {
      if (tab === 'login') {
        const res = await loginUser(email, password);
        if (res.success && res.user) {
          onLoginSuccess(res.user);
        } else {
          setErrorMessage(res.error || 'Gagal masuk. Periksa email dan password Anda.');
        }
      } else {
        const res = await signupUser(email, password, name);
        if (res.success && res.user) {
          onLoginSuccess(res.user);
        } else {
          setErrorMessage(res.error || 'Gagal mendaftar. Silakan coba lagi.');
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Terjadi kesalahan pada sistem.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 dark:bg-slate-950 flex flex-col justify-center items-center p-4 sm:p-6 transition-colors duration-300 relative overflow-hidden">
      
      {/* Background Glow Accents */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full z-10">
        
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-500 p-1 shadow-xl shadow-emerald-500/20 mb-4 animate-bounce-subtle">
            <div className="w-full h-full bg-white dark:bg-slate-950 rounded-[22px] flex items-center justify-center">
              <Wallet className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
          
          <h1 className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 dark:from-white dark:via-slate-100 dark:to-slate-300 tracking-tight">
            Frugalify
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium max-w-xs mx-auto">
            Aplikasi Rekap Keuangan Personal & Portofolio Saham Real-Time
          </p>
        </div>

        {/* Main Card */}
        <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-200/90 dark:border-slate-800 shadow-2xl bg-white/90 dark:bg-slate-900/80 backdrop-blur-xl">
          
          {/* Tab Switcher */}
          <div className="flex bg-slate-100 dark:bg-slate-950 p-1.5 rounded-2xl mb-6 border border-slate-200/80 dark:border-slate-800">
            <button
              type="button"
              onClick={() => { setTab('login'); setErrorMessage(''); }}
              className={`flex-1 py-3 rounded-xl font-extrabold text-xs sm:text-sm transition-all duration-200 ${
                tab === 'login'
                  ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-md'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              Masuk Akun
            </button>
            <button
              type="button"
              onClick={() => { setTab('signup'); setErrorMessage(''); }}
              className={`flex-1 py-3 rounded-xl font-extrabold text-xs sm:text-sm transition-all duration-200 ${
                tab === 'signup'
                  ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-md'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              Daftar Akun Baru
            </button>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="mb-5 p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {tab === 'signup' && (
              <div>
                <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1.5">
                  Nama Lengkap
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="e.g. Budi Santoso"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 font-medium"
                  />
                  <User className="w-5 h-5 absolute left-3.5 top-3.5 text-slate-400" />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1.5">
                Alamat Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="nama@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 font-medium"
                />
                <Mail className="w-5 h-5 absolute left-3.5 top-3.5 text-slate-400" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-11 py-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 font-medium"
                />
                <Lock className="w-5 h-5 absolute left-3.5 top-3.5 text-slate-400" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 mt-2 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-extrabold text-sm shadow-xl shadow-emerald-500/25 transition-all duration-300 flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>{tab === 'login' ? 'Masuk ke Keuangan Saya' : 'Daftar & Mulai'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Feature Highlights */}
          <div className="mt-6 pt-5 border-t border-slate-200/80 dark:border-slate-800 grid grid-cols-2 gap-2 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>Universal AI Scan</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-teal-500 shrink-0" />
              <span>Portofolio Live Saham</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-cyan-500 shrink-0" />
              <span>Sync Lintas Device</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>Privasi Aman 100%</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
