-- EMI Calculator Database Schema with Full-Text Search and User Relationship

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash TEXT,
    name VARCHAR(150) NOT NULL DEFAULT 'Smart User',
    avatar_url TEXT,
    auth_provider VARCHAR(50) NOT NULL DEFAULT 'local',
    google_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- 2. Calculations Table
CREATE TABLE IF NOT EXISTS calculations (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_calculations_created_at ON calculations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_calculations_user_id ON calculations(user_id);
CREATE INDEX IF NOT EXISTS idx_calculations_loan_type ON calculations(loan_type);

-- 3. Search Indexing: Full Text Search vector index
CREATE INDEX IF NOT EXISTS idx_calculations_search ON calculations 
USING GIN (to_tsvector('english', coalesce(title, '') || ' ' || coalesce(loan_type, '') || ' ' || coalesce(notes, '')));
