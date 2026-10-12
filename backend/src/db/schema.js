const { pgTable, serial, varchar, numeric, integer, text, timestamp } = require('drizzle-orm/pg-core');

// Users table with hashed password and auth provider support
const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: text('password_hash'), // Nullable for Google OAuth users
  name: varchar('name', { length: 150 }).notNull().default('Smart User'),
  avatarUrl: text('avatar_url'),
  authProvider: varchar('auth_provider', { length: 50 }).notNull().default('local'), // 'local' | 'google'
  googleId: varchar('google_id', { length: 255 }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// Calculations table linked to users (optional foreign key / user association)
const calculations = pgTable('calculations', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'set null' }),
  title: varchar('title', { length: 150 }).notNull().default('Loan Calculation'),
  loanType: varchar('loan_type', { length: 50 }).default('general'),
  principal: numeric('principal', { precision: 15, scale: 2 }).notNull(),
  annualInterestRate: numeric('annual_interest_rate', { precision: 6, scale: 2 }).notNull(),
  tenureMonths: integer('tenure_months').notNull(),
  monthlyEmi: numeric('monthly_emi', { precision: 15, scale: 2 }).notNull(),
  totalInterest: numeric('total_interest', { precision: 15, scale: 2 }).notNull(),
  totalPayment: numeric('total_payment', { precision: 15, scale: 2 }).notNull(),
  prepaymentMonthly: numeric('prepayment_monthly', { precision: 15, scale: 2 }).default('0'),
  prepaymentLumpsum: numeric('prepayment_lumpsum', { precision: 15, scale: 2 }).default('0'),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

module.exports = {
  users,
  calculations,
};
