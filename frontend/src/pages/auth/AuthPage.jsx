import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'
import {
  ChefHat,
  Mail,
  Lock,
  User,
  Phone,
  ArrowRight,
  Shield,
  Sparkles,
  KeyRound
} from 'lucide-react'

export default function AuthPage() {
  const [tab, setTab] = useState('login')
  const [loading, setLoading] = useState(false)
  const [loginData, setLoginData] = useState({ email: '', password: '' })
  const [regData, setRegData] = useState({ fullName: '', email: '', password: '', phone: '' })
  const { login, register } = useAuth()
  const navigate = useNavigate()

  const handleLogin = async e => {
    e.preventDefault()
    setLoading(true)
    try {
      const role = await login(loginData.email, loginData.password)
      toast.success(`Welcome back, signed in as ${role}!`)
      navigate(role === 'CUSTOMER' ? '/menu' : '/admin/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async e => {
    e.preventDefault()
    setLoading(true)
    try {
      await register(regData)
      toast.success('Account created successfully!')
      navigate('/menu')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  const quickLogin = async (email, pass) => {
    setLoading(true)
    try {
      const role = await login(email, pass)
      toast.success(`Signed in as ${role}`)
      navigate(role === 'CUSTOMER' ? '/menu' : '/admin/dashboard')
    } catch {
      toast.error('Quick login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        {/* ── Brand Logo & Header ── */}
        <div className="auth-logo">
          <div className="icon">
            <ChefHat size={30} strokeWidth={2.4} />
          </div>
          <h1>DineFlow</h1>
          <p>Modern Restaurant Management & Ordering Platform</p>
        </div>

        {/* ── Tab Switcher ── */}
        <div className="auth-tabs">
          <button
            type="button"
            className={`auth-tab ${tab === 'login' ? 'active' : ''}`}
            onClick={() => setTab('login')}
          >
            Sign In
          </button>
          <button
            type="button"
            className={`auth-tab ${tab === 'register' ? 'active' : ''}`}
            onClick={() => setTab('register')}
          >
            Create Account
          </button>
        </div>

        {/* ── Login Form ── */}
        {tab === 'login' ? (
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div style={{ position: 'relative' }}>
                <input
                  className="form-input"
                  type="email"
                  placeholder="admin@rms.com"
                  required
                  value={loginData.email}
                  onChange={e => setLoginData({ ...loginData, email: e.target.value })}
                  style={{ paddingLeft: '40px' }}
                />
                <Mail
                  size={17}
                  style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  className="form-input"
                  type="password"
                  placeholder="••••••••"
                  required
                  value={loginData.password}
                  onChange={e => setLoginData({ ...loginData, password: e.target.value })}
                  style={{ paddingLeft: '40px' }}
                />
                <Lock
                  size={17}
                  style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }}
                />
              </div>
            </div>

            <button
              className="btn btn-primary"
              style={{ width: '100%', padding: '12px', fontSize: '14px', marginTop: '8px' }}
              disabled={loading}
            >
              {loading ? (
                <>Authenticating...</>
              ) : (
                <>
                  Sign In <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        ) : (
          /* ── Register Form ── */
          <form onSubmit={handleRegister}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <div style={{ position: 'relative' }}>
                <input
                  className="form-input"
                  placeholder="Satya Narayan"
                  required
                  value={regData.fullName}
                  onChange={e => setRegData({ ...regData, fullName: e.target.value })}
                  style={{ paddingLeft: '40px' }}
                />
                <User
                  size={17}
                  style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div style={{ position: 'relative' }}>
                <input
                  className="form-input"
                  type="email"
                  placeholder="user@example.com"
                  required
                  value={regData.email}
                  onChange={e => setRegData({ ...regData, email: e.target.value })}
                  style={{ paddingLeft: '40px' }}
                />
                <Mail
                  size={17}
                  style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }}
                />
              </div>
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    className="form-input"
                    type="password"
                    placeholder="Min 6 chars"
                    required
                    value={regData.password}
                    onChange={e => setRegData({ ...regData, password: e.target.value })}
                    style={{ paddingLeft: '40px' }}
                  />
                  <Lock
                    size={17}
                    style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Phone</label>
                <div style={{ position: 'relative' }}>
                  <input
                    className="form-input"
                    placeholder="017XXXXXXXX"
                    value={regData.phone}
                    onChange={e => setRegData({ ...regData, phone: e.target.value })}
                    style={{ paddingLeft: '40px' }}
                  />
                  <Phone
                    size={17}
                    style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }}
                  />
                </div>
              </div>
            </div>

            <button
              className="btn btn-primary"
              style={{ width: '100%', padding: '12px', fontSize: '14px', marginTop: '8px' }}
              disabled={loading}
            >
              {loading ? <>Creating Account...</> : <>Create Account <Sparkles size={16} /></>}
            </button>
          </form>
        )}

        {/* ── Demo Accounts Quick Action ── */}
        <div className="divider" />
        <div style={{ textAlign: 'center', marginBottom: '12px' }}>
          <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-light)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            ⚡ One-Click Demo Access
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => quickLogin('admin@rms.com', 'admin123')}
            disabled={loading}
            style={{
              padding: '10px',
              border: '1px solid #fecaca',
              background: '#fef2f2',
              color: '#dc2626',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <Shield size={14} /> Admin Access
          </button>

          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => quickLogin('staff@rms.com', 'staff123')}
            disabled={loading}
            style={{
              padding: '10px',
              border: '1px solid #fde68a',
              background: '#fffbeb',
              color: '#d97706',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <KeyRound size={14} /> Staff Access
          </button>
        </div>
      </div>
    </div>
  )
}
