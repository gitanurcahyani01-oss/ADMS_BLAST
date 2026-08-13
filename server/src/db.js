import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env relative to this file
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config();

let pool = null;

// Default production fallbacks for cPanel hosting if process.env is missing or unreadable
const FALLBACK_HOST = '127.0.0.1';
const FALLBACK_USER = 'jasapeny_admsuser';
const FALLBACK_PASS = 'SuksesBlast2026';
const FALLBACK_DB   = 'jasapeny_admsblastdb';
const FALLBACK_PORT = 3306;

export function getPool() {
  if (pool) return pool;

  let dbUrl = process.env.DATABASE_URL;

  if (dbUrl && typeof dbUrl === 'string' && dbUrl.trim().length > 0) {
    // Replace localhost with 127.0.0.1 to avoid Node 20 IPv6 (::1) lookup issues on cPanel
    if (dbUrl.includes('@localhost')) {
      dbUrl = dbUrl.replace('@localhost', '@127.0.0.1');
    }

    try {
      pool = mysql.createPool({
        uri: dbUrl,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        enableKeepAlive: true
      });
      console.log('✅ MySQL Pool connected via DATABASE_URL URI.');
      return pool;
    } catch (err) {
      console.warn('⚠️ Could not connect via DATABASE_URL URI, trying parameter fallback:', err.message);
    }
  }

  // Parameter-based connection fallback (forces 127.0.0.1 IPv4)
  const host = process.env.DB_HOST || FALLBACK_HOST;
  const user = process.env.DB_USER || FALLBACK_USER;
  const password = process.env.DB_PASSWORD || FALLBACK_PASS;
  const database = process.env.DB_NAME || FALLBACK_DB;
  const port = parseInt(process.env.DB_PORT || String(FALLBACK_PORT), 10);

  console.log(`🔌 Connecting to MySQL (${user}@${host}:${port}/${database})...`);

  pool = mysql.createPool({
    host,
    user,
    password,
    database,
    port,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true
  });

  return pool;
}

export async function query(sql, params = []) {
  const connectionPool = getPool();
  const [rows] = await connectionPool.execute(sql, params);
  return rows;
}

export async function queryOne(sql, params = []) {
  const rows = await query(sql, params);
  return rows[0] || null;
}

export default {
  getPool,
  query,
  queryOne
};
