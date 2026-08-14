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

  // Parameter-based connection
  const host = process.env.DB_HOST;
  const user = process.env.DB_USER;
  const password = process.env.DB_PASSWORD;
  const database = process.env.DB_NAME;
  const port = parseInt(process.env.DB_PORT || '3306', 10);
  const socketPath = process.env.DB_SOCKET;

  if (!socketPath && (!host || !user || !database)) {
    throw new Error('❌ MySQL configuration is missing in environment variables. Set DATABASE_URL or DB_HOST, DB_USER, DB_NAME, DB_PASSWORD in .env.');
  }

  const poolConfig = {
    user,
    password,
    database,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true
  };

  if (socketPath) {
    poolConfig.socketPath = socketPath;
    console.log(`🔌 Connecting to MySQL via Unix Socket (${user}@${socketPath}/${database})...`);
  } else {
    poolConfig.host = host;
    poolConfig.port = port;
    console.log(`🔌 Connecting to MySQL via TCP (${user}@${host}:${port}/${database})...`);
  }

  pool = mysql.createPool(poolConfig);

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
