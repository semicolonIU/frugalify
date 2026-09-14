import { CashTransaction, InvestmentAsset, UserSettings } from './types';

const INITIAL_SETTINGS: UserSettings = {
  wallets: [
    { id: 'w-main', name: 'Dompet Utama', type: 'BANK', balance: 0 }
  ],
  incomeTemplates: [],
  monthlyExpenseBudget: 5000000
};

const INITIAL_TRANSACTIONS: CashTransaction[] = [];

const INITIAL_INVESTMENTS: InvestmentAsset[] = [];

const KEYS = {
  TRANSACTIONS: 'frugal_transactions_v2',
  INVESTMENTS: 'frugal_investments_v2',
  SETTINGS: 'frugal_settings_v2',
};

// --- SETTINGS ---
export function getStoredSettings(): UserSettings {
  if (typeof window === 'undefined') return INITIAL_SETTINGS;
  try {
    const data = localStorage.getItem(KEYS.SETTINGS);
    if (!data) {
      localStorage.setItem(KEYS.SETTINGS, JSON.stringify(INITIAL_SETTINGS));
      return INITIAL_SETTINGS;
    }
    return JSON.parse(data);
  } catch {
    return INITIAL_SETTINGS;
  }
}

export function saveStoredSettings(settings: UserSettings): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
}

export function updateWalletBalance(walletId: string, amountChange: number): void {
  const settings = getStoredSettings();
  const walletIndex = settings.wallets.findIndex(w => w.id === walletId);
  if (walletIndex >= 0) {
    settings.wallets[walletIndex].balance += amountChange;
    saveStoredSettings(settings);
  }
}

// --- TRANSACTIONS ---
export function getStoredTransactions(): CashTransaction[] {
  if (typeof window === 'undefined') return INITIAL_TRANSACTIONS;
  try {
    const data = localStorage.getItem(KEYS.TRANSACTIONS);
    if (!data) {
      localStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify(INITIAL_TRANSACTIONS));
      return INITIAL_TRANSACTIONS;
    }
    return JSON.parse(data);
  } catch {
    return INITIAL_TRANSACTIONS;
  }
}

export function saveStoredTransactions(txs: CashTransaction[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify(txs));
}

export function addStoredTransaction(tx: CashTransaction): CashTransaction[] {
  const current = getStoredTransactions();
  const updated = [tx, ...current];
  saveStoredTransactions(updated);

  // Update wallet balances
  if (tx.type === 'INCOME') {
    updateWalletBalance(tx.walletId, tx.amount);
  } else if (tx.type === 'EXPENSE') {
    updateWalletBalance(tx.walletId, -tx.amount);
  } else if (tx.type === 'TRANSFER' && tx.toWalletId) {
    updateWalletBalance(tx.walletId, -tx.amount);
    updateWalletBalance(tx.toWalletId, tx.amount);
  }
  
  return updated;
}

export function deleteStoredTransaction(id: string): CashTransaction[] {
  const current = getStoredTransactions();
  const tx = current.find(t => t.id === id);
  if (tx) {
    // Reverse wallet balances
    if (tx.type === 'INCOME') {
      updateWalletBalance(tx.walletId, -tx.amount);
    } else if (tx.type === 'EXPENSE') {
      updateWalletBalance(tx.walletId, tx.amount);
    } else if (tx.type === 'TRANSFER' && tx.toWalletId) {
      updateWalletBalance(tx.walletId, tx.amount);
      updateWalletBalance(tx.toWalletId, -tx.amount);
    }
  }
  
  const updated = current.filter(item => item.id !== id);
  saveStoredTransactions(updated);
  return updated;
}

// --- INVESTMENTS ---
export function getStoredInvestments(): InvestmentAsset[] {
  if (typeof window === 'undefined') return INITIAL_INVESTMENTS;
  try {
    const data = localStorage.getItem(KEYS.INVESTMENTS);
    if (!data) {
      localStorage.setItem(KEYS.INVESTMENTS, JSON.stringify(INITIAL_INVESTMENTS));
      return INITIAL_INVESTMENTS;
    }
    return JSON.parse(data);
  } catch {
    return INITIAL_INVESTMENTS;
  }
}

export function saveStoredInvestments(assets: InvestmentAsset[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(KEYS.INVESTMENTS, JSON.stringify(assets));
}

export function updateOrAddInvestments(newAssets: Array<{ assetClass: 'STOCK'|'CRYPTO'|'GOLD', ticker: string, name: string, units: number, avgBuyPrice?: number }>): InvestmentAsset[] {
  const current = getStoredInvestments();
  const updated = [...current];

  for (const item of newAssets) {
    const cleanTicker = item.ticker.toUpperCase().trim();
    const existingIndex = updated.findIndex(s => s.ticker === cleanTicker && s.assetClass === item.assetClass);

    const units = item.units;
    const avgBuyPrice = item.avgBuyPrice || (existingIndex >= 0 ? updated[existingIndex].avgBuyPrice : 5000);
    const currentPrice = existingIndex >= 0 ? updated[existingIndex].currentPrice : avgBuyPrice * 1.05;
    
    const totalCost = units * avgBuyPrice;
    const totalValue = units * currentPrice;
    const pnlAmount = totalValue - totalCost;
    const pnlPercentage = totalCost > 0 ? (pnlAmount / totalCost) * 100 : 0;

    if (existingIndex >= 0) {
      updated[existingIndex] = {
        ...updated[existingIndex],
        units,
        avgBuyPrice,
        totalValue,
        totalCost,
        pnlAmount,
        pnlPercentage,
        updatedAt: new Date().toISOString(),
      };
    } else {
      updated.push({
        id: `inv-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        assetClass: item.assetClass,
        ticker: cleanTicker,
        name: item.name || cleanTicker,
        units,
        avgBuyPrice,
        currentPrice,
        totalValue,
        totalCost,
        pnlAmount,
        pnlPercentage,
        updatedAt: new Date().toISOString(),
      });
    }
  }

  saveStoredInvestments(updated);
  return updated;
}
