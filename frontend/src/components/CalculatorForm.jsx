import React from 'react';
import {
  Home,
  Car,
  User,
  GraduationCap,
  RotateCcw,
  Save,
  Plus,
  Minus,
  SlidersHorizontal,
  HelpCircle,
} from 'lucide-react';
import { CURRENCIES, formatWords, formatCurrency } from '../utils/formatters';

const PRESETS = [
  { id: 'home', label: 'My Sweet Home 🏡', sub: 'Flat / Family House', icon: Home, amount: 4000000, rate: 8.5, tenureYears: 20 },
  { id: 'car', label: 'Getting My Car 🚗', sub: 'Commute / Roadtrips', icon: Car, amount: 1000000, rate: 9.2, tenureYears: 5 },
  { id: 'education', label: 'College & Studies 🎓', sub: 'Future Career / Degree', icon: GraduationCap, amount: 1500000, rate: 9.8, tenureYears: 7 },
  { id: 'personal', label: 'Family Needs ✨', sub: 'Renovation or Buffer', icon: User, amount: 500000, rate: 12.5, tenureYears: 3 },
];

export default function CalculatorForm({
  loanAmount,
  setLoanAmount,
  interestRate,
  setInterestRate,
  tenureYears,
  setTenureYears,
  tenureType,
  setTenureType,
  activeLoanType,
  setActiveLoanType,
  currency,
  onSaveLoan,
  onReset,
}) {
  const currentCurrency = CURRENCIES[currency] || CURRENCIES.INR;

  const handlePresetSelect = (preset) => {
    setActiveLoanType(preset.id);
    setLoanAmount(preset.amount);
    setInterestRate(preset.rate);
    setTenureType('years');
    setTenureYears(preset.tenureYears);
  };

  const handleAmountStep = (delta) => {
    setLoanAmount((prev) => Math.max(0, Number(prev) + delta));
    setActiveLoanType('custom');
  };

  const handleRateStep = (delta) => {
    setInterestRate((prev) => {
      const updated = Math.round((Number(prev) + delta) * 100) / 100;
      return Math.min(30, Math.max(0, updated));
    });
    setActiveLoanType('custom');
  };

  const handleTenureStep = (delta) => {
    setTenureYears((prev) => {
      const maxTenure = tenureType === 'years' ? 35 : 420;
      return Math.min(maxTenure, Math.max(0, Number(prev) + delta));
    });
    setActiveLoanType('custom');
  };

  // Dynamic slider track fill percentages (0% to 100%)
  const amountMax = 20000000;
  const amountPct = Math.min(100, Math.max(0, (loanAmount / amountMax) * 100));

  const rateMax = 24;
  const ratePct = Math.min(100, Math.max(0, (interestRate / rateMax) * 100));

  const maxTenure = tenureType === 'years' ? 30 : 360;
  const tenurePct = Math.min(100, Math.max(0, (tenureYears / maxTenure) * 100));

  return (
    <div className="glass-card" style={{ padding: '24px' }}>
      {/* Header */}
      <div className="form-header-row">
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <SlidersHorizontal size={22} color="var(--primary)" />
            <span>Enter Loan Details</span>
          </h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            Adjust the values using sliders, plus/minus buttons, or type numbers directly.
          </p>
        </div>
        <button
          onClick={onReset}
          className="btn-secondary"
          style={{ padding: '8px 14px', fontSize: '0.85rem', fontWeight: 600, flexShrink: 0 }}
          title="Reset all values to 0"
        >
          <RotateCcw size={15} />
          <span>Reset to 0</span>
        </button>
      </div>

      {/* Quick Loan Presets */}
      <div style={{ marginBottom: '26px' }}>
        <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '8px', display: 'block' }}>
          Choose a Life Goal (Optional 1-click fill)
        </label>
        <div className="life-goal-grid">
          {PRESETS.map((preset) => {
            const Icon = preset.icon;
            const isSelected = activeLoanType === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => handlePresetSelect(preset)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '12px 10px',
                  borderRadius: '12px',
                  border: `2px solid ${isSelected ? 'var(--primary)' : 'var(--border-color)'}`,
                  background: isSelected ? 'var(--primary-glow)' : 'var(--bg-input)',
                  color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  textAlign: 'center',
                }}
              >
                <Icon size={22} color={isSelected ? 'var(--primary)' : 'var(--text-muted)'} />
                <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{preset.label}</span>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{preset.sub}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* STEP 1: Loan Amount */}
      <div className="step-card">
        <div className="step-header-row">
          <div className="step-title-group">
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span className="step-badge">1</span>
              <label style={{ fontSize: '1rem', fontWeight: 800 }}>Loan Amount</label>
            </div>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginTop: '2px' }}>
              How much money do you want to borrow?
            </span>
          </div>

          <div className="step-input-group">
            <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-muted)' }}>{currentCurrency.symbol}</span>
            <input
              type="number"
              value={loanAmount}
              onChange={(e) => {
                const val = Number(e.target.value);
                setLoanAmount(val >= 0 ? val : 0);
                setActiveLoanType('custom');
              }}
              className="input-box step-amount-input"
              min={0}
              max={100000000}
            />
          </div>
        </div>

        {/* Amount in words representation for clarity */}
        {formatWords(loanAmount, currency) && (
          <div style={{ marginBottom: '10px', fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 700 }}>
            In words: {formatWords(loanAmount, currency)}
          </div>
        )}

        {/* Stepper Buttons and Slider */}
        <div className="stepper-row">
          <button
            type="button"
            onClick={() => handleAmountStep(-50000)}
            className="stepper-btn"
            title="Decrease by 50,000"
            aria-label="Decrease loan amount"
          >
            <Minus size={18} />
          </button>

          <input
            type="range"
            min={0}
            max={amountMax}
            step={25000}
            value={loanAmount}
            onChange={(e) => {
              setLoanAmount(Number(e.target.value));
              setActiveLoanType('custom');
            }}
            className="range-slider"
            style={{
              background: `linear-gradient(to right, var(--primary) 0%, var(--primary) ${amountPct}%, var(--slider-track-bg) ${amountPct}%, var(--slider-track-bg) 100%)`,
            }}
          />

          <button
            type="button"
            onClick={() => handleAmountStep(50000)}
            className="stepper-btn"
            title="Increase by 50,000"
            aria-label="Increase loan amount"
          >
            <Plus size={18} />
          </button>
        </div>

        {/* Quick Amount Shortcuts */}
        <div className="shortcut-pills-row">
          {[
            { label: '+50k', val: 50000 },
            { label: '+1 Lakh', val: 100000 },
            { label: '+5 Lakh', val: 500000 },
            { label: '+10 Lakh', val: 1000000 },
            { label: '+25 Lakh', val: 2500000 },
          ].map((pill) => (
            <button
              key={pill.label}
              type="button"
              onClick={() => handleAmountStep(pill.val)}
              className="btn-secondary"
              style={{ borderRadius: '8px', fontWeight: 600 }}
            >
              <Plus size={13} />
              <span>{pill.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* STEP 2: Annual Interest Rate */}
      <div className="step-card">
        <div className="step-header-row">
          <div className="step-title-group">
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span className="step-badge">2</span>
              <label style={{ fontSize: '1rem', fontWeight: 800 }}>Interest Rate (% Per Year)</label>
            </div>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginTop: '2px' }}>
              The interest percentage charged by the lender
            </span>
          </div>

          <div className="step-input-group">
            <input
              type="number"
              step="0.05"
              min="0"
              max="30"
              value={interestRate}
              onChange={(e) => {
                setInterestRate(Number(e.target.value));
                setActiveLoanType('custom');
              }}
              className="input-box step-rate-input"
            />
            <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-muted)' }}>%</span>
          </div>
        </div>

        {/* Stepper Buttons and Slider */}
        <div className="stepper-row">
          <button
            type="button"
            onClick={() => handleRateStep(-0.25)}
            className="stepper-btn"
            title="Decrease by 0.25%"
            aria-label="Decrease interest rate"
          >
            <Minus size={18} />
          </button>

          <input
            type="range"
            min={0}
            max={rateMax}
            step={0.1}
            value={interestRate}
            onChange={(e) => {
              setInterestRate(Number(e.target.value));
              setActiveLoanType('custom');
            }}
            className="range-slider"
            style={{
              background: `linear-gradient(to right, var(--primary) 0%, var(--primary) ${ratePct}%, var(--slider-track-bg) ${ratePct}%, var(--slider-track-bg) 100%)`,
            }}
          />

          <button
            type="button"
            onClick={() => handleRateStep(0.25)}
            className="stepper-btn"
            title="Increase by 0.25%"
            aria-label="Increase interest rate"
          >
            <Plus size={18} />
          </button>
        </div>

        {/* Quick Rate Shortcuts */}
        <div className="shortcut-pills-row">
          {[
            { label: '8.5% (Home)', val: 8.5 },
            { label: '9.0% (Car)', val: 9.0 },
            { label: '10.5% (Edu)', val: 10.5 },
            { label: '12.5% (Personal)', val: 12.5 },
          ].map((chip) => (
            <button
              key={chip.label}
              type="button"
              onClick={() => {
                setInterestRate(chip.val);
                setActiveLoanType('custom');
              }}
              className="btn-secondary"
              style={{ borderRadius: '8px', fontWeight: 600 }}
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>

      {/* STEP 3: Loan Duration / Tenure */}
      <div className="step-card">
        <div className="step-header-row">
          <div className="step-title-group">
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span className="step-badge">3</span>
              <label style={{ fontSize: '1rem', fontWeight: 800 }}>Loan Duration (Tenure)</label>
            </div>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginTop: '2px' }}>
              How many years or months will you take to repay?
            </span>
          </div>

          <div className="step-input-group step-tenure-group">
            <input
              type="number"
              min="0"
              max={tenureType === 'years' ? 35 : 420}
              value={tenureYears}
              onChange={(e) => {
                setTenureYears(Number(e.target.value));
                setActiveLoanType('custom');
              }}
              className="input-box step-tenure-input"
            />

            {/* Years / Months Switcher */}
            <div className="tenure-unit-toggle">
              <button
                type="button"
                onClick={() => {
                  if (tenureType !== 'years') {
                    setTenureYears(Math.max(0, Math.round(tenureYears / 12)));
                    setTenureType('years');
                  }
                }}
                style={{
                  border: 'none',
                  background: tenureType === 'years' ? 'var(--primary)' : 'transparent',
                  color: tenureType === 'years' ? '#fff' : 'var(--text-muted)',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  padding: '6px 12px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                }}
              >
                Years
              </button>
              <button
                type="button"
                onClick={() => {
                  if (tenureType !== 'months') {
                    setTenureYears(tenureYears * 12);
                    setTenureType('months');
                  }
                }}
                style={{
                  border: 'none',
                  background: tenureType === 'months' ? 'var(--primary)' : 'transparent',
                  color: tenureType === 'months' ? '#fff' : 'var(--text-muted)',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  padding: '6px 12px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                }}
              >
                Months
              </button>
            </div>
          </div>
        </div>

        {/* Stepper Buttons and Slider */}
        <div className="stepper-row">
          <button
            type="button"
            onClick={() => handleTenureStep(-1)}
            className="stepper-btn"
            title="Decrease duration by 1"
            aria-label="Decrease loan duration"
          >
            <Minus size={18} />
          </button>

          <input
            type="range"
            min={0}
            max={maxTenure}
            step={1}
            value={tenureYears}
            onChange={(e) => {
              setTenureYears(Number(e.target.value));
              setActiveLoanType('custom');
            }}
            className="range-slider"
            style={{
              background: `linear-gradient(to right, var(--primary) 0%, var(--primary) ${tenurePct}%, var(--slider-track-bg) ${tenurePct}%, var(--slider-track-bg) 100%)`,
            }}
          />

          <button
            type="button"
            onClick={() => handleTenureStep(1)}
            className="stepper-btn"
            title="Increase duration by 1"
            aria-label="Increase loan duration"
          >
            <Plus size={18} />
          </button>
        </div>

        {/* Quick Tenure Shortcuts */}
        <div className="shortcut-pills-row">
          {[
            { label: '3 Yrs', years: 3 },
            { label: '5 Yrs', years: 5 },
            { label: '10 Yrs', years: 10 },
            { label: '15 Yrs', years: 15 },
            { label: '20 Yrs', years: 20 },
            { label: '25 Yrs', years: 25 },
          ].map((t) => (
            <button
              key={t.label}
              type="button"
              onClick={() => {
                setTenureType('years');
                setTenureYears(t.years);
                setActiveLoanType('custom');
              }}
              className="btn-secondary"
              style={{ borderRadius: '8px', fontWeight: 600 }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Save Loan Calculation Action */}
      <button
        type="button"
        onClick={onSaveLoan}
        className="btn-primary"
        style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: '1rem', fontWeight: 700 }}
      >
        <Save size={20} />
        <span>Save Calculation to Database</span>
      </button>
    </div>
  );
}
