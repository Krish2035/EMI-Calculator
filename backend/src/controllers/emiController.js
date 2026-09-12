const db = require('../config/db');
const { calculateEMI, generateAmortizationSchedule } = require('../utils/calculator');

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

    const emi = monthlyEMI || calculateEMI(principal, annualInterestRate, tenureMonths).monthlyEMI;
    const interest = totalInterest !== undefined ? totalInterest : calculateEMI(principal, annualInterestRate, tenureMonths).totalInterest;
    const payment = totalPayment !== undefined ? totalPayment : calculateEMI(principal, annualInterestRate, tenureMonths).totalPayment;

    const dbStatus = db.getStatus();

    if (dbStatus.connected) {
      const queryText = `
        INSERT INTO calculations (
          title, loan_type, principal, annual_interest_rate, tenure_months,
          monthly_emi, total_interest, total_payment, prepayment_monthly,
          prepayment_lumpsum, notes, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())
        RETURNING *;
      `;
      const values = [
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

      const result = await db.query(queryText, values);
      return res.status(201).json({
        success: true,
        message: 'Calculation saved to PostgreSQL successfully.',
        data: result.rows[0],
        storage: 'postgresql',
      });
    } else {
      // Fallback in-memory storage
      const newRecord = {
        id: db.memoryIdCounter(),
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
      db.memoryStore.unshift(newRecord);
      db.saveMemoryStore();

      return res.status(201).json({
        success: true,
        message: 'Calculation saved to local storage (PostgreSQL currently offline).',
        data: newRecord,
        storage: 'local-store',
      });
    }
  } catch (error) {
    console.error('Save calculation error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to save calculation: ' + error.message,
    });
  }
};

// Get all saved calculations
const getCalculations = async (req, res) => {
  try {
    const dbStatus = db.getStatus();

    if (dbStatus.connected) {
      const result = await db.query('SELECT * FROM calculations ORDER BY created_at DESC LIMIT 100;');
      return res.json({
        success: true,
        data: result.rows,
        storage: 'postgresql',
      });
    } else {
      return res.json({
        success: true,
        data: db.memoryStore,
        storage: 'local-store',
      });
    }
  } catch (error) {
    console.error('Get calculations error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve calculations: ' + error.message,
    });
  }
};

// Delete a calculation (idempotent: always succeeds)
const deleteCalculation = async (req, res) => {
  try {
    const { id } = req.params;
    const dbStatus = db.getStatus();

    if (dbStatus.connected) {
      await db.query('DELETE FROM calculations WHERE id = $1;', [id]);
      return res.json({
        success: true,
        message: 'Record deleted from PostgreSQL.',
      });
    } else {
      const index = db.memoryStore.findIndex((item) => String(item.id) === String(id));
      if (index !== -1) {
        db.memoryStore.splice(index, 1);
        db.saveMemoryStore();
      }
      return res.json({
        success: true,
        message: 'Record deleted from store.',
      });
    }
  } catch (error) {
    console.error('Delete calculation error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete calculation: ' + error.message,
    });
  }
};

// Health check endpoint
const getHealth = async (req, res) => {
  // Re-verify connection if offline
  await db.checkAndInitDb().catch(() => {});
  const status = db.getStatus();

  return res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'EMI Calculator API',
    database: status,
  });
};

module.exports = {
  calculate,
  saveCalculation,
  getCalculations,
  deleteCalculation,
  getHealth,
};
