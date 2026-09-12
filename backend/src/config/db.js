const { Pool } = require('pg');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

dotenv.config();

let pool = null;
let isConnected = false;
let dbError = null;

// File-backed fallback store if PostgreSQL is not yet running/configured
const dataDir = path.join(__dirname, '..', 'data');
const dataFile = path.join(dataDir, 'calculations.json');

const loadMemoryStore = () => {
  try {
    if (fs.existsSync(dataFile)) {
      const content = fs.readFileSync(dataFile, 'utf8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.warn('[DB] Could not load calculations.json:', err.message);
  }
  return [];
};

const memoryStore = loadMemoryStore();
let memoryIdCounter = memoryStore.length > 0
  ? Math.max(...memoryStore.map((m) => Number(m.id) || 0)) + 1
  : 1;

const saveMemoryStore = () => {
  try {
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    fs.writeFileSync(dataFile, JSON.stringify(memoryStore, null, 2), 'utf8');
  } catch (err) {
    console.warn('[DB] Could not write to calculations.json:', err.message);
  }
};

try {
  const isCloudDb = Boolean(process.env.DATABASE_URL);
  const connectionConfig = isCloudDb
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: {
          rejectUnauthorized: false,
        },
      }
    : {
        user: process.env.PGUSER || 'postgres',
        host: process.env.PGHOST || 'localhost',
        database: process.env.PGDATABASE || 'emi_calculator',
        password: process.env.PGPASSWORD || 'postgres',
        port: parseInt(process.env.PGPORT || '5432', 10),
        connectionTimeoutMillis: 5000,
      };

  pool = new Pool(connectionConfig);

  pool.on('error', (err) => {
    console.error('[DB] Unexpected PostgreSQL client error:', err.message);
    isConnected = false;
    dbError = err.message;
  });
} catch (err) {
  console.error('[DB] Failed to initialize PostgreSQL pool:', err.message);
  isConnected = false;
  dbError = err.message;
}

const checkAndInitDb = async () => {
  if (!pool) return false;
  try {
    const client = await pool.connect();
    isConnected = true;
    dbError = null;
    console.log('[DB] Connected successfully to PostgreSQL database.');

    // Auto-create schema if needed
    const schemaPath = path.join(__dirname, '..', 'db', 'schema.sql');
    if (fs.existsSync(schemaPath)) {
      const schemaSql = fs.readFileSync(schemaPath, 'utf8');
      await client.query(schemaSql);
      console.log('[DB] Schema verified/initialized.');
    }
    client.release();
    return true;
  } catch (err) {
    isConnected = false;
    dbError = err.message;
    console.warn(`[DB] PostgreSQL connection check warning: ${err.message}. Using fallback in-memory store for active session.`);
    return false;
  }
};

const query = async (text, params) => {
  if (isConnected && pool) {
    return await pool.query(text, params);
  }
  throw new Error('PostgreSQL is not connected: ' + (dbError || 'Connection unavailable'));
};

const getStatus = () => {
  return {
    connected: isConnected,
    mode: isConnected ? 'postgresql' : 'in-memory-fallback',
    error: dbError,
    config: {
      host: process.env.PGHOST || 'localhost',
      database: process.env.PGDATABASE || 'emi_calculator',
      port: process.env.PGPORT || '5432',
      user: process.env.PGUSER || 'postgres',
    },
  };
};

module.exports = {
  pool,
  query,
  checkAndInitDb,
  getStatus,
  memoryStore,
  saveMemoryStore,
  memoryIdCounter: () => memoryIdCounter++,
};
