import { Client, Databases, Account, ID, Query } from 'appwrite';
import { CashTransaction, InvestmentAsset, UserSettings, AppUser } from './types';

const APPWRITE_ENDPOINT = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1';
const APPWRITE_PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '';
const APPWRITE_DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'financial_db';

const COLLECTIONS = {
  TRANSACTIONS: 'transactions',
  INVESTMENTS: 'investments',
  SETTINGS: 'settings',
};

export const isAppwriteConfigured = Boolean(APPWRITE_PROJECT_ID && APPWRITE_PROJECT_ID !== '');

let client: Client | null = null;
let databases: Databases | null = null;
let account: Account | null = null;

if (isAppwriteConfigured) {
  try {
    client = new Client();
    client
      .setEndpoint(APPWRITE_ENDPOINT)
      .setProject(APPWRITE_PROJECT_ID);
    
    databases = new Databases(client);
    account = new Account(client);
  } catch (err) {
    console.warn('Could not initialize Appwrite client:', err);
  }
}

// Key for local user session state
const LOCAL_USER_KEY = 'frugalify_current_user_v1';
const LOCAL_USERS_DB = 'frugalify_registered_users_v1';

/**
 * Authentication API
 */
export async function getAppwriteUser(): Promise<AppUser | null> {
  if (account && isAppwriteConfigured) {
    try {
      const acc = await account.get();
      return {
        id: acc.$id,
        name: acc.name || acc.email.split('@')[0],
        email: acc.email,
        createdAt: acc.$createdAt,
      };
    } catch {
      // Fallback to local session if appwrite session not active
    }
  }

  if (typeof window !== 'undefined') {
    const raw = localStorage.getItem(LOCAL_USER_KEY);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch {
        return null;
      }
    }
  }

  return null;
}

export async function loginUser(email: string, password: string): Promise<{ success: boolean; user?: AppUser; error?: string }> {
  // 1. Try Appwrite Cloud
  if (account && isAppwriteConfigured) {
    try {
      // Delete any current session first to prevent session conflict
      try {
        await account.deleteSession('current');
      } catch {}

      await account.createEmailPasswordSession(email, password);
      const acc = await account.get();
      const user: AppUser = {
        id: acc.$id,
        name: acc.name || acc.email.split('@')[0],
        email: acc.email,
        createdAt: acc.$createdAt,
      };

      if (typeof window !== 'undefined') {
        localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(user));
      }

      return { success: true, user };
    } catch (err: any) {
      console.warn('Appwrite login attempt error:', err);
    }
  }

  // 2. Local Multi-user fallback for testing/offline
  if (typeof window !== 'undefined') {
    try {
      const usersRaw = localStorage.getItem(LOCAL_USERS_DB);
      const users: Array<{ id: string; email: string; password: string; name: string }> = usersRaw ? JSON.parse(usersRaw) : [];
      const found = users.find(u => u.email.toLowerCase() === email.toLowerCase());

      if (found) {
        if (found.password === password) {
          const user: AppUser = { id: found.id, name: found.name, email: found.email };
          localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(user));
          return { success: true, user };
        } else {
          return { success: false, error: 'Password salah. Silakan coba lagi.' };
        }
      }
    } catch (e) {
      console.error(e);
    }
  }

  return { success: false, error: 'Akun tidak ditemukan. Silakan lakukan pendaftaran.' };
}

export async function signupUser(email: string, password: string, name: string): Promise<{ success: boolean; user?: AppUser; error?: string }> {
  // 1. Try Appwrite Cloud
  if (account && isAppwriteConfigured) {
    try {
      const userId = ID.unique();
      await account.create(userId, email, password, name);
      await account.createEmailPasswordSession(email, password);
      const acc = await account.get();
      const user: AppUser = {
        id: acc.$id,
        name: acc.name || name,
        email: acc.email,
        createdAt: acc.$createdAt,
      };

      if (typeof window !== 'undefined') {
        localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(user));
      }

      return { success: true, user };
    } catch (err: any) {
      console.warn('Appwrite signup attempt error:', err);
    }
  }

  // 2. Local Multi-user fallback
  if (typeof window !== 'undefined') {
    try {
      const usersRaw = localStorage.getItem(LOCAL_USERS_DB);
      const users: Array<{ id: string; email: string; password: string; name: string }> = usersRaw ? JSON.parse(usersRaw) : [];
      
      if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
        return { success: false, error: 'Email sudah terdaftar. Silakan login.' };
      }

      const newUserId = `usr_${Date.now()}`;
      const newUser = { id: newUserId, email, password, name };
      users.push(newUser);
      localStorage.setItem(LOCAL_USERS_DB, JSON.stringify(users));

      const appUser: AppUser = { id: newUserId, name, email };
      localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(appUser));
      return { success: true, user: appUser };
    } catch (err) {
      console.error(err);
    }
  }

  return { success: false, error: 'Gagal mendaftarkan akun. Silakan coba lagi.' };
}

export async function logoutUser(): Promise<void> {
  if (account && isAppwriteConfigured) {
    try {
      await account.deleteSession('current');
    } catch {}
  }
  if (typeof window !== 'undefined') {
    localStorage.removeItem(LOCAL_USER_KEY);
  }
}

/**
 * Fetch CashTransactions (Scoped by User if user provided)
 */
export async function fetchAppwriteTransactions(userId?: string): Promise<CashTransaction[] | null> {
  if (!databases || !isAppwriteConfigured) return null;
  try {
    const queries = [Query.orderDesc('createdAt'), Query.limit(100)];
    if (userId) {
      queries.push(Query.equal('userId', userId));
    }
    
    const res = await databases.listDocuments(
      APPWRITE_DATABASE_ID,
      COLLECTIONS.TRANSACTIONS,
      queries
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
 * Save single CashTransaction (Scoped by User)
 */
export async function syncSaveAppwriteTransaction(tx: CashTransaction, userId?: string): Promise<boolean> {
  if (!databases || !isAppwriteConfigured) return false;
  try {
    const payload: any = {
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
    if (userId) payload.userId = userId;

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
export async function fetchAppwriteInvestments(userId?: string): Promise<InvestmentAsset[] | null> {
  if (!databases || !isAppwriteConfigured) return null;
  try {
    const queries = [Query.limit(100)];
    if (userId) {
      queries.push(Query.equal('userId', userId));
    }

    const res = await databases.listDocuments(
      APPWRITE_DATABASE_ID,
      COLLECTIONS.INVESTMENTS,
      queries
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
export async function syncSaveAppwriteInvestments(assets: InvestmentAsset[], userId?: string): Promise<boolean> {
  if (!databases || !isAppwriteConfigured) return false;
  try {
    for (const asset of assets) {
      const payload: any = {
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
      if (userId) payload.userId = userId;

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
export async function fetchAppwriteSettings(userId?: string): Promise<UserSettings | null> {
  if (!databases || !isAppwriteConfigured) return null;
  try {
    const docId = userId ? `settings_${userId}` : 'user_settings_global';
    const doc = await databases.getDocument(
      APPWRITE_DATABASE_ID,
      COLLECTIONS.SETTINGS,
      docId
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
export async function syncSaveAppwriteSettings(settings: UserSettings, userId?: string): Promise<boolean> {
  if (!databases || !isAppwriteConfigured) return false;
  try {
    const docId = userId ? `settings_${userId}` : 'user_settings_global';
    const payload: any = {
      wallets: JSON.stringify(settings.wallets),
      incomeTemplates: JSON.stringify(settings.incomeTemplates),
      monthlyExpenseBudget: settings.monthlyExpenseBudget,
    };
    if (userId) payload.userId = userId;

    try {
      await databases.updateDocument(
        APPWRITE_DATABASE_ID,
        COLLECTIONS.SETTINGS,
        docId,
        payload
      );
    } catch {
      await databases.createDocument(
        APPWRITE_DATABASE_ID,
        COLLECTIONS.SETTINGS,
        docId,
        payload
      );
    }
    return true;
  } catch (err) {
    console.warn('Appwrite syncSaveSettings skipped:', err);
    return false;
  }
}

export { client, databases, account, ID, Query, APPWRITE_DATABASE_ID };
