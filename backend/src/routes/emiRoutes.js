const express = require('express');
const router = express.Router();
const {
  calculate,
  saveCalculation,
  getCalculations,
  search,
  deleteCalculation,
  getHealth,
} = require('../controllers/emiController');
const { optionalAuth } = require('../middleware/authMiddleware');
const cacheService = require('../services/cacheService');

// Calculate EMI and schedule
router.post('/calculate', calculate);

// Search calculations with indexing
router.get('/search', search);

// CRUD for loan calculations (optionalAuth associates records with logged-in user)
router.post('/calculations', optionalAuth, saveCalculation);
router.get('/calculations', optionalAuth, getCalculations);
router.delete('/calculations/:id', deleteCalculation);

// Health check with architecture metrics
router.get('/health', getHealth);

module.exports = router;
