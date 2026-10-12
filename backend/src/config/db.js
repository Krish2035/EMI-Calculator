const { Pool } = require('pg');
const { drizzle } = require('drizzle-orm/node-postgres');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const schema = require('../db/schema');

dotenv.config();

// Primary (Write) Connection Pool
let primaryPool = null;
let isPrimaryConnected = false;
let dbError = null;

// Read Replica Pools
let replicaPools = [];
let replicaIndex = 0;

// Drizzle ORM instances
let drizzleWrite = null;
let drizzleRead = null;

// File-backed fallback store for development/offline mode
const dataDir = path.join(__dirname, '..', 'data');
const calculationsFile = path.join(dataDir, 'calculations.json');
const usersFile = path.join(dataDir, 'users.json');

const loadJsonStore = (filePath, fallback = []) => {
  try {
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }
  } catch (err) {
    console.warn(`[DB Store] Warning loading ${filePath}:`, err.message);
  }
  return fallback;
};

const memoryStore = loadJsonStore(calculationsFile);
const usersStore = loadJsonStore(usersFile);

let memoryIdCounter = memoryStore.length > 0
  ? Math.max(...memoryStore.map((m) => Number(m.id) || 0)) + 1
  : 1;

let userIdCounter = usersStore.length > 0
  ? Math.max(...usersStore.map((u) => Number(u.id) || 0)) + 1
  : 1;

const saveMemoryStore = () => {
  try {
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
    fs.writeFileSync(calculationsFile, JSON.stringify(memoryStore, null, 2), 'utf8');
  } catch (err) {
    console.warn('[DB Store] Error saving calculations.json:', err.message);
  }
};

const saveUsersStore = () => {
  try {
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
    fs.writeFileSync(usersFile, JSON.stringify(usersStore, null, 2), 'utf8');
  } catch (err) {
    console.warn('[DB Store] Error saving users.json:', err.message);
  }
};

// Build connection configuration
const buildConnectionConfig = (connectionStringOrHost) => {
  if (connectionStringOrHost && connectionStringOrHost.startsWith('postgres')) {
    return {
      connectionString: connectionStringOrHost,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      connectionTimeoutMillis: 5000,
    };
  }

  return {
    user: process.env.PGUSER || 'postgres',
    host: connectionStringOrHost || process.env.PGHOST || 'localhost',
    database: process.env.PGDATABASE || 'emi_calculator',
    password: process.env.PGPASSWORD || 'postgres',
    port: parseInt(process.env.PGPORT || '5432', 10),
    connectionTimeoutMillis: 5000,
    max: 20,
    idleTimeoutMillis: 30000,
  };
};

// Initialize Primary Master Pool
try {
  const primaryConn = process.env.DATABASE_URL || process.env.PGHOST || 'localhost';
  primaryPool = new Pool(buildConnectionConfig(primaryConn));
  drizzleWrite = drizzle(primaryPool, { schema });

  primaryPool.on('error', (err) => {
    console.error('[DB Primary] Unexpected error on primary pool:', err.message);
    isPrimaryConnected = false;
    dbError = err.message;
  });
} catch (err) {
  console.error('[DB Primary] Initialization failed:', err.message);
  isPrimaryConnected = false;
  dbError = err.message;
}

// Initialize Read Replicas (comma-separated URLs or hosts)
const replicaUrls = process.env.DATABASE_READ_REPLICAS
  ? process.env.DATABASE_READ_REPLICAS.split(',').map((s) => s.trim()).filter(Boolean)
  : [];

replicaPools = replicaUrls.map((url, i) => {
  try {
    const pool = new Pool(buildConnectionConfig(url));
    pool.on('error', (err) => console.warn(`[DB Replica #${i + 1}] Error:`, err.message));
    return { pool, name: `replica-${i + 1}`, drizzle: drizzle(pool, { schema }) };
  } catch (err) {
    console.warn(`[DB Replica #${i + 1}] Failed to initialize:`, err.message);
    return null;
  }
}).filter(Boolean);

// Connect and verify database schemas
const checkAndInitDb = async () => {
  if (!primaryPool) return false;
  try {
    const client = await primaryPool.connect();
    isPrimaryConnected = true;
    dbError = null;
    console.log('[DB Primary] Connected successfully to primary PostgreSQL database.');

    // Execute schema init
    const schemaPath = path.join(__dirname, '..', 'db', 'schema.sql');
    if (fs.existsSync(schemaPath)) {
      const sql = fs.readFileSync(schemaPath, 'utf8');
      await client.query(sql);
      console.log('[DB Primary] Drizzle & PostgreSQL Schema verified/initialized.');
    }
    client.release();
    return true;
  } catch (err) {
    isPrimaryConnected = false;
    dbError = err.message;
    console.warn(`[DB Primary] PostgreSQL not reachable (${err.message}). Using resilient local in-memory fallback store.`);
    return false;
  }
};

// Execute Write Query (Always goes to Primary Master)
const queryWrite = async (text, params) => {
  if (isPrimaryConnected && primaryPool) {
    return await primaryPool.query(text, params);
  }
  throw new Error('Primary DB offline: ' + (dbError || 'Not connected'));
};

// Execute Read Query (Routes to Read Replicas with round-robin, falls back to Primary)
const queryRead = async (text, params) => {
  if (replicaPools.length > 0) {
    replicaIndex = (replicaIndex + 1) % replicaPools.length;
    const selectedReplica = replicaPools[replicaIndex];
    try {
      return await selectedReplica.pool.query(text, params);
    } catch (err) {
      console.warn(`[DB Replica] ${selectedReplica.name} failed, falling back to Primary:`, err.message);
    }
  }

  // Fallback to Primary for read
  return await queryWrite(text, params);
};

// Drizzle read accessor (Round-Robin replica or primary)
const getDrizzleRead = () => {
  if (replicaPools.length > 0) {
    replicaIndex = (replicaIndex + 1) % replicaPools.length;
    return replicaPools[replicaIndex].drizzle;
  }
  return drizzleWrite;
};

// Status object
const getStatus = () => {
  return {
    connected: isPrimaryConnected,
    mode: isPrimaryConnected ? 'postgresql-drizzle' : 'in-memory-fallback',
    error: dbError,
    architecture: {
      primary: {
        host: process.env.PGHOST || 'localhost',
        database: process.env.PGDATABASE || 'emi_calculator',
        status: isPrimaryConnected ? 'online' : 'offline',
      },
      readReplicas: {
        configuredCount: replicaPools.length,
        strategy: 'round-robin-with-primary-fallback',
        replicas: replicaPools.map((r) => r.name),
      },
      orm: 'Drizzle ORM v0.38+',
    },
  };
};

module.exports = {
  // Pools
  primaryPool,
  replicaPools,
  // Drizzle ORM clients
  drizzleWrite,
  getDrizzleRead,
  schema,
  // Query helpers
  query: queryWrite,
  queryWrite,
  queryRead,
  checkAndInitDb,
  getStatus,
  // Fallback local stores
  memoryStore,
  usersStore,
  saveMemoryStore,
  saveUsersStore,
  memoryIdCounter: () => memoryIdCounter++,
  userIdCounter: () => userIdCounter++,
};
