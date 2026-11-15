import React from 'react'
import { Outlet, NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useNotifications } from '../../context/NotificationContext'
import {
  UtensilsCrossed,
  ShoppingBag,
  CalendarDays,
  LogOut,
  ChefHat,
  User,
  Sparkles
} from 'lucide-react'

export default function CustomerLayout() {
  const { user, logout } = useAuth()
  const { totalUnreadChat } = useNotifications() || {}
  const location = useLocation()

  const totalBadge = totalUnreadChat || 0

  const getPageTitle = () => {
    if (location.pathname === '/menu') return 'Explore Menu'
    if (location.pathname === '/my-orders') return 'My Orders'
    if (location.pathname === '/my-reservations') return 'My Reservations'
    return 'Dining Lounge'
  }

  return (
    <div className="app-layout">
      {/* ── Customer Sidebar ── */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-icon">
            <ChefHat size={24} strokeWidth={2.3} />
          </div>
          <div>
            <h1>DineFlow</h1>
            <span>Guest Dining Portal</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-title">Dining & Ordering</div>
          <NavLink to="/menu" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
            <span className="nav-icon">
              <UtensilsCrossed size={18} />
            </span>
            Menu & Cart
          </NavLink>

          <div className="nav-section-title">My Account</div>
          <NavLink to="/my-orders" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
            <span className="nav-icon">
              <ShoppingBag size={18} />
            </span>
            My Orders
            {totalBadge > 0 && (
              <span className="badge">
                {totalBadge}
              </span>
            )}
          </NavLink>

          <NavLink to="/my-reservations" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
            <span className="nav-icon">
              <CalendarDays size={18} />
            </span>
            My Reservations
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user-card">
            <div
              className="avatar"
              style={{
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: '#fff',
                fontSize: '13px'
              }}
            >
              {user?.fullName?.[0]?.toUpperCase() || 'G'}
            </div>
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <div
                style={{
                  fontSize: '13px',
                  fontWeight: 700,
                  color: '#f8fafc',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}
              >
                {user?.fullName}
              </div>
              <div style={{ fontSize: '11px', color: '#94a3b8' }}>Guest Member</div>
            </div>
          </div>
          <button
            className="nav-item"
            onClick={logout}
            style={{
              width: '100%',
              color: '#f87171',
              background: 'rgba(239, 68, 68, 0.08)',
              border: '1px solid rgba(239, 68, 68, 0.15)',
              justifyContent: 'center'
            }}
          >
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </aside>

      {/* ── Main Customer Area ── */}
      <main className="main-content">
        <header className="topbar">
          <div className="topbar-title-wrap">
            <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 500 }}>Customer Lounge</span>
            <span style={{ color: 'var(--border-strong)', fontSize: '12px' }}>/</span>
            <span className="topbar-title">{getPageTitle()}</span>
          </div>

          <div className="topbar-right">
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '4px 8px 4px 12px',
                borderRadius: '9999px',
                background: 'var(--bg)',
                border: '1px solid var(--border)'
              }}
            >
              <span style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                {user?.fullName?.split(' ')[0]}
              </span>
              <div
                className="avatar"
                style={{
                  width: '28px',
                  height: '28px',
                  fontSize: '11px',
                  background: 'var(--primary-gradient)',
                  color: '#fff'
                }}
              >
                {user?.fullName?.[0]?.toUpperCase() || 'G'}
              </div>
            </div>
          </div>
        </header>

        <Outlet />
      </main>
    </div>
  )
}
