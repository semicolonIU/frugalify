'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Info, Activity, Target, ShoppingBag, TrendingUp, ShieldCheck, CheckCircle2, Sparkles } from 'lucide-react';
import { FinancialLivingScore } from '@/lib/types';

interface FinancialScoreInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  score: FinancialLivingScore;
}

export const FinancialScoreInfoModal: React.FC<FinancialScoreInfoModalProps> = ({
  isOpen,
  onClose,
  score,
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 dark:bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-fade-in transition-colors duration-300">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="glass-panel rounded-3xl max-w-lg w-full p-5 sm:p-6 border border-slate-200/90 dark:border-slate-700/80 shadow-2xl relative my-6"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-2xl bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30">
                  <Info className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">
                    Panduan Financial Living Score
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    Penjelasan rinci formula & kriteria skor keuangan Anda
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Current Score Summary Banner */}
            <div className="mb-5 p-4 rounded-2xl bg-gradient-to-r from-cyan-500/10 via-emerald-500/10 to-teal-500/10 border border-cyan-500/20 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white font-black text-xl flex items-center justify-center border border-slate-800 shadow-md">
                  {score.score}
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Status Keuangan Saat Ini
                  </span>
                  <div className="text-sm font-extrabold text-slate-900 dark:text-white">
                    {score.status}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 block">Total Poin</span>
                <span className="text-xs font-black text-cyan-600 dark:text-cyan-400">{score.score} / 100 Poin</span>
              </div>
            </div>

            {/* Content Sections */}
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
              
              {/* Section 1: Apa itu Financial Living Score? */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-1.5">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-500" /> Apa itu Financial Living Score?
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Indikator otomatis (skala 0 - 100) yang mengukur tingkat kesehatan finansial Anda berdasarkan prinsip <strong>Frugal Living</strong> & kedisiplinan mengelola uang bulanan.
                </p>
              </div>

              {/* Section 2: 3 Pilar Utama Perhitungan Skor */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Rincian 3 Pilar Perhitungan Poin (Total 100 Poin):
                </h4>

                {/* Pilar 1 */}
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                      <Target className="w-4 h-4" /> 1. Kontrol Budget Bulanan
                    </span>
                    <span className="text-xs font-black text-emerald-700 dark:text-emerald-300">
                      {score.budgetScore} / 40 Poin
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                    Menilai realisasi total pengeluaran vs batas budget. Jika pengeluaran &lt; 80% budget, Anda mendapatkan <strong>40 Poin penuh</strong>. Poin berkurang jika mendekati atau melebihi 100% budget (Overbudget: {score.expenseToBudgetRatio}%).
                  </p>
                </div>

                {/* Pilar 2 */}
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                      <ShoppingBag className="w-4 h-4" /> 2. Kontrol Belanja Impulsif
                    </span>
                    <span className="text-xs font-black text-amber-700 dark:text-amber-300">
                      {score.impulseScore} / 30 Poin
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                    Menilai rasio belanja e-commerce / Shopee (saat ini: {score.shopeeImpulseRatio}%). Porsi belanja e-commerce di bawah 15% mendapat <strong>30 Poin penuh</strong>. Jika melebihi 40%, poin bernilai 0.
                  </p>
                </div>

                {/* Pilar 3 */}
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-teal-600 dark:text-teal-400 flex items-center gap-1.5">
                      <TrendingUp className="w-4 h-4" /> 3. Pertumbuhan Aset & Investasi
                    </span>
                    <span className="text-xs font-black text-teal-700 dark:text-teal-300">
                      {score.investmentScore} / 30 Poin
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                    Menilai akumulasi portofolio saham, crypto & emas dibanding batas budget. Memiliki portofolio &gt; 3x budget mendapatkan <strong>30 Poin penuh</strong>.
                  </p>
                </div>
              </div>

              {/* Section 3: Tingkatan Kategori Status */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-cyan-500" /> Tingkatan Kategori Skor
                </h4>
                <div className="space-y-1.5 text-[11px]">
                  <div className="flex items-center justify-between p-2 rounded-xl bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 font-medium">
                    <span>🟢 Sangat Sehat & Frugal</span>
                    <span className="font-extrabold">80 - 100 Poin</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-xl bg-amber-500/10 text-amber-800 dark:text-amber-300 font-medium">
                    <span>🟡 Waspada / Perlu Kontrol</span>
                    <span className="font-extrabold">55 - 79 Poin</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-xl bg-rose-500/10 text-rose-800 dark:text-rose-300 font-medium">
                    <span>🔴 Boros / Overbudget</span>
                    <span className="font-extrabold">0 - 54 Poin</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Modal Footer Button */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 mt-4">
              <button
                onClick={onClose}
                className="w-full py-2.5 rounded-2xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs transition-all"
              >
                Tutup Panduan Skor
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
