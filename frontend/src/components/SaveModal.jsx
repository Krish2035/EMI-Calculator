import React, { useState } from 'react';
import { X, Save, Database } from 'lucide-react';
import { CURRENCIES, formatCurrency } from '../utils/formatters';

export default function SaveModal({
  isOpen,
  onClose,
  onConfirmSave,
  loanData,
  currency,
  dbStatus,
}) {
  if (!isOpen) return null;

  const [title, setTitle] = useState(
    loanData.loanType ? `${loanData.loanType.charAt(0).toUpperCase() + loanData.loanType.slice(1)} Loan` : 'My Loan Calculation'
  );
  const [loanType, setLoanType] = useState(loanData.loanType || 'home');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const currentCurrency = CURRENCIES[currency] || CURRENCIES.INR;
  const sym = currentCurrency.symbol;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    await onConfirmSave({
      title,
      loanType,
      notes,
    });
    setSaving(false);
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.7)',
      backdropFilter: 'blur(6px)',
      zIndex: 250,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      animation: 'fadeIn 0.2s ease',
    }}>
      <div className="glass-card" style={{
        width: '100%',
        maxWidth: '460px',
        padding: '24px',
        background: 'var(--bg-secondary)',
        borderRadius: '16px',
        border: '1px solid var(--border-color)',
      }}>
        {/* Modal Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Database size={20} color="var(--primary)" />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Save Calculation</h3>
          </div>
          <button
            onClick={onClose}
            className="btn-secondary"
            style={{ padding: '6px', borderRadius: '8px' }}
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Title */}
          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
              Calculation Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Dream House SBI Quote"
              className="input-box"
              style={{ width: '100%' }}
            />
          </div>

          {/* Loan Category */}
          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
              Category
            </label>
            <select
              value={loanType}
              onChange={(e) => setLoanType(e.target.value)}
              className="input-box"
              style={{ width: '100%', cursor: 'pointer' }}
            >
              <option value="home">Home Loan</option>
              <option value="car">Car Loan</option>
              <option value="personal">Personal Loan</option>
              <option value="education">Education Loan</option>
              <option value="business">Business Loan</option>
              <option value="general">Other / General</option>
            </select>
          </div>

          {/* Snapshot Summary Box */}
          <div style={{
            background: 'var(--bg-input)',
            padding: '12px 16px',
            borderRadius: '10px',
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '8px',
            fontSize: '0.8rem',
          }}>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Loan Amount:</span>
              <div style={{ fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                {sym} {formatCurrency(loanData.principal, currency)}
              </div>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Monthly EMI:</span>
              <div style={{ fontWeight: 700, color: 'var(--primary)', fontFamily: 'var(--font-mono)' }}>
                {sym} {formatCurrency(loanData.monthlyEMI, currency)}
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
              Notes (Optional)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. 0.5% processing fee, valid until end of month"
              className="input-box"
              style={{ width: '100%', resize: 'none' }}
            />
          </div>

          {/* Destination Badge */}
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Destination: {dbStatus.connected ? 'PostgreSQL Table (calculations)' : 'Session Store'}
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              style={{ padding: '8px 16px' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="btn-primary"
              style={{ padding: '8px 20px' }}
            >
              <Save size={16} />
              <span>{saving ? 'Saving...' : 'Confirm & Save'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
