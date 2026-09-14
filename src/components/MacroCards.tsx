'use client';

import React from 'react';
import { Wallet, TrendingUp, CreditCard, Activity, ArrowUpRight, ArrowDownRight, PieChart, Info } from 'lucide-react';
import { FinancialLivingScore, UserSettings, InvestmentAsset, CashTransaction } from '@/lib/types';
import { usePrivacy } from '@/components/PrivacyProvider';

interface MacroCardsProps {
  score: FinancialLivingScore;
  settings: UserSettings;
  investments: InvestmentAsset[];
  transactions: CashTransaction[];
  onOpenScoreInfo?: () => void;
  onOpenRecap?: () => void;
}

export const MacroCards: React.FC<MacroCardsProps> = ({
  score,
  settings,
  investments,
  transactions,
  onOpenScoreInfo,
  onOpenRecap,
}) => {
  const { formatCurrency } = usePrivacy();
  // Calculations
  const totalWalletBalance = settings.wallets.reduce((acc, curr) => acc + curr.balance, 0);
  const totalInvestmentValue = investments.reduce((acc, curr) => acc + curr.totalValue, 0);
  const totalInvestmentPnL = investments.reduce((acc, curr) => acc + curr.pnlAmount, 0);
  
  const actualNetWorth = totalWalletBalance + totalInvestmentValue;

  // Monthly Expenses Calculation (Current Active Month)
  const currentMonthKey = new Date().toISOString().substring(0, 7);
  const currentMonthExpenses = transactions.filter(
    t => t.type === 'EXPENSE' && (!t.date || t.date.startsWith(currentMonthKey))
  );
  
  // Fallback to all expenses if no date filter matches
  const activeExpensesList = currentMonthExpenses.length > 0 ? currentMonthExpenses : transactions.filter(t => t.type === 'EXPENSE');
  const totalMonthlyExpenses = activeExpensesList.reduce((acc, curr) => acc + curr.amount, 0);

  const shopeeTotal = activeExpensesList
    .filter(e => e.platform === 'Screenshot Shopee' || e.category.toLowerCase().includes('shopee') || e.category.toLowerCase().includes('marketplace') || e.category.toLowerCase().includes('e-commerce'))
    .reduce((acc, curr) => acc + curr.amount, 0);

  // Monthly Income Calculation & Surplus Logic
  const currentMonthIncomes = transactions.filter(
    t => t.type === 'INCOME' && (!t.date || t.date.startsWith(currentMonthKey))
  );
  const activeIncomesList = currentMonthIncomes.length > 0 ? currentMonthIncomes : transactions.filter(t => t.type === 'INCOME');
  const totalMonthlyIncome = activeIncomesList.reduce((acc, curr) => acc + curr.amount, 0);

  const monthlySurplus = totalMonthlyIncome - totalMonthlyExpenses;
  const isSurplus = monthlySurplus >= 0;

  // Daily Average Calculation
  const currentDay = new Date().getDate() || 1;
  const dailyAverageExpense = Math.round(totalMonthlyExpenses / currentDay);

  const budget = settings.monthlyExpenseBudget || 5000000;
  const remainingBudget = budget - totalMonthlyExpenses;
  const usedPercentage = Math.round((totalMonthlyExpenses / budget) * 100);

  const getScoreColor = (val: number) => {
    if (val >= 80) return 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border-emerald-500/30';
    if (val >= 55) return 'bg-amber-500/20 text-amber-700 dark:text-amber-400 border-amber-500/30';
    return 'bg-rose-500/20 text-rose-700 dark:text-rose-400 border-rose-500/30';
  };

  const getExpenseBadge = () => {
    if (totalMonthlyExpenses > budget) {
      return {
        label: `🔴 Overbudget (${usedPercentage}%)`,
        bg: 'bg-rose-500/20 text-rose-700 dark:text-rose-400 border-rose-500/30',
        progressBg: 'bg-rose-500 shadow-lg shadow-rose-500/30'
      };
    }
    if (totalMonthlyExpenses > budget * 0.8) {
      return {
        label: `🟡 Waspada (${usedPercentage}%)`,
        bg: 'bg-amber-500/20 text-amber-700 dark:text-amber-400 border-amber-500/30',
        progressBg: 'bg-amber-500 shadow-lg shadow-amber-500/30'
      };
    }
    return {
      label: `🟢 Aman (${usedPercentage}%)`,
      bg: 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border-emerald-500/30',
      progressBg: 'bg-emerald-500 shadow-lg shadow-emerald-500/30'
    };
  };

  const expenseStatus = getExpenseBadge();

  const budgetIncomeRatio = totalMonthlyIncome > 0 ? Math.round((budget / totalMonthlyIncome) * 100) : null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {/* 1. Kekayaan Bersih Aktual (Net Worth & Surplus Info) */}
      <div className="glass-card rounded-2xl p-5 relative overflow-hidden group hover:border-emerald-500/30 transition-all duration-300">
        <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all" />
        
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
            <Wallet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            Kekayaan Bersih Aktual
          </span>
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
            Real-Time Live
          </span>
        </div>

        <div className="mb-2">
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            {formatCurrency(actualNetWorth)}
          </div>
          <div className="flex items-center space-x-2 mt-1 text-xs">
            <span className="text-slate-600 dark:text-slate-400">Total {settings.wallets.length} Dompet: <strong className="text-slate-800 dark:text-slate-200">{formatCurrency(totalWalletBalance)}</strong></span>
          </div>
        </div>

        {/* Info Surplus / Defisit Bulan Ini Banner */}
        <div className={`p-2 rounded-xl border text-[11px] font-semibold mb-2 transition-all ${
          isSurplus
            ? 'bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border-emerald-500/20'
            : 'bg-rose-500/10 text-rose-800 dark:text-rose-300 border-rose-500/20'
        }`}>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1">
              {isSurplus ? <ArrowUpRight className="w-3.5 h-3.5 text-emerald-500" /> : <ArrowDownRight className="w-3.5 h-3.5 text-rose-500" />}
              <span>{isSurplus ? 'Surplus Bulan Ini' : 'Defisit Bulan Ini'}</span>
            </span>
            <span className="font-extrabold">
              {isSurplus ? '+' : '-'}{formatCurrency(Math.abs(monthlySurplus))}
            </span>
          </div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-0.5 flex items-center justify-between">
            <span>Pemasukan: {formatCurrency(totalMonthlyIncome)}</span>
            <span>Pengeluaran: {formatCurrency(totalMonthlyExpenses)}</span>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between text-xs">
          <span className="text-slate-600 dark:text-slate-400 flex items-center gap-1 font-medium">
            <TrendingUp className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" /> Portofolio Investasi:
          </span>
          <div className="flex items-center space-x-1.5 font-medium">
            <span className="text-slate-800 dark:text-slate-200 font-extrabold">{formatCurrency(totalInvestmentValue)}</span>
            <span className={`flex items-center text-[11px] px-1.5 py-0.5 rounded-md font-bold ${totalInvestmentPnL >= 0 ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400' : 'bg-rose-500/10 text-rose-700 dark:text-rose-400'}`}>
              {totalInvestmentPnL >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              {formatCurrency(Math.abs(totalInvestmentPnL))}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Pengeluaran Bulanan Berjalan (Redesigned with Quota Status & Daily Avg) */}
      <div 
        onClick={onOpenRecap}
        className="glass-card rounded-2xl p-5 relative overflow-hidden group hover:border-amber-500/40 cursor-pointer transition-all duration-300 shadow-md"
      >
        <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-all" />

        {/* Card Header */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
            <CreditCard className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            Pengeluaran Bulan Ini
          </span>
          <div className="flex items-center space-x-1.5">
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${expenseStatus.bg}`}>
              {expenseStatus.label}
            </span>
          </div>
        </div>

        {/* Amount & Subtitle Sisa Kuota */}
        <div className="mb-3">
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-baseline justify-between">
            <span>{formatCurrency(totalMonthlyExpenses)}</span>
          </div>

          <div className="flex items-center justify-between mt-1 text-[11px]">
            {remainingBudget >= 0 ? (
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                Sisa Kuota: <strong>{formatCurrency(remainingBudget)}</strong>
              </span>
            ) : (
              <span className="text-rose-600 dark:text-rose-400 font-extrabold flex items-center gap-1">
                ⚠️ Overbudget: <strong>{formatCurrency(Math.abs(remainingBudget))}</strong>
              </span>
            )}
            <span className="text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1.5">
              <span>Limit: <strong>{formatCurrency(budget)}</strong></span>
              {budgetIncomeRatio !== null && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 font-extrabold border border-cyan-500/20">
                  {budgetIncomeRatio}% Pemasukan
                </span>
              )}
            </span>
          </div>

          {/* Animated Glow Progress Bar */}
          <div className="w-full bg-slate-200 dark:bg-slate-800/80 rounded-full h-2.5 mt-2.5 overflow-hidden p-0.5 border border-slate-300/40 dark:border-slate-700/50">
            <div
              className={`h-full transition-all duration-700 rounded-full ${expenseStatus.progressBg}`}
              style={{ width: `${Math.min(100, usedPercentage)}%` }}
            />
          </div>
        </div>

        {/* Bottom Metrics: Shopee Impulsif & Daily Average */}
        <div className="pt-2.5 border-t border-slate-200/80 dark:border-slate-800/80 grid grid-cols-2 gap-2 text-xs">
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1">
              <PieChart className="w-3 h-3 text-amber-500" /> Shopee / Online
            </span>
            <span className="font-extrabold text-amber-600 dark:text-amber-300 text-xs">
              {formatCurrency(shopeeTotal)}
            </span>
          </div>

          <div className="flex flex-col text-right">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
              🗓️ Rerata Harian (H-{currentDay})
            </span>
            <span className="font-extrabold text-slate-800 dark:text-slate-200 text-xs">
              {formatCurrency(dailyAverageExpense)}/hr
            </span>
          </div>
        </div>
      </div>

      {/* 3. Financial Living Score (Transparent 3-Pillar Breakdown + Info Button) */}
      <div className="glass-card rounded-2xl p-5 relative overflow-hidden group hover:border-cyan-500/30 transition-all duration-300">
        <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl group-hover:bg-cyan-500/20 transition-all" />

        {/* Score Card Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              Financial Score
            </span>
            {onOpenScoreInfo && (
              <button
                onClick={onOpenScoreInfo}
                className="p-1 rounded-full bg-slate-200/80 hover:bg-cyan-500/20 dark:bg-slate-800 dark:hover:bg-cyan-500/20 text-slate-500 hover:text-cyan-600 dark:hover:text-cyan-400 transition-all active:scale-90"
                title="Lihat Rincian Rumus & Panduan Skor"
              >
                <Info className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${getScoreColor(score.score)}`}>
            {score.status}
          </span>
        </div>

        {/* Score Ring + Recommendation */}
        <div className="flex items-start space-x-3.5 mb-3">
          <div className="relative flex flex-col items-center justify-center w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 shadow-inner shrink-0">
            <span className="text-2xl font-black text-slate-900 dark:text-white leading-none">{score.score}</span>
            <span className="text-[9px] font-bold text-slate-500 mt-0.5">/100</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
              "{score.recommendation}"
            </p>
          </div>
        </div>

        {/* 3-Pillar Breakdown Bars */}
        <div className="space-y-1.5 pt-2 border-t border-slate-200/80 dark:border-slate-800/80">
          <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1">
              3 Pilar Skor:
              {onOpenScoreInfo && (
                <button
                  onClick={onOpenScoreInfo}
                  className="text-cyan-600 dark:text-cyan-400 hover:underline font-bold"
                >
                  (Info Rinci)
                </button>
              )}
            </span>
          </div>
          
          <div className="grid grid-cols-3 gap-1.5 text-[10px]">
            {/* Pillar 1: Budget */}
            <button
              onClick={onOpenScoreInfo}
              className="p-1.5 rounded-xl bg-slate-100/80 hover:bg-slate-200 dark:bg-slate-900/60 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-center transition-colors cursor-pointer"
              title="Pilar 1: Kontrol Budget Bulanan"
            >
              <div className="text-[9px] text-slate-500 font-semibold truncate">Budget</div>
              <div className="font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">
                {score.budgetScore || 0}<span className="text-slate-400 font-normal">/40</span>
              </div>
            </button>

            {/* Pillar 2: Impulsif */}
            <button
              onClick={onOpenScoreInfo}
              className="p-1.5 rounded-xl bg-slate-100/80 hover:bg-slate-200 dark:bg-slate-900/60 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-center transition-colors cursor-pointer"
              title="Pilar 2: Kontrol Belanja Impulsif"
            >
              <div className="text-[9px] text-slate-500 font-semibold truncate">Impulsif</div>
              <div className="font-extrabold text-amber-600 dark:text-amber-400 mt-0.5">
                {score.impulseScore || 0}<span className="text-slate-400 font-normal">/30</span>
              </div>
            </button>

            {/* Pillar 3: Investasi */}
            <button
              onClick={onOpenScoreInfo}
              className="p-1.5 rounded-xl bg-slate-100/80 hover:bg-slate-200 dark:bg-slate-900/60 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-center transition-colors cursor-pointer"
              title="Pilar 3: Pertumbuhan Investasi"
            >
              <div className="text-[9px] text-slate-500 font-semibold truncate">Investasi</div>
              <div className="font-extrabold text-teal-600 dark:text-teal-400 mt-0.5">
                {score.investmentScore || 0}<span className="text-slate-400 font-normal">/30</span>
              </div>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
