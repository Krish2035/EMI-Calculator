const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const emiRoutes = require('./routes/emiRoutes');
const authRoutes = require('./routes/authRoutes');
const { checkAndInitDb } = require('./config/db');
const { setupSwagger } = require('./docs/swagger');
const { apiIpLimiter } = require('./middleware/rateLimiter');
const queueManager = require('./queues/queueManager');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security & Headers
app.use(helmet({
  contentSecurityPolicy: false, // Allows Swagger UI to execute scripts cleanly
  crossOriginEmbedderPolicy: false,
}));

// CORS Configuration
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['X-Cache', 'X-Email-RateLimit-Limit', 'X-Email-RateLimit-Remaining', 'X-Worker-PID', 'Retry-After'],
}));

// Body Parsing
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// Tag every response with active Worker PID for load balancer verification
app.use((req, res, next) => {
  res.setHeader('X-Worker-PID', process.pid);
  next();
});

// Setup Swagger UI Documentation at /api/docs and /swagger
setupSwagger(app);

// Apply General IP Rate Limiting to all /api routes
app.use('/api', apiIpLimiter);

// Auth Routes (Registration, Login with bcrypt & Google OAuth)
app.use('/api/auth', authRoutes);

// Core EMI & Calculations Routes (Search indexing, CRUD, Prepayment, Health)
app.use('/api', emiRoutes);

// BullMQ Queue Health & Stats endpoint
app.get('/api/queue/stats', async (req, res) => {
  const stats = await queueManager.getQueueStats();
  return res.json({ success: true, stats });
});

// Root route
app.get('/', (req, res) => {
  res.json({
    message: '🚀 EMI Calculator Enterprise API (Top 1% Tier Architecture)',
    version: '2.0.0',
    workerPid: process.pid,
    documentation: '/api/docs',
    endpoints: {
      auth: ['POST /api/auth/register', 'POST /api/auth/login', 'POST /api/auth/google', 'GET /api/auth/me'],
      calculator: ['POST /api/calculate', 'GET /api/calculations', 'POST /api/calculations', 'DELETE /api/calculations/:id'],
      search: 'GET /api/search?q=query&type=home&min=100000',
      health: 'GET /api/health',
      queues: 'GET /api/queue/stats',
      docs: '/api/docs',
    },
  });
});

// Start Server if not imported by another script
if (require.main === module) {
  const server = app.listen(PORT, async () => {
    console.log(`================================================================`);
    console.log(`🚀 EMI Calculator Enterprise API (Worker PID ${process.pid})`);
    console.log(`📡 URL: http://localhost:${PORT}`);
    console.log(`📚 Swagger Documentation: http://localhost:${PORT}/api/docs`);
    console.log(`🛡️  Rate Limiter & bcrypt Security: Active`);
    console.log(`================================================================`);

    // Initialize Drizzle ORM & PostgreSQL
    await checkAndInitDb();
  });

  // Graceful shutdown
  const gracefulShutdown = () => {
    console.log(`[Worker ${process.pid}] Shutting down gracefully...`);
    server.close(() => {
      console.log(`[Worker ${process.pid}] Closed HTTP connections.`);
      process.exit(0);
    });
  };

  process.on('SIGTERM', gracefulShutdown);
  process.on('SIGINT', gracefulShutdown);
}

module.exports = app;
