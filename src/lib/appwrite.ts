import { Client, Databases, ID, Query } from 'appwrite';
import { CashTransaction, InvestmentAsset, UserSettings } from './types';

const APPWRITE_ENDPOINT = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1';
const APPWRITE_PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '';
const APPWRITE_DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'financial_db';

const COLLECTIONS = {
  TRANSACTIONS: 'transactions',
  INVESTMENTS: 'investments',
  SETTINGS: 'settings',
};

const DOC_SETTINGS_ID = 'user_settings_global';

export const isAppwriteConfigured = Boolean(APPWRITE_PROJECT_ID && APPWRITE_PROJECT_ID !== '');

let client: Client | null = null;
let databases: Databases | null = null;

if (isAppwriteConfigured) {
  try {
    client = new Client();
    client
      .setEndpoint(APPWRITE_ENDPOINT)
      .setProject(APPWRITE_PROJECT_ID);
    
    databases = new Databases(client);
  } catch (err) {
    console.warn('Could not initialize Appwrite client:', err);
  }
}

/**
 * Fetch all CashTransactions from Appwrite Cloud DB
 */
export async function fetchAppwriteTransactions(): Promise<CashTransaction[] | null> {
  if (!databases || !isAppwriteConfigured) return null;
  try {
    const res = await databases.listDocuments(
      APPWRITE_DATABASE_ID,
      COLLECTIONS.TRANSACTIONS,
      [Query.orderDesc('createdAt'), Query.limit(100)]
    );
    
    return res.documents.map(doc => ({
      id: doc.id || doc.$id,
      type: doc.type,
      title: doc.title,
      amount: doc.amount,
      date: doc.date,
      category: doc.category,
      walletId: doc.walletId,
      toWalletId: doc.toWalletId,
      platform: doc.platform,
      mainAmount: doc.mainAmount,
      fees: doc.fees,
      discount: doc.discount,
      items: doc.items ? JSON.parse(doc.items) : [],
      createdAt: doc.createdAt || doc.$createdAt,
    })) as CashTransaction[];
  } catch (err) {
    console.warn('Appwrite fetchTransactions skipped/not setup:', err);
    return null;
  }
}

/**
 * Save / Add single CashTransaction to Appwrite Cloud DB
 */
export async function syncSaveAppwriteTransaction(tx: CashTransaction): Promise<boolean> {
  if (!databases || !isAppwriteConfigured) return false;
  try {
    const payload = {
      type: tx.type,
      title: tx.title,
      amount: tx.amount,
      date: tx.date,
      category: tx.category,
      walletId: tx.walletId,
      toWalletId: tx.toWalletId || '',
      platform: tx.platform || '',
      mainAmount: tx.mainAmount || 0,
      fees: tx.fees || 0,
      discount: tx.discount || 0,
      items: tx.items ? JSON.stringify(tx.items) : '[]',
      createdAt: tx.createdAt || new Date().toISOString(),
    };

    await databases.createDocument(
      APPWRITE_DATABASE_ID,
      COLLECTIONS.TRANSACTIONS,
      tx.id || ID.unique(),
      payload
    );
    return true;
  } catch (err) {
    console.warn('Appwrite saveTransaction skipped:', err);
    return false;
  }
}

/**
 * Delete CashTransaction from Appwrite Cloud DB
 */
export async function syncDeleteAppwriteTransaction(id: string): Promise<boolean> {
  if (!databases || !isAppwriteConfigured) return false;
  try {
    await databases.deleteDocument(
      APPWRITE_DATABASE_ID,
      COLLECTIONS.TRANSACTIONS,
      id
    );
    return true;
  } catch (err) {
    console.warn('Appwrite deleteTransaction skipped:', err);
    return false;
  }
}

/**
 * Fetch InvestmentAssets from Appwrite Cloud DB
 */
export async function fetchAppwriteInvestments(): Promise<InvestmentAsset[] | null> {
  if (!databases || !isAppwriteConfigured) return null;
  try {
    const res = await databases.listDocuments(
      APPWRITE_DATABASE_ID,
      COLLECTIONS.INVESTMENTS,
      [Query.limit(100)]
    );
    
    return res.documents.map(doc => ({
      id: doc.id || doc.$id,
      assetClass: doc.assetClass,
      ticker: doc.ticker,
      name: doc.name,
      units: doc.units,
      avgBuyPrice: doc.avgBuyPrice,
      currentPrice: doc.currentPrice,
      totalValue: doc.totalValue,
      totalCost: doc.totalCost,
      pnlAmount: doc.pnlAmount,
      pnlPercentage: doc.pnlPercentage,
      updatedAt: doc.updatedAt || doc.$updatedAt,
    })) as InvestmentAsset[];
  } catch (err) {
    console.warn('Appwrite fetchInvestments skipped/not setup:', err);
    return null;
  }
}

/**
 * Save InvestmentAssets to Appwrite Cloud DB
 */
export async function syncSaveAppwriteInvestments(assets: InvestmentAsset[]): Promise<boolean> {
  if (!databases || !isAppwriteConfigured) return false;
  try {
    for (const asset of assets) {
      const payload = {
        assetClass: asset.assetClass,
        ticker: asset.ticker,
        name: asset.name,
        units: asset.units,
        avgBuyPrice: asset.avgBuyPrice,
        currentPrice: asset.currentPrice,
        totalValue: asset.totalValue,
        totalCost: asset.totalCost,
        pnlAmount: asset.pnlAmount,
        pnlPercentage: asset.pnlPercentage,
        updatedAt: asset.updatedAt || new Date().toISOString(),
      };

      try {
        await databases.updateDocument(
          APPWRITE_DATABASE_ID,
          COLLECTIONS.INVESTMENTS,
          asset.id,
          payload
        );
      } catch {
        await databases.createDocument(
          APPWRITE_DATABASE_ID,
          COLLECTIONS.INVESTMENTS,
          asset.id || ID.unique(),
          payload
        );
      }
    }
    return true;
  } catch (err) {
    console.warn('Appwrite syncSaveInvestments skipped:', err);
    return false;
  }
}

/**
 * Fetch UserSettings from Appwrite Cloud DB
 */
export async function fetchAppwriteSettings(): Promise<UserSettings | null> {
  if (!databases || !isAppwriteConfigured) return null;
  try {
    const doc = await databases.getDocument(
      APPWRITE_DATABASE_ID,
      COLLECTIONS.SETTINGS,
      DOC_SETTINGS_ID
    );
    
    return {
      wallets: doc.wallets ? JSON.parse(doc.wallets) : [],
      incomeTemplates: doc.incomeTemplates ? JSON.parse(doc.incomeTemplates) : [],
      monthlyExpenseBudget: doc.monthlyExpenseBudget || 5000000,
    };
  } catch (err) {
    console.warn('Appwrite fetchSettings skipped/not setup:', err);
    return null;
  }
}

/**
 * Save UserSettings to Appwrite Cloud DB
 */
export async function syncSaveAppwriteSettings(settings: UserSettings): Promise<boolean> {
  if (!databases || !isAppwriteConfigured) return false;
  try {
    const payload = {
      wallets: JSON.stringify(settings.wallets),
      incomeTemplates: JSON.stringify(settings.incomeTemplates),
      monthlyExpenseBudget: settings.monthlyExpenseBudget,
    };

    try {
      await databases.updateDocument(
        APPWRITE_DATABASE_ID,
        COLLECTIONS.SETTINGS,
        DOC_SETTINGS_ID,
        payload
      );
    } catch {
      await databases.createDocument(
        APPWRITE_DATABASE_ID,
        COLLECTIONS.SETTINGS,
        DOC_SETTINGS_ID,
        payload
      );
    }
    return true;
  } catch (err) {
    console.warn('Appwrite syncSaveSettings skipped:', err);
    return false;
  }
}

export { client, databases, ID, Query, APPWRITE_DATABASE_ID };
