'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Save, 
  Sliders, 
  Wallet, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Building2, 
  QrCode, 
  Banknote,
  PiggyBank,
  Sparkles,
  CreditCard,
  Target
} from 'lucide-react';
import { UserSettings, WalletAccount, IncomeTemplate, WalletType } from '@/lib/types';
import { formatNumberInput, parseNumberInput } from '@/lib/utils';
import { usePrivacy } from '@/components/PrivacyProvider';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: UserSettings;
  onSaveSettings: (settings: UserSettings) => void;
  onClaimSalary: (template: IncomeTemplate) => void;
  showToast?: (message: string, type?: 'success' | 'error' | 'info') => void;
  totalMonthlyIncome?: number;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  onClaimSalary,
  showToast,
  totalMonthlyIncome = 0,
}) => {
  const { formatCurrency } = usePrivacy();
  const [activeTab, setActiveTab] = useState<'WALLETS' | 'SALARY' | 'BUDGET'>('WALLETS');
  const [wallets, setWallets] = useState<WalletAccount[]>([]);
  const [incomeTemplates, setIncomeTemplates] = useState<IncomeTemplate[]>([]);
  const [monthlyExpenseBudget, setMonthlyExpenseBudget] = useState(5000000);

  // Form New Wallet
  const [newWalletName, setNewWalletName] = useState('');
  const [newWalletType, setNewWalletType] = useState<WalletType>('BANK');
  const [newWalletBalance, setNewWalletBalance] = useState<number>(0);

  // Form New Template Gaji
  const [newSalaryName, setNewSalaryName] = useState('');
  const [newSalaryAmount, setNewSalaryAmount] = useState<number>(0);
  const [newSalaryWalletId, setNewSalaryWalletId] = useState('');

  useEffect(() => {
    if (settings) {
      setWallets(settings.wallets || []);
      setIncomeTemplates(settings.incomeTemplates || []);
      setMonthlyExpenseBudget(settings.monthlyExpenseBudget || 5000000);
      if (settings.wallets && settings.wallets.length > 0) {
        setNewSalaryWalletId(settings.wallets[0].id);
      }
    }
  }, [settings, isOpen]);

  if (!isOpen) return null;

  const totalWalletBalance = wallets.reduce((sum, w) => sum + (w.balance || 0), 0);

  const handleAddWallet = () => {
    if (!newWalletName.trim()) return;
    const newW: WalletAccount = {
      id: `w-${Date.now()}`,
      name: newWalletName.trim(),
      type: newWalletType,
      balance: Number(newWalletBalance) || 0,
    };
    setWallets([...wallets, newW]);
    setNewWalletName('');
    setNewWalletBalance(0);
    if (showToast) showToast(`Rekening ${newW.name} berhasil ditambahkan!`, 'success');
  };

  const handleDeleteWallet = (id: string) => {
    setWallets(wallets.filter(w => w.id !== id));
  };

  const handleAddSalaryTemplate = () => {
    if (!newSalaryName.trim() || !newSalaryWalletId) return;
    const newT: IncomeTemplate = {
      id: `inc-${Date.now()}`,
      name: newSalaryName.trim(),
      amount: Number(newSalaryAmount) || 0,
      category: 'Gaji',
      targetWalletId: newSalaryWalletId,
    };
    setIncomeTemplates([...incomeTemplates, newT]);
    setNewSalaryName('');
    setNewSalaryAmount(0);
    if (showToast) showToast(`Template gaji "${newT.name}" berhasil dibuat!`, 'success');
  };

  const handleDeleteSalaryTemplate = (id: string) => {
    setIncomeTemplates(incomeTemplates.filter(t => t.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings({
      wallets,
      incomeTemplates,
      monthlyExpenseBudget: Number(monthlyExpenseBudget),
    });
    if (showToast) showToast('Pengaturan keuangan berhasil disimpan!', 'success');
    onClose();
  };

  const getWalletIcon = (type: WalletType) => {
    switch (type) {
      case 'BANK': return <Building2 className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />;
      case 'EWALLET': return <QrCode className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
      case 'CASH': return <Banknote className="w-4 h-4 text-amber-600 dark:text-amber-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-slate-900/40 dark:bg-slate-950/85 backdrop-blur-md animate-fade-in overflow-hidden">
      <div className="glass-panel rounded-3xl max-w-xl w-full max-h-[92vh] flex flex-col border border-slate-200/90 dark:border-slate-700/80 shadow-2xl relative my-auto transition-colors duration-300">
        
        {/* Sticky Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 pb-3 sm:pb-4 border-b border-slate-200 dark:border-slate-800 shrink-0">
          <div className="flex items-center space-x-3 min-w-0">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-emerald-500/20 via-teal-500/20 to-cyan-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 shadow-md shrink-0">
              <Sliders className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight truncate">
                Pengaturan Multi-Wallet
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate">
                Kelola saldo dompet, gaji, & limit budget bulanan
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Modal Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          
          {/* Total Wallet Summary Banner */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-cyan-500/10 border border-emerald-500/20 flex items-center justify-between gap-2">
            <div className="flex items-center space-x-3 min-w-0">
              <div className="p-2 sm:p-2.5 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 shrink-0">
                <Wallet className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block truncate">
                  Total Saldo Cash & Wallet
                </span>
                <div className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight truncate">
                  {formatCurrency(totalWalletBalance)}
                </div>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-extrabold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/25 shrink-0">
              {wallets.length} Akun
            </span>
          </div>

          {/* Compact Mobile Tab Navigation */}
          <div className="grid grid-cols-3 gap-1 p-1 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold">
            <button
              type="button"
              onClick={() => setActiveTab('WALLETS')}
              className={`py-2 rounded-xl flex items-center justify-center gap-1 transition-all ${
                activeTab === 'WALLETS'
                  ? 'bg-emerald-500 text-slate-950 shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span className="truncate"><span className="hidden sm:inline">Rekening & </span>Wallet</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('SALARY')}
              className={`py-2 rounded-xl flex items-center justify-center gap-1 transition-all ${
                activeTab === 'SALARY'
                  ? 'bg-teal-500 text-slate-950 shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <PiggyBank className="w-3.5 h-3.5" />
              <span className="truncate"><span className="hidden sm:inline">Template </span>Gaji</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('BUDGET')}
              className={`py-2 rounded-xl flex items-center justify-center gap-1 transition-all ${
                activeTab === 'BUDGET'
                  ? 'bg-cyan-500 text-slate-950 shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Target className="w-3.5 h-3.5" />
              <span className="truncate"><span className="hidden sm:inline">Batas </span>Budget</span>
            </button>
          </div>

          <form id="settings-form" onSubmit={handleSubmit} className="space-y-4">
            {/* TAB 1: REKENING & MULTI-WALLET */}
            {activeTab === 'WALLETS' && (
              <div className="space-y-4 animate-fade-in">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Wallet className="w-4 h-4" /> Daftar Rekening, E-Wallet & Cash
                  </h4>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    Total: <strong className="text-slate-900 dark:text-white">{wallets.length} Akun</strong>
                  </span>
                </div>
                
                {/* Wallet list items */}
                <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                  {wallets.length === 0 ? (
                    <div className="text-center py-6 glass-card rounded-2xl text-slate-400 text-xs font-medium">
                      Belum ada rekening/wallet. Tambahkan di bawah.
                    </div>
                  ) : (
                    wallets.map((w, idx) => (
                      <div 
                        key={w.id} 
                        className="flex flex-col xs:flex-row xs:items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all gap-2 shadow-sm"
                      >
                        <div className="flex items-center space-x-2.5 min-w-0">
                          <div className="p-2 rounded-xl bg-slate-200/80 dark:bg-slate-800 border border-slate-300/60 dark:border-slate-700/60 shrink-0">
                            {getWalletIcon(w.type)}
                          </div>
                          <div className="min-w-0">
                            <div className="font-extrabold text-slate-900 dark:text-white text-sm truncate">{w.name}</div>
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold uppercase">
                              {w.type}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between xs:justify-end space-x-2 pt-1 xs:pt-0 border-t xs:border-t-0 border-slate-200/60 dark:border-slate-800/60">
                          <div className="flex items-center space-x-1">
                            <span className="text-[10px] text-slate-400 font-semibold xs:hidden">Saldo: Rp</span>
                            <input
                              type="text"
                              value={formatNumberInput(w.balance)}
                              onChange={(e) => {
                                const updated = [...wallets];
                                updated[idx].balance = parseNumberInput(e.target.value);
                                setWallets(updated);
                              }}
                              className="w-28 xs:w-32 glass-input px-2.5 py-1 text-right rounded-xl text-xs font-black text-slate-900 dark:text-white"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => handleDeleteWallet(w.id)}
                            className="text-slate-400 hover:text-rose-500 p-1.5 rounded-xl hover:bg-rose-500/10 transition-colors"
                            title="Hapus Akun"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Form Add New Wallet Card */}
                <div className="p-3.5 rounded-2xl bg-slate-100/80 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 space-y-3">
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <Plus className="w-3.5 h-3.5 text-emerald-500" /> Tambah Rekening / E-Wallet Baru
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <input
                      type="text"
                      placeholder="Nama Akun (BCA, GoPay)"
                      value={newWalletName}
                      onChange={(e) => setNewWalletName(e.target.value)}
                      className="glass-input px-3 py-2 rounded-xl text-xs font-medium"
                    />
                    <select
                      value={newWalletType}
                      onChange={(e) => setNewWalletType(e.target.value as WalletType)}
                      className="glass-input px-3 py-2 rounded-xl text-xs font-medium bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700"
                    >
                      <option value="BANK">Bank Transfer</option>
                      <option value="EWALLET">E-Wallet</option>
                      <option value="CASH">Uang Tunai</option>
                    </select>
                    <input
                      type="text"
                      placeholder="Saldo Awal (Rp)"
                      value={formatNumberInput(newWalletBalance)}
                      onChange={(e) => setNewWalletBalance(parseNumberInput(e.target.value))}
                      className="glass-input px-3 py-2 rounded-xl text-xs font-medium"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleAddWallet}
                    disabled={!newWalletName.trim()}
                    className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-slate-950 text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95"
                  >
                    <Plus className="w-4 h-4" /> Tambah Akun Ke Daftar
                  </button>
                </div>
              </div>
            )}

            {/* TAB 2: TEMPLATE GAJI */}
            {activeTab === 'SALARY' && (
              <div className="space-y-4 animate-fade-in">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" /> Template Gaji Bulanan & Pencairan
                  </h4>
                </div>

                {/* Info banner */}
                <div className="p-3 rounded-xl bg-teal-500/10 border border-teal-500/20 text-xs text-teal-800 dark:text-teal-300 leading-relaxed flex items-start gap-2">
                  <Sparkles className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>
                    Klik <strong>"Cairkan Gaji!"</strong> untuk otomatis memasukkan nominal gaji ke rekening dompet pilihan.
                  </span>
                </div>

                {/* Salary template list */}
                <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                  {incomeTemplates.length === 0 ? (
                    <div className="text-center py-6 glass-card rounded-2xl text-slate-400 text-xs font-medium">
                      Belum ada template gaji. Buat template di bawah.
                    </div>
                  ) : (
                    incomeTemplates.map((template) => {
                      const targetW = wallets.find(w => w.id === template.targetWalletId);
                      return (
                        <div 
                          key={template.id} 
                          className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all gap-2 shadow-sm"
                        >
                          <div className="min-w-0">
                            <div className="font-extrabold text-slate-900 dark:text-white text-sm truncate">{template.name}</div>
                            <div className="text-[11px] text-teal-600 dark:text-teal-400 font-bold mt-0.5 truncate">
                              Rp {template.amount.toLocaleString('id-ID')} ➔ <span className="text-slate-600 dark:text-slate-300">{targetW?.name || 'Rekening'}</span>
                            </div>
                          </div>

                          <div className="flex items-center space-x-1.5 shrink-0">
                            <button
                              type="button"
                              onClick={() => onClaimSalary(template)}
                              className="px-2.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-black transition-all active:scale-95 shadow-md shadow-emerald-500/20 flex items-center gap-1"
                            >
                              <Sparkles className="w-3.5 h-3.5" /> Cairkan!
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteSalaryTemplate(template.id)}
                              className="text-slate-400 hover:text-rose-500 p-1.5 rounded-xl hover:bg-rose-500/10 transition-colors"
                              title="Hapus Template"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Form Add Salary Template */}
                <div className="p-3.5 rounded-2xl bg-slate-100/80 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 space-y-3">
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <Plus className="w-3.5 h-3.5 text-teal-500" /> Buat Template Gaji Bulanan Baru
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <input
                      type="text"
                      placeholder="Sumber (Gaji Utama)"
                      value={newSalaryName}
                      onChange={(e) => setNewSalaryName(e.target.value)}
                      className="glass-input px-3 py-2 rounded-xl text-xs font-medium"
                    />
                    <input
                      type="text"
                      placeholder="Nominal Gaji (Rp)"
                      value={formatNumberInput(newSalaryAmount)}
                      onChange={(e) => setNewSalaryAmount(parseNumberInput(e.target.value))}
                      className="glass-input px-3 py-2 rounded-xl text-xs font-medium"
                    />
                    <select
                      value={newSalaryWalletId}
                      onChange={(e) => setNewSalaryWalletId(e.target.value)}
                      className="glass-input px-3 py-2 rounded-xl text-xs font-medium bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700"
                    >
                      {wallets.map(w => (
                        <option key={w.id} value={w.id}>{w.name}</option>
                      ))}
                    </select>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddSalaryTemplate}
                    disabled={!newSalaryName.trim()}
                    className="w-full py-2.5 rounded-xl bg-teal-500 hover:bg-teal-600 disabled:opacity-50 text-slate-950 text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95"
                  >
                    <Plus className="w-4 h-4" /> Simpan Template Gaji
                  </button>
                </div>
              </div>
            )}

            {/* TAB 3: BATAS BUDGET */}
            {activeTab === 'BUDGET' && (
              <div className="space-y-4 animate-fade-in">
                <h4 className="text-xs font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Target className="w-4 h-4" /> Target & Batas Maksimum Budget Bulanan
                </h4>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Batas Maksimum Pengeluaran per Bulan (Rp)
                  </label>

                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">Rp</span>
                    <input
                      type="text"
                      value={formatNumberInput(monthlyExpenseBudget)}
                      onChange={(e) => setMonthlyExpenseBudget(parseNumberInput(e.target.value))}
                      className="w-full glass-input pl-9 pr-4 py-3 rounded-2xl text-base font-black text-slate-900 dark:text-white"
                    />
                  </div>

                  {/* Percentage vs Monthly Income Badge */}
                  {totalMonthlyIncome > 0 ? (
                    <div className="flex items-center justify-between text-xs font-medium text-cyan-700 dark:text-cyan-300 bg-cyan-500/10 p-2.5 rounded-xl border border-cyan-500/20">
                      <span>Rasio vs Pemasukan:</span>
                      <strong className="font-extrabold text-cyan-600 dark:text-cyan-400">
                        {Math.round((monthlyExpenseBudget / totalMonthlyIncome) * 100)}% Pemasukan
                      </strong>
                    </div>
                  ) : (
                    <div className="text-[11px] text-slate-500 italic">
                      (Belum ada data pemasukan bulan ini untuk menghitung rasio)
                    </div>
                  )}

                  {/* Quick Presets */}
                  <div className="space-y-1.5">
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium block">Pilihan Cepat (Preset Budget):</span>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                      {[3000000, 5000000, 8000000, 10000000, 15000000, 20000000].map(val => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setMonthlyExpenseBudget(val)}
                          className={`py-1.5 px-2 rounded-xl text-[11px] font-extrabold transition-all border text-center ${
                            monthlyExpenseBudget === val
                              ? 'bg-cyan-500 text-slate-950 border-cyan-500 shadow-md'
                              : 'bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-300 dark:hover:bg-slate-700'
                          }`}
                        >
                          {(val / 1000000).toFixed(0)} Juta
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Sticky Action Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 shrink-0 bg-slate-100/50 dark:bg-slate-950/50 rounded-b-3xl">
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="w-1/3 py-3 rounded-2xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-extrabold text-xs transition-all"
            >
              Batal
            </button>
            <button
              type="submit"
              form="settings-form"
              className="w-2/3 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:brightness-110 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center space-x-2 transition-all active:scale-95 shadow-lg shadow-emerald-500/20"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Pengaturan</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
