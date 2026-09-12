import React from 'react';
import {
  X,
  Trash2,
  Upload,
  Calendar,
  Layers,
  CheckCircle2,
  Database,
  FileText,
} from 'lucide-react';
import { CURRENCIES, formatCurrency } from '../utils/formatters';

export default function SavedCalculations({
  isOpen,
  onClose,
  savedList,
  onLoadCalculation,
  onDeleteCalculation,
  currency,
  dbStatus,
}) {
  if (!isOpen) return null;

  const currentCurrency = CURRENCIES[currency] || CURRENCIES.INR;
  const sym = currentCurrency.symbol;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.65)',
      backdropFilter: 'blur(6px)',
      zIndex: 200,
      display: 'flex',
      justifyContent: 'flex-end',
      animation: 'fadeIn 0.2s ease',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '480px',
        background: 'var(--bg-secondary)',
        borderLeft: '1px solid var(--border-color)',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: 'var(--shadow-lg)',
      }}>
        {/* Header */}
        <div style={{
          padding: '20px',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Database size={18} color="var(--primary)" />
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Saved Calculations</h3>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Storage: {dbStatus.connected ? 'PostgreSQL Database' : 'Session Memory Store'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="btn-secondary"
            style={{ padding: '6px', borderRadius: '8px' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* List Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {savedList.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '40px 20px',
              color: 'var(--text-muted)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '12px',
            }}>
              <FileText size={36} strokeWidth={1.5} />
              <p style={{ fontSize: '0.9rem' }}>No saved calculations yet.</p>
              <p style={{ fontSize: '0.8rem', maxWidth: '280px' }}>
                Click "Save Calculation to Database" on the main calculator to bookmark loan comparisons.
              </p>
            </div>
          ) : (
            savedList.map((item) => (
              <div
                key={item.id}
                className="glass-card"
                style={{
                  padding: '16px',
                  border: '1px solid var(--border-color)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>{item.title}</h4>
                    <span className="badge badge-info" style={{ textTransform: 'capitalize', marginTop: '4px' }}>
                      {item.loan_type || 'General'} Loan
                    </span>
                  </div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    {item.created_at ? new Date(item.created_at).toLocaleDateString() : ''}
                  </span>
                </div>

                {/* Metrics */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '8px',
                  background: 'var(--bg-input)',
                  padding: '10px',
                  borderRadius: '8px',
                  fontSize: '0.8rem',
                }}>
                  <div>
                    <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.72rem' }}>Principal</span>
                    <span style={{ fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                      {sym} {formatCurrency(item.principal, currency)}
                    </span>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.72rem' }}>Rate & Tenure</span>
                    <span style={{ fontWeight: 600 }}>
                      {item.annual_interest_rate}% | {Math.round(item.tenure_months / 12)} Yrs
                    </span>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.72rem' }}>Monthly EMI</span>
                    <span style={{ fontWeight: 700, color: 'var(--primary)', fontFamily: 'var(--font-mono)' }}>
                      {sym} {formatCurrency(item.monthly_emi, currency)}
                    </span>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.72rem' }}>Total Interest</span>
                    <span style={{ fontWeight: 700, color: '#f43f5e', fontFamily: 'var(--font-mono)' }}>
                      {sym} {formatCurrency(item.total_interest, currency)}
                    </span>
                  </div>
                </div>

                {item.notes && (
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                    "{item.notes}"
                  </p>
                )}

                {/* Action Buttons */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '4px' }}>
                  <button
                    onClick={() => onLoadCalculation(item)}
                    className="btn-secondary"
                    style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                  >
                    <Upload size={13} />
                    <span>Load to Calculator</span>
                  </button>
                  <button
                    onClick={() => onDeleteCalculation(item.id)}
                    className="btn-secondary"
                    style={{ padding: '6px 8px', fontSize: '0.75rem', color: '#f43f5e' }}
                    title="Delete record"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
