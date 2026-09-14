import React, { useState, useMemo } from 'react';
import { 
  Receipt, 
  TrendingUp, 
  Search, 
  Trash2, 
  ChevronDown, 
  ChevronUp, 
  Plus, 
  Camera, 
  ArrowUpRight,
  ArrowDownLeft,
  ArrowRightLeft,
  Coins,
  Gem,
  Sparkles,
  Award,
  Calendar,
  CalendarDays
} from 'lucide-react';
import { CashTransaction, InvestmentAsset, AssetClass, WalletAccount } from '@/lib/types';
import { formatNumberInput, parseNumberInput, formatDateID, relativeTimeID } from '@/lib/utils';
import { WealthPieChart } from '@/components/WealthPieChart';
import { usePrivacy } from '@/components/PrivacyProvider';

interface DualColumnDashboardProps {
  transactions: CashTransaction[];
  investments: InvestmentAsset[];
  wallets: WalletAccount[];
  onDeleteTransaction: (id: string) => void;
  onOpenScanReceipt: () => void;
  onOpenScanPortfolio: () => void;
  onOpenManualTransaction: () => void;
  onAddInvestment: (asset: { assetClass: AssetClass, ticker: string, name: string, units: number, avgBuyPrice: number }) => void;
  isAssetsLoading?: boolean;
}

const GOLD_PROVIDERS = [
  { code: 'ANTAM', name: 'Emas Antam LM 24K (CertiCard)', defaultPrice: 2600000 },
  { code: 'PEGADAIAN', name: 'Pegadaian Tabungan Emas', defaultPrice: 2595000 },
  { code: 'UBS', name: 'Emas Batangan UBS 24K', defaultPrice: 2585000 },
  { code: 'GALERI24', name: 'Emas LM Galeri 24 (Pegadaian)', defaultPrice: 2590000 },
  { code: 'TREASURY', name: 'Treasury Emas Digital', defaultPrice: 2588000 },
  { code: 'PLUANG', name: 'Pluang Emas Digital', defaultPrice: 2588000 },
];

export const DualColumnDashboard: React.FC<DualColumnDashboardProps> = ({
  transactions,
  investments,
  wallets,
  onDeleteTransaction,
  onOpenScanReceipt,
  onOpenScanPortfolio,
  onOpenManualTransaction,
  onAddInvestment,
}) => {
  const { formatCurrency } = usePrivacy();
  const [searchTerm, setSearchTerm] = useState('');
  const [txTypeFilter, setTxTypeFilter] = useState<string>('ALL');
  const [assetTab, setAssetTab] = useState<AssetClass>('STOCK');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [viewByDay, setViewByDay] = useState<boolean>(true); // Mode Tampilan Per Hari

  // Form add manual investment
  const [showAddInv, setShowAddInv] = useState(false);
  const [invTicker, setInvTicker] = useState('ANTAM');
  const [invName, setInvName] = useState('Emas Antam LM 24K (CertiCard)');
  const [invUnits, setInvUnits] = useState<number>(0);
  const [invAvgPrice, setInvAvgPrice] = useState<number>(2600000);

  const filteredTransactions = transactions.filter(tx => {
    const matchesSearch = tx.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          tx.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = txTypeFilter === 'ALL' || tx.type === txTypeFilter;
    return matchesSearch && matchesType;
  });

  // Group transactions by date for Per Hari view
  const groupedByDay = useMemo(() => {
    const groups: Record<string, { date: string; items: CashTransaction[]; totalExpense: number; totalIncome: number }> = {};
    
    filteredTransactions.forEach(tx => {
      const dateKey = tx.date || 'Lainnya';
      if (!groups[dateKey]) {
        groups[dateKey] = { date: dateKey, items: [], totalExpense: 0, totalIncome: 0 };
      }
      groups[dateKey].items.push(tx);
      if (tx.type === 'EXPENSE') groups[dateKey].totalExpense += tx.amount;
      if (tx.type === 'INCOME') groups[dateKey].totalIncome += tx.amount;
    });

    return Object.values(groups).sort((a, b) => b.date.localeCompare(a.date));
  }, [filteredTransactions]);

  const filteredInvestments = investments.filter(inv => inv.assetClass === assetTab);

  const handleCreateInvestment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!invTicker.trim()) return;

    let finalName = invName.trim();
    if (assetTab === 'GOLD') {
      const match = GOLD_PROVIDERS.find(p => p.code === invTicker.toUpperCase());
      if (match && !invName) finalName = match.name;
    }

    onAddInvestment({
      assetClass: assetTab,
      ticker: invTicker.trim().toUpperCase(),
      name: finalName || invTicker.trim().toUpperCase(),
      units: Number(invUnits),
      avgBuyPrice: Number(invAvgPrice),
    });

    setInvTicker(assetTab === 'GOLD' ? 'ANTAM' : '');
    setInvName(assetTab === 'GOLD' ? 'Emas Antam LM 24K (CertiCard)' : '');
    setInvUnits(0);
    setInvAvgPrice(assetTab === 'GOLD' ? 2600000 : 0);
    setShowAddInv(false);
  };

  const getWalletName = (id: string) => {
    return wallets.find(w => w.id === id)?.name || id;
  };

  // Helper renderer single transaction card
  const renderTransactionCard = (tx: CashTransaction) => {
    const isExpanded = expandedId === tx.id;
    const isIncome = tx.type === 'INCOME';
    const isTransfer = tx.type === 'TRANSFER';
    const hasDetails = Boolean((tx.fees && tx.fees > 0) || (tx.discount && tx.discount > 0));

    return (
      <div 
        key={tx.id}
        className="glass-card rounded-xl p-3.5 transition-all border border-slate-200/80 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700/80 shadow-sm"
      >
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <div className={`p-2 rounded-xl border shrink-0 ${
              isIncome ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-600 dark:text-emerald-400' :
              isTransfer ? 'bg-cyan-500/20 border-cyan-500/30 text-cyan-600 dark:text-cyan-400' :
              'bg-rose-500/20 border-rose-500/30 text-rose-600 dark:text-rose-400'
            }`}>
              {isIncome ? <ArrowDownLeft className="w-4 h-4" /> :
               isTransfer ? <ArrowRightLeft className="w-4 h-4" /> :
               <ArrowUpRight className="w-4 h-4" />}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">{tx.title}</h3>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-400 font-medium">
                  {tx.category}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1.5">
                <span>{tx.date}</span>
                <span>•</span>
                <span className="text-slate-700 dark:text-slate-300 font-medium">
                  {isTransfer ? `${getWalletName(tx.walletId)} ➔ ${getWalletName(tx.toWalletId || '')}` : getWalletName(tx.walletId)}
                </span>
              </p>
            </div>
          </div>

          <div className="text-right">
            <div className={`text-sm font-extrabold tracking-tight ${
              isIncome ? 'text-emerald-600 dark:text-emerald-400' : isTransfer ? 'text-cyan-600 dark:text-cyan-400' : 'text-rose-600 dark:text-rose-400'
            }`}>
              {isIncome ? '+' : isTransfer ? '' : '-'}{formatCurrency(tx.amount)}
            </div>
            <button
              onClick={() => onDeleteTransaction(tx.id)}
              className="text-slate-400 hover:text-rose-500 p-1 transition-colors mt-1"
              title="Hapus Transaksi"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Expandable item details */}
        {hasDetails && (
          <div className="mt-2.5 pt-2 border-t border-slate-200 dark:border-slate-800/80">
            <button
              onClick={() => setExpandedId(isExpanded ? null : tx.id)}
              className="text-[11px] text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 font-medium flex items-center gap-1"
            >
              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              Lihat Rincian Transaksi
            </button>

            {isExpanded && (
              <div className="mt-2 p-2.5 rounded-lg bg-slate-100 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 space-y-1">
                {tx.items && tx.items.length > 0 && tx.items.map((prod, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs text-slate-700 dark:text-slate-300">
                    <span className="truncate max-w-[200px] text-slate-500 dark:text-slate-400">• {prod.name} ({prod.qty}x)</span>
                    <span>{formatCurrency(prod.subtotal)}</span>
                  </div>
                ))}
                
                {(tx.items && tx.items.length > 0) && (tx.fees! > 0 || tx.discount! > 0) && (
                  <div className="border-t border-slate-200 dark:border-slate-800 my-1.5" />
                )}
                
                {tx.mainAmount !== undefined && tx.mainAmount > 0 && !(tx.items && tx.items.length > 0) && (
                  <div className="flex items-center justify-between text-xs text-slate-700 dark:text-slate-300">
                    <span>Subtotal</span>
                    <span>{formatCurrency(tx.mainAmount)}</span>
                  </div>
                )}

                {tx.fees !== undefined && tx.fees > 0 && (
                  <div className="flex items-center justify-between text-xs text-slate-700 dark:text-slate-300">
                    <span>Biaya Tambahan</span>
                    <span className="text-rose-600 dark:text-rose-400">+{formatCurrency(tx.fees)}</span>
                  </div>
                )}

                {tx.discount !== undefined && tx.discount > 0 && (
                  <div className="flex items-center justify-between text-xs text-slate-700 dark:text-slate-300">
                    <span>Diskon</span>
                    <span className="text-emerald-600 dark:text-emerald-400">-{formatCurrency(tx.discount)}</span>
                  </div>
                )}
                
                <div className="border-t border-slate-200 dark:border-slate-800/80 my-1 pt-1 flex items-center justify-between text-xs font-bold text-slate-900 dark:text-white">
                  <span>Total</span>
                  <span>{formatCurrency(tx.amount)}</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* ========================================================= */}
      {/* KOLOM KIRI (7 cols): Arus Kas Terpadu */}
      {/* ========================================================= */}
      <div className="lg:col-span-7 flex flex-col space-y-4">
        <div className="glass-panel rounded-2xl p-4 sm:p-5 transition-colors duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Receipt className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                Riwayat Arus Kas Terpadu
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400">Pemasukan, Pengeluaran (AI Scan), & Transfer antar Dompet</p>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={onOpenScanReceipt}
                className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95 shadow-lg shadow-emerald-500/10"
              >
                <Camera className="w-3.5 h-3.5" /> Scan Struk/Bukti
              </button>
              <button
                onClick={onOpenManualTransaction}
                className="p-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 text-xs flex items-center gap-1 transition-all"
                title="Input Transaksi Manual"
              >
                <Plus className="w-4 h-4" /> <span className="hidden sm:inline">Tambah</span>
              </button>
            </div>
          </div>

          {/* Search & Transaction Type Filters */}
          <div className="flex flex-col space-y-2 mb-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cari transaksi, merchant, atau kategori..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full glass-input pl-9 pr-4 py-2 rounded-xl text-xs"
                suppressHydrationWarning
              />
            </div>

            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
                {[
                  { label: 'Semua Arus Kas', value: 'ALL' },
                  { label: 'Pengeluaran', value: 'EXPENSE' },
                  { label: 'Pemasukan', value: 'INCOME' },
                  { label: 'Transfer', value: 'TRANSFER' },
                ].map(f => (
                  <button
                    key={f.value}
                    onClick={() => setTxTypeFilter(f.value)}
                    className={`px-3 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                      txTypeFilter === f.value
                        ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                        : 'bg-slate-200 dark:bg-slate-800/60 text-slate-700 dark:text-slate-400 hover:bg-slate-300 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {/* Mode Tampilan Toggle (Per Hari vs Semua) */}
              <button
                onClick={() => setViewByDay(!viewByDay)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-extrabold flex items-center gap-1.5 transition-all border ${
                  viewByDay
                    ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 shadow-sm'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                }`}
                title="Ganti Mode Tampilan Transaksi (Per Hari / Flat)"
              >
                <CalendarDays className="w-3.5 h-3.5" />
                <span>{viewByDay ? 'Grup: Per Hari' : 'Grup: Semua'}</span>
              </button>
            </div>
          </div>

          {/* List Transactions */}
          <div className="space-y-4 max-h-[580px] overflow-y-auto pr-1">
            {filteredTransactions.length === 0 ? (
              <div className="text-center py-10 glass-card rounded-xl">
                <Receipt className="w-8 h-8 text-slate-400 dark:text-slate-600 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Belum Ada Catatan Transaksi</p>
                <p className="text-xs text-slate-500 mt-1">Unggah foto struk belanja atau catat transaksi Anda.</p>
              </div>
            ) : viewByDay ? (
              // Mode Tampilan Per Hari
              groupedByDay.map(group => (
                <div key={group.date} className="space-y-2">
                  {/* Sticky Day Header Banner */}
                  <div className="sticky top-0 z-10 px-3 py-1.5 rounded-xl bg-slate-200/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-300/80 dark:border-slate-800 flex items-center justify-between text-xs font-bold shadow-sm">
                    <div className="flex items-center space-x-2 text-slate-800 dark:text-slate-200">
                      <Calendar className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>{formatDateID(group.date)}</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-semibold border border-emerald-500/20">
                        {relativeTimeID(group.date)}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 text-[11px]">
                      {group.totalExpense > 0 && (
                        <span className="text-rose-600 dark:text-rose-400 font-extrabold">
                          -{formatCurrency(group.totalExpense)}
                        </span>
                      )}
                      {group.totalIncome > 0 && (
                        <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">
                          +{formatCurrency(group.totalIncome)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Transaksi di hari tersebut */}
                  <div className="space-y-2 pl-1 sm:pl-2 border-l-2 border-slate-200/80 dark:border-slate-800/80 ml-2">
                    {group.items.map(tx => renderTransactionCard(tx))}
                  </div>
                </div>
              ))
            ) : (
              // Mode Tampilan Flat List
              filteredTransactions.map(tx => renderTransactionCard(tx))
            )}
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* KOLOM KANAN (5 cols): Portofolio Investasi (Saham, Kripto, Emas) */}
      {/* ========================================================= */}
      <div className="lg:col-span-5 flex flex-col space-y-4">
        <div className="glass-panel rounded-2xl p-4 sm:p-5 transition-colors duration-300">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                Portofolio Investasi
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400">Live prices & PnL (Saham, Crypto, Emas)</p>
            </div>

            <div className="flex items-center space-x-1.5">
              <button
                onClick={onOpenScanPortfolio}
                className="px-2.5 py-1.5 rounded-xl bg-teal-500/20 hover:bg-teal-500/30 text-teal-700 dark:text-teal-300 border border-teal-500/30 text-xs font-semibold flex items-center gap-1 transition-all active:scale-95"
              >
                <Camera className="w-3.5 h-3.5" /> Scan Investasi
              </button>
              <button
                onClick={() => setShowAddInv(!showAddInv)}
                className="p-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 text-xs transition-all"
                title="Tambah Aset Manual"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Form Quick Add Investment */}
          {showAddInv && (
            <form onSubmit={handleCreateInvestment} className="mb-4 p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="text-xs font-extrabold text-teal-600 dark:text-teal-400 uppercase flex items-center gap-1.5">
                {assetTab === 'GOLD' ? <Gem className="w-4 h-4 text-yellow-500" /> : <TrendingUp className="w-4 h-4" />}
                Tambah Aset {assetTab === 'GOLD' ? 'Emas Logam Mulia / Tabungan' : assetTab}
              </div>

              {/* Special Gold Form Fields */}
              {assetTab === 'GOLD' ? (
                <>
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400">Pilih Produsen / Provider Emas:</label>
                    <select
                      value={invTicker}
                      onChange={(e) => {
                        const val = e.target.value;
                        setInvTicker(val);
                        const match = GOLD_PROVIDERS.find(p => p.code === val);
                        if (match) {
                          setInvName(match.name);
                          if (!invAvgPrice || invAvgPrice === 1350000) setInvAvgPrice(match.defaultPrice);
                        }
                      }}
                      className="w-full glass-input px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700"
                    >
                      {GOLD_PROVIDERS.map(p => (
                        <option key={p.code} value={p.code}>{p.name} — Rp {p.defaultPrice.toLocaleString('id-ID')}/gr</option>
                      ))}
                    </select>
                  </div>

                  {/* Preset Quick Gram Buttons */}
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400">Pilihan Cepat Berat Emas:</label>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {[0.5, 1, 2, 5, 10, 25, 50, 100].map(g => (
                        <button
                          type="button"
                          key={g}
                          onClick={() => setInvUnits(g)}
                          className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${
                            invUnits === g
                              ? 'bg-amber-500 text-slate-950 shadow'
                              : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-amber-400 hover:text-slate-950'
                          }`}
                        >
                          {g} gr
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400">Berat Emas (Gram):</label>
                      <input
                        type="number"
                        step="0.001"
                        placeholder="Contoh: 10"
                        value={invUnits || ''}
                        onChange={(e) => setInvUnits(Number(e.target.value))}
                        className="w-full glass-input px-2.5 py-1.5 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400">Harga Beli / Gram (Rp):</label>
                      <input
                        type="text"
                        placeholder="2.600.000"
                        value={formatNumberInput(invAvgPrice)}
                        onChange={(e) => setInvAvgPrice(parseNumberInput(e.target.value))}
                        className="w-full glass-input px-2.5 py-1.5 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
                        required
                      />
                    </div>
                  </div>

                  {invUnits > 0 && invAvgPrice > 0 && (
                    <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-1 text-[11px]">
                      <div className="flex items-center justify-between text-slate-700 dark:text-slate-300 font-semibold">
                        <span>Modal Pembelian ({invUnits} gr):</span>
                        <span className="font-extrabold text-slate-900 dark:text-white">{formatCurrency(invUnits * invAvgPrice)}</span>
                      </div>
                      <div className="flex items-center justify-between text-teal-700 dark:text-teal-300 font-semibold">
                        <span>Valuasi Pasaran Live (~Rp 2.600.000/gr):</span>
                        <span className="font-bold">{formatCurrency(invUnits * 2600000)}</span>
                      </div>
                      <div className="flex items-center justify-between text-amber-800 dark:text-amber-300 font-semibold pt-1 border-t border-amber-500/20">
                        <span>Estimasi Buyback / Pencairan Tunai (~94%):</span>
                        <span className="font-black text-amber-600 dark:text-amber-400">{formatCurrency(invUnits * Math.round(2600000 * 0.94))}</span>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder={assetTab === 'STOCK' ? 'Ticker (BBCA)' : 'Ticker (BTC)'}
                      value={invTicker}
                      onChange={(e) => setInvTicker(e.target.value)}
                      className="glass-input px-2.5 py-1.5 rounded-xl text-xs"
                      required
                    />
                    <input
                      type="number"
                      placeholder={assetTab === 'STOCK' ? 'Jumlah (Lot)' : 'Jumlah (Coin)'}
                      value={invUnits || ''}
                      onChange={(e) => setInvUnits(Number(e.target.value))}
                      className="glass-input px-2.5 py-1.5 rounded-xl text-xs"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Avg Beli (Rp)"
                      value={formatNumberInput(invAvgPrice)}
                      onChange={(e) => setInvAvgPrice(parseNumberInput(e.target.value))}
                      className="glass-input px-2.5 py-1.5 rounded-xl text-xs"
                      required
                    />
                  </div>
                </>
              )}

              <button
                type="submit"
                className="w-full py-2 rounded-xl bg-teal-500 hover:bg-teal-600 text-slate-950 font-black text-xs uppercase tracking-wider transition-all shadow-md active:scale-95"
              >
                Simpan Aset {assetTab === 'GOLD' ? 'Emas' : assetTab}
              </button>
            </form>
          )}

          {/* Asset Class Tabs (Saham, Kripto, Emas) */}
          <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-slate-200 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 mb-4 text-xs font-bold">
            <button
              onClick={() => {
                setAssetTab('STOCK');
                setInvTicker('');
              }}
              className={`py-1.5 rounded-lg flex items-center justify-center gap-1 transition-all ${
                assetTab === 'STOCK' ? 'bg-teal-500 text-slate-950 shadow-md' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" /> Saham
            </button>
            <button
              onClick={() => {
                setAssetTab('CRYPTO');
                setInvTicker('');
              }}
              className={`py-1.5 rounded-lg flex items-center justify-center gap-1 transition-all ${
                assetTab === 'CRYPTO' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Coins className="w-3.5 h-3.5" /> Kripto
            </button>
            <button
              onClick={() => {
                setAssetTab('GOLD');
                setInvTicker('ANTAM');
                setInvName('Emas Antam LM 24K');
              }}
              className={`py-1.5 rounded-lg flex items-center justify-center gap-1 transition-all ${
                assetTab === 'GOLD' ? 'bg-yellow-400 text-slate-950 shadow-md' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Gem className="w-3.5 h-3.5" /> Emas Fisik
            </button>
          </div>

          {/* Asset Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <th className="pb-2 pl-2">Aset</th>
                  <th className="pb-2 text-center">{assetTab === 'GOLD' ? 'Berat' : 'Unit'}</th>
                  <th className="pb-2 text-right">Live Price</th>
                  <th className="pb-2 pr-2 text-right">PnL</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/80 dark:divide-slate-800/60 text-xs">
                {filteredInvestments.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-8 text-slate-500">
                      Belum ada aset {assetTab === 'GOLD' ? 'Emas' : assetTab}. Tambahkan aset secara manual atau scan portofolio Anda.
                    </td>
                  </tr>
                ) : (
                  filteredInvestments.map(inv => {
                    const isProfit = inv.pnlAmount >= 0;
                    return (
                      <tr key={inv.id} className="hover:bg-slate-100 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 pl-2">
                          <div className="font-extrabold text-slate-900 dark:text-white text-sm tracking-wide flex items-center gap-1.5">
                            {inv.assetClass === 'GOLD' && <Award className="w-3.5 h-3.5 text-amber-500 shrink-0" />}
                            <span>{inv.ticker}</span>
                          </div>
                          <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate max-w-[120px]">{inv.name}</div>
                        </td>
                        <td className="py-3 text-center font-extrabold text-slate-700 dark:text-slate-200">
                          {inv.assetClass === 'STOCK' ? `${inv.units / 100} Lot` : `${inv.units} ${inv.assetClass === 'GOLD' ? 'Gram' : 'Coin'}`}
                        </td>
                        <td className="py-3 text-right">
                          <div className="text-[11px] text-teal-600 dark:text-teal-400 font-semibold">Rp {inv.currentPrice.toLocaleString('id-ID')}</div>
                          {inv.assetClass === 'GOLD' && <span className="text-[9px] text-slate-500 block">per gram</span>}
                        </td>
                        <td className="py-3 pr-2 text-right">
                          <div className={`font-bold ${isProfit ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                            {isProfit ? '+' : ''}{formatCurrency(inv.pnlAmount)}
                          </div>
                          <div className={`text-[10px] font-semibold ${isProfit ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                            {isProfit ? '+' : ''}{inv.pnlPercentage}%
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Wealth Allocation Pie Chart — Full width in right column */}
        <WealthPieChart investments={investments} wallets={wallets} />
      </div>
    </div>
  );
};
