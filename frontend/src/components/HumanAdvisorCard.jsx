import React from 'react';
import {
  Sparkles,
  Lightbulb,
  ShieldCheck,
  Zap,
  GitCompare,
  TrendingDown,
  Smile,
  ArrowRight,
} from 'lucide-react';
import { CURRENCIES, formatCurrency } from '../utils/formatters';

export default function HumanAdvisorCard({
  principal,
  interestRate,
  tenureMonths,
  monthlyEMI,
  totalInterest,
  totalPayment,
  currency,
  onNavigateTab,
}) {
  const currentCurrency = CURRENCIES[currency] || CURRENCIES.INR;
  const sym = currentCurrency.symbol;

  const isZero = !principal || principal <= 0 || !monthlyEMI || monthlyEMI <= 0;
  const tenureYears = Math.round(tenureMonths / 12);
  const interestRatio = principal > 0 ? ((totalInterest / principal) * 100).toFixed(0) : 0;

  // Potential savings estimate for friendly tip (e.g. paying 5% more per month)
  const extraTipAmount = Math.max(500, Math.round(monthlyEMI * 0.05 / 100) * 100);
  const estimatedSavings = Math.round(totalInterest * 0.18);

  return (
    <div className="glass-card" style={{
      padding: '20px 24px',
      marginBottom: '24px',
      background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(139, 92, 246, 0.04) 100%)',
      border: '1.5px solid rgba(99, 102, 241, 0.25)',
      borderRadius: '16px',
      position: 'relative',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', flexWrap: 'wrap' }}>
        {/* Friendly Avatar Icon */}
        <div style={{
          width: '44px',
          height: '44px',
          borderRadius: '50%',
          background: 'var(--primary-gradient)',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          boxShadow: '0 4px 12px rgba(99, 102, 241, 0.35)',
        }}>
          {isZero ? <Smile size={24} /> : <Lightbulb size={24} />}
        </div>

        {/* Content */}
        <div style={{ flex: '1 1 200px', minWidth: 0 }}>
          {isZero ? (
            <div>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>
                Hello there! Welcome to your personal loan companion 👋
              </h4>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                Planning for a loan doesn't have to be confusing or stressful. Start by picking one of the <strong>life goals</strong> below (Home, Car, Education, or Personal), or freely move the sliders. We'll show you exactly where every rupee goes.
              </p>
            </div>
          ) : (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                  Smart Advisor's Human Note 💡
                </h4>
                <span className="badge badge-info" style={{ fontSize: '0.72rem' }}>
                  Tailored to your loan
                </span>
              </div>

              <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
                {interestRatio > 40 ? (
                  <p style={{ margin: '0 0 8px 0' }}>
                    <strong>Bank Interest Alert:</strong> Over {tenureYears} years, you will pay{' '}
                    <strong style={{ color: 'var(--interest-color)' }}>
                      {sym} {formatCurrency(totalInterest, currency)}
                    </strong>{' '}
                    in interest—that is <strong>{interestRatio}% extra</strong> on top of what you borrow!
                  </p>
                ) : (
                  <p style={{ margin: '0 0 8px 0' }}>
                    <strong>Great choice on tenure:</strong> Your total interest is only <strong>{interestRatio}%</strong> of your loan amount, meaning most of your monthly payment directly builds your ownership!
                  </p>
                )}

                {totalInterest > 100000 && (
                  <p style={{ margin: 0, color: 'var(--text-primary)' }}>
                    ✨ <em>Friendly tip:</em> Adding just{' '}
                    <strong style={{ color: 'var(--total-color)' }}>
                      {sym} {formatCurrency(extraTipAmount, currency)}/month
                    </strong>{' '}
                    as a voluntary prepayment could save you up to{' '}
                    <strong>{sym} {formatCurrency(estimatedSavings, currency)}</strong> in interest and shave months off your debt!
                  </p>
                )}
              </div>

              {/* Action Buttons for the User */}
              <div style={{ display: 'flex', gap: '10px', marginTop: '14px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => onNavigateTab && onNavigateTab('prepayment')}
                  className="btn-secondary"
                  style={{
                    padding: '6px 12px',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    borderColor: 'var(--primary)',
                    color: 'var(--primary)',
                  }}
                >
                  <Zap size={14} />
                  <span>Test Prepayment Savings</span>
                  <ArrowRight size={12} />
                </button>

                <button
                  type="button"
                  onClick={() => onNavigateTab && onNavigateTab('compare')}
                  className="btn-secondary"
                  style={{
                    padding: '6px 12px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <GitCompare size={14} />
                  <span>Compare with Another Bank</span>
                </button>
              </div>
            </div>
          )}

          {/* Privacy & Human Trust Reassurance */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            marginTop: '12px',
            paddingTop: '10px',
            borderTop: '1px solid var(--border-color)',
            fontSize: '0.75rem',
            color: 'var(--text-muted)',
          }}>
            <ShieldCheck size={14} color="#10b981" />
            <span>
              <strong>100% Private & Peaceful:</strong> We do not ask for your phone number, email, or bank credentials. No telecallers or spam.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
