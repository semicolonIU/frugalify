import { Client, Databases, ID, Query } from 'appwrite';

const APPWRITE_ENDPOINT = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1';
const APPWRITE_PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '';
const APPWRITE_DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'financial_db';

export const isAppwriteConfigured = Boolean(APPWRITE_PROJECT_ID && APPWRITE_PROJECT_ID !== '');

let client: Client | null = null;
let databases: Databases | null = null;

if (isAppwriteConfigured) {
  client = new Client();
  client
    .setEndpoint(APPWRITE_ENDPOINT)
    .setProject(APPWRITE_PROJECT_ID);
  
  databases = new Databases(client);
}

export { client, databases, ID, Query, APPWRITE_DATABASE_ID };
