import React, { useState } from 'react';
import {
  GitCompare,
  CheckCircle2,
  TrendingDown,
  ArrowRight,
  PlusCircle,
} from 'lucide-react';
import { calculateEMI } from '../utils/calculator';
import { CURRENCIES, formatCurrency } from '../utils/formatters';

export default function LoanComparator({ currentLoan, currency }) {
  const currentCurrency = CURRENCIES[currency] || CURRENCIES.INR;
  const sym = currentCurrency.symbol;

  // Option B loan state
  const [optionB, setOptionB] = useState({
    title: 'Bank B Offer',
    principal: currentLoan.principal,
    rate: Math.max(1, currentLoan.rate - 0.5),
    tenureYears: currentLoan.tenureYears,
  });

  const emiA = calculateEMI(currentLoan.principal, currentLoan.rate, currentLoan.tenureMonths);
  const tenureMonthsB = optionB.tenureYears * 12;
  const emiB = calculateEMI(optionB.principal, optionB.rate, tenureMonthsB);

  const diffEMI = emiA.monthlyEMI - emiB.monthlyEMI;
  const diffInterest = emiA.totalInterest - emiB.totalInterest;

  return (
    <div className="glass-card" style={{ padding: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
        <GitCompare size={20} color="var(--primary)" />
        <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Compare Two Loan Offers</h2>
      </div>
      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
        Evaluate two loan quotes side-by-side to choose the most cost-effective deal.
      </p>

      {/* Comparison Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '16px', marginBottom: '24px' }}>
        {/* Option A (Current) */}
        <div style={{
          padding: '20px',
          background: 'var(--bg-input)',
          borderRadius: '14px',
          border: '1px solid var(--border-color)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase' }}>
              Option A (Current Loan)
            </span>
            <span className="badge badge-info">Active</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Principal:</span>
              <span style={{ fontWeight: 600 }}>{sym} {formatCurrency(currentLoan.principal, currency)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Interest Rate:</span>
              <span style={{ fontWeight: 600 }}>{currentLoan.rate}% P.A.</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Tenure:</span>
              <span style={{ fontWeight: 600 }}>{currentLoan.tenureYears} Years</span>
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '8px 0' }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Monthly EMI:</span>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>
                {sym} {formatCurrency(emiA.monthlyEMI, currency)}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Total Interest:</span>
              <span style={{ fontWeight: 700, color: '#f43f5e' }}>{sym} {formatCurrency(emiA.totalInterest, currency)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Total Payment:</span>
              <span style={{ fontWeight: 700 }}>{sym} {formatCurrency(emiA.totalPayment, currency)}</span>
            </div>
          </div>
        </div>

        {/* Option B (Alternative) */}
        <div style={{
          padding: '20px',
          background: 'var(--bg-input)',
          borderRadius: '14px',
          border: '1px solid var(--border-color)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <input
              type="text"
              value={optionB.title}
              onChange={(e) => setOptionB({ ...optionB, title: e.target.value })}
              className="input-box"
              style={{ fontSize: '0.85rem', fontWeight: 700, padding: '4px 8px', width: '150px' }}
            />
            <span className="badge badge-warning">Alternative</span>
          </div>

          {/* Editable fields for Option B */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Principal:</span>
              <input
                type="number"
                value={optionB.principal}
                onChange={(e) => setOptionB({ ...optionB, principal: Number(e.target.value) })}
                className="input-box"
                style={{ width: '120px', textAlign: 'right', fontSize: '0.8rem', padding: '4px 8px' }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Interest Rate:</span>
              <input
                type="number"
                step="0.1"
                value={optionB.rate}
                onChange={(e) => setOptionB({ ...optionB, rate: Number(e.target.value) })}
                className="input-box"
                style={{ width: '80px', textAlign: 'right', fontSize: '0.8rem', padding: '4px 8px' }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Tenure (Yrs):</span>
              <input
                type="number"
                value={optionB.tenureYears}
                onChange={(e) => setOptionB({ ...optionB, tenureYears: Number(e.target.value) })}
                className="input-box"
                style={{ width: '70px', textAlign: 'right', fontSize: '0.8rem', padding: '4px 8px' }}
              />
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '8px 0' }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Monthly EMI:</span>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>
                {sym} {formatCurrency(emiB.monthlyEMI, currency)}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Total Interest:</span>
              <span style={{ fontWeight: 700, color: '#f43f5e' }}>{sym} {formatCurrency(emiB.totalInterest, currency)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Total Payment:</span>
              <span style={{ fontWeight: 700 }}>{sym} {formatCurrency(emiB.totalPayment, currency)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Difference Analysis Banner */}
      <div style={{
        background: diffInterest >= 0
          ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(6, 182, 212, 0.12) 100%)'
          : 'linear-gradient(135deg, rgba(244, 63, 94, 0.12) 0%, rgba(245, 158, 11, 0.12) 100%)',
        border: `1px solid ${diffInterest >= 0 ? 'rgba(16, 185, 129, 0.3)' : 'rgba(244, 63, 94, 0.3)'}`,
        borderRadius: '12px',
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
      }}>
        <div>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: diffInterest >= 0 ? '#10b981' : '#f43f5e' }}>
            {diffInterest >= 0 ? 'Cost Comparison Verdict' : 'Higher Cost Alert'}
          </span>
          <p style={{ fontSize: '0.95rem', fontWeight: 600, marginTop: '2px' }}>
            {diffInterest >= 0
              ? `Option B saves you ${sym} ${formatCurrency(diffInterest, currency)} in total interest and ${sym} ${formatCurrency(Math.abs(diffEMI), currency)} per month!`
              : `Option B costs you ${sym} ${formatCurrency(Math.abs(diffInterest), currency)} more in interest.`}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <span className={`badge ${diffInterest >= 0 ? 'badge-success' : 'badge-warning'}`} style={{ padding: '6px 12px' }}>
            {diffInterest >= 0 ? 'Option B is Better' : 'Option A is Better'}
          </span>
        </div>
      </div>
    </div>
  );
}
