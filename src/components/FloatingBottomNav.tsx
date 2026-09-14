'use client';

import React from 'react';
import { Sparkles, Plus, Sliders, Wallet, Settings } from 'lucide-react';

interface FloatingBottomNavProps {
  onOpenAIScanPicker: () => void;
  onOpenManualExpense: () => void;
  onOpenWallet: () => void;
  onOpenBudget: () => void;
  onOpenSettings: () => void;
}

export const FloatingBottomNav: React.FC<FloatingBottomNavProps> = ({
  onOpenAIScanPicker,
  onOpenManualExpense,
  onOpenWallet,
  onOpenBudget,
  onOpenSettings,
}) => {
  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[94%] max-w-lg">
      <div className="glass-panel rounded-full px-3 py-2 border border-slate-200/90 dark:border-slate-700/80 shadow-2xl flex items-center justify-between bg-white/90 dark:bg-slate-950/85 backdrop-blur-xl transition-colors duration-300 relative">
        
        {/* 1. AI Scan */}
        <button
          onClick={onOpenAIScanPicker}
          className="flex flex-col items-center justify-center p-2 rounded-2xl hover:bg-emerald-500/15 text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all active:scale-90 group min-w-[56px]"
          title="AI Scan Bukti Transaksi / Portofolio"
        >
          <Sparkles className="w-5 h-5 group-hover:scale-110 text-emerald-600 dark:text-emerald-400 transition-transform animate-pulse" />
          <span className="text-[10px] font-bold mt-0.5 text-slate-600 dark:text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
            AI Scan
          </span>
        </button>

        {/* 2. Dompet → buka tab WALLETS */}
        <button
          onClick={onOpenWallet}
          className="flex flex-col items-center justify-center p-2 rounded-2xl hover:bg-cyan-500/15 text-slate-600 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-400 transition-all active:scale-90 group min-w-[56px]"
          title="Rekening & Wallet"
        >
          <Wallet className="w-5 h-5 group-hover:scale-110 transition-transform text-cyan-500" />
          <span className="text-[10px] font-bold mt-0.5 text-slate-600 dark:text-slate-400 group-hover:text-cyan-600 dark:group-hover:text-cyan-400">
            Dompet
          </span>
        </button>

        {/* 3. FAB Center: Catat Transaksi */}
        <div className="relative -translate-y-6 shrink-0 mx-1">
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-500 blur-md opacity-60 animate-pulse" />
          <button
            onClick={onOpenManualExpense}
            className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-500 text-slate-950 flex flex-col items-center justify-center shadow-xl shadow-emerald-500/40 ring-4 ring-white dark:ring-slate-950 active:scale-90 hover:scale-105 hover:brightness-110 transition-all duration-300 group"
            title="Catat Transaksi Manual"
          >
            <Plus className="w-7 h-7 text-slate-950 font-black group-hover:rotate-90 transition-transform duration-300" />
            <span className="text-[9px] font-black tracking-tight text-slate-950 uppercase -mt-0.5">
              Catat
            </span>
          </button>
        </div>

        {/* 4. Budget → buka tab BUDGET */}
        <button
          onClick={onOpenBudget}
          className="flex flex-col items-center justify-center p-2 rounded-2xl hover:bg-amber-500/15 text-slate-600 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400 transition-all active:scale-90 group min-w-[56px]"
          title="Batas Budget Bulanan"
        >
          <Sliders className="w-5 h-5 group-hover:scale-110 transition-transform text-amber-500" />
          <span className="text-[10px] font-bold mt-0.5 text-slate-600 dark:text-slate-400 group-hover:text-amber-600 dark:group-hover:text-amber-400">
            Budget
          </span>
        </button>

        {/* 5. Pengaturan umum */}
        <button
          onClick={onOpenSettings}
          className="flex flex-col items-center justify-center p-2 rounded-2xl hover:bg-slate-200/80 dark:hover:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all active:scale-90 group min-w-[56px]"
          title="Pengaturan"
        >
          <Settings className="w-5 h-5 group-hover:scale-110 transition-transform text-slate-500" />
          <span className="text-[10px] font-bold mt-0.5 text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white">
            Lainnya
          </span>
        </button>

      </div>
    </div>
  );
};
