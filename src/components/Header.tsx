'use client';

import React, { useState } from 'react';
import { Wallet, Settings, RefreshCw, Sun, Moon, Eye, EyeOff, Activity, LogOut, LogIn } from 'lucide-react';
import { FinancialLivingScore, AppUser } from '@/lib/types';
import { useTheme } from '@/components/ThemeProvider';
import { usePrivacy } from '@/components/PrivacyProvider';
import { isAppwriteConfigured } from '@/lib/appwrite';

interface HeaderProps {
  score: FinancialLivingScore;
  onOpenSettings: () => void;
  onRefreshData: () => void;
  isRefreshing: boolean;
  currentUser: AppUser | null;
  onOpenAuth: () => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  score,
  onOpenSettings,
  onRefreshData,
  isRefreshing,
  currentUser,
  onOpenAuth,
  onLogout,
}) => {
  const { theme, toggleTheme } = useTheme();
  const { isPrivacyMode, togglePrivacyMode } = usePrivacy();
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const getScoreColorBadge = () => {
    if (score.score >= 80) return 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30';
    if (score.score >= 55) return 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30';
    return 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30';
  };

  return (
    <header className="sticky top-0 z-30 w-full glass-panel border-b border-slate-200/80 dark:border-slate-800/80 px-3 sm:px-6 py-2.5 sm:py-3 transition-colors duration-300">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
        
        {/* Left: Brand Logo & Title */}
        <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-500 p-0.5 shadow-md shadow-emerald-500/20 shrink-0 flex items-center justify-center">
            <div className="w-full h-full bg-white dark:bg-slate-950 rounded-[10px] flex items-center justify-center transition-colors">
              <Wallet className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
          
          <div className="min-w-0">
            <div className="flex items-center space-x-1.5">
              <h1 className="text-base sm:text-lg font-black bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-slate-700 to-slate-800 dark:from-white dark:via-slate-100 dark:to-slate-300 tracking-tight truncate">
                Frugalify
              </h1>
              <span className="hidden xs:inline-flex items-center px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-[10px] font-extrabold border border-emerald-500/20">
                All-in-One
              </span>
            </div>
            <p className="hidden sm:block text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate">
              Rekap Keuangan Personal & Portfolio Saham Real-Time
            </p>
          </div>
        </div>

        {/* Right: Actions Glass Toolbar */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          
          {/* User Auth Chip / Button */}
          <div className="relative">
            {currentUser ? (
              <div className="relative">
                {/* Avatar Chip — mobile: hanya ikon inisial, sm+: tampilkan nama */}
                <button
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="flex items-center gap-1.5 pl-1 pr-2 sm:px-2.5 py-1 sm:py-1.5 rounded-full sm:rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-all"
                  title={currentUser.name}
                >
                  <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-500 text-white flex items-center justify-center text-[11px] font-black uppercase shrink-0 shadow-sm shadow-emerald-500/30">
                    {currentUser.name ? currentUser.name.charAt(0) : 'U'}
                  </div>
                  <span className="hidden sm:block max-w-[100px] truncate text-xs font-bold text-slate-800 dark:text-slate-200">{currentUser.name}</span>
                </button>

                {/* User Dropdown — fixed agar tidak terpotong di layar kecil */}
                {showUserDropdown && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowUserDropdown(false)} />
                    {/* Gunakan fixed + right-3 top-14 agar selalu di dalam viewport */}
                    <div className="fixed right-3 top-14 w-56 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl shadow-slate-900/20 z-50 overflow-hidden">
                      {/* Header info user */}
                      <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border-b border-slate-100 dark:border-slate-800">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-500 text-white flex items-center justify-center text-base font-black uppercase shrink-0 shadow-md shadow-emerald-500/30">
                          {currentUser.name ? currentUser.name.charAt(0) : 'U'}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{currentUser.name}</p>
                          <p className="text-[10px] text-slate-400 truncate">{currentUser.email}</p>
                        </div>
                      </div>
                      {/* Actions */}
                      <div className="p-2">
                        <button
                          onClick={() => {
                            setShowUserDropdown(false);
                            onLogout();
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-bold transition-colors"
                        >
                          <LogOut className="w-4 h-4 shrink-0" />
                          <span>Keluar (Logout)</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-xs font-bold shadow-md shadow-emerald-500/20 active:scale-95 transition-all"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Masuk</span>
              </button>
            )}
          </div>

          {/* Mini Mobile Score Badge */}
          <div className={`flex items-center gap-1 px-2 py-1 rounded-xl text-[10px] font-black border ${getScoreColorBadge()}`}>
            <Activity className="w-3 h-3" />
            <span>{score.score}</span>
          </div>

          {/* Action Icon Group Container */}
          <div className="flex items-center gap-1 p-1 rounded-2xl bg-slate-100/90 dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800/90 shadow-inner">
            
            {/* Privacy Mode Sensor Toggle */}
            <button
              onClick={togglePrivacyMode}
              className={`p-1.5 sm:p-2 rounded-xl transition-all active:scale-90 ${
                isPrivacyMode
                  ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/40 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800'
              }`}
              title={isPrivacyMode ? 'Sensor Nominal Uang Aktif (Klik untuk buka)' : 'Aktifkan Sensor Privasi Nominal Uang'}
            >
              {isPrivacyMode ? (
                <EyeOff className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500 animate-pulse" />
              ) : (
                <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              )}
            </button>

            {/* Dark / Light Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-1.5 sm:p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-all active:scale-90"
              title={theme === 'dark' ? 'Ganti ke Light Mode' : 'Ganti ke Dark Mode'}
            >
              {theme === 'dark' ? (
                <Sun className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 transition-transform hover:rotate-45" />
              ) : (
                <Moon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-600 transition-transform hover:-rotate-12" />
              )}
            </button>



            {/* Live Data Refresh Button */}
            <button
              onClick={onRefreshData}
              disabled={isRefreshing}
              className="p-1.5 sm:p-2 rounded-xl text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 hover:bg-emerald-500/10 transition-all active:scale-90 disabled:opacity-50"
              title="Refresh Data Live Financial & Saham"
            >
              <RefreshCw className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isRefreshing ? 'animate-spin text-emerald-500' : ''}`} />
            </button>

            {/* Settings Modal Button */}
            <button
              onClick={onOpenSettings}
              className="p-1.5 sm:p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-all active:scale-90"
              title="Pengaturan Saldo & Budget"
            >
              <Settings className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
