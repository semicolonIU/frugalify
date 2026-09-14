'use client';

import React, { useState, useMemo } from 'react';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  BarChart3, 
  TrendingDown, 
  Tag, 
  Calendar, 
  Flame, 
  ShoppingBag,
  Sparkles,
  PieChart,
  ArrowUpRight,
  RotateCcw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CashTransaction } from '@/lib/types';
import { useTheme } from '@/components/ThemeProvider';
import { usePrivacy } from '@/components/PrivacyProvider';

interface ExpenseRecapModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: CashTransaction[];
}

const CATEGORY_COLORS: Record<string, { bar: string; text: string; bg: string; border: string }> = {
  'Makanan & Groceries':  { bar: '#f43f5e', text: 'text-rose-600 dark:text-rose-400',   bg: 'bg-rose-500/10',   border: 'border-rose-500/20' },
  'Belanja Marketplace':  { bar: '#f97316', text: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20' },
  'Belanja Shopee':       { bar: '#f97316', text: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20' },
  'Tagihan & Utilitas':   { bar: '#06b6d4', text: 'text-cyan-600 dark:text-cyan-400',   bg: 'bg-cyan-500/10',   border: 'border-cyan-500/20'  },
  'Transportasi':         { bar: '#8b5cf6', text: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-500/10', border: 'border-violet-500/20' },
  'Hiburan & Lifestyle':  { bar: '#ec4899', text: 'text-pink-600 dark:text-pink-400',   bg: 'bg-pink-500/10',   border: 'border-pink-500/20' },
  'Investasi':            { bar: '#10b981', text: 'text-emerald-600 dark:text-emerald-400',bg: 'bg-emerald-500/10',border: 'border-emerald-500/20' },
  'Lainnya':              { bar: '#64748b', text: 'text-slate-600 dark:text-slate-400',  bg: 'bg-slate-500/10',  border: 'border-slate-500/20' },
};

const DEFAULT_COLORS = [
  { bar: '#f43f5e', text: 'text-rose-600 dark:text-rose-400',   bg: 'bg-rose-500/10',   border: 'border-rose-500/20' },
  { bar: '#f97316', text: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20' },
  { bar: '#06b6d4', text: 'text-cyan-600 dark:text-cyan-400',   bg: 'bg-cyan-500/10',   border: 'border-cyan-500/20' },
  { bar: '#8b5cf6', text: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-500/10', border: 'border-violet-500/20' },
  { bar: '#ec4899', text: 'text-pink-600 dark:text-pink-400',   bg: 'bg-pink-500/10',   border: 'border-pink-500/20' },
];

export const ExpenseRecapModal: React.FC<ExpenseRecapModalProps> = ({
  isOpen,
  onClose,
  transactions,
}) => {
  const { theme } = useTheme();
  const { formatCurrency } = usePrivacy();
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  const resetToCurrentMonth = () => setCurrentDate(new Date(today.getFullYear(), today.getMonth(), 1));

  const monthName = currentDate.toLocaleString('id-ID', { month: 'long', year: 'numeric' });
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();

  const isCurrentMonth = currentDate.getMonth() === today.getMonth() && currentDate.getFullYear() === today.getFullYear();

  const { categoryData, totalExpense, maxCategoryValue, filteredExpenses, topExpenses } = useMemo(() => {
    const targetMonth = currentDate.getMonth();
    const targetYear = currentDate.getFullYear();

    const expenses = transactions.filter(tx => {
      if (tx.type !== 'EXPENSE') return false;
      const txDate = new Date(tx.date);
      return txDate.getMonth() === targetMonth && txDate.getFullYear() === targetYear;
    });

    const grouped = expenses.reduce((acc, tx) => {
      let cat = tx.category || 'Lainnya';
      if (cat.toLowerCase().includes('shopee') || cat.toLowerCase().includes('e-commerce') || cat.toLowerCase().includes('tokopedia')) {
        cat = 'Belanja Marketplace';
      }
      acc[cat] = (acc[cat] || 0) + tx.amount;
      return acc;
    }, {} as Record<string, number>);

    const catArray = Object.keys(grouped)
      .map(key => ({ category: key, amount: grouped[key] }))
      .sort((a, b) => b.amount - a.amount);

    const total = catArray.reduce((sum, item) => sum + item.amount, 0);
    const maxVal = catArray.length > 0 ? catArray[0].amount : 0;
    const top5 = [...expenses].sort((a, b) => b.amount - a.amount).slice(0, 5);

    return { 
      categoryData: catArray, 
      totalExpense: total, 
      maxCategoryValue: maxVal,
      filteredExpenses: expenses,
      topExpenses: top5
    };
  }, [transactions, currentDate]);

  const dailyAverage = totalExpense > 0 ? Math.round(totalExpense / (isCurrentMonth ? today.getDate() : daysInMonth)) : 0;
  const topCategory = categoryData.length > 0 ? categoryData[0] : null;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[99] flex flex-col bg-slate-900/50 dark:bg-slate-950/90 backdrop-blur-md overflow-hidden transition-colors duration-300"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-200/80 dark:border-slate-800 glass-panel shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">
                  Rekap Pengeluaran Bulanan
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Analisis visual pengeluaran & 5 transaksi terbesar
                </p>
              </div>
            </div>
            <button 
              onClick={onClose} 
              className="p-2 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable Body */}
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">

              {/* Month Selector Bar */}
              <div className="glass-card rounded-3xl p-4 sm:p-5 relative overflow-hidden border border-slate-200/90 dark:border-slate-700/60 shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* Month Nav */}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900/80 px-2 py-1.5 rounded-2xl border border-slate-200 dark:border-slate-700/60 shadow-inner">
                      <button 
                        onClick={prevMonth} 
                        className="p-1.5 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                        title="Bulan Sebelumnya"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <span className="text-sm font-extrabold text-slate-900 dark:text-white min-w-[140px] text-center flex items-center justify-center gap-1.5">
                        <Calendar className="w-4 h-4 text-rose-500" />
                        {monthName}
                      </span>
                      <button 
                        onClick={nextMonth} 
                        className="p-1.5 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                        title="Bulan Berikutnya"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>

                    {!isCurrentMonth && (
                      <button
                        onClick={resetToCurrentMonth}
                        className="px-3 py-1.5 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30 text-xs font-bold flex items-center gap-1 transition-all"
                      >
                        <RotateCcw className="w-3.5 h-3.5" /> Bulan Ini
                      </button>
                    )}
                  </div>

                  {/* Total Expense Counter */}
                  <div className="text-left sm:text-right">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                      Total Pengeluaran ({filteredExpenses.length} Transaksi)
                    </span>
                    <p className="text-2xl sm:text-3xl font-black text-rose-600 dark:text-rose-400 tracking-tight mt-0.5">
                      {formatCurrency(totalExpense)}
                    </p>
                  </div>
                </div>
              </div>

              {/* KPI Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* 1. Kategori Terboros */}
                <div className="glass-card rounded-2xl p-4 border border-slate-200 dark:border-slate-800 relative overflow-hidden">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      <Flame className="w-4 h-4 text-rose-500" /> Kategori Terboros
                    </span>
                  </div>
                  {topCategory ? (
                    <div>
                      <div className="text-base font-extrabold text-slate-900 dark:text-white truncate">
                        {topCategory.category}
                      </div>
                      <div className="text-xs font-bold text-rose-600 dark:text-rose-400 mt-0.5">
                        {formatCurrency(topCategory.amount)} ({totalExpense > 0 ? ((topCategory.amount / totalExpense) * 100).toFixed(1) : 0}%)
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs text-slate-400 italic">Belum ada data</div>
                  )}
                </div>

                {/* 2. Rata-Rata Pengeluaran Harian */}
                <div className="glass-card rounded-2xl p-4 border border-slate-200 dark:border-slate-800 relative overflow-hidden">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      <TrendingDown className="w-4 h-4 text-amber-500" /> Rata-Rata Harian
                    </span>
                  </div>
                  <div>
                    <div className="text-base font-extrabold text-slate-900 dark:text-white">
                      {formatCurrency(dailyAverage)} <span className="text-[11px] font-medium text-slate-500">/ hari</span>
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                      Berdasarkan {isCurrentMonth ? today.getDate() : daysInMonth} hari
                    </div>
                  </div>
                </div>

                {/* 3. Shopee / Online Ratio */}
                <div className="glass-card rounded-2xl p-4 border border-slate-200 dark:border-slate-800 relative overflow-hidden">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      <ShoppingBag className="w-4 h-4 text-orange-500" /> Total Transaksi
                    </span>
                  </div>
                  <div>
                    <div className="text-base font-extrabold text-slate-900 dark:text-white">
                      {filteredExpenses.length} Catatan Transaksi
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                      Pengeluaran Bulan {monthName.split(' ')[0]}
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Content Layout: Left (Categories Breakdown) & Right (Top 5 Spenders) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* Category Progress Bars (7 cols) */}
                <div className="lg:col-span-7 glass-panel rounded-3xl p-5 sm:p-6 border border-slate-200/90 dark:border-slate-800">
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <Tag className="w-4 h-4 text-rose-500" />
                    Rincian Kategori Pengeluaran
                  </h3>

                  {categoryData.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <BarChart3 className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-2" />
                      <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Belum Ada Pengeluaran</p>
                      <p className="text-xs text-slate-500 mt-1">Tidak ada catatan transaksi pengeluaran di {monthName}.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {categoryData.map((item, idx) => {
                        const pct = totalExpense > 0 ? ((item.amount / totalExpense) * 100).toFixed(1) : '0';
                        const color = CATEGORY_COLORS[item.category] || DEFAULT_COLORS[idx % DEFAULT_COLORS.length];

                        return (
                          <div key={item.category} className="space-y-1.5">
                            <div className="flex items-center justify-between text-xs">
                              <div className="flex items-center space-x-2">
                                <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-extrabold text-[10px] flex items-center justify-center">
                                  {idx + 1}
                                </span>
                                <span className="font-bold text-slate-800 dark:text-slate-200">{item.category}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className={`font-extrabold ${color.text}`}>{pct}%</span>
                                <span className="font-bold text-slate-900 dark:text-white">{formatCurrency(item.amount)}</span>
                              </div>
                            </div>

                            {/* Progress bar container */}
                            <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${pct}%` }}
                                transition={{ duration: 0.5, delay: idx * 0.05 }}
                                className="h-full rounded-full"
                                style={{ backgroundColor: color.bar }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Top 5 Spenders List (5 cols) */}
                <div className="lg:col-span-5 glass-panel rounded-3xl p-5 sm:p-6 border border-slate-200/90 dark:border-slate-800">
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    5 Transaksi Terbesar
                  </h3>

                  {topExpenses.length === 0 ? (
                    <div className="text-center py-10 text-xs text-slate-400">
                      Belum ada transaksi di bulan ini.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {topExpenses.map((tx, index) => (
                        <div 
                          key={tx.id} 
                          className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all text-xs"
                        >
                          <div className="flex items-center space-x-3 min-w-0">
                            <div className="w-7 h-7 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 font-black text-xs flex items-center justify-center shrink-0 border border-rose-500/20">
                              #{index + 1}
                            </div>
                            <div className="min-w-0">
                              <h4 className="font-extrabold text-slate-900 dark:text-white truncate">{tx.title}</h4>
                              <p className="text-[10px] text-slate-500 dark:text-slate-400">{tx.date} • {tx.category}</p>
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <div className="font-black text-rose-600 dark:text-rose-400 text-xs">
                              {formatCurrency(tx.amount)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>

            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
