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
  Coins,
  Sparkles,
  CreditCard,
  Target
} from 'lucide-react';
import { UserSettings, WalletAccount, IncomeTemplate, WalletType } from '@/lib/types';
import { formatNumberInput, parseNumberInput } from '@/lib/utils';

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

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  };

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 dark:bg-slate-950/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="glass-panel rounded-3xl max-w-xl w-full p-5 sm:p-6 border border-slate-200/90 dark:border-slate-700/80 shadow-2xl relative my-6 transition-colors duration-300">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between mb-5 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-emerald-500/20 via-teal-500/20 to-cyan-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 shadow-md">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">
                Pengaturan Keuangan & Multi-Wallet
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Kelola saldo dompet, template gaji, dan batas budget bulanan
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

        {/* Total Wallet Summary Banner */}
        <div className="mb-5 p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-cyan-500/10 border border-emerald-500/20 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Total Saldo Cash & Wallet
              </span>
              <div className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                {formatCurrency(totalWalletBalance)}
              </div>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/25">
            {wallets.length} Akun Active
          </span>
        </div>

        {/* Tab Navigation */}
        <div className="grid grid-cols-3 gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 mb-5 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('WALLETS')}
            className={`py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'WALLETS'
                ? 'bg-emerald-500 text-slate-950 shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Rekening & Wallet</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('SALARY')}
            className={`py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'SALARY'
                ? 'bg-teal-500 text-slate-950 shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <PiggyBank className="w-3.5 h-3.5" />
            <span>Template Gaji</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('BUDGET')}
            className={`py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'BUDGET'
                ? 'bg-cyan-500 text-slate-950 shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Target className="w-3.5 h-3.5" />
            <span>Batas Budget</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* TAB 1: REKENING & MULTI-WALLET */}
          {activeTab === 'WALLETS' && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Wallet className="w-4 h-4" /> Daftar Rekening Bank, E-Wallet & Cash
                </h4>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  Total: <strong className="text-slate-900 dark:text-white">{wallets.length} Akun</strong>
                </span>
              </div>
              
              {/* Wallet list items */}
              <div className="space-y-2.5 max-h-52 overflow-y-auto pr-1">
                {wallets.length === 0 ? (
                  <div className="text-center py-6 glass-card rounded-2xl text-slate-400 text-xs">
                    Belum ada rekening/wallet. Tambahkan di bawah.
                  </div>
                ) : (
                  wallets.map((w, idx) => (
                    <div 
                      key={w.id} 
                      className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all shadow-sm"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="p-2 rounded-xl bg-slate-200/80 dark:bg-slate-800 border border-slate-300/60 dark:border-slate-700/60 shrink-0">
                          {getWalletIcon(w.type)}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white text-sm">{w.name}</div>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold uppercase">
                            {w.type}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <div className="text-right">
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Saldo (Rp)</span>
                          <input
                            type="text"
                            value={formatNumberInput(w.balance)}
                            onChange={(e) => {
                              const updated = [...wallets];
                              updated[idx].balance = parseNumberInput(e.target.value);
                              setWallets(updated);
                            }}
                            className="w-32 glass-input px-2.5 py-1 text-right rounded-xl text-xs font-bold text-slate-900 dark:text-white"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteWallet(w.id)}
                          className="text-slate-400 hover:text-rose-500 p-1.5 rounded-lg hover:bg-rose-500/10 transition-colors"
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
                  className="w-full py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-slate-950 text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95"
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
                  <CheckCircle2 className="w-4 h-4" /> Template Gaji Bulanan & Pencairan Otomatis
                </h4>
              </div>

              {/* Info banner */}
              <div className="p-3 rounded-xl bg-teal-500/10 border border-teal-500/20 text-xs text-teal-800 dark:text-teal-300 leading-relaxed flex items-start gap-2">
                <Sparkles className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  Template gaji mempermudah Anda mencairkan gaji bulanan secara cepat. Cukup klik <strong>"Cairkan Gaji!"</strong> untuk langsung mencatat transaksi pemasukan.
                </span>
              </div>

              {/* Salary template list */}
              <div className="space-y-2.5 max-h-52 overflow-y-auto pr-1">
                {incomeTemplates.length === 0 ? (
                  <div className="text-center py-6 glass-card rounded-2xl text-slate-400 text-xs">
                    Belum ada template gaji. Buat template di bawah.
                  </div>
                ) : (
                  incomeTemplates.map((template) => {
                    const targetW = wallets.find(w => w.id === template.targetWalletId);
                    return (
                      <div 
                        key={template.id} 
                        className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all shadow-sm"
                      >
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white text-sm">{template.name}</div>
                          <div className="text-[11px] text-teal-600 dark:text-teal-400 font-semibold mt-0.5">
                            Rp {template.amount.toLocaleString('id-ID')} ➔ <span className="text-slate-600 dark:text-slate-300">{targetW?.name || 'Rekening'}</span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <button
                            type="button"
                            onClick={() => onClaimSalary(template)}
                            className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-extrabold transition-all active:scale-95 shadow-md shadow-emerald-500/20 flex items-center gap-1"
                          >
                            <Sparkles className="w-3.5 h-3.5" /> Cairkan!
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteSalaryTemplate(template.id)}
                            className="text-slate-400 hover:text-rose-500 p-1.5 rounded-lg hover:bg-rose-500/10 transition-colors"
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
                    placeholder="Sumber (Gaji Kantor Utama)"
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
                  className="w-full py-2 rounded-xl bg-teal-500 hover:bg-teal-600 disabled:opacity-50 text-slate-950 text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95"
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
                    className="w-full glass-input pl-9 pr-4 py-3 rounded-2xl text-base font-extrabold text-slate-900 dark:text-white"
                  />
                </div>

                {/* Percentage vs Monthly Income Badge */}
                {totalMonthlyIncome > 0 ? (
                  <div className="flex items-center justify-between text-xs font-medium text-cyan-700 dark:text-cyan-300 bg-cyan-500/10 p-2.5 rounded-xl border border-cyan-500/20">
                    <span>Rasio Budget vs Pemasukan Bulan Ini:</span>
                    <strong className="font-extrabold text-cyan-600 dark:text-cyan-400">
                      {Math.round((monthlyExpenseBudget / totalMonthlyIncome) * 100)}% dari Pemasukan
                    </strong>
                  </div>
                ) : (
                  <div className="text-[11px] text-slate-500 italic">
                    (Belum ada data pemasukan di bulan ini untuk menghitung persentase rasio)
                  </div>
                )}

                {/* Quick Presets */}
                <div className="space-y-1.5">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium block">Pilihan Cepat (Preset Budget):</span>
                  <div className="flex flex-wrap gap-2">
                    {[3000000, 5000000, 8000000, 10000000, 15000000, 20000000].map(val => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setMonthlyExpenseBudget(val)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                          monthlyExpenseBudget === val
                            ? 'bg-cyan-500 text-slate-950 border-cyan-500 shadow-md'
                            : 'bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-300 dark:hover:bg-slate-700'
                        }`}
                      >
                        {formatCurrency(val)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Modal Footer Buttons */}
          <div className="flex items-center space-x-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="w-1/3 py-3 rounded-2xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition-all"
            >
              Batal
            </button>
            <button
              type="submit"
              className="w-2/3 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:brightness-110 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center space-x-2 transition-all active:scale-95 shadow-lg shadow-emerald-500/20"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Pengaturan</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
