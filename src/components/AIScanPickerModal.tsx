'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Camera, TrendingUp, Sparkles, ArrowRight, Receipt, LineChart } from 'lucide-react';

interface AIScanPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectScanReceipt: () => void;
  onSelectScanPortfolio: () => void;
}

export const AIScanPickerModal: React.FC<AIScanPickerModalProps> = ({
  isOpen,
  onClose,
  onSelectScanReceipt,
  onSelectScanPortfolio,
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 dark:bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-fade-in transition-colors duration-300">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="glass-panel rounded-3xl max-w-md w-full p-5 sm:p-6 border border-slate-200/90 dark:border-slate-700/80 shadow-2xl relative my-6"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-emerald-500/20 via-teal-500/20 to-cyan-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                  <Sparkles className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">
                    Pilih Jenis AI Scan
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    Ekstraksi otomatis foto dengan Gemini AI
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

            {/* Scan Options */}
            <div className="space-y-3.5">
              {/* Option 1: Scan Bukti Transaksi */}
              <button
                onClick={() => {
                  onClose();
                  onSelectScanReceipt();
                }}
                className="w-full text-left p-4 rounded-2xl bg-slate-50 hover:bg-emerald-500/10 dark:bg-slate-900/60 dark:hover:bg-emerald-500/10 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/40 transition-all duration-300 group shadow-sm flex items-center justify-between"
              >
                <div className="flex items-start space-x-3.5">
                  <div className="p-3 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 group-hover:scale-110 transition-transform">
                    <Receipt className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="text-sm font-extrabold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        Scan Bukti Transaksi
                      </h4>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-500/20">
                        Universal Struk
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                      Scan foto struk belanja, nota fisik, e-wallet, atau screenshot Shopee & Tokopedia.
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all shrink-0 ml-2" />
              </button>

              {/* Option 2: Scan Portofolio Investasi */}
              <button
                onClick={() => {
                  onClose();
                  onSelectScanPortfolio();
                }}
                className="w-full text-left p-4 rounded-2xl bg-slate-50 hover:bg-teal-500/10 dark:bg-slate-900/60 dark:hover:bg-teal-500/10 border border-slate-200 dark:border-slate-800 hover:border-teal-500/40 transition-all duration-300 group shadow-sm flex items-center justify-between"
              >
                <div className="flex items-start space-x-3.5">
                  <div className="p-3 rounded-2xl bg-teal-500/15 text-teal-600 dark:text-teal-400 border border-teal-500/30 group-hover:scale-110 transition-transform">
                    <LineChart className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="text-sm font-extrabold text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                        Scan Portofolio Investasi
                      </h4>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-500/15 text-teal-700 dark:text-teal-300 font-bold border border-teal-500/20">
                        Saham & Aset
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                      Ekstrak otomatis ticker saham (BBCA, BBRI), jumlah lot & harga rata-rata dari screenshot Bibit/Stockbit.
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-teal-500 group-hover:translate-x-1 transition-all shrink-0 ml-2" />
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
