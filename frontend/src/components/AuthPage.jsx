import React, { useState, useRef } from 'react';
import { api } from '../services/api';
import { signInWithGoogle } from '../services/firebase';
import financialVideo from '../../resources/Financial_application.mp4';
import {
  Lock,
  Mail,
  User,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  PieChart,
  Zap,
  CheckCircle2,
  AlertCircle,
  Calculator,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Sun,
  Moon,
} from 'lucide-react';

export default function AuthPage({ onAuthSuccess, onContinueGuest, theme, toggleTheme }) {
  const [mode, setMode] = useState('signin'); // 'signin' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState(null);

  // Video playback & audio controls
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  // Real-time password strength calculation
  const getPasswordStrength = (pass) => {
    if (!pass) return { score: 0, label: '', color: 'transparent' };
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 10) score += 1;
    if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 2) return { score, label: 'Weak', color: '#ef4444', percent: '33%' };
    if (score <= 4) return { score, label: 'Good', color: '#f59e0b', percent: '66%' };
    return { score, label: 'Strong', color: '#10b981', percent: '100%' };
  };

  const strength = getPasswordStrength(password);

  // Handle Email & Password Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('Please fill in all required fields.');
      return;
    }

    if (mode === 'signup') {
      if (password.length < 6) {
        setError('Password must be at least 6 characters long.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
    }

    setLoading(true);
    try {
      let res;
      if (mode === 'signup') {
        res = await api.register(email, password, name || 'Smart User');
      } else {
        res = await api.login(email, password);
      }

      if (res && res.user) {
        onAuthSuccess(res.user);
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Firebase Google Sign-In
  const handleGoogleSignIn = async () => {
    setError(null);
    setGoogleLoading(true);
    try {
      const googleUser = await signInWithGoogle();
      const res = await api.googleAuth(googleUser);
      if (res && res.user) {
        onAuthSuccess(res.user);
      }
    } catch (err) {
      // User cancelled popup or config issue
      if (err.code !== 'auth/popup-closed-by-user') {
        setError(err.message || 'Failed to complete Google Sign-In.');
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="auth-container" style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '32px 20px',
      position: 'relative',
      overflow: 'hidden',
      background: 'var(--bg-main, #0b0f19)',
    }}>
      {/* Theme Toggle in Top Corner */}
      {toggleTheme && (
        <button
          type="button"
          onClick={toggleTheme}
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          style={{
            position: 'absolute',
            top: '20px',
            right: '24px',
            zIndex: 30,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 14px',
            borderRadius: '999px',
            background: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            color: 'var(--text-main, #f8fafc)',
            fontSize: '0.82rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)')}
        >
          {theme === 'dark' ? <Sun size={15} color="#f59e0b" /> : <Moon size={15} color="#6366f1" />}
          <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
        </button>
      )}

      {/* Dynamic Ambient Background Glows */}
      <div style={{
        position: 'absolute',
        top: '-15%',
        left: '-10%',
        width: '600px',
        height: '600px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(59, 130, 246, 0.22) 0%, rgba(0, 0, 0, 0) 70%)',
        filter: 'blur(70px)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute',
        bottom: '-15%',
        right: '-10%',
        width: '600px',
        height: '600px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(139, 92, 246, 0.20) 0%, rgba(0, 0, 0, 0) 70%)',
        filter: 'blur(70px)',
        pointerEvents: 'none',
      }} />

      {/* Split Responsive Presentation Wrapper */}
      <div className="auth-split-wrapper">
        {/* LEFT COLUMN: Financial Application Video Showcase */}
        <div className="auth-video-container">
          {/* Glassmorphic Video Showcase Player Card */}
          <div className="auth-video-card">
            {/* Top Mac-style bar */}
            <div className="auth-video-topbar">
              <div className="auth-video-dots">
                <span className="auth-video-dot" style={{ background: '#ef4444' }} />
                <span className="auth-video-dot" style={{ background: '#f59e0b' }} />
                <span className="auth-video-dot" style={{ background: '#10b981' }} />
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.75rem',
                color: 'var(--text-muted, #94a3b8)',
                fontWeight: 600,
              }}>
                <Calculator size={13} color="#60a5fa" />
                <span>Financial_application.mp4</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {/* Media Play/Pause & Mute Buttons */}
                <button
                  type="button"
                  onClick={togglePlay}
                  className="auth-video-btn"
                  title={isPlaying ? 'Pause video' : 'Play video'}
                  aria-label={isPlaying ? 'Pause video' : 'Play video'}
                >
                  {isPlaying ? <Pause size={13} /> : <Play size={13} />}
                  <span>{isPlaying ? 'Pause' : 'Play'}</span>
                </button>
                <button
                  type="button"
                  onClick={toggleMute}
                  className="auth-video-btn"
                  title={isMuted ? 'Unmute video audio' : 'Mute video audio'}
                  aria-label={isMuted ? 'Unmute video audio' : 'Mute video audio'}
                >
                  {isMuted ? <VolumeX size={13} /> : <Volume2 size={13} />}
                  <span>{isMuted ? 'Muted' : 'Audio'}</span>
                </button>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  color: '#10b981',
                  background: 'rgba(16, 185, 129, 0.12)',
                  padding: '4px 9px',
                  borderRadius: '999px',
                  border: '1px solid rgba(16, 185, 129, 0.25)',
                }}>
                  <span style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: '#10b981',
                    display: 'inline-block',
                    boxShadow: '0 0 8px #10b981',
                  }} />
                  <span>Live Demo</span>
                </div>
              </div>
            </div>

            {/* Video Player */}
            <video
              ref={videoRef}
              autoPlay
              loop
              muted={isMuted}
              playsInline
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              className="auth-video-player"
            >
              <source src={financialVideo} type="video/mp4" />
              <source src="/resources/Financial_application.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>

            {/* Bottom Glass/Gradient Text Overlay */}
            <div className="auth-video-bottom-overlay">
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '5px 12px',
                borderRadius: '999px',
                background: 'rgba(59, 130, 246, 0.18)',
                border: '1px solid rgba(59, 130, 246, 0.35)',
                color: '#60a5fa',
                fontSize: '0.78rem',
                fontWeight: 600,
                width: 'fit-content',
              }}>
                <Sparkles size={14} />
                <span>Interactive Financial Suite</span>
              </div>

              <h2 style={{
                fontSize: 'clamp(1.4rem, 2.2vw, 1.85rem)',
                fontWeight: 800,
                color: '#ffffff',
                lineHeight: 1.25,
                letterSpacing: '-0.025em',
                margin: 0,
              }}>
                Master Your Loans with{' '}
                <span style={{
                  background: 'linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}>
                  Smart EMI Intelligence
                </span>
              </h2>

              <p style={{
                fontSize: '0.88rem',
                color: '#cbd5e1',
                lineHeight: 1.5,
                margin: 0,
              }}>
                Watch dynamic monthly amortization, instant prepayment interest savings, and real-time loan comparisons in action.
              </p>

              {/* Feature Pills Row */}
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '8px',
                marginTop: '4px',
              }}>
                <div className="auth-feature-pill">
                  <TrendingUp size={15} color="#60a5fa" />
                  <span>Dynamic EMI</span>
                </div>
                <div className="auth-feature-pill">
                  <Zap size={15} color="#34d399" />
                  <span>Prepayment Power</span>
                </div>
                <div className="auth-feature-pill">
                  <PieChart size={15} color="#c084fc" />
                  <span>Visual Breakdown</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Main Glassmorphism Auth Card */}
        <div style={{
          width: '100%',
          maxWidth: '460px',
          margin: '0 auto',
          zIndex: 10,
          background: 'var(--bg-card, rgba(17, 24, 39, 0.85))',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderRadius: '24px',
          border: '1px solid var(--border-color, rgba(255, 255, 255, 0.1))',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.5), 0 0 40px rgba(59, 130, 246, 0.1)',
          padding: '36px 32px',
          animation: 'fadeInRight 0.4s ease-out',
        }}>
          {/* Brand Header */}
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
              color: '#fff',
              boxShadow: '0 8px 24px rgba(59, 130, 246, 0.4)',
              marginBottom: '16px',
            }}>
              <Calculator size={30} />
            </div>

          <h1 style={{
            fontSize: '1.65rem',
            fontWeight: 800,
            color: 'var(--text-main, #f8fafc)',
            letterSpacing: '-0.02em',
            margin: '0 0 6px 0',
          }}>
            Smart EMI Calculator
          </h1>
          <p style={{
            fontSize: '0.9rem',
            color: 'var(--text-muted, #94a3b8)',
            margin: 0,
          }}>
            {mode === 'signin'
              ? 'Welcome back! Sign in to access your financial calculations'
              : 'Create an account to save, compare & export loan plans'}
          </p>
        </div>

        {/* Tab Switcher: Sign In vs Sign Up */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          padding: '4px',
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '14px',
          marginBottom: '24px',
          border: '1px solid rgba(255, 255, 255, 0.05)',
        }}>
          <button
            type="button"
            onClick={() => { setMode('signin'); setError(null); }}
            style={{
              padding: '10px 0',
              border: 'none',
              borderRadius: '10px',
              fontSize: '0.9rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              background: mode === 'signin' ? 'linear-gradient(135deg, #3b82f6, #2563eb)' : 'transparent',
              color: mode === 'signin' ? '#ffffff' : 'var(--text-muted, #94a3b8)',
              boxShadow: mode === 'signin' ? '0 4px 12px rgba(37, 99, 235, 0.35)' : 'none',
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setMode('signup'); setError(null); }}
            style={{
              padding: '10px 0',
              border: 'none',
              borderRadius: '10px',
              fontSize: '0.9rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              background: mode === 'signup' ? 'linear-gradient(135deg, #3b82f6, #2563eb)' : 'transparent',
              color: mode === 'signup' ? '#ffffff' : 'var(--text-muted, #94a3b8)',
              boxShadow: mode === 'signup' ? '0 4px 12px rgba(37, 99, 235, 0.35)' : 'none',
            }}
          >
            Create Account
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            background: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '12px',
            padding: '12px 14px',
            color: '#ef4444',
            fontSize: '0.85rem',
            marginBottom: '20px',
            animation: 'shake 0.3s ease',
          }}>
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* Google OAuth Button */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={googleLoading || loading}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            padding: '12px 16px',
            borderRadius: '12px',
            border: '1px solid var(--border-color, rgba(255, 255, 255, 0.15))',
            background: 'var(--bg-card-hover, rgba(255, 255, 255, 0.06))',
            color: 'var(--text-main, #f8fafc)',
            fontSize: '0.92rem',
            fontWeight: 600,
            cursor: googleLoading ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            opacity: googleLoading ? 0.7 : 1,
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)')}
        >
          {/* Official Google SVG */}
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          {googleLoading ? 'Connecting to Google...' : 'Continue with Google'}
        </button>

        {/* Divider */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          margin: '22px 0',
          color: 'var(--text-muted, #64748b)',
          fontSize: '0.78rem',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255, 255, 255, 0.1)' }} />
          <span>Or with email & password</span>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255, 255, 255, 0.1)' }} />
        </div>

        {/* Auth Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Name Field (Sign Up mode only) */}
          {mode === 'signup' && (
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.82rem',
                fontWeight: 600,
                color: 'var(--text-muted, #94a3b8)',
                marginBottom: '6px',
              }}>
                Full Name
              </label>
              <div style={{ position: 'relative' }}>
                <User size={18} style={{
                  position: 'absolute',
                  left: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted, #64748b)',
                }} />
                <input
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 14px 12px 42px',
                    borderRadius: '12px',
                    border: '1px solid var(--border-color, rgba(255, 255, 255, 0.12))',
                    background: 'rgba(255, 255, 255, 0.04)',
                    color: 'var(--text-main, #f8fafc)',
                    fontSize: '0.9rem',
                    outline: 'none',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = '#3b82f6')}
                  onBlur={(e) => (e.target.style.borderColor = 'rgba(255, 255, 255, 0.12)')}
                />
              </div>
            </div>
          )}

          {/* Email Field */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '0.82rem',
              fontWeight: 600,
              color: 'var(--text-muted, #94a3b8)',
              marginBottom: '6px',
            }}>
              Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{
                position: 'absolute',
                left: '14px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted, #64748b)',
              }} />
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 14px 12px 42px',
                  borderRadius: '12px',
                  border: '1px solid var(--border-color, rgba(255, 255, 255, 0.12))',
                  background: 'rgba(255, 255, 255, 0.04)',
                  color: 'var(--text-main, #f8fafc)',
                  fontSize: '0.9rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.2s',
                }}
                onFocus={(e) => (e.target.style.borderColor = '#3b82f6')}
                onBlur={(e) => (e.target.style.borderColor = 'rgba(255, 255, 255, 0.12)')}
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '6px',
            }}>
              <label style={{
                fontSize: '0.82rem',
                fontWeight: 600,
                color: 'var(--text-muted, #94a3b8)',
              }}>
                Password
              </label>
              {mode === 'signup' && strength.label && (
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: strength.color }}>
                  {strength.label}
                </span>
              )}
            </div>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{
                position: 'absolute',
                left: '14px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted, #64748b)',
              }} />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder={mode === 'signup' ? 'At least 6 characters' : 'Enter your password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 42px 12px 42px',
                  borderRadius: '12px',
                  border: '1px solid var(--border-color, rgba(255, 255, 255, 0.12))',
                  background: 'rgba(255, 255, 255, 0.04)',
                  color: 'var(--text-main, #f8fafc)',
                  fontSize: '0.9rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.2s',
                }}
                onFocus={(e) => (e.target.style.borderColor = '#3b82f6')}
                onBlur={(e) => (e.target.style.borderColor = 'rgba(255, 255, 255, 0.12)')}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted, #94a3b8)',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* Password Strength Bar */}
            {mode === 'signup' && password.length > 0 && (
              <div style={{
                height: '4px',
                width: '100%',
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '4px',
                marginTop: '8px',
                overflow: 'hidden',
              }}>
                <div style={{
                  height: '100%',
                  width: strength.percent,
                  background: strength.color,
                  transition: 'width 0.3s ease, background 0.3s ease',
                }} />
              </div>
            )}
          </div>

          {/* Confirm Password (Sign Up mode only) */}
          {mode === 'signup' && (
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.82rem',
                fontWeight: 600,
                color: 'var(--text-muted, #94a3b8)',
                marginBottom: '6px',
              }}>
                Confirm Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{
                  position: 'absolute',
                  left: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted, #64748b)',
                }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Repeat your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 14px 12px 42px',
                    borderRadius: '12px',
                    border: '1px solid var(--border-color, rgba(255, 255, 255, 0.12))',
                    background: 'rgba(255, 255, 255, 0.04)',
                    color: 'var(--text-main, #f8fafc)',
                    fontSize: '0.9rem',
                    outline: 'none',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = '#3b82f6')}
                  onBlur={(e) => (e.target.style.borderColor = 'rgba(255, 255, 255, 0.12)')}
                />
              </div>
            </div>
          )}

          {/* Primary Submit Button */}
          <button
            type="submit"
            disabled={loading || googleLoading}
            style={{
              marginTop: '8px',
              padding: '13px 20px',
              borderRadius: '12px',
              border: 'none',
              background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 50%, #1d4ed8 100%)',
              color: '#ffffff',
              fontSize: '0.95rem',
              fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              boxShadow: '0 8px 24px -4px rgba(37, 99, 235, 0.5)',
              transition: 'all 0.2s ease',
              opacity: loading ? 0.75 : 1,
            }}
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : mode === 'signin' ? (
              <>
                <span>Sign In to Dashboard</span>
                <ArrowRight size={18} />
              </>
            ) : (
              <>
                <span>Create Free Account</span>
                <Sparkles size={18} />
              </>
            )}
          </button>
        </form>

        {/* Guest Access Option */}
        <div style={{ textAlign: 'center', marginTop: '22px' }}>
          <button
            type="button"
            onClick={onContinueGuest}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted, #94a3b8)',
              fontSize: '0.85rem',
              fontWeight: 500,
              cursor: 'pointer',
              textDecoration: 'underline',
              padding: '4px 8px',
              transition: 'color 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#3b82f6')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted, #94a3b8)')}
          >
            Or explore calculator as Guest &rarr;
          </button>
        </div>

        {/* Security Badge */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          marginTop: '24px',
          paddingTop: '16px',
          borderTop: '1px solid rgba(255, 255, 255, 0.06)',
          fontSize: '0.75rem',
          color: 'var(--text-muted, #64748b)',
        }}>
          <ShieldCheck size={14} color="#10b981" />
          <span>Secured with bcrypt password hashing & JWT token encryption</span>
        </div>
      </div>
    </div>
  </div>
  );
}
