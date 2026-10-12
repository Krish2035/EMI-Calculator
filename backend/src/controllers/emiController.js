const db = require('../config/db');
const { calculateEMI, generateAmortizationSchedule } = require('../utils/calculator');
const cacheService = require('../services/cacheService');
const searchIndexService = require('../services/searchIndexService');
const queueManager = require('../queues/queueManager');

// Calculate EMI and schedule
const calculate = async (req, res) => {
  try {
    const {
      principal,
      annualInterestRate,
      tenureMonths,
      extraMonthly = 0,
      lumpSumAmount = 0,
      lumpSumMonth = 0,
      startDate,
    } = req.body;

    if (!principal || !annualInterestRate || !tenureMonths) {
      return res.status(400).json({
        success: false,
        message: 'Principal, annualInterestRate, and tenureMonths are required.',
      });
    }

    const result = generateAmortizationSchedule(principal, annualInterestRate, tenureMonths, {
      extraMonthly,
      lumpSumAmount,
      lumpSumMonth,
      startDate,
    });

    return res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Calculation error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to calculate EMI: ' + error.message,
    });
  }
};

// Save a calculation record to DB
const saveCalculation = async (req, res) => {
  try {
    const {
      title = 'My Loan Calculation',
      loanType = 'general',
      principal,
      annualInterestRate,
      tenureMonths,
      monthlyEMI,
      totalInterest,
      totalPayment,
      prepaymentMonthly = 0,
      prepaymentLumpSum = 0,
      notes = '',
    } = req.body;

    if (!principal || !annualInterestRate || !tenureMonths) {
      return res.status(400).json({
        success: false,
        message: 'Missing required loan parameters.',
      });
    }

    const userId = req.user ? req.user.id : null;
    const emi = monthlyEMI || calculateEMI(principal, annualInterestRate, tenureMonths).monthlyEMI;
    const interest = totalInterest !== undefined ? totalInterest : calculateEMI(principal, annualInterestRate, tenureMonths).totalInterest;
    const payment = totalPayment !== undefined ? totalPayment : calculateEMI(principal, annualInterestRate, tenureMonths).totalPayment;

    const dbStatus = db.getStatus();
    let savedRecord = null;

    if (dbStatus.connected) {
      const queryText = `
        INSERT INTO calculations (
          user_id, title, loan_type, principal, annual_interest_rate, tenure_months,
          monthly_emi, total_interest, total_payment, prepayment_monthly,
          prepayment_lumpsum, notes, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW())
        RETURNING *;
      `;
      const values = [
        userId,
        title,
        loanType,
        principal,
        annualInterestRate,
        tenureMonths,
        emi,
        interest,
        payment,
        prepaymentMonthly,
        prepaymentLumpSum,
        notes,
      ];

      const result = await db.queryWrite(queryText, values);
      savedRecord = result.rows[0];
    } else {
      // Fallback in-memory storage
      savedRecord = {
        id: db.memoryIdCounter(),
        user_id: userId,
        title,
        loan_type: loanType,
        principal: Number(principal),
        annual_interest_rate: Number(annualInterestRate),
        tenure_months: Number(tenureMonths),
        monthly_emi: Number(emi),
        total_interest: Number(interest),
        total_payment: Number(payment),
        prepayment_monthly: Number(prepaymentMonthly),
        prepayment_lumpsum: Number(prepaymentLumpSum),
        notes,
        created_at: new Date().toISOString(),
      };
      db.memoryStore.unshift(savedRecord);
      db.saveMemoryStore();
    }

    // Invalidate calculations cache
    await cacheService.delPattern('calculations:*');

    // Async background report queueing with BullMQ
    await queueManager.addReportJob('generate-report', {
      calculationId: savedRecord.id,
      title,
      userId,
    });

    return res.status(201).json({
      success: true,
      message: 'Calculation saved successfully.',
      data: savedRecord,
      storage: dbStatus.connected ? 'postgresql-drizzle' : 'local-store',
    });
  } catch (error) {
    console.error('Save calculation error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to save calculation: ' + error.message,
    });
  }
};

// Get all saved calculations (uses Read Replicas & Redis Cache)
const getCalculations = async (req, res) => {
  try {
    const userId = req.user ? req.user.id : null;
    const cacheKey = `calculations:list:${userId || 'all'}`;

    // Try Redis/Memory Cache
    const cached = await cacheService.get(cacheKey);
    if (cached) {
      res.setHeader('X-Cache', 'HIT');
      return res.json({
        success: true,
        data: cached,
        cached: true,
      });
    }

    const dbStatus = db.getStatus();
    let records = [];

    if (dbStatus.connected) {
      let querySql = 'SELECT * FROM calculations';
      const params = [];
      if (userId) {
        querySql += ' WHERE user_id = $1 OR user_id IS NULL';
        params.push(userId);
      }
      querySql += ' ORDER BY created_at DESC LIMIT 100;';

      const result = await db.queryRead(querySql, params);
      records = result.rows;
    } else {
      records = db.memoryStore || [];
      if (userId) {
        records = records.filter((r) => !r.user_id || String(r.user_id) === String(userId));
      }
    }

    // Set cache for 60 seconds
    await cacheService.set(cacheKey, records, 60);
    res.setHeader('X-Cache', 'MISS');

    return res.json({
      success: true,
      data: records,
      storage: dbStatus.connected ? 'postgresql-read-replica' : 'local-store',
      cached: false,
    });
  } catch (error) {
    console.error('Get calculations error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve calculations: ' + error.message,
    });
  }
};

// Search Calculations using full-text & inverted indexer
const search = async (req, res) => {
  try {
    const { q = '', type, min, max, limit = 25 } = req.query;
    const searchResult = await searchIndexService.searchCalculations(q, {
      loanType: type,
      minPrincipal: min,
      maxPrincipal: max,
      limit,
    });

    return res.json({
      success: true,
      query: q,
      ...searchResult,
    });
  } catch (err) {
    console.error('Search error:', err);
    return res.status(500).json({
      success: false,
      message: 'Search failed: ' + err.message,
    });
  }
};

// Delete a calculation
const deleteCalculation = async (req, res) => {
  try {
    const { id } = req.params;
    const dbStatus = db.getStatus();

    if (dbStatus.connected) {
      await db.queryWrite('DELETE FROM calculations WHERE id = $1;', [id]);
    } else {
      const index = db.memoryStore.findIndex((item) => String(item.id) === String(id));
      if (index !== -1) {
        db.memoryStore.splice(index, 1);
        db.saveMemoryStore();
      }
    }

    // Invalidate cache
    await cacheService.delPattern('calculations:*');

    return res.json({
      success: true,
      message: 'Record deleted successfully.',
    });
  } catch (error) {
    console.error('Delete calculation error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete calculation: ' + error.message,
    });
  }
};

// Health check endpoint with complete architectural overview
const getHealth = async (req, res) => {
  await db.checkAndInitDb().catch(() => {});
  const dbStatus = db.getStatus();
  const cacheStatus = cacheService.getStatus();
  const queueStatus = await queueManager.getQueueStats();

  return res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'EMI Calculator Enterprise API (Top 1% Tier)',
    architecture: {
      loadBalancer: {
        workerPid: process.pid,
        clusterMode: Boolean(process.env.CLUSTER_WORKER),
      },
      database: dbStatus,
      cache: cacheStatus,
      queues: queueStatus,
      rateLimiter: {
        strategy: 'Dual-Layer (IP Sliding Window + Normalized Email Limiting)',
        status: 'Active',
      },
      security: {
        passwordHashing: 'bcrypt (salt 12)',
        auth: 'JWT & Firebase Google OAuth',
      },
    },
  });
};

module.exports = {
  calculate,
  saveCalculation,
  getCalculations,
  search,
  deleteCalculation,
  getHealth,
};
