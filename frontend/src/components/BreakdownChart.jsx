import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { PieChart, PieChart as PieIcon } from 'lucide-react';
import { CURRENCIES, formatCurrency } from '../utils/formatters';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function BreakdownChart({ principal, totalInterest, currency, theme }) {
  const currentCurrency = CURRENCIES[currency] || CURRENCIES.INR;
  const sym = currentCurrency.symbol;

  const total = principal + totalInterest;
  const principalPercent = total > 0 ? ((principal / total) * 100).toFixed(1) : 0;
  const interestPercent = total > 0 ? ((totalInterest / total) * 100).toFixed(1) : 0;

  const isZero = total <= 0;
  const isLight = theme === 'light';

  // Crisp, high-visibility placeholder circle colors when 0
  const zeroBg = isLight ? '#e2e8f0' : 'rgba(255, 255, 255, 0.12)';
  const zeroBorder = isLight ? '#94a3b8' : 'rgba(255, 255, 255, 0.3)';

  const data = {
    labels: isZero ? ['No Loan Data'] : ['Principal Loan Amount', 'Total Interest'],
    datasets: [
      {
        data: isZero ? [1] : [principal, totalInterest],
        backgroundColor: isZero ? [zeroBg] : ['#3b82f6', '#f43f5e'],
        borderColor: isZero ? [zeroBorder] : ['rgba(59, 130, 246, 0.2)', 'rgba(244, 63, 94, 0.2)'],
        borderWidth: 2,
        hoverOffset: isZero ? 0 : 8,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '72%',
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: !isZero,
        backgroundColor: '#111827',
        titleFont: { family: 'Calibri, Candara, Segoe UI, sans-serif', size: 14, weight: 'bold' },
        bodyFont: { family: 'Calibri, Candara, Segoe UI, sans-serif', size: 13 },
        padding: 12,
        cornerRadius: 8,
        callbacks: {
          label: function (context) {
            if (isZero) return ' Enter loan amount to calculate';
            const val = context.raw || 0;
            const pct = total > 0 ? ((val / total) * 100).toFixed(1) : 0;
            return ` ${context.label}: ${sym} ${formatCurrency(val, currency)} (${pct}%)`;
          },
        },
      },
    },
  };

  return (
    <div className="glass-card" style={{
      padding: '24px',
      display: 'flex',
      flexDirection: 'column',
      position: 'sticky',
      top: '90px',
      gap: '16px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <PieIcon size={20} color="var(--primary)" />
          <h2 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Repayment Breakdown</h2>
        </div>
        {!isZero && (
          <span className="badge badge-info" style={{ fontSize: '0.72rem', fontWeight: 700 }}>
            {principalPercent}% Principal / {interestPercent}% Interest
          </span>
        )}
      </div>

      {/* Doughnut Chart Container */}
      <div style={{ position: 'relative', height: '210px', width: '210px', maxWidth: '100%', margin: '0 auto' }}>
        <Doughnut data={data} options={options} />
        {/* Center Text */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          pointerEvents: 'none',
        }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, display: 'block', letterSpacing: '0.05em' }}>
            PRINCIPAL
          </span>
          <span style={{ fontSize: '1.45rem', fontWeight: 800, color: isZero ? 'var(--text-muted)' : '#3b82f6', fontFamily: 'var(--font-mono)' }}>
            {isZero ? '0%' : `${principalPercent}%`}
          </span>
        </div>
      </div>

      {/* Dual Ratio Bar */}
      {!isZero && (
        <div style={{ width: '100%' }}>
          <div style={{
            height: '8px',
            borderRadius: '4px',
            overflow: 'hidden',
            display: 'flex',
            background: 'var(--bg-input)',
          }}>
            <div style={{ width: `${principalPercent}%`, background: '#3b82f6', transition: 'width 0.3s ease' }} title={`Principal: ${principalPercent}%`} />
            <div style={{ width: `${interestPercent}%`, background: '#f43f5e', transition: 'width 0.3s ease' }} title={`Interest: ${interestPercent}%`} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            <span style={{ color: '#3b82f6', fontWeight: 700 }}>● Principal ({principalPercent}%)</span>
            <span style={{ color: '#f43f5e', fontWeight: 700 }}>● Bank Interest ({interestPercent}%)</span>
          </div>
        </div>
      )}

      {/* Legend & Breakdown Items */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {/* Principal Item */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '10px 14px',
          background: 'var(--bg-input)',
          borderRadius: '12px',
          borderLeft: '4px solid #3b82f6',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#3b82f6' }}></span>
              <span style={{ fontSize: '0.9rem', fontWeight: 700 }}>Loan You Borrowed</span>
            </div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginLeft: '16px' }}>Principal amount</span>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.98rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
              {sym} {formatCurrency(principal, currency)}
            </span>
            <span style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, color: '#3b82f6' }}>
              {principalPercent}% of total
            </span>
          </div>
        </div>

        {/* Interest Item */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '10px 14px',
          background: 'var(--bg-input)',
          borderRadius: '12px',
          borderLeft: '4px solid #f43f5e',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#f43f5e' }}></span>
              <span style={{ fontSize: '0.9rem', fontWeight: 700 }}>Extra Bank Interest</span>
            </div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginLeft: '16px' }}>Extra cost to lender</span>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.98rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#f43f5e' }}>
              {sym} {formatCurrency(totalInterest, currency)}
            </span>
            <span style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, color: '#f43f5e' }}>
              {interestPercent}% of total
            </span>
          </div>
        </div>

        {/* Humanized cost multiplier & helpful tip */}
        <div style={{
          background: 'rgba(99, 102, 241, 0.08)',
          border: '1px solid rgba(99, 102, 241, 0.2)',
          borderRadius: '10px',
          padding: '10px 12px',
          fontSize: '0.78rem',
          color: 'var(--text-secondary)',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '8px',
          lineHeight: 1.45,
        }}>
          <span style={{ fontSize: '1rem', marginTop: '-2px' }}>💡</span>
          <div>
            {!isZero && principal > 0 ? (
              <span>
                For every <strong>{sym} 1.00</strong> borrowed, you repay{' '}
                <strong style={{ color: totalInterest > 0 ? '#f43f5e' : 'var(--text-primary)' }}>
                  {sym} {(total / principal).toFixed(2)}
                </strong>{' '}
                in total. Shortening the tenure saves you direct interest!
              </span>
            ) : (
              <span>
                Choose a life goal on the left or type your loan amount to see your complete principal vs interest breakdown here.
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
