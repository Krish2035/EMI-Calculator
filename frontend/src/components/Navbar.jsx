import React from 'react';
import {
  Calculator,
  Moon,
  Sun,
  Database,
  BookmarkCheck,
  Download,
  WifiOff,
  LogOut,
  User,
  LogIn,
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
  currentUser,
  onLogout,
  onOpenAuth,
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
              <span className="badge badge-info" style={{ fontSize: '0.65rem' }}>Enterprise Suite</span>
            </div>
            <p className="hide-on-mobile" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Top 1% Tier Financial Planning Architecture
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {/* Database Connection Pill */}
          <div
            onClick={onRefreshStatus}
            title={
              dbStatus.connected
                ? `PostgreSQL & Drizzle ORM Connected: ${dbStatus.config?.database || 'emi_calculator'} (Click to refresh)`
                : `Storage: ${dbStatus.mode} (Click to re-check)`
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
            <span className="hide-on-mobile">{dbStatus.connected ? 'Drizzle & Replicas' : 'Session Store'}</span>
            <span className="show-on-mobile">{dbStatus.connected ? 'ORM' : 'Store'}</span>
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

          {/* Font Size Toggle */}
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
            title={fontSize === 'large' ? 'Text Size: Large' : 'Text Size: Normal'}
          >
            <span style={{ fontSize: fontSize === 'large' ? '1rem' : '0.85rem' }}>Aa</span>
          </button>

          {/* Dark / Light Toggle */}
          <button
            onClick={toggleTheme}
            className="btn-secondary"
            aria-label="Toggle Theme"
            style={{ padding: '8px', borderRadius: '10px' }}
          >
            {theme === 'dark' ? <Sun size={17} color="#fbbf24" /> : <Moon size={17} color="#6366f1" />}
          </button>

          {/* User Profile / Logout or Sign In */}
          {currentUser ? (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '4px 8px 4px 4px',
              borderRadius: '9999px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--border-color)',
            }}>
              {currentUser.avatarUrl ? (
                <img
                  src={currentUser.avatarUrl}
                  alt={currentUser.name}
                  style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }}
                />
              ) : (
                <div style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                }}>
                  {(currentUser.name || currentUser.email || 'U')[0].toUpperCase()}
                </div>
              )}
              <span className="hide-on-mobile" style={{
                fontSize: '0.8rem',
                fontWeight: 600,
                maxWidth: '120px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}>
                {currentUser.name || currentUser.email}
              </span>
              <button
                onClick={onLogout}
                title="Log Out"
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#ef4444',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="btn-primary"
              style={{
                padding: '6px 12px',
                fontSize: '0.8rem',
                fontWeight: 600,
                borderRadius: '9999px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <LogIn size={14} />
              <span>Sign In</span>
            </button>
          )}

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
            >
              <WifiOff size={13} />
              <span>Offline</span>
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
              }}
            >
              <Download size={14} />
              <span>Install</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
