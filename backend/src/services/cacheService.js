const Redis = require('ioredis');
const dotenv = require('dotenv');

dotenv.config();

// In-Memory fallback cache
class MemoryCache {
  constructor() {
    this.cache = new Map();
  }

  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;
    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    return item.value;
  }

  set(key, value, ttlSeconds = 300) {
    this.cache.set(key, {
      value,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  }

  del(key) {
    this.cache.delete(key);
  }

  delPattern(pattern) {
    const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    }
  }

  flush() {
    this.cache.clear();
  }

  size() {
    return this.cache.size;
  }
}

const memoryFallback = new MemoryCache();
let redisClient = null;
let isRedisConnected = false;

// Initialize Redis only if explicitly configured or available
const initRedis = () => {
  try {
    const host = process.env.REDIS_HOST || '127.0.0.1';
    const port = parseInt(process.env.REDIS_PORT || '6379', 10);
    const password = process.env.REDIS_PASSWORD || undefined;

    redisClient = new Redis({
      host,
      port,
      password,
      lazyConnect: true,
      enableOfflineQueue: false,
      connectTimeout: 1500,
      maxRetriesPerRequest: 0,
      retryStrategy: () => null, // Do not endlessly loop reconnect if host is offline
    });
    redisClient.on('error', () => {
      isRedisConnected = false;
    });

    redisClient.connect().then(() => {
      isRedisConnected = true;
      console.log('[Redis Cache] ✅ Connected to Redis server.');
    }).catch(() => {
      isRedisConnected = false;
      console.log('[Redis Cache] ℹ️ Redis offline. Active fallback: in-memory cache.');
    });

    redisClient.on('error', () => {
      isRedisConnected = false;
    });

    redisClient.on('connect', () => {
      isRedisConnected = true;
    });
  } catch (err) {
    isRedisConnected = false;
  }
};

initRedis();

const cacheService = {
  isRedisActive() {
    return isRedisConnected;
  },

  async get(key) {
    if (isRedisConnected && redisClient) {
      try {
        const val = await redisClient.get(key);
        return val ? JSON.parse(val) : null;
      } catch (err) {
        // fallback
      }
    }
    return memoryFallback.get(key);
  },

  async set(key, value, ttlSeconds = 300) {
    if (isRedisConnected && redisClient) {
      try {
        await redisClient.set(key, JSON.stringify(value), 'EX', ttlSeconds);
        return;
      } catch (err) {
        // fallback
      }
    }
    memoryFallback.set(key, value, ttlSeconds);
  },

  async del(key) {
    if (isRedisConnected && redisClient) {
      try {
        await redisClient.del(key);
        return;
      } catch (err) {
        // fallback
      }
    }
    memoryFallback.del(key);
  },

  async delPattern(pattern) {
    if (isRedisConnected && redisClient) {
      try {
        const keys = await redisClient.keys(pattern);
        if (keys.length > 0) {
          await redisClient.del(...keys);
        }
        return;
      } catch (err) {
        // fallback
      }
    }
    memoryFallback.delPattern(pattern);
  },

  async wrap(key, ttlSeconds, fetcherFn) {
    const cached = await this.get(key);
    if (cached !== null && cached !== undefined) {
      return { data: cached, hit: true };
    }
    const fresh = await fetcherFn();
    await this.set(key, fresh, ttlSeconds);
    return { data: fresh, hit: false };
  },

  getStatus() {
    return {
      activeEngine: isRedisConnected ? 'Redis (Distributed Distributed Cache)' : 'In-Memory (Local High-Speed Cache)',
      isRedisConnected,
      inMemoryItemCount: memoryFallback.size(),
    };
  },

  middleware(ttlSeconds = 60, keyPrefix = 'cache') {
    return async (req, res, next) => {
      if (req.method !== 'GET') return next();

      const key = `${keyPrefix}:${req.originalUrl || req.url}`;
      try {
        const cached = await cacheService.get(key);
        if (cached !== null && cached !== undefined) {
          res.setHeader('X-Cache', 'HIT');
          return res.json(cached);
        }
      } catch (err) {}

      res.setHeader('X-Cache', 'MISS');
      const originalJson = res.json.bind(res);
      res.json = (body) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          cacheService.set(key, body, ttlSeconds).catch(() => {});
        }
        return originalJson(body);
      };

      next();
    };
  },
};

module.exports = cacheService;
