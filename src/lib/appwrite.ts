import { Client, Databases, Account, ID, Query } from 'appwrite';
import { CashTransaction, InvestmentAsset, UserSettings, AppUser } from './types';

const APPWRITE_ENDPOINT = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://sgp.cloud.appwrite.io/v1';
const APPWRITE_PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '';
const APPWRITE_DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || '6a75bac8003d3ae867c7';

const COLLECTIONS = {
  TRANSACTIONS: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_TRANSACTIONS || '6aa80290002d3b4aa955',
  INVESTMENTS: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_INVESTMENTS || '6aa8043400368f0a6f47',
  SETTINGS: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_SETTINGS || '6aa805420002e8d932ee',
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

/**
 * Clean & format Document IDs for Appwrite compliance (max 36 chars, alphanumeric, ., -, _)
 */
export function cleanAppwriteDocId(rawId?: string): string {
  if (!rawId) return ID.unique();
  const cleaned = rawId.replace(/[^a-zA-Z0-9._-]/g, '_').substring(0, 36);
  return cleaned || ID.unique();
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
      amount: Number(doc.amount || 0),
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
    console.warn('Appwrite fetchTransactions error:', err);
    return null;
  }
}

/**
 * Save single CashTransaction (Scoped by User) with robust fallback
 */
export async function syncSaveAppwriteTransaction(
  tx: CashTransaction,
  userId?: string
): Promise<{ success: boolean; error?: string }> {
  if (!databases || !isAppwriteConfigured) {
    return { success: false, error: 'Appwrite tidak terkonfigurasi' };
  }

  const fullPayload: any = {
    type: tx.type,
    title: tx.title,
    amount: Number(tx.amount || 0),
    date: String(tx.date || new Date().toISOString().substring(0, 10)),
    category: String(tx.category || 'Umum'),
    walletId: String(tx.walletId || 'w-main'),
    toWalletId: tx.toWalletId || '',
    platform: tx.platform || '',
    mainAmount: Number(tx.mainAmount || 0),
    fees: Number(tx.fees || 0),
    discount: Number(tx.discount || 0),
    items: tx.items ? JSON.stringify(tx.items) : '[]',
    createdAt: tx.createdAt || new Date().toISOString(),
  };
  if (userId) fullPayload.userId = userId;

  try {
    if (tx.id && !tx.id.startsWith('tx-')) {
      try {
        await databases.updateDocument(APPWRITE_DATABASE_ID, COLLECTIONS.TRANSACTIONS, tx.id, fullPayload);
        return { success: true };
      } catch {}
    }

    await databases.createDocument(
      APPWRITE_DATABASE_ID,
      COLLECTIONS.TRANSACTIONS,
      ID.unique(),
      fullPayload
    );
    return { success: true };
  } catch (err1: any) {
    console.warn('Full payload transaction save failed, trying minimal core payload:', err1);

    const corePayload: any = {
      type: tx.type,
      title: tx.title,
      amount: Number(tx.amount || 0),
      date: String(tx.date || new Date().toISOString().substring(0, 10)),
      category: String(tx.category || 'Umum'),
      walletId: String(tx.walletId || 'w-main'),
    };

    try {
      await databases.createDocument(
        APPWRITE_DATABASE_ID,
        COLLECTIONS.TRANSACTIONS,
        ID.unique(),
        corePayload
      );
      return { success: true };
    } catch (err2: any) {
      console.error('Appwrite saveTransaction error:', err2);
      const msg = err2?.message || String(err2);
      return { success: false, error: msg };
    }
  }
}

/**
 * Delete CashTransaction from Appwrite Cloud DB
 */
export async function syncDeleteAppwriteTransaction(id: string): Promise<{ success: boolean; error?: string }> {
  if (!databases || !isAppwriteConfigured) return { success: false, error: 'Appwrite tidak terkonfigurasi' };
  try {
    const docId = cleanAppwriteDocId(id);
    await databases.deleteDocument(
      APPWRITE_DATABASE_ID,
      COLLECTIONS.TRANSACTIONS,
      docId
    );
    return { success: true };
  } catch (err: any) {
    console.warn('Appwrite deleteTransaction error:', err);
    return { success: false, error: err?.message || String(err) };
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
      units: Number(doc.units || 0),
      avgBuyPrice: Number(doc.avgBuyPrice || 0),
      currentPrice: Number(doc.currentPrice || 0),
      totalValue: Number(doc.totalValue || 0),
      totalCost: Number(doc.totalCost || 0),
      pnlAmount: Number(doc.pnlAmount || 0),
      pnlPercentage: Number(doc.pnlPercentage || 0),
      updatedAt: doc.updatedAt || doc.$updatedAt,
    })) as InvestmentAsset[];
  } catch (err) {
    console.warn('Appwrite fetchInvestments error:', err);
    return null;
  }
}

/**
 * Save InvestmentAssets to Appwrite Cloud DB
 */
export async function syncSaveAppwriteInvestments(
  assets: InvestmentAsset[],
  userId?: string
): Promise<{ success: boolean; error?: string }> {
  if (!databases || !isAppwriteConfigured) return { success: false, error: 'Appwrite tidak terkonfigurasi' };
  try {
    for (const asset of assets) {
      const payload: any = {
        assetClass: asset.assetClass,
        ticker: asset.ticker,
        name: asset.name,
        units: Number(asset.units || 0),
        avgBuyPrice: Number(asset.avgBuyPrice || 0),
        currentPrice: Number(asset.currentPrice || 0),
        totalValue: Number(asset.totalValue || 0),
        totalCost: Number(asset.totalCost || 0),
        pnlAmount: Number(asset.pnlAmount || 0),
        pnlPercentage: Number(asset.pnlPercentage || 0),
        updatedAt: asset.updatedAt || new Date().toISOString(),
      };
      if (userId) payload.userId = userId;

      try {
        if (asset.id && !asset.id.startsWith('inv-')) {
          await databases.updateDocument(APPWRITE_DATABASE_ID, COLLECTIONS.INVESTMENTS, asset.id, payload);
        } else {
          await databases.createDocument(APPWRITE_DATABASE_ID, COLLECTIONS.INVESTMENTS, ID.unique(), payload);
        }
      } catch {
        await databases.createDocument(APPWRITE_DATABASE_ID, COLLECTIONS.INVESTMENTS, ID.unique(), payload);
      }
    }
    return { success: true };
  } catch (err: any) {
    console.warn('Appwrite syncSaveInvestments error:', err);
    return { success: false, error: err?.message || String(err) };
  }
}

/**
 * Fetch UserSettings from Appwrite Cloud DB
 */
export async function fetchAppwriteSettings(userId?: string): Promise<UserSettings | null> {
  if (!databases || !isAppwriteConfigured) return null;
  try {
    const docId = cleanAppwriteDocId(userId ? `settings_${userId}` : 'user_settings_global');
    const doc = await databases.getDocument(
      APPWRITE_DATABASE_ID,
      COLLECTIONS.SETTINGS,
      docId
    );
    
    return {
      wallets: doc.wallets ? JSON.parse(doc.wallets) : [],
      incomeTemplates: doc.incomeTemplates ? JSON.parse(doc.incomeTemplates) : [],
      monthlyExpenseBudget: Number(doc.monthlyExpenseBudget || 0),
    };
  } catch (err) {
    console.warn('Appwrite fetchSettings error:', err);
    return null;
  }
}

/**
 * Save UserSettings to Appwrite Cloud DB
 */
export async function syncSaveAppwriteSettings(
  settings: UserSettings,
  userId?: string
): Promise<{ success: boolean; error?: string }> {
  if (!databases || !isAppwriteConfigured) return { success: false, error: 'Appwrite tidak terkonfigurasi' };
  
  const docId = cleanAppwriteDocId(userId ? `settings_${userId}` : 'user_settings_global');
  
  const fullPayload: any = {
    wallets: JSON.stringify(settings.wallets),
    incomeTemplates: JSON.stringify(settings.incomeTemplates || []),
    monthlyExpenseBudget: Number(settings.monthlyExpenseBudget || 0),
  };
  if (userId) fullPayload.userId = userId;

  try {
    try {
      await databases.updateDocument(APPWRITE_DATABASE_ID, COLLECTIONS.SETTINGS, docId, fullPayload);
    } catch {
      await databases.createDocument(APPWRITE_DATABASE_ID, COLLECTIONS.SETTINGS, docId, fullPayload);
    }
    return { success: true };
  } catch (err1: any) {
    console.warn('Full settings save failed, trying minimal payload:', err1);

    const minimalPayload: any = {
      wallets: JSON.stringify(settings.wallets),
      monthlyExpenseBudget: Number(settings.monthlyExpenseBudget || 0),
    };

    try {
      try {
        await databases.updateDocument(APPWRITE_DATABASE_ID, COLLECTIONS.SETTINGS, docId, minimalPayload);
      } catch {
        await databases.createDocument(APPWRITE_DATABASE_ID, COLLECTIONS.SETTINGS, docId, minimalPayload);
      }
      return { success: true };
    } catch (err2: any) {
      console.error('Appwrite syncSaveSettings error:', err2);
      return { success: false, error: err2?.message || String(err2) };
    }
  }
}

export { client, databases, account, ID, Query, APPWRITE_DATABASE_ID };
