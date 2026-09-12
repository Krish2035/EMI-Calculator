import React from 'react';
import {
  Calculator,
  Moon,
  Sun,
  Database,
  BookmarkCheck,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Download,
  WifiOff,
} from 'lucide-react';
import { CURRENCIES } from '../utils/formatters';

export default function Navbar({
  currency,
  setCurrency,
  theme,
  toggleTheme,
  fontSize,
  toggleFontSize,
  dbStatus,
  onOpenHistory,
  savedCount,
  onRefreshStatus,
  isInstallable,
  onInstall,
  isOnline = true,
}) {
  return (
    <header style={{
      borderBottom: '1px solid var(--border-color)',
      background: 'var(--bg-card)',
      backdropFilter: 'blur(16px)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '14px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
      }}>
        {/* Logo & Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            background: 'var(--primary-gradient)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            boxShadow: '0 0 15px var(--primary-glow)',
          }}>
            <Calculator size={22} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em', background: 'var(--primary-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                SmartEMI
              </span>
              <span className="badge badge-info" style={{ fontSize: '0.65rem' }}>Friendly Companion</span>
            </div>
            <p className="hide-on-mobile" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Your Friendly Loan Planning Companion</p>
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {/* Database Connection Pill */}
          <div
            onClick={onRefreshStatus}
            title={
              dbStatus.connected
                ? `PostgreSQL Connected: ${dbStatus.config?.database || 'emi_calculator'} on port ${dbStatus.config?.port || 5432} (Click to refresh)`
                : `Storage: ${dbStatus.mode} (Click to re-check PostgreSQL connection)`
            }
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 10px',
              borderRadius: '9999px',
              background: dbStatus.connected ? 'rgba(16, 185, 129, 0.12)' : 'rgba(245, 158, 11, 0.12)',
              border: `1px solid ${dbStatus.connected ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
              color: dbStatus.connected ? '#10b981' : '#f59e0b',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer',
              userSelect: 'none',
              transition: 'all 0.2s',
            }}
          >
            <Database size={13} />
            <span className="hide-on-mobile">{dbStatus.connected ? 'PostgreSQL Active' : 'Session Store'}</span>
            <span className="show-on-mobile">{dbStatus.connected ? 'PG' : 'Store'}</span>
            <span style={{
              width: '7px',
              height: '7px',
              borderRadius: '50%',
              backgroundColor: dbStatus.connected ? '#10b981' : '#f59e0b',
              display: 'inline-block',
            }} />
          </div>

          {/* Currency Switcher */}
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="input-box"
            style={{ padding: '6px 10px', fontSize: '0.8rem', cursor: 'pointer' }}
          >
            {Object.values(CURRENCIES).map((c) => (
              <option key={c.code} value={c.code}>
                {c.label}
              </option>
            ))}
          </select>

          {/* Saved History Trigger */}
          <button
            onClick={onOpenHistory}
            className="btn-secondary"
            style={{ padding: '6px 10px', fontSize: '0.8rem' }}
          >
            <BookmarkCheck size={16} />
            <span className="hide-on-mobile">Saved Loans</span>
            <span className="show-on-mobile">Saved</span>
            {savedCount > 0 && (
              <span style={{
                background: 'var(--primary)',
                color: '#fff',
                fontSize: '0.7rem',
                borderRadius: '9999px',
                padding: '1px 6px',
                fontWeight: 700,
              }}>
                {savedCount}
              </span>
            )}
          </button>

          {/* Font Size Toggle for Accessibility (Older & Younger generation friendly) */}
          <button
            onClick={toggleFontSize}
            className="btn-secondary"
            style={{
              padding: '6px 10px',
              fontSize: '0.85rem',
              fontWeight: 700,
              background: fontSize === 'large' ? 'var(--primary-glow)' : 'transparent',
              borderColor: fontSize === 'large' ? 'var(--primary)' : 'var(--border-color)',
            }}
            title={fontSize === 'large' ? 'Text Size: Large (Click for Normal)' : 'Text Size: Normal (Click for Large)'}
          >
            <span style={{ fontSize: fontSize === 'large' ? '1rem' : '0.85rem' }}>Aa</span>
            <span className="hide-on-mobile" style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{fontSize === 'large' ? 'Large' : 'Normal'}</span>
          </button>

          {/* Dark / Light Toggle */}
          <button
            onClick={toggleTheme}
            className="btn-secondary"
            aria-label="Toggle Theme"
            title={theme === 'dark' ? 'Switch to Clean Light Theme' : 'Switch to Dark Theme'}
            style={{ padding: '8px', borderRadius: '10px' }}
          >
            {theme === 'dark' ? <Sun size={17} color="#fbbf24" /> : <Moon size={17} color="#6366f1" />}
          </button>

          {/* Offline Mode Indicator */}
          {!isOnline && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '5px 10px',
                borderRadius: '9999px',
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.35)',
                color: '#f87171',
                fontSize: '0.75rem',
                fontWeight: 700,
              }}
              title="Working offline. All calculations and schedules run locally on your device."
            >
              <WifiOff size={13} />
              <span>Offline Mode ⚡</span>
            </div>
          )}

          {/* PWA Install Button */}
          {isInstallable && (
            <button
              onClick={onInstall}
              className="btn-primary"
              style={{
                padding: '6px 12px',
                fontSize: '0.8rem',
                fontWeight: 700,
                borderRadius: '9999px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                animation: 'pulseGlow 2.5s infinite',
              }}
              title="Install SmartEMI on your device for fast offline access"
            >
              <Download size={14} />
              <span>Install App</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
