-- EMI Calculator Database Schema
CREATE TABLE IF NOT EXISTS calculations (
    id SERIAL PRIMARY KEY,
    title VARCHAR(150) NOT NULL DEFAULT 'Loan Calculation',
    loan_type VARCHAR(50) DEFAULT 'general',
    principal NUMERIC(15, 2) NOT NULL,
    annual_interest_rate NUMERIC(6, 2) NOT NULL,
    tenure_months INTEGER NOT NULL,
    monthly_emi NUMERIC(15, 2) NOT NULL,
    total_interest NUMERIC(15, 2) NOT NULL,
    total_payment NUMERIC(15, 2) NOT NULL,
    prepayment_monthly NUMERIC(15, 2) DEFAULT 0,
    prepayment_lumpsum NUMERIC(15, 2) DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_calculations_created_at ON calculations(created_at DESC);
