'use client';

import React from 'react';
import { Wallet, Sparkles, Settings, ShieldCheck, RefreshCw, BarChart3, Sun, Moon, Eye, EyeOff } from 'lucide-react';
import { FinancialLivingScore } from '@/lib/types';
import { isGeminiConfigured } from '@/lib/gemini';
import { useTheme } from '@/components/ThemeProvider';
import { usePrivacy } from '@/components/PrivacyProvider';

interface HeaderProps {
  score: FinancialLivingScore;
  onOpenSettings: () => void;
  onRefreshData: () => void;
  onOpenRecap: () => void;
  isRefreshing: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  score,
  onOpenSettings,
  onOpenRecap,
  onRefreshData,
  isRefreshing,
}) => {
  const { theme, toggleTheme } = useTheme();
  const { isPrivacyMode, togglePrivacyMode } = usePrivacy();

  const getBadgeColor = () => {
    if (score.status.includes('Boros') || score.status.includes('OVERBUDGET')) return 'bg-rose-500/20 text-rose-600 dark:text-rose-400 border-rose-500/30';
    if (score.status.includes('Waspada') || score.status.includes('PERINGATAN')) return 'bg-amber-500/20 text-amber-700 dark:text-amber-400 border-amber-500/30';
    return 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border-emerald-500/30';
  };

  return (
    <header className="sticky top-0 z-30 w-full glass-panel border-b border-slate-200/80 dark:border-slate-800/80 px-4 py-3 sm:px-6 transition-colors duration-300">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand logo & title */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-500 p-0.5 shadow-lg shadow-emerald-500/20 flex items-center justify-center">
            <div className="w-full h-full bg-white dark:bg-slate-950 rounded-[10px] flex items-center justify-center transition-colors">
              <Wallet className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-slate-700 to-slate-800 dark:from-white dark:via-slate-200 dark:to-slate-400 tracking-tight">
                Frugalify <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-semibold border border-emerald-500/20">All-in-One</span>
              </h1>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">Rekap Keuangan Personal & Portfolio Saham</p>
          </div>
        </div>

        {/* Status indicators & Actions */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Frugal Badge */}
          <div className={`hidden xs:flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${getBadgeColor()}`}>
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{score.status.split('/')[0]}</span>
          </div>

          {/* AI Status */}
          <div className="hidden md:flex items-center space-x-1 px-2.5 py-1 rounded-full bg-slate-200/80 dark:bg-slate-800/60 border border-slate-300/80 dark:border-slate-700/60 text-xs text-slate-700 dark:text-slate-300">
            <Sparkles className={`w-3.5 h-3.5 ${isGeminiConfigured ? 'text-amber-500 dark:text-amber-400 animate-pulse' : 'text-slate-400'}`} />
            <span>Gemini AI {isGeminiConfigured ? 'Live' : 'Demo'}</span>
          </div>

          {/* Privacy Sensor Mode Toggle Button */}
          <button
            onClick={togglePrivacyMode}
            className={`p-2 rounded-xl border transition-all active:scale-90 shadow-sm ${
              isPrivacyMode
                ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/40 animate-pulse'
                : 'bg-slate-200/80 hover:bg-slate-300/80 dark:bg-slate-800/80 dark:hover:bg-slate-700/80 border-slate-300/80 dark:border-slate-700/60 text-slate-600 dark:text-slate-400'
            }`}
            title={isPrivacyMode ? 'Sensor Aktif: Klik untuk Tampilkan Nominal Uang' : 'Sensor Privasi: Klik untuk Sembunyikan Nominal Uang'}
          >
            {isPrivacyMode ? (
              <EyeOff className="w-4 h-4 text-amber-500" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-slate-200/80 hover:bg-slate-300/80 dark:bg-slate-800/80 dark:hover:bg-slate-700/80 border border-slate-300/80 dark:border-slate-700/60 text-amber-500 dark:text-yellow-400 transition-all active:scale-90 shadow-sm"
            title={theme === 'dark' ? 'Ganti ke Mode Putih Elegant' : 'Ganti ke Dark Mode'}
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 transition-transform hover:rotate-45" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-600 transition-transform hover:-rotate-12" />
            )}
          </button>

          {/* Recap button */}
          <button
            onClick={onOpenRecap}
            className="p-2 rounded-xl bg-slate-200/80 hover:bg-rose-500/20 dark:bg-slate-800/80 dark:hover:bg-rose-500/20 border border-slate-300/80 dark:border-slate-700/60 hover:border-rose-500/30 text-slate-700 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 transition-all active:scale-95"
            title="Rekap Pengeluaran Bulanan"
          >
            <BarChart3 className="w-4 h-4" />
          </button>

          {/* Refresh Data */}
          <button
            onClick={onRefreshData}
            disabled={isRefreshing}
            className="p-2 rounded-xl bg-slate-200/80 hover:bg-slate-300/80 dark:bg-slate-800/80 dark:hover:bg-slate-700/80 border border-slate-300/80 dark:border-slate-700/60 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all active:scale-95 disabled:opacity-50"
            title="Refresh Live Data Saham & Financial Status"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-emerald-500' : ''}`} />
          </button>

          {/* Settings button */}
          <button
            onClick={onOpenSettings}
            className="p-2 rounded-xl bg-slate-200/80 hover:bg-slate-300/80 dark:bg-slate-800/80 dark:hover:bg-slate-700/80 border border-slate-300/80 dark:border-slate-700/60 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all active:scale-95"
            title="Pengaturan Saldo & Budget"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
