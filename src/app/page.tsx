'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { MacroCards } from '@/components/MacroCards';
import { QuoteBanner } from '@/components/QuoteBanner';
import { DualColumnDashboard } from '@/components/DualColumnDashboard';
import { ScanReceiptModal } from '@/components/ScanReceiptModal';
import { ScanPortfolioModal } from '@/components/ScanPortfolioModal';
import { InteractiveFormModal } from '@/components/InteractiveFormModal';
import { SettingsModal } from '@/components/SettingsModal';
import { FloatingBottomNav } from '@/components/FloatingBottomNav';
import { ToastContainer, ToastMessage, ToastType } from '@/components/Toast';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { ExpenseRecapModal } from '@/components/ExpenseRecapModal';
import { AIScanPickerModal } from '@/components/AIScanPickerModal';
import { FinancialScoreInfoModal } from '@/components/FinancialScoreInfoModal';

import {
  CashTransaction,
  InvestmentAsset,
  UserSettings,
  FinancialLivingScore,
  FinancialQuoteResponse,
  IncomeTemplate,
  AssetClass,
} from '@/lib/types';
import {
  getStoredTransactions,
  addStoredTransaction,
  deleteStoredTransaction,
  getStoredInvestments,
  saveStoredInvestments,
  updateOrAddInvestments,
  getStoredSettings,
  saveStoredSettings,
} from '@/lib/storage';
import { calculateFinancialLivingScore } from '@/lib/frugalScore';
import { fetchLiveAssetPrices, recalculateInvestmentsWithLivePrices } from '@/lib/stocks';
import { fetchDynamicQuote, MonthlyExpenseMetrics } from '@/lib/gemini';

// Helper to compute monthly expense & income metrics aligned with Card Pengeluaran Bulan Ini
const getMonthlyMetrics = (txs: CashTransaction[], userSettings: UserSettings): MonthlyExpenseMetrics => {
  const currentMonthKey = new Date().toISOString().substring(0, 7);
  const currentMonthExpenses = txs.filter(
    t => t.type === 'EXPENSE' && (!t.date || t.date.startsWith(currentMonthKey))
  );
  const activeExpensesList = currentMonthExpenses.length > 0 ? currentMonthExpenses : txs.filter(t => t.type === 'EXPENSE');
  const totalExpense = activeExpensesList.reduce((acc, curr) => acc + curr.amount, 0);

  const currentMonthIncomes = txs.filter(
    t => t.type === 'INCOME' && (!t.date || t.date.startsWith(currentMonthKey))
  );
  const activeIncomesList = currentMonthIncomes.length > 0 ? currentMonthIncomes : txs.filter(t => t.type === 'INCOME');
  const totalIncome = activeIncomesList.reduce((acc, curr) => acc + curr.amount, 0);

  const shopeeTotal = activeExpensesList
    .filter(e => e.platform === 'Screenshot Shopee' || e.category.toLowerCase().includes('shopee') || e.category.toLowerCase().includes('marketplace') || e.category.toLowerCase().includes('e-commerce'))
    .reduce((acc, curr) => acc + curr.amount, 0);

  const currentDay = new Date().getDate() || 1;
  const dailyAvg = Math.round(totalExpense / currentDay);

  const budget = userSettings.monthlyExpenseBudget || 5000000;
  const remainingBudget = budget - totalExpense;
  const usedPercentage = Math.round((totalExpense / budget) * 100);

  let status = 'AMAN';
  if (totalExpense > budget) {
    status = 'OVERBUDGET';
  } else if (totalExpense > budget * 0.8) {
    status = 'WASPADA';
  }

  return {
    totalExpense,
    totalIncome,
    budget,
    remainingBudget,
    usedPercentage,
    shopeeTotal,
    dailyAvg,
    status
  };
};

export default function Home() {
  const [transactions, setTransactions] = useState<CashTransaction[]>([]);
  const [investments, setInvestments] = useState<InvestmentAsset[]>([]);
  const [settings, setSettings] = useState<UserSettings>({
    wallets: [],
    incomeTemplates: [],
    monthlyExpenseBudget: 5000000,
  });

  const [score, setScore] = useState<FinancialLivingScore>({
    score: 82,
    status: 'Sangat Sehat & Frugal',
    budgetScore: 35,
    impulseScore: 27,
    investmentScore: 20,
    savingsRatio: 65,
    shopeeImpulseRatio: 12,
    expenseToBudgetRatio: 45,
    recommendation: 'Disiplin frugal living yang baik. Alokasikan terus ke portofolio investasi!',
  });
  const [quote, setQuote] = useState<FinancialQuoteResponse | null>(null);

  // Modals visibility
  const [isScoreInfoOpen, setIsScoreInfoOpen] = useState(false);
  const [isAIScanPickerOpen, setIsAIScanPickerOpen] = useState(false);
  const [isScanReceiptOpen, setIsScanReceiptOpen] = useState(false);
  const [isScanPortfolioOpen, setIsScanPortfolioOpen] = useState(false);
  const [isInteractiveFormOpen, setIsInteractiveFormOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isRecapOpen, setIsRecapOpen] = useState(false);
  const [pendingScanData, setPendingScanData] = useState<Partial<CashTransaction> | null>(null);

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isQuoteLoading, setIsQuoteLoading] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    confirmVariant?: 'danger' | 'warning' | 'primary';
    action: (() => void) | null;
  }>({ isOpen: false, title: '', message: '', action: null });

  const showToast = (message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Initial Load
  useEffect(() => {
    const loadedTxs = getStoredTransactions();
    const loadedInvestments = getStoredInvestments();
    const loadedSettings = getStoredSettings();

    setTransactions(loadedTxs);
    setInvestments(loadedInvestments);
    setSettings(loadedSettings);

    refreshMarketData(loadedTxs, loadedInvestments, loadedSettings);
  }, []);

  const refreshMarketData = async (
    currentTxs: CashTransaction[],
    currentInvestments: InvestmentAsset[],
    currentSettings: UserSettings
  ) => {
    setIsRefreshing(true);
    try {
      const liveQuotes = await fetchLiveAssetPrices(currentInvestments);
      const updatedInvestments = recalculateInvestmentsWithLivePrices(currentInvestments, liveQuotes);
      setInvestments(updatedInvestments);
      saveStoredInvestments(updatedInvestments);

      const calculatedScore = calculateFinancialLivingScore(currentTxs, updatedInvestments, currentSettings);
      setScore(calculatedScore);

      // Fetch dynamic quote based on Card Pengeluaran Bulan Ini metrics
      const metrics = getMonthlyMetrics(currentTxs, currentSettings);
      fetchQuote(metrics);
    } catch (err) {
      console.error('Error refreshing market data:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleResetData = () => {
    setConfirmState({
      isOpen: true,
      title: 'Reset Semua Data',
      message: 'PERINGATAN: Aksi ini akan menghapus semua data transaksi, portofolio saham, dan pengaturan wallet Anda. Data akan dikembalikan ke kondisi dummy awal.',
      confirmText: 'Reset Total',
      confirmVariant: 'danger',
      action: () => {
        localStorage.clear();
        window.location.reload();
      }
    });
  };

  const fetchQuote = async (metrics: MonthlyExpenseMetrics) => {
    setIsQuoteLoading(true);
    try {
      const result = await fetchDynamicQuote(metrics);
      if (result) setQuote(result);
    } catch (err) {
      console.error('Failed to fetch quote:', err);
    } finally {
      setIsQuoteLoading(false);
    }
  };

  // Handlers
  const handleReceiptScanSuccess = (aiData: any) => {
    setPendingScanData({
      type: 'EXPENSE',
      platform: aiData.platform || 'Struk Belanja Fisik',
      title: aiData.storeName || 'Merchant Baru',
      date: aiData.date || new Date().toISOString().substring(0, 10),
      mainAmount: aiData.mainAmount || 0,
      fees: aiData.fees || 0,
      discount: aiData.discount || 0,
      amount: aiData.totalAmount || 0,
      category: aiData.category || 'Makanan & Groceries',
      items: aiData.items || [],
    });
    setIsInteractiveFormOpen(true);
  };

  const handlePortfolioScanSuccess = (newAssets: Array<{ ticker: string; lots: number; avgBuyPrice?: number }>) => {
    const formatted = newAssets.map(a => ({
      assetClass: 'STOCK' as AssetClass,
      ticker: a.ticker,
      name: a.ticker,
      units: a.lots * 100,
      avgBuyPrice: a.avgBuyPrice || 0,
    }));
    const updatedInvestments = updateOrAddInvestments(formatted);
    setInvestments(updatedInvestments);
    
    const newScore = calculateFinancialLivingScore(transactions, updatedInvestments, settings);
    setScore(newScore);
  };

  const handleSaveTransaction = (transaction: CashTransaction) => {
    const updatedTxs = addStoredTransaction(transaction);
    setTransactions(updatedTxs);

    // Refresh settings to get updated wallet balances
    const updatedSettings = getStoredSettings();
    setSettings(updatedSettings);

    const newScore = calculateFinancialLivingScore(updatedTxs, investments, updatedSettings);
    setScore(newScore);

    const metrics = getMonthlyMetrics(updatedTxs, updatedSettings);
    fetchQuote(metrics);
  };

  const handleDeleteTransaction = (id: string) => {
    setConfirmState({
      isOpen: true,
      title: 'Hapus Transaksi',
      message: 'Apakah Anda yakin ingin menghapus riwayat transaksi ini? Data yang sudah dihapus tidak dapat dikembalikan.',
      confirmText: 'Ya, Hapus',
      confirmVariant: 'danger',
      action: () => {
        const updatedTxs = deleteStoredTransaction(id);
        setTransactions(updatedTxs);

        const updatedSettings = getStoredSettings();
        setSettings(updatedSettings);

        const newScore = calculateFinancialLivingScore(updatedTxs, investments, updatedSettings);
        setScore(newScore);
        
        showToast('Transaksi berhasil dihapus', 'success');
        setConfirmState(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const handleSaveSettings = (newSettings: UserSettings) => {
    setSettings(newSettings);
    saveStoredSettings(newSettings);

    const newScore = calculateFinancialLivingScore(transactions, investments, newSettings);
    setScore(newScore);
  };

  const handleClaimSalary = (template: IncomeTemplate) => {
    const salaryTx: CashTransaction = {
      id: `tx-sal-${Date.now()}`,
      type: 'INCOME',
      title: template.name,
      amount: template.amount,
      date: new Date().toISOString().substring(0, 10),
      category: template.category || 'Gaji',
      walletId: template.targetWalletId,
      createdAt: new Date().toISOString(),
    };
    handleSaveTransaction(salaryTx);
    showToast(`🎉 Success! Gaji "${template.name}" sebesar Rp ${template.amount.toLocaleString('id-ID')} telah dicairkan ke dompet!`, 'success');
  };

  const handleAddInvestmentManual = (asset: { assetClass: AssetClass, ticker: string, name: string, units: number, avgBuyPrice: number }) => {
    const updatedInvestments = updateOrAddInvestments([asset]);
    setInvestments(updatedInvestments);

    const newScore = calculateFinancialLivingScore(transactions, updatedInvestments, settings);
    setScore(newScore);
  };

  const handleManualExpenseTrigger = () => {
    setPendingScanData(null);
    setIsInteractiveFormOpen(true);
  };

  return (
    <div className="min-h-screen pb-24 sm:pb-28">
      {/* Top Header Bar */}
      <Header
        score={score}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenRecap={() => setIsRecapOpen(true)}
        onRefreshData={() => refreshMarketData(transactions, investments, settings)}
        isRefreshing={isRefreshing}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
        {/* Dynamic Financial Quote Banner */}
        <QuoteBanner
          quote={quote}
          onRefreshQuote={() => {
            const metrics = getMonthlyMetrics(transactions, settings);
            fetchQuote(metrics);
          }}
          isLoading={isQuoteLoading}
        />

        {/* Macro Summary Cards */}
        <MacroCards
          score={score}
          settings={settings}
          investments={investments}
          transactions={transactions}
          onOpenScoreInfo={() => setIsScoreInfoOpen(true)}
          onOpenRecap={() => setIsRecapOpen(true)}
        />

        {/* Dual-Column Main Dashboard Layout */}
        <DualColumnDashboard
          transactions={transactions}
          investments={investments}
          wallets={settings.wallets}
          onDeleteTransaction={handleDeleteTransaction}
          onOpenScanReceipt={() => setIsScanReceiptOpen(true)}
          onOpenScanPortfolio={() => setIsScanPortfolioOpen(true)}
          onOpenManualTransaction={handleManualExpenseTrigger}
          onAddInvestment={handleAddInvestmentManual}
          isAssetsLoading={isRefreshing}
        />
      </main>

      {/* Floating Bottom Navigation Bar for Mobile */}
      <FloatingBottomNav
        onOpenAIScanPicker={() => setIsAIScanPickerOpen(true)}
        onOpenManualExpense={handleManualExpenseTrigger}
        onOpenRecap={() => setIsRecapOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Modals */}
      <FinancialScoreInfoModal
        isOpen={isScoreInfoOpen}
        onClose={() => setIsScoreInfoOpen(false)}
        score={score}
      />

      <AIScanPickerModal
        isOpen={isAIScanPickerOpen}
        onClose={() => setIsAIScanPickerOpen(false)}
        onSelectScanReceipt={() => setIsScanReceiptOpen(true)}
        onSelectScanPortfolio={() => setIsScanPortfolioOpen(true)}
      />

      <ScanReceiptModal
        isOpen={isScanReceiptOpen}
        onClose={() => setIsScanReceiptOpen(false)}
        onScanSuccess={handleReceiptScanSuccess}
      />

      <ScanPortfolioModal
        isOpen={isScanPortfolioOpen}
        onClose={() => setIsScanPortfolioOpen(false)}
        onScanSuccess={handlePortfolioScanSuccess}
      />

      <InteractiveFormModal
        isOpen={isInteractiveFormOpen}
        onClose={() => setIsInteractiveFormOpen(false)}
        initialData={pendingScanData}
        wallets={settings.wallets}
        onSaveTransaction={handleSaveTransaction}
        showToast={showToast}
      />

      {/* Compute active month income for budget ratio calculation */}
      {(() => {
        const currentMonthKey = new Date().toISOString().substring(0, 7);
        const currentMonthIncomes = transactions.filter(
          t => t.type === 'INCOME' && (!t.date || t.date.startsWith(currentMonthKey))
        );
        const activeIncomesList = currentMonthIncomes.length > 0 ? currentMonthIncomes : transactions.filter(t => t.type === 'INCOME');
        const activeIncome = activeIncomesList.reduce((acc, curr) => acc + curr.amount, 0);

        return (
          <SettingsModal
            isOpen={isSettingsOpen}
            onClose={() => setIsSettingsOpen(false)}
            settings={settings}
            onSaveSettings={handleSaveSettings}
            onClaimSalary={handleClaimSalary}
            showToast={showToast}
            totalMonthlyIncome={activeIncome}
          />
        );
      })()}

      {/* Monthly Expense Recap Modal */}
      <ExpenseRecapModal
        isOpen={isRecapOpen}
        onClose={() => setIsRecapOpen(false)}
        transactions={transactions}
      />

      {/* Confirm Dialog Global */}
      <ConfirmDialog
        isOpen={confirmState.isOpen}
        title={confirmState.title}
        message={confirmState.message}
        confirmText={confirmState.confirmText}
        confirmVariant={confirmState.confirmVariant}
        onConfirm={() => confirmState.action?.()}
        onCancel={() => setConfirmState(prev => ({ ...prev, isOpen: false }))}
      />

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
}
