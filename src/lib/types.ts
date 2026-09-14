export type PlatformType = 
  | 'Struk Belanja Fisik' 
  | 'Screenshot Shopee' 
  | 'Screenshot Tokopedia' 
  | 'Screenshot GoPay' 
  | 'Screenshot OVO' 
  | 'Screenshot DANA' 
  | 'Screenshot BCA Mobile' 
  | 'Screenshot Livin by Mandiri' 
  | 'Lainnya'
  | 'Input Manual';

export interface PurchasedItem {
  id: string;
  name: string;
  price: number;
  qty: number;
  subtotal: number;
}

export type TransactionType = 'INCOME' | 'EXPENSE' | 'TRANSFER';

export interface CashTransaction {
  id: string;
  type: TransactionType;
  title: string; // nama merchant atau deskripsi pemasukan
  amount: number; // nilai akhir transaksi
  date: string; // YYYY-MM-DD
  category: string; 
  walletId: string; // id dompet utama yg terpengaruh (sumber jika EXPENSE/TRANSFER, tujuan jika INCOME)
  toWalletId?: string; // id dompet tujuan (hanya jika TRANSFER)
  
  // Spesifik Expense dari Scan
  platform?: PlatformType;
  mainAmount?: number;
  fees?: number;
  discount?: number;
  items?: PurchasedItem[];
  
  createdAt: string;
}

export type AssetClass = 'STOCK' | 'CRYPTO' | 'GOLD';

export interface InvestmentAsset {
  id: string;
  assetClass: AssetClass;
  ticker: string; // e.g. BBCA, BTC-USD, XAU
  name: string; 
  units: number; // lembar saham / jumlah coin / gram emas
  avgBuyPrice: number; // IDR per unit
  currentPrice: number; // IDR per unit
  totalValue: number; 
  totalCost: number;
  pnlAmount: number;
  pnlPercentage: number;
  updatedAt: string;
}

export type WalletType = 'BANK' | 'EWALLET' | 'CASH';

export interface WalletAccount {
  id: string;
  name: string;
  type: WalletType;
  balance: number;
}

export interface IncomeTemplate {
  id: string;
  name: string; // e.g. "Gaji Kantor", "Freelance"
  amount: number;
  category: string;
  targetWalletId: string;
}

export interface UserSettings {
  wallets: WalletAccount[];
  incomeTemplates: IncomeTemplate[];
  monthlyExpenseBudget: number;
}

export interface FinancialLivingScore {
  score: number; // 0 - 100
  status: 'Sangat Sehat & Frugal' | 'Waspada / Perlu Kontrol' | 'Boros / Overbudget';
  budgetScore: number; // max 40
  impulseScore: number; // max 30
  investmentScore: number; // max 30
  savingsRatio: number; // %
  shopeeImpulseRatio: number; // %
  expenseToBudgetRatio: number; // %
  recommendation: string;
}

export interface FinancialQuoteResponse {
  text: string;
  author: string;
}
