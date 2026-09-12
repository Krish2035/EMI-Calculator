import React, { useState } from 'react';
import {
  HeartHandshake,
  CheckCircle2,
  AlertTriangle,
  Info,
  ChevronRight,
  ShieldCheck,
  TrendingDown,
  Sparkles,
} from 'lucide-react';
import { CURRENCIES, formatCurrency } from '../utils/formatters';

export default function AffordabilityMeter({
  monthlyEMI,
  currency,
}) {
  const [monthlyIncome, setMonthlyIncome] = useState(() => {
    const saved = localStorage.getItem('smart_emi_monthly_income');
    return saved ? Number(saved) : 0;
  });

  const [isOpen, setIsOpen] = useState(true);

  const currentCurrency = CURRENCIES[currency] || CURRENCIES.INR;
  const sym = currentCurrency.symbol;

  const handleIncomeChange = (val) => {
    const num = Math.max(0, Number(val) || 0);
    setMonthlyIncome(num);
    localStorage.setItem('smart_emi_monthly_income', num);
  };

  const ratio = monthlyIncome > 0 && monthlyEMI > 0 ? (monthlyEMI / monthlyIncome) * 100 : 0;
  const clampedRatio = Math.min(100, Math.round(ratio));

  // Determine comfort tier
  let tier = 'unset';
  let tierColor = 'var(--text-muted)';
  let tierBg = 'var(--bg-input)';
  let tierTitle = 'Enter your take-home pay';
  let tierMessage = 'Wondering if this EMI is safe for your monthly budget? Enter your take-home family income below to see your comfort zone.';

  if (monthlyIncome > 0 && monthlyEMI > 0) {
    if (ratio <= 30) {
      tier = 'safe';
      tierColor = '#10b981';
      tierBg = 'rgba(16, 185, 129, 0.12)';
      tierTitle = 'Healthy & Comfortable 🧘‍♂️';
      tierMessage = `This EMI takes only ${clampedRatio}% of your monthly earnings. Financial planners love this—you will comfortably handle bills, groceries, and weekend fun without financial stress.`;
    } else if (ratio <= 45) {
      tier = 'moderate';
      tierColor = '#f59e0b';
      tierBg = 'rgba(245, 158, 11, 0.12)';
      tierTitle = 'Manageable, Budget Mindfully ⚖️';
      tierMessage = `This EMI consumes ${clampedRatio}% of your earnings. It is realistic and standard, but keep an emergency fund handy and avoid taking on new credit cards.`;
    } else {
      tier = 'heavy';
      tierColor = '#ef4444';
      tierBg = 'rgba(239, 68, 68, 0.12)';
      tierTitle = 'May Feel Tight on Monthly Life ⚠️';
      tierMessage = `This EMI takes ${clampedRatio}% of your earnings. Over 45% can pinch your lifestyle. Consider extending your loan tenure by a few years to bring the monthly EMI down to a gentler range.`;
    }
  }

  // Quick preset income buttons for convenience
  const quickIncomes = currency === 'INR' 
    ? [40000, 75000, 150000, 250000]
    : [2500, 5000, 8000, 12000];

  return (
    <div className="glass-card" style={{
      padding: '22px',
      marginBottom: '24px',
      position: 'relative',
      overflow: 'hidden',
      border: `1.5px solid ${tier === 'unset' ? 'var(--border-color)' : tierColor}`,
      background: tier === 'unset' ? 'var(--bg-card)' : `linear-gradient(to right bottom, var(--bg-card), ${tierBg})`,
    }}>
      {/* Card Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: tier === 'unset' ? 'var(--primary-glow)' : tierBg,
            color: tier === 'unset' ? 'var(--primary)' : tierColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}>
            <HeartHandshake size={22} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0 }}>
                Can I Afford This? (Comfort Check)
              </h3>
              <span className="badge" style={{
                background: tierBg,
                color: tierColor,
                fontSize: '0.75rem',
                border: `1px solid ${tierColor}`,
              }}>
                {tierTitle}
              </span>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '3px 0 0 0' }}>
              Personalized budget sanity check — see how this loan fits into your actual lifestyle.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="btn-secondary"
          style={{ padding: '6px 12px', fontSize: '0.8rem' }}
        >
          {isOpen ? 'Minimize' : 'Show Budget Check'}
        </button>
      </div>

      {isOpen && (
        <div style={{ marginTop: '18px', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
          {/* Income Input Row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap', marginBottom: '16px' }}>
            <div style={{ flex: '1 1 200px', minWidth: 0 }}>
              <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                Your Monthly Family Take-Home Income:
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{
                  position: 'absolute',
                  left: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  fontWeight: 700,
                  color: 'var(--text-muted)',
                }}>
                  {sym}
                </span>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={monthlyIncome || ''}
                  onChange={(e) => handleIncomeChange(e.target.value)}
                  placeholder="e.g. 75,000"
                  className="input-box"
                  style={{ paddingLeft: '32px', width: '100%', fontSize: '1rem', fontWeight: 600 }}
                />
              </div>
            </div>

            {/* Quick Preset Pills */}
            <div style={{ flex: '2 1 200px', minWidth: 0 }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                Quick pick income:
              </span>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {quickIncomes.map((inc) => (
                  <button
                    key={inc}
                    type="button"
                    onClick={() => handleIncomeChange(inc)}
                    className="preset-pill"
                    style={{
                      background: monthlyIncome === inc ? 'var(--primary)' : 'var(--bg-input)',
                      color: monthlyIncome === inc ? '#ffffff' : 'var(--text-secondary)',
                      padding: '6px 12px',
                      fontSize: '0.8rem',
                    }}
                  >
                    {sym} {formatCurrency(inc, currency)}
                  </button>
                ))}
                {monthlyIncome > 0 && (
                  <button
                    type="button"
                    onClick={() => handleIncomeChange(0)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--text-muted)',
                      fontSize: '0.75rem',
                      cursor: 'pointer',
                      textDecoration: 'underline',
                    }}
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Visual Comfort Meter Bar */}
          {monthlyIncome > 0 && monthlyEMI > 0 ? (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px', fontSize: '0.82rem' }}>
                <span style={{ fontWeight: 700, color: 'var(--text-secondary)' }}>
                  Loan EMI vs Income: <strong style={{ color: tierColor }}>{clampedRatio}% of salary</strong>
                </span>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                  Remaining for living & savings: <strong>{100 - clampedRatio}%</strong> ({sym} {formatCurrency(Math.max(0, monthlyIncome - monthlyEMI), currency)})
                </span>
              </div>

              {/* Progress Bar with Color Segments */}
              <div style={{
                height: '10px',
                borderRadius: '5px',
                background: 'var(--bg-input)',
                overflow: 'hidden',
                position: 'relative',
                display: 'flex',
              }}>
                <div style={{
                  width: `${Math.min(100, clampedRatio)}%`,
                  background: tierColor,
                  borderRadius: '5px',
                  transition: 'width 0.4s ease, background 0.4s ease',
                }} />
              </div>

              {/* Threshold Labels */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                <span style={{ color: '#10b981' }}>● Safe (0 - 30%)</span>
                <span style={{ color: '#f59e0b' }}>● Moderate (30 - 45%)</span>
                <span style={{ color: '#ef4444' }}>● Heavy (45%+)</span>
              </div>

              {/* Empathetic Feedback Box */}
              <div style={{
                marginTop: '12px',
                padding: '12px 16px',
                borderRadius: '10px',
                background: tierBg,
                border: `1px solid ${tierColor}`,
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
              }}>
                {tier === 'safe' && <CheckCircle2 size={20} color={tierColor} style={{ flexShrink: 0, marginTop: '2px' }} />}
                {tier === 'moderate' && <Info size={20} color={tierColor} style={{ flexShrink: 0, marginTop: '2px' }} />}
                {tier === 'heavy' && <AlertTriangle size={20} color={tierColor} style={{ flexShrink: 0, marginTop: '2px' }} />}
                <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                  <strong>{tierTitle}: </strong>
                  <span>{tierMessage}</span>
                </div>
              </div>
            </div>
          ) : (
            <div style={{
              padding: '12px 14px',
              borderRadius: '10px',
              background: 'var(--bg-input)',
              fontSize: '0.82rem',
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}>
              <ShieldCheck size={18} color="var(--primary)" />
              <span>
                {monthlyEMI <= 0
                  ? 'Set your loan details in the calculator to see your comfort feedback.'
                  : 'Enter your monthly family take-home salary to see your personal affordability rating.'}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
