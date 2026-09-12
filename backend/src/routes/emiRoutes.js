const express = require('express');
const router = express.Router();
const {
  calculate,
  saveCalculation,
  getCalculations,
  deleteCalculation,
  getHealth,
} = require('../controllers/emiController');

// Calculate EMI and schedule
router.post('/calculate', calculate);

// CRUD for loan calculations
router.post('/calculations', saveCalculation);
router.get('/calculations', getCalculations);
router.delete('/calculations/:id', deleteCalculation);

// Health check
router.get('/health', getHealth);

module.exports = router;
