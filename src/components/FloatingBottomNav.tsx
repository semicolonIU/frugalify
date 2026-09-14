'use client';

import React from 'react';
import { Sparkles, Plus, Sliders, Wallet } from 'lucide-react';

interface FloatingBottomNavProps {
  onOpenAIScanPicker: () => void;
  onOpenManualExpense: () => void;
  onOpenWallet: () => void;
  onOpenBudget: () => void;
}

export const FloatingBottomNav: React.FC<FloatingBottomNavProps> = ({
  onOpenAIScanPicker,
  onOpenManualExpense,
  onOpenWallet,
  onOpenBudget,
}) => {
  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[94%] max-w-lg">
      <div className="glass-panel rounded-full px-3 py-2 border border-slate-200/90 dark:border-slate-700/80 shadow-2xl flex items-center justify-between bg-white/90 dark:bg-slate-950/85 backdrop-blur-xl transition-colors duration-300 relative">
        
        {/* 1. Left Item 1: AI Scan */}
        <button
          onClick={onOpenAIScanPicker}
          className="flex flex-col items-center justify-center p-2 rounded-2xl hover:bg-emerald-500/15 text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all active:scale-90 group min-w-[56px]"
          title="Pilih Jenis AI Scan (Bukti Transaksi / Portofolio Investasi)"
        >
          <div className="relative">
            <Sparkles className="w-5 h-5 group-hover:scale-110 text-emerald-600 dark:text-emerald-400 transition-transform animate-pulse" />
          </div>
          <span className="text-[10px] font-bold mt-0.5 text-slate-600 dark:text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
            AI Scan
          </span>
        </button>

        {/* 2. Left Item 2: Dompet */}
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

        {/* 3. DEAD CENTER FAB: Input Transaksi Manual (Besar, Glowing & Elevated) */}
        <div className="relative -translate-y-6 shrink-0 mx-1">
          {/* Pulse Glow Ring */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-500 blur-md opacity-60 animate-pulse" />
          
          <button
            onClick={onOpenManualExpense}
            className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-500 text-slate-950 flex flex-col items-center justify-center shadow-xl shadow-emerald-500/40 ring-4 ring-white dark:ring-slate-950 active:scale-90 hover:scale-105 hover:brightness-110 transition-all duration-300 group"
            title="Input Transaksi Manual (Tambah Pemasukan / Pengeluaran / Transfer)"
          >
            <Plus className="w-7 h-7 text-slate-950 font-black group-hover:rotate-90 transition-transform duration-300" />
            <span className="text-[9px] font-black tracking-tight text-slate-950 uppercase -mt-0.5">
              Catat
            </span>
          </button>
        </div>

        {/* 4. Right Item 1: Budget */}
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

        {/* 5. Right Item 2: Settings */}
        <button
          onClick={onOpenWallet}
          className="flex flex-col items-center justify-center p-2 rounded-2xl hover:bg-slate-200/80 dark:hover:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all active:scale-90 group min-w-[56px]"
          title="Pengaturan"
        >
          <svg className="w-5 h-5 group-hover:scale-110 transition-transform text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.893.149c-.425.07-.765.383-.93.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 01-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.397.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 01-.12-1.45l.527-.737c.25-.35.273-.806.108-1.204-.165-.397-.505-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.107-1.204l-.527-.738a1.125 1.125 0 01.12-1.45l.773-.773a1.125 1.125 0 011.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="text-[10px] font-bold mt-0.5 text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white">
            Lainnya
          </span>
        </button>

      </div>
    </div>
  );
};
