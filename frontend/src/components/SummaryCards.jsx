import React from 'react';
import {
  CreditCard,
  Percent,
  Wallet,
  CalendarCheck,
  TrendingUp,
} from 'lucide-react';
import { CURRENCIES, formatCurrency } from '../utils/formatters';

export default function SummaryCards({
  monthlyEMI,
  totalInterest,
  totalPayment,
  principal,
  tenureMonths,
  currency,
}) {
  const currentCurrency = CURRENCIES[currency] || CURRENCIES.INR;
  const sym = currentCurrency.symbol;

  const isZero = !principal || !monthlyEMI || principal <= 0 || tenureMonths <= 0;

  const interestRatio = totalPayment > 0 ? ((totalInterest / totalPayment) * 100).toFixed(1) : '0';
  const principalRatio = totalPayment > 0 ? ((principal / totalPayment) * 100).toFixed(1) : '0';

  // Payoff date estimation
  let payoffStr = '0';
  if (!isZero && tenureMonths > 0) {
    const payoffDate = new Date();
    payoffDate.setMonth(payoffDate.getMonth() + tenureMonths);
    payoffStr = payoffDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  }

  return (
    <div className="summary-grid">
      {/* 1. Monthly EMI */}
      <div className="glass-card" style={{
        padding: '22px',
        position: 'relative',
        overflow: 'hidden',
        borderLeft: '5px solid var(--primary)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
          <div>
            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block' }}>
              Monthly EMI
            </span>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Amount you pay every month
            </span>
          </div>
          <div style={{
            padding: '8px',
            borderRadius: '10px',
            background: 'var(--primary-glow)',
            color: 'var(--primary)',
          }}>
            <CreditCard size={20} />
          </div>
        </div>
        <div className="card-metric-value" style={{ color: 'var(--text-primary)' }}>
          {sym} {formatCurrency(monthlyEMI, currency)}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px', flexWrap: 'wrap' }}>
          <span className="badge badge-info" style={{ fontSize: '0.75rem', fontWeight: 700 }}>
            Per Month
          </span>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            For {tenureMonths || 0} Months
          </span>
        </div>
      </div>

      {/* 2. Total Interest */}
      <div className="glass-card" style={{
        padding: '22px',
        position: 'relative',
        overflow: 'hidden',
        borderLeft: '5px solid var(--interest-color)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
          <div>
            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block' }}>
              Total Interest
            </span>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Extra money paid to the bank
            </span>
          </div>
          <div style={{
            padding: '8px',
            borderRadius: '10px',
            background: 'rgba(244, 63, 94, 0.15)',
            color: 'var(--interest-color)',
          }}>
            <Percent size={20} />
          </div>
        </div>
        <div className="card-metric-value" style={{ color: 'var(--interest-color)' }}>
          {sym} {formatCurrency(totalInterest, currency)}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px', flexWrap: 'wrap' }}>
          <span className="badge badge-warning" style={{ fontSize: '0.75rem', fontWeight: 700 }}>
            {interestRatio}% Extra Cost
          </span>
        </div>
      </div>

      {/* 3. Total Payment */}
      <div className="glass-card" style={{
        padding: '22px',
        position: 'relative',
        overflow: 'hidden',
        borderLeft: '5px solid var(--total-color)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
          <div>
            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block' }}>
              Total Money to Pay
            </span>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Loan borrowed + Bank interest
            </span>
          </div>
          <div style={{
            padding: '8px',
            borderRadius: '10px',
            background: 'rgba(16, 185, 129, 0.15)',
            color: 'var(--total-color)',
          }}>
            <Wallet size={20} />
          </div>
        </div>
        <div className="card-metric-value" style={{ color: 'var(--text-primary)' }}>
          {sym} {formatCurrency(totalPayment, currency)}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px', flexWrap: 'wrap' }}>
          <span className="badge badge-success" style={{ fontSize: '0.75rem', fontWeight: 700 }}>
            Full Repayment
          </span>
        </div>
      </div>

      {/* 4. Payoff Timeline */}
      <div className="glass-card" style={{
        padding: '22px',
        position: 'relative',
        overflow: 'hidden',
        borderLeft: '5px solid var(--secondary-accent)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
          <div>
            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block' }}>
              Loan End Date
            </span>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              When you become 100% debt-free
            </span>
          </div>
          <div style={{
            padding: '8px',
            borderRadius: '10px',
            background: 'rgba(6, 182, 212, 0.15)',
            color: 'var(--secondary-accent)',
          }}>
            <CalendarCheck size={20} />
          </div>
        </div>
        <div className="card-metric-value" style={{ color: 'var(--secondary-accent)' }}>
          {payoffStr}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px', flexWrap: 'wrap' }}>
          {isZero ? (
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Enter loan details to calculate
            </span>
          ) : (
            <span className="badge" style={{ fontSize: '0.75rem', fontWeight: 700, background: 'rgba(6, 182, 212, 0.15)', color: 'var(--secondary-accent)' }}>
              🎉 Debt-Free Milestone Day!
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
