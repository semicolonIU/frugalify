'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  CheckCircle, 
  Plus, 
  Trash2, 
  Sparkles, 
  ArrowRightLeft, 
  ArrowDownLeft, 
  ArrowUpRight,
  Receipt,
  Wallet,
  Tag,
  Calendar,
  Building2,
  Percent,
  Coins
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CashTransaction, TransactionType, PlatformType, PurchasedItem, WalletAccount } from '@/lib/types';
import { formatNumberInput, parseNumberInput } from '@/lib/utils';

interface InteractiveFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData: Partial<CashTransaction> | null;
  wallets: WalletAccount[];
  onSaveTransaction: (transaction: CashTransaction) => void;
  showToast?: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export const InteractiveFormModal: React.FC<InteractiveFormModalProps> = ({
  isOpen,
  onClose,
  initialData,
  wallets,
  onSaveTransaction,
  showToast,
}) => {
  const [type, setType] = useState<TransactionType>('EXPENSE');
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const [date, setDate] = useState('');
  const [category, setCategory] = useState('Makanan & Groceries');
  const [walletId, setWalletId] = useState('');
  const [toWalletId, setToWalletId] = useState('');

  // Fields for scan receipt details
  const [platform, setPlatform] = useState<PlatformType>('Struk Belanja Fisik');
  const [mainAmount, setMainAmount] = useState<number>(0);
  const [fees, setFees] = useState<number>(0);
  const [discount, setDiscount] = useState<number>(0);
  const [items, setItems] = useState<PurchasedItem[]>([]);
  const [showItemDetails, setShowItemDetails] = useState(false);

  useEffect(() => {
    if (wallets.length > 0 && !walletId) {
      setWalletId(wallets[0].id);
      if (wallets.length > 1) {
        setToWalletId(wallets[1].id);
      }
    }
  }, [wallets]);

  useEffect(() => {
    if (initialData) {
      const anyData = initialData as any;
      setType(initialData.type || 'EXPENSE');
      setTitle(initialData.title || anyData.storeName || '');
      setDate(initialData.date || new Date().toISOString().substring(0, 10));
      setCategory(initialData.category || 'Makanan & Groceries');
      setWalletId(initialData.walletId || (wallets[0]?.id || ''));
      setToWalletId(initialData.toWalletId || (wallets[1]?.id || ''));
      setPlatform(initialData.platform || 'Struk Belanja Fisik');
      setMainAmount(initialData.mainAmount || 0);
      setFees(initialData.fees || 0);
      setDiscount(initialData.discount || 0);
      setAmount(initialData.amount || anyData.totalAmount || 0);

      const parsedItems = (initialData.items || []).map(item => ({
        ...item,
        id: item.id || `i-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`
      }));
      setItems(parsedItems);
      if (parsedItems.length > 0) setShowItemDetails(true);
    } else {
      setType('EXPENSE');
      setTitle('');
      setDate(new Date().toISOString().substring(0, 10));
      setCategory('Makanan & Groceries');
      setWalletId(wallets[0]?.id || '');
      setToWalletId(wallets[1]?.id || '');
      setPlatform('Struk Belanja Fisik');
      setMainAmount(0);
      setFees(0);
      setDiscount(0);
      setAmount(0);
      setItems([]);
      setShowItemDetails(false);
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  // Auto calculate total expense if line items exist
  const itemsSum = items.reduce((acc, curr) => acc + curr.subtotal, 0);
  const effectiveMainAmount = items.length > 0 ? itemsSum : mainAmount;
  const computedExpenseTotal = type === 'EXPENSE' && items.length > 0
    ? Math.max(0, effectiveMainAmount + fees - discount)
    : amount;

  const handleAddItem = () => {
    const newItem: PurchasedItem = {
      id: `i-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: 'Item Produk Baru',
      price: 10000,
      qty: 1,
      subtotal: 10000,
    };
    setItems([...items, newItem]);
  };

  const handleItemChange = (id: string, field: keyof PurchasedItem, value: any) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        if (field === 'price' || field === 'qty') {
          updated.subtotal = Number(updated.price) * Number(updated.qty);
        }
        return updated;
      }
      return item;
    }));
  };

  const handleRemoveItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      if (showToast) showToast('Judul / Nama Merchant wajib diisi', 'error');
      else alert('Judul / Nama Merchant wajib diisi');
      return;
    }

    if (type === 'TRANSFER' && walletId === toWalletId) {
      if (showToast) showToast('Dompet asal dan dompet tujuan tidak boleh sama!', 'error');
      else alert('Dompet asal dan dompet tujuan tidak boleh sama!');
      return;
    }

    const finalAmount = type === 'EXPENSE' && items.length > 0 ? computedExpenseTotal : Number(amount);

    const transaction: CashTransaction = {
      id: initialData?.id || `tx-${Date.now()}`,
      type,
      title: title.trim(),
      amount: finalAmount,
      date: date || new Date().toISOString().substring(0, 10),
      category: type === 'TRANSFER' ? 'Transfer Dana' : category,
      walletId,
      toWalletId: type === 'TRANSFER' ? toWalletId : undefined,
      platform: type === 'EXPENSE' ? platform : undefined,
      mainAmount: type === 'EXPENSE' ? effectiveMainAmount : undefined,
      fees: type === 'EXPENSE' ? Number(fees) : undefined,
      discount: type === 'EXPENSE' ? Number(discount) : undefined,
      items: type === 'EXPENSE' && items.length > 0 ? items : undefined,
      createdAt: new Date().toISOString(),
    };

    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.7 }
      });
    } catch (e) {}

    onSaveTransaction(transaction);
    onClose();
  };

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 dark:bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div className="glass-panel rounded-3xl max-w-lg w-full p-5 sm:p-6 border border-slate-200/90 dark:border-slate-700/80 shadow-2xl relative my-6 transition-colors duration-300">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center space-x-3">
            <div className={`p-2.5 rounded-2xl border ${
              type === 'EXPENSE' ? 'bg-rose-500/20 text-rose-600 dark:text-rose-400 border-rose-500/30' :
              type === 'INCOME' ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30' :
              'bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 border-cyan-500/30'
            }`}>
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">
                Pencatatan Arus Kas
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Catat pengeluaran, pemasukan, atau pemindahan saldo
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

        {/* Transaction Type Segmented Control */}
        <div className="grid grid-cols-3 gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 mb-5 text-xs font-bold">
          <button
            type="button"
            onClick={() => setType('EXPENSE')}
            className={`py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
              type === 'EXPENSE'
                ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <ArrowUpRight className="w-4 h-4" />
            <span>Pengeluaran</span>
          </button>
          <button
            type="button"
            onClick={() => setType('INCOME')}
            className={`py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
              type === 'INCOME'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <ArrowDownLeft className="w-4 h-4" />
            <span>Pemasukan</span>
          </button>
          <button
            type="button"
            onClick={() => setType('TRANSFER')}
            className={`py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
              type === 'TRANSFER'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <ArrowRightLeft className="w-4 h-4" />
            <span>Transfer</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Main Title / Store Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              {type === 'INCOME' ? 'Sumber Pemasukan' : type === 'TRANSFER' ? 'Keterangan Transfer' : 'Nama Toko / Merchant / Deskripsi'}
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={type === 'INCOME' ? 'Contoh: Gaji Bulanan, Bonus, Freelance Project' : type === 'TRANSFER' ? 'Contoh: Top Up GoPay dari Rekening BCA' : 'Contoh: Superindo, Shopee, Cafe Kopi'}
              className="w-full glass-input px-3.5 py-2.5 rounded-2xl text-xs font-semibold text-slate-900 dark:text-white"
            />
          </div>

          {/* Wallets & Category Grid */}
          {type === 'TRANSFER' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                  <Wallet className="w-3.5 h-3.5 text-cyan-500" /> Dompet Asal
                </label>
                <select
                  value={walletId}
                  onChange={(e) => setWalletId(e.target.value)}
                  className="w-full glass-input px-3 py-2 rounded-2xl text-xs font-medium bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700"
                >
                  {wallets.map(w => (
                    <option key={w.id} value={w.id}>{w.name} (Rp {w.balance.toLocaleString('id-ID')})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                  <Wallet className="w-3.5 h-3.5 text-emerald-500" /> Dompet Tujuan
                </label>
                <select
                  value={toWalletId}
                  onChange={(e) => setToWalletId(e.target.value)}
                  className="w-full glass-input px-3 py-2 rounded-2xl text-xs font-medium bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700"
                >
                  {wallets.map(w => (
                    <option key={w.id} value={w.id}>{w.name} (Rp {w.balance.toLocaleString('id-ID')})</option>
                  ))}
                </select>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                  <Wallet className="w-3.5 h-3.5 text-emerald-500" /> 
                  {type === 'INCOME' ? 'Masuk ke Dompet' : 'Gunakan Dompet'}
                </label>
                <select
                  value={walletId}
                  onChange={(e) => setWalletId(e.target.value)}
                  className="w-full glass-input px-3 py-2 rounded-2xl text-xs font-medium bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700"
                >
                  {wallets.map(w => (
                    <option key={w.id} value={w.id}>{w.name} (Rp {w.balance.toLocaleString('id-ID')})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5 text-amber-500" /> Kategori
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full glass-input px-3 py-2 rounded-2xl text-xs font-medium bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700"
                >
                  {type === 'INCOME' ? (
                    <>
                      <option value="Gaji">Gaji</option>
                      <option value="Bonus">Bonus & THR</option>
                      <option value="Freelance">Freelance / Usaha</option>
                      <option value="Investasi">Hasil Investasi</option>
                      <option value="Lainnya">Lainnya</option>
                    </>
                  ) : (
                    <>
                      <option value="Makanan & Groceries">Makanan & Groceries</option>
                      <option value="Belanja Shopee">Belanja Shopee / E-Commerce</option>
                      <option value="Tagihan & Utilitas">Tagihan & Utilitas</option>
                      <option value="Transportasi">Transportasi</option>
                      <option value="Hiburan & Lifestyle">Hiburan & Lifestyle</option>
                      <option value="Lainnya">Lainnya</option>
                    </>
                  )}
                </select>
              </div>
            </div>
          )}

          {/* Amount & Nominal Section */}
          {type === 'EXPENSE' ? (
            <div className="space-y-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200">
                <span>Rincian Pengeluaran</span>
                {items.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowItemDetails(!showItemDetails)}
                    className="text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline font-semibold"
                  >
                    {showItemDetails ? 'Sembunyikan Line Items' : `Lihat ${items.length} Item Produk`}
                  </button>
                )}
              </div>

              {/* Subtotal, Biaya, Diskon grid */}
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                    {items.length > 0 ? 'Total Item (Auto)' : 'Subtotal (Rp)'}
                  </label>
                  <input
                    type="text"
                    required
                    readOnly={items.length > 0}
                    value={formatNumberInput(effectiveMainAmount)}
                    onChange={(e) => {
                      const val = parseNumberInput(e.target.value);
                      setMainAmount(val);
                      setAmount(val + fees - discount);
                    }}
                    placeholder="0"
                    className={`w-full glass-input px-2.5 py-1.5 rounded-xl text-xs font-extrabold ${items.length > 0 ? 'bg-slate-200/60 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300' : 'text-slate-900 dark:text-white'}`}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-amber-600 dark:text-amber-400 mb-1">
                    Biaya / Ongkir (Rp)
                  </label>
                  <input
                    type="text"
                    value={formatNumberInput(fees)}
                    onChange={(e) => {
                      const val = parseNumberInput(e.target.value);
                      setFees(val);
                      setAmount(effectiveMainAmount + val - discount);
                    }}
                    placeholder="0"
                    className="w-full glass-input px-2.5 py-1.5 rounded-xl text-xs font-extrabold text-amber-600 dark:text-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-emerald-600 dark:text-emerald-400 mb-1">
                    Diskon (Rp)
                  </label>
                  <input
                    type="text"
                    value={formatNumberInput(discount)}
                    onChange={(e) => {
                      const val = parseNumberInput(e.target.value);
                      setDiscount(val);
                      setAmount(effectiveMainAmount + fees - val);
                    }}
                    placeholder="0"
                    className="w-full glass-input px-2.5 py-1.5 rounded-xl text-xs font-extrabold text-emerald-600 dark:text-emerald-400"
                  />
                </div>
              </div>

              {/* Line Items Editor (Optional Expansion) */}
              {showItemDetails && (
                <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800 animate-fade-in">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 dark:text-slate-300">
                    <span>Item Belanja ({items.length})</span>
                    <button
                      type="button"
                      onClick={handleAddItem}
                      className="text-[10px] px-2 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-bold flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" /> Tambah Item
                    </button>
                  </div>
                  <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                    {items.map((item) => (
                      <div key={item.id} className="flex items-center space-x-1.5 text-xs">
                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) => handleItemChange(item.id, 'name', e.target.value)}
                          className="flex-1 glass-input px-2 py-1 rounded-lg text-xs"
                          placeholder="Nama produk"
                        />
                        <input
                          type="number"
                          value={item.qty}
                          onChange={(e) => handleItemChange(item.id, 'qty', Number(e.target.value))}
                          className="w-12 glass-input px-1.5 py-1 rounded-lg text-xs text-center font-bold"
                          placeholder="Qty"
                        />
                        <input
                          type="text"
                          value={formatNumberInput(item.price)}
                          onChange={(e) => handleItemChange(item.id, 'price', parseNumberInput(e.target.value))}
                          className="w-24 glass-input px-2 py-1 rounded-lg text-xs text-right font-semibold"
                          placeholder="Harga"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(item.id)}
                          className="text-slate-400 hover:text-rose-500 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Total & Date Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200 dark:border-slate-800">
                <div>
                  <label className="block text-xs font-extrabold text-slate-900 dark:text-white mb-1">
                    Total Akhir Pengeluaran
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-rose-500">Rp</span>
                    <input
                      type="text"
                      readOnly
                      value={formatNumberInput(Math.max(0, effectiveMainAmount + fees - discount))}
                      className="w-full pl-9 pr-3 py-2 rounded-xl text-base font-extrabold bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 focus:outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" /> Tanggal Transaksi
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full glass-input px-3 py-2 rounded-xl text-xs font-semibold text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Nominal Transaksi (Rp)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-emerald-600 dark:text-emerald-400">Rp</span>
                    <input
                      type="text"
                      required
                      value={formatNumberInput(amount)}
                      onChange={(e) => setAmount(parseNumberInput(e.target.value))}
                      placeholder="0"
                      className="w-full glass-input pl-9 pr-3 py-2 rounded-xl text-base font-extrabold text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" /> Tanggal Transaksi
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full glass-input px-3 py-2 rounded-xl text-xs font-semibold text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Quick Nominal Presets */}
              <div className="space-y-1 pt-1">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Nominal Cepat:</span>
                <div className="flex flex-wrap gap-1.5">
                  {[20000, 50000, 100000, 250000, 500000, 1000000].map(val => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setAmount(val)}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-200/80 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 transition-all active:scale-95"
                    >
                      {formatRupiah(val)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
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
              className={`w-2/3 py-3 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center justify-center space-x-2 transition-all active:scale-95 shadow-lg ${
                type === 'EXPENSE'
                  ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/20'
                  : type === 'INCOME'
                  ? 'bg-emerald-500 hover:bg-emerald-600 text-slate-950 shadow-emerald-500/20'
                  : 'bg-cyan-500 hover:bg-cyan-600 text-slate-950 shadow-cyan-500/20'
              }`}
            >
              <CheckCircle className="w-4 h-4" />
              <span>Simpan {type === 'EXPENSE' ? 'Pengeluaran' : type === 'INCOME' ? 'Pemasukan' : 'Transfer'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
