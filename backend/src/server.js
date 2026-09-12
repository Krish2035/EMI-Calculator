const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const emiRoutes = require('./routes/emiRoutes');
const { checkAndInitDb } = require('./config/db');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api', emiRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'EMI Calculator Backend API is running',
    version: '1.0.0',
    endpoints: [
      'POST /api/calculate',
      'POST /api/calculations',
      'GET /api/calculations',
      'DELETE /api/calculations/:id',
      'GET /api/health',
    ],
  });
});

// Start Server
app.listen(PORT, async () => {
  console.log(`==========================================`);
  console.log(`🚀 EMI Calculator Server running on port ${PORT}`);
  console.log(`📡 URL: http://localhost:${PORT}`);
  console.log(`==========================================`);
  
  // Attempt PostgreSQL initialization
  await checkAndInitDb();
});
