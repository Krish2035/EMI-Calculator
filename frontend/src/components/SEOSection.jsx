import React, { useState } from 'react';
import { 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  ShieldCheck, 
  Zap, 
  TrendingDown, 
  Calculator, 
  Layers, 
  ExternalLink,
  BookOpen,
  CheckCircle2
} from 'lucide-react';

const FAQ_ITEMS = [
  {
    q: "What is EMI Calculator Vercel?",
    a: "EMI Calculator Vercel (hosted at emi-calculator-orcin.vercel.app) is a free, privacy-first loan calculation tool deployed on Vercel's global edge network. It allows users to calculate monthly loan installments (EMI), visualize interest-to-principal ratios, examine full monthly/yearly amortization schedules, and simulate prepayment savings."
  },
  {
    q: "How is loan EMI calculated?",
    a: "EMI is computed using the standard compound interest formula: EMI = [P x R x (1+R)^N] / [(1+R)^N - 1], where P is Principal loan amount, R is monthly interest rate (annual interest rate / 12 / 100), and N is the loan tenure in total number of months."
  },
  {
    q: "How does prepaying a loan save interest on this Vercel calculator?",
    a: "When you make an extra monthly payment or a lump-sum prepayment, the money goes 100% towards reducing your outstanding principal balance. Because compound interest is calculated on the remaining balance, prepaying slashes the total interest payable and shortens your overall repayment tenure by months or years."
  },
  {
    q: "Which types of loans can I calculate on emi-calculator-orcin.vercel.app?",
    a: "You can calculate EMIs for Home Loans, Car/Auto Loans, Personal Loans, Education Loans, and Business Loans. The calculator supports multiple currencies (USD, INR, EUR, GBP, AED, CAD, and AUD) with real-time slider adjustments."
  },
  {
    q: "Is my personal financial data safe on this Vercel EMI calculator?",
    a: "Yes, 100%. SmartEMI operates with a privacy-first architecture. All loan mathematical calculations run directly in your browser (client-side). No sensitive financial details are saved or sold to third-party lenders or advertising platforms."
  },
  {
    q: "Can I install EMI Calculator Vercel on my smartphone or desktop?",
    a: "Yes. The application is a Progressive Web App (PWA). You can click 'Install App' in your browser or select 'Add to Home Screen' on Android or iOS to use the calculator offline anytime without internet access."
  }
];

export default function SEOSection() {
  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = (index) => {
    setOpenFaq(prev => prev === index ? null : index);
  };

  return (
    <section 
      aria-label="EMI Calculator Vercel Guide and Documentation" 
      style={{
        marginTop: '36px',
        marginBottom: '40px',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
      }}
    >
      {/* Overview & Feature Highlights */}
      <div 
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: '16px',
          padding: 'clamp(20px, 3vw, 32px)',
          backdropFilter: 'blur(12px)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
          <span 
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'rgba(99, 102, 241, 0.15)',
              color: 'var(--primary)',
            }}
          >
            <BookOpen size={18} />
          </span>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            Comprehensive Guide
          </span>
        </div>

        <h2 style={{ fontSize: 'clamp(1.3rem, 2.5vw, 1.75rem)', fontWeight: 800, marginBottom: '12px', color: 'var(--text-primary)' }}>
          About EMI Calculator Vercel (SmartEMI)
        </h2>

        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '0.98rem', marginBottom: '20px' }}>
          <strong>EMI Calculator Vercel</strong> (<a href="https://emi-calculator-orcin.vercel.app/" style={{ color: 'var(--primary)', textDecoration: 'underline' }}>emi-calculator-orcin.vercel.app</a>) is an advanced online loan planning companion hosted on Vercel's edge network. Whether you are planning a <strong>Home Loan</strong>, purchasing a new <strong>Car</strong>, consolidating debt with a <strong>Personal Loan</strong>, or investing in higher studies with an <strong>Education Loan</strong>, our tool delivers real-time calculation accuracy, interactive visualizations, and actionable debt-payoff strategies.
        </p>

        {/* Feature Grid */}
        <div 
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '16px',
            marginTop: '16px',
          }}
        >
          <div style={{ background: 'var(--bg-input)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: 'var(--primary)' }}>
              <Zap size={18} />
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>Edge Speed on Vercel</h3>
            </div>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Powered by Vercel global edge caching for zero-latency slider interactions, instant updates, and 100% reliable uptime.
            </p>
          </div>

          <div style={{ background: 'var(--bg-input)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: 'var(--savings-color)' }}>
              <TrendingDown size={18} />
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>Prepayment Savings Engine</h3>
            </div>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Simulate recurring monthly extra payments or lump-sum principal paydowns to see how much interest and tenure you save.
            </p>
          </div>

          <div style={{ background: 'var(--bg-input)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: 'var(--secondary-accent)' }}>
              <Layers size={18} />
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>Full Amortization Schedule</h3>
            </div>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Access transparent year-by-year and month-by-month repayment breakdowns detailing exact principal and interest split.
            </p>
          </div>

          <div style={{ background: 'var(--bg-input)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: '#10b981' }}>
              <ShieldCheck size={18} />
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>100% Client-Side Privacy</h3>
            </div>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Your financial calculations stay entirely inside your browser. No spam, no lender calls, and full offline PWA support.
            </p>
          </div>
        </div>
      </div>

      {/* How EMI is Calculated Section */}
      <div 
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: '16px',
          padding: 'clamp(20px, 3vw, 32px)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
          <span 
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'rgba(16, 185, 129, 0.15)',
              color: 'var(--savings-color)',
            }}
          >
            <Calculator size={18} />
          </span>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--savings-color)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            Mathematical Formula
          </span>
        </div>

        <h2 style={{ fontSize: 'clamp(1.2rem, 2vw, 1.5rem)', fontWeight: 800, marginBottom: '12px', color: 'var(--text-primary)' }}>
          How is EMI Calculated on SmartEMI Vercel?
        </h2>

        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '0.95rem', marginBottom: '16px' }}>
          The standard mathematical formula used across leading international banks and lenders to calculate Equated Monthly Installment (EMI) is:
        </p>

        <div 
          style={{
            background: 'var(--bg-input)',
            padding: '16px 20px',
            borderRadius: '12px',
            border: '1px solid var(--border-color)',
            fontFamily: 'monospace',
            fontSize: 'clamp(0.95rem, 2vw, 1.15rem)',
            color: 'var(--primary)',
            fontWeight: 700,
            overflowX: 'auto',
            marginBottom: '16px',
            textAlign: 'center',
          }}
        >
          EMI = [P &times; R &times; (1 + R)^N] / [(1 + R)^N - 1]
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
            <CheckCircle2 size={18} color="var(--primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              <strong style={{ color: 'var(--text-primary)' }}>P (Principal Amount):</strong> Total borrowed loan amount before interest.
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
            <CheckCircle2 size={18} color="var(--primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              <strong style={{ color: 'var(--text-primary)' }}>R (Monthly Rate):</strong> Annual Interest Rate divided by 12 and then by 100.
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
            <CheckCircle2 size={18} color="var(--primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              <strong style={{ color: 'var(--text-primary)' }}>N (Tenure Months):</strong> Total repayment period expressed in months (Years &times; 12).
            </div>
          </div>
        </div>
      </div>

      {/* Frequently Asked Questions (FAQ) with Accordion */}
      <div 
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: '16px',
          padding: 'clamp(20px, 3vw, 32px)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
          <span 
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'rgba(6, 182, 212, 0.15)',
              color: 'var(--secondary-accent)',
            }}
          >
            <HelpCircle size={18} />
          </span>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--secondary-accent)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            Frequently Asked Questions
          </span>
        </div>

        <h2 style={{ fontSize: 'clamp(1.2rem, 2vw, 1.5rem)', fontWeight: 800, marginBottom: '16px', color: 'var(--text-primary)' }}>
          Frequently Asked Questions About EMI Calculator Vercel
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {FAQ_ITEMS.map((item, index) => {
            const isOpen = openFaq === index;
            return (
              <div 
                key={index}
                style={{
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  transition: 'border-color 0.2s',
                }}
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(index)}
                  style={{
                    width: '100%',
                    padding: '16px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-primary)',
                    fontSize: '0.98rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    textAlign: 'left',
                    gap: '12px',
                  }}
                  aria-expanded={isOpen}
                >
                  <span>{item.q}</span>
                  {isOpen ? <ChevronUp size={18} color="var(--primary)" /> : <ChevronDown size={18} color="var(--text-muted)" />}
                </button>
                {isOpen && (
                  <div 
                    style={{
                      padding: '0 20px 16px',
                      color: 'var(--text-secondary)',
                      fontSize: '0.92rem',
                      lineHeight: 1.6,
                      borderTop: '1px solid var(--border-color)',
                      paddingTop: '12px',
                    }}
                  >
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

