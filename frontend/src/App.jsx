import React, { useState, useEffect, useMemo } from 'react';
import Navbar from './components/Navbar';
import CalculatorForm from './components/CalculatorForm';
import SummaryCards from './components/SummaryCards';
import BreakdownChart from './components/BreakdownChart';
import AmortizationSchedule from './components/AmortizationSchedule';
import PrepaymentSimulator from './components/PrepaymentSimulator';
import LoanComparator from './components/LoanComparator';
import SavedCalculations from './components/SavedCalculations';
import SaveModal from './components/SaveModal';
import AffordabilityMeter from './components/AffordabilityMeter';
import HumanAdvisorCard from './components/HumanAdvisorCard';
import { generateAmortization, calculateEMI } from './utils/calculator';
import { api } from './services/api';
import { usePWA } from './hooks/usePWA';
import { Table, Zap, GitCompare, Sparkles, Check, AlertCircle, Heart } from 'lucide-react';

export default function App() {
  // PWA & Network State
  const { isInstallable, isOnline, promptInstall } = usePWA();
  // Theme State
  const [theme, setTheme] = useState(() => localStorage.getItem('smart_emi_theme') || 'dark');

  // Font Size State for Accessibility (older & younger friendly)
  const [fontSize, setFontSize] = useState(() => localStorage.getItem('smart_emi_font_size') || 'normal');

  // Currency State
  const [currency, setCurrency] = useState(() => localStorage.getItem('smart_emi_currency') || 'INR');

  // Main Loan Inputs
  const [loanAmount, setLoanAmount] = useState(0);
  const [interestRate, setInterestRate] = useState(0);
  const [tenureYears, setTenureYears] = useState(0);
  const [tenureType, setTenureType] = useState('years'); // 'years' | 'months'
  const [activeLoanType, setActiveLoanType] = useState(null);

  // Prepayment Simulator Inputs
  const [extraMonthly, setExtraMonthly] = useState(0);
  const [lumpSumAmount, setLumpSumAmount] = useState(0);
  const [lumpSumMonth, setLumpSumMonth] = useState(12);

  // Active Bottom Tab
  const [activeTab, setActiveTab] = useState('amortization'); // 'amortization' | 'prepayment' | 'compare'

  // Saved Drawer & Save Modal
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [savedCalculations, setSavedCalculations] = useState([]);

  // Backend & Database Health
  const [dbStatus, setDbStatus] = useState({ connected: false, mode: 'checking...' });
  const [toast, setToast] = useState(null);

  // Synchronize theme attribute
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('smart_emi_theme', theme);
  }, [theme]);

  // Synchronize font size attribute
  useEffect(() => {
    document.documentElement.setAttribute('data-font-size', fontSize);
    localStorage.setItem('smart_emi_font_size', fontSize);
  }, [fontSize]);

  const toggleFontSize = () => {
    setFontSize((prev) => (prev === 'normal' ? 'large' : 'normal'));
  };

  // Persist currency
  useEffect(() => {
    localStorage.setItem('smart_emi_currency', currency);
  }, [currency]);

  // Dynamic friendly greeting
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  }, []);

  // Total tenure in months
  const totalMonths = tenureType === 'years' ? tenureYears * 12 : tenureYears;

  // Real-time calculation with Amortization & Prepayments
  const calculationResult = useMemo(() => {
    return generateAmortization(loanAmount, interestRate, totalMonths, {
      extraMonthly,
      lumpSumAmount,
      lumpSumMonth,
    });
  }, [loanAmount, interestRate, totalMonths, extraMonthly, lumpSumAmount, lumpSumMonth]);

  // Toast notification helper
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Fetch DB health & saved calculations
  const loadInitialData = async () => {
    try {
      const health = await api.checkHealth();
      if (health && health.database) {
        setDbStatus(health.database);
      }
      const history = await api.getCalculations();
      if (history && history.data) {
        setSavedCalculations(history.data);
      }
    } catch (err) {
      console.warn('Backend connection warning:', err.message);
    }
  };

  // Handle PWA App Shortcuts via URL parameters (e.g. /?tab=compare or /?tab=prepayment)
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab');
      if (tabParam && ['amortization', 'prepayment', 'compare'].includes(tabParam)) {
        setActiveTab(tabParam);
      }
    } catch (e) {
      console.warn('Could not read URL parameters', e);
    }
  }, []);

  // Offline status toast
  useEffect(() => {
    if (!isOnline) {
      showToast('You are currently offline. Full EMI calculations remain active!', 'warning');
    }
  }, [isOnline]);

  useEffect(() => {
    loadInitialData();
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Reset to default values (0)
  const handleReset = () => {
    setLoanAmount(0);
    setInterestRate(0);
    setTenureYears(0);
    setTenureType('years');
    setActiveLoanType(null);
    setExtraMonthly(0);
    setLumpSumAmount(0);
    setLumpSumMonth(12);
    showToast('Reset to 0', 'info');
  };

  // Confirm Save Loan to Database
  const handleConfirmSave = async ({ title, loanType, notes }) => {
    try {
      const payload = {
        title,
        loanType,
        principal: loanAmount,
        annualInterestRate: interestRate,
        tenureMonths: totalMonths,
        monthlyEMI: calculationResult.monthlyEMI,
        totalInterest: calculationResult.totalInterest,
        totalPayment: calculationResult.totalPayment,
        prepaymentMonthly: extraMonthly,
        prepaymentLumpSum: lumpSumAmount,
        notes,
      };

      const res = await api.saveCalculation(payload);
      if (res && res.data) {
        setSavedCalculations((prev) => [res.data, ...prev]);
        showToast(
          res.storage === 'postgresql'
            ? 'Loan successfully saved to PostgreSQL database!'
            : 'Loan saved to active session storage!'
        );
      }
    } catch (err) {
      showToast('Error saving: ' + err.message, 'error');
    }
  };

  // Delete saved calculation
  const handleDeleteCalculation = async (id) => {
    try {
      await api.deleteCalculation(id);
    } catch (err) {
      console.warn('Notice while deleting from backend:', err);
    } finally {
      setSavedCalculations((prev) => prev.filter((item) => String(item.id) !== String(id)));
      showToast('Calculation removed');
    }
  };

  // Load a saved record back into the calculator
  const handleLoadCalculation = (record) => {
    setLoanAmount(Number(record.principal));
    setInterestRate(Number(record.annual_interest_rate));
    const months = Number(record.tenure_months);
    if (months % 12 === 0) {
      setTenureYears(months / 12);
      setTenureType('years');
    } else {
      setTenureYears(months);
      setTenureType('months');
    }
    setActiveLoanType(record.loan_type || 'custom');
    if (record.prepayment_monthly) setExtraMonthly(Number(record.prepayment_monthly));
    if (record.prepayment_lumpsum) setLumpSumAmount(Number(record.prepayment_lumpsum));

    setIsHistoryOpen(false);
    showToast(`Loaded "${record.title}"`);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Toast Notification */}
      {toast && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 999,
          background:
            toast.type === 'error'
              ? '#ef4444'
              : toast.type === 'warning'
              ? '#f59e0b'
              : toast.type === 'info'
              ? '#3b82f6'
              : '#10b981',
          color: '#ffffff',
          padding: '12px 20px',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
          animation: 'fadeIn 0.3s ease',
          fontWeight: 600,
          fontSize: '0.875rem',
        }}>
          {toast.type === 'error' ? (
            <AlertCircle size={18} />
          ) : toast.type === 'warning' ? (
            <AlertCircle size={18} />
          ) : (
            <Check size={18} />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Top Navigation */}
      <Navbar
        currency={currency}
        setCurrency={setCurrency}
        theme={theme}
        toggleTheme={toggleTheme}
        fontSize={fontSize}
        toggleFontSize={toggleFontSize}
        dbStatus={dbStatus}
        onOpenHistory={() => setIsHistoryOpen(true)}
        savedCount={savedCalculations.length}
        onRefreshStatus={loadInitialData}
        isInstallable={isInstallable}
        onInstall={promptInstall}
        isOnline={isOnline}
      />

      {/* Main Container */}
      <main className="main-container">
        {/* Page Hero Header with Humanized Greeting */}
        <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '14px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span className="badge badge-info" style={{ fontSize: '0.75rem', fontWeight: 700 }}>
                {greeting}! 👋
              </span>
            </div>
            <h1 style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '6px' }}>
              Your Loan Planning Companion
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              Empathetic, clear loan calculations for everyone — students, home buyers, and seniors. Transparent numbers with zero hidden traps.
            </p>
          </div>

          {/* Quick Tab Switcher */}
          <div className="tab-switcher">
            <button
              onClick={() => setActiveTab('amortization')}
              className="tab-btn"
              style={{
                background: activeTab === 'amortization' ? 'var(--primary)' : 'transparent',
                color: activeTab === 'amortization' ? '#ffffff' : 'var(--text-secondary)',
              }}
            >
              <Table size={16} />
              <span>1. Repayment Schedule</span>
            </button>

            <button
              onClick={() => setActiveTab('prepayment')}
              className="tab-btn"
              style={{
                background: activeTab === 'prepayment' ? 'var(--primary)' : 'transparent',
                color: activeTab === 'prepayment' ? '#ffffff' : 'var(--text-secondary)',
              }}
            >
              <Zap size={16} />
              <span>2. Extra Payment Savings</span>
            </button>

            <button
              onClick={() => setActiveTab('compare')}
              className="tab-btn"
              style={{
                background: activeTab === 'compare' ? 'var(--primary)' : 'transparent',
                color: activeTab === 'compare' ? '#ffffff' : 'var(--text-secondary)',
              }}
            >
              <GitCompare size={16} />
              <span>3. Compare 2 Bank Offers</span>
            </button>
          </div>
        </div>

        {/* Top Summary Metrics */}
        <div style={{ marginBottom: '20px' }}>
          <SummaryCards
            monthlyEMI={calculationResult.monthlyEMI}
            totalInterest={calculationResult.totalInterest}
            totalPayment={calculationResult.totalPayment}
            principal={loanAmount}
            tenureMonths={totalMonths}
            currency={currency}
          />
        </div>

        {/* Smart Human Advisor Note */}
        <HumanAdvisorCard
          principal={loanAmount}
          interestRate={interestRate}
          tenureMonths={totalMonths}
          monthlyEMI={calculationResult.monthlyEMI}
          totalInterest={calculationResult.totalInterest}
          totalPayment={calculationResult.totalPayment}
          currency={currency}
          onNavigateTab={setActiveTab}
        />

        {/* Core Calculation Grid: Left Inputs + Right Chart */}
        <div className="calc-grid" style={{ marginBottom: '24px' }}>
          {/* Left Column: Sliders & Controls */}
          <CalculatorForm
            loanAmount={loanAmount}
            setLoanAmount={setLoanAmount}
            interestRate={interestRate}
            setInterestRate={setInterestRate}
            tenureYears={tenureYears}
            setTenureYears={setTenureYears}
            tenureType={tenureType}
            setTenureType={setTenureType}
            activeLoanType={activeLoanType}
            setActiveLoanType={setActiveLoanType}
            currency={currency}
            onSaveLoan={() => setIsSaveModalOpen(true)}
            onReset={handleReset}
          />

          {/* Right Column: Doughnut Chart Breakdown */}
          <BreakdownChart
            principal={loanAmount}
            totalInterest={calculationResult.totalInterest}
            currency={currency}
            theme={theme}
          />
        </div>

        {/* Can I Afford This? (Monthly Budget & Comfort Check) */}
        <AffordabilityMeter
          monthlyEMI={calculationResult.monthlyEMI}
          currency={currency}
        />

        {/* Bottom Section: Active Feature Tab */}
        <div style={{ marginBottom: '32px' }}>
          {activeTab === 'amortization' && (
            <AmortizationSchedule
              yearlySchedule={calculationResult.yearlySchedule}
              monthlySchedule={calculationResult.monthlySchedule}
              currency={currency}
              principal={loanAmount}
            />
          )}

          {activeTab === 'prepayment' && (
            <PrepaymentSimulator
              principal={loanAmount}
              interestRate={interestRate}
              tenureMonths={totalMonths}
              extraMonthly={extraMonthly}
              setExtraMonthly={setExtraMonthly}
              lumpSumAmount={lumpSumAmount}
              setLumpSumAmount={setLumpSumAmount}
              lumpSumMonth={lumpSumMonth}
              setLumpSumMonth={setLumpSumMonth}
              savingsData={calculationResult}
              currency={currency}
            />
          )}

          {activeTab === 'compare' && (
            <LoanComparator
              currentLoan={{
                principal: loanAmount,
                rate: interestRate,
                tenureYears: tenureType === 'years' ? tenureYears : Math.round(tenureYears / 12),
                tenureMonths: totalMonths,
              }}
              currency={currency}
            />
          )}
        </div>
      </main>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid var(--border-color)',
        padding: '20px',
        textAlign: 'center',
        color: 'var(--text-muted)',
        fontSize: '0.8rem',
        background: 'var(--bg-card)',
      }}>
        SmartEMI Calculator • Built with React, Vite, Node.js, Express & PostgreSQL
      </footer>

      {/* Modals & Drawers */}
      <SaveModal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        onConfirmSave={handleConfirmSave}
        loanData={{
          loanType: activeLoanType,
          principal: loanAmount,
          monthlyEMI: calculationResult.monthlyEMI,
        }}
        currency={currency}
        dbStatus={dbStatus}
      />

      <SavedCalculations
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        savedList={savedCalculations}
        onLoadCalculation={handleLoadCalculation}
        onDeleteCalculation={handleDeleteCalculation}
        currency={currency}
        dbStatus={dbStatus}
      />
    </div>
  );
}
