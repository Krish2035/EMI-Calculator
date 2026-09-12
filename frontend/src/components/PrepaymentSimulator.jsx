import React, { useState, useEffect } from 'react';
import {
  Zap,
  TrendingDown,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CURRENCIES, formatCurrency } from '../utils/formatters';

export default function PrepaymentSimulator({
  principal,
  interestRate,
  tenureMonths,
  extraMonthly,
  setExtraMonthly,
  lumpSumAmount,
  setLumpSumAmount,
  lumpSumMonth,
  setLumpSumMonth,
  savingsData,
  currency,
}) {
  const currentCurrency = CURRENCIES[currency] || CURRENCIES.INR;
  const sym = currentCurrency.symbol;

  const {
    monthsSaved = 0,
    interestSaved = 0,
    actualTenureMonths = tenureMonths,
    actualTotalInterest = 0,
    actualTotalPayment = 0,
  } = savingsData || {};

  // Trigger celebratory confetti if significant savings achieved
  useEffect(() => {
    if (interestSaved > 50000 || monthsSaved >= 12) {
      confetti({
        particleCount: 35,
        spread: 60,
        origin: { y: 0.8 },
      });
    }
  }, [extraMonthly, lumpSumAmount]);

  const yearsSaved = Math.floor(monthsSaved / 12);
  const remMonthsSaved = monthsSaved % 12;
  const savingsString =
    yearsSaved > 0
      ? `${yearsSaved} Yr${yearsSaved > 1 ? 's' : ''} ${remMonthsSaved > 0 ? `${remMonthsSaved} Mo` : ''}`
      : `${monthsSaved} Mo`;

  return (
    <div className="glass-card" style={{ padding: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
        <Zap size={20} color="#10b981" />
        <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Prepayment & Foreclosure Simulator</h2>
      </div>
      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
        See how small extra payments can save you massive interest and help you become debt-free years ahead of schedule.
      </p>

      {/* Simulator Inputs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '16px', marginBottom: '24px' }}>
        {/* Extra Monthly Payment */}
        <div style={{
          padding: '16px',
          background: 'var(--bg-input)',
          borderRadius: '12px',
          border: '1px solid var(--border-color)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Extra Monthly Payment</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{sym}</span>
              <input
                type="number"
                value={extraMonthly}
                onChange={(e) => setExtraMonthly(Math.max(0, Number(e.target.value)))}
                className="input-box"
                style={{ width: '110px', textAlign: 'right', fontSize: '0.85rem' }}
                step="500"
              />
            </div>
          </div>
          <input
            type="range"
            min={0}
            max={Math.max(10000, Math.round(principal * 0.05))}
            step={1000}
            value={extraMonthly}
            onChange={(e) => setExtraMonthly(Number(e.target.value))}
            className="range-slider"
            style={{
              background: `linear-gradient(to right, var(--primary) 0%, var(--primary) ${Math.max(10000, Math.round(principal * 0.05)) > 0 ? Math.min(100, Math.max(0, (extraMonthly / Math.max(10000, Math.round(principal * 0.05))) * 100)) : 0}%, var(--slider-track-bg) ${Math.max(10000, Math.round(principal * 0.05)) > 0 ? Math.min(100, Math.max(0, (extraMonthly / Math.max(10000, Math.round(principal * 0.05))) * 100)) : 0}%, var(--slider-track-bg) 100%)`,
            }}
          />
          <div style={{ display: 'flex', gap: '6px', marginTop: '10px' }}>
            {[2000, 5000, 10000, 20000].map((amt) => (
              <button
                key={amt}
                onClick={() => setExtraMonthly(amt)}
                className="btn-secondary"
                style={{ padding: '3px 8px', fontSize: '0.72rem', borderRadius: '6px' }}
              >
                +{formatCurrency(amt, currency)}
              </button>
            ))}
          </div>
        </div>

        {/* One-Time Lump Sum Prepayment */}
        <div style={{
          padding: '16px',
          background: 'var(--bg-input)',
          borderRadius: '12px',
          border: '1px solid var(--border-color)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Lump Sum Prepayment</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{sym}</span>
              <input
                type="number"
                value={lumpSumAmount}
                onChange={(e) => setLumpSumAmount(Math.max(0, Number(e.target.value)))}
                className="input-box"
                style={{ width: '110px', textAlign: 'right', fontSize: '0.85rem' }}
                step="10000"
              />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '8px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Pay at Month #:</span>
            <input
              type="number"
              min={1}
              max={tenureMonths}
              value={lumpSumMonth}
              onChange={(e) => setLumpSumMonth(Math.max(1, Number(e.target.value)))}
              className="input-box"
              style={{ width: '70px', textAlign: 'center', fontSize: '0.85rem' }}
            />
          </div>
        </div>
      </div>

      {/* Savings Results Banner */}
      {(extraMonthly > 0 || lumpSumAmount > 0) && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(6, 182, 212, 0.15) 100%)',
          border: '1px solid rgba(16, 185, 129, 0.35)',
          borderRadius: '16px',
          padding: '20px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          animation: 'fadeIn 0.4s ease',
        }}>
          {/* Interest Saved */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#10b981', marginBottom: '4px' }}>
              <TrendingDown size={18} />
              <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>Interest Saved</span>
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#10b981', fontFamily: 'var(--font-mono)' }}>
              {sym} {formatCurrency(interestSaved, currency)}
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Direct savings off your total loan cost
            </span>
          </div>

          {/* Tenure Reduced */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#06b6d4', marginBottom: '4px' }}>
              <Clock size={18} />
              <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>Tenure Reduced</span>
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#06b6d4', fontFamily: 'var(--font-mono)' }}>
              {savingsString}
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              New loan tenure: {actualTenureMonths} months
            </span>
          </div>

          {/* Quick summary button */}
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <span className="badge badge-success" style={{ alignSelf: 'flex-start', padding: '6px 12px', fontSize: '0.8rem' }}>
              <Sparkles size={14} /> High Savings Strategy
            </span>
          </div>
        </div>
      )}

      {extraMonthly === 0 && lumpSumAmount === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '24px',
          background: 'var(--bg-input)',
          borderRadius: '12px',
          border: '1px dashed var(--border-color)',
          color: 'var(--text-muted)',
          fontSize: '0.85rem',
        }}>
          Adjust the sliders above to preview how prepayments can shave years off your loan tenure and save interest.
        </div>
      )}
    </div>
  );
}
