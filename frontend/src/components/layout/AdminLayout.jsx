import React from 'react'
import { Outlet, NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
  LayoutDashboard,
  ShoppingBag,
  Armchair,
  CalendarDays,
  UtensilsCrossed,
  Users,
  BarChart3,
  LogOut,
  ChefHat,
  Bell,
  Shield,
  Sparkles
} from 'lucide-react'

const navItems = [
  { section: 'Overview' },
  { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { section: 'Operations' },
  { to: '/admin/orders', icon: ShoppingBag, label: 'Live Orders' },
  { to: '/admin/tables', icon: Armchair, label: 'Dining Tables' },
  { to: '/admin/reservations', icon: CalendarDays, label: 'Reservations' },
  { section: 'Catalog' },
  { to: '/admin/menu', icon: UtensilsCrossed, label: 'Menu Catalog' },
  { section: 'Administration', adminOnly: true },
  { to: '/admin/users', icon: Users, label: 'User Directory', adminOnly: true },
  { to: '/admin/reports', icon: BarChart3, label: 'Analytics & Reports', adminOnly: true },
]

export default function AdminLayout() {
  const { user, logout, isAdmin } = useAuth()
  const location = useLocation()

  // Find active label for breadcrumb
  const currentNav = navItems.find(item => item.to === location.pathname)
  const pageTitle = currentNav?.label || 'Restaurant Management'

  return (
    <div className="app-layout">
      {/* ── Modern Premium Sidebar ── */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-icon">
            <ChefHat size={24} strokeWidth={2.3} />
          </div>
          <div>
            <h1>DineFlow</h1>
            <span>{isAdmin ? 'System Administrator' : 'Staff Operations'}</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item, i) => {
            if (item.section) {
              if (item.adminOnly && !isAdmin) return null
              return <div key={i} className="nav-section-title">{item.section}</div>
            }
            if (item.adminOnly && !isAdmin) return null
            const Icon = item.icon
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
              >
                <span className="nav-icon">
                  <Icon size={18} strokeWidth={2} />
                </span>
                {item.label}
              </NavLink>
            )
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user-card">
            <div
              className="avatar"
              style={{
                background: isAdmin ? 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)' : '#3b82f6',
                color: '#fff',
                fontSize: '13px'
              }}
            >
              {user?.fullName?.[0]?.toUpperCase() || 'U'}
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
              <div style={{ fontSize: '11px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Shield size={10} color={isAdmin ? '#fb923c' : '#60a5fa'} />
                {user?.role}
              </div>
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

      {/* ── Main Workspace ── */}
      <main className="main-content">
        <header className="topbar">
          <div className="topbar-title-wrap">
            <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 500 }}>Admin Portal</span>
            <span style={{ color: 'var(--border-strong)', fontSize: '12px' }}>/</span>
            <span className="topbar-title">{pageTitle}</span>
          </div>

          <div className="topbar-right">
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 12px',
                background: 'rgba(16, 185, 129, 0.08)',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                borderRadius: '9999px',
                fontSize: '12px',
                fontWeight: 600,
                color: '#059669'
              }}
            >
              <span
                style={{
                  width: '7px',
                  height: '7px',
                  borderRadius: '50%',
                  background: '#10b981',
                  boxShadow: '0 0 8px #10b981'
                }}
              />
              System Live
            </div>

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
                {user?.fullName?.[0]?.toUpperCase() || 'A'}
              </div>
            </div>
          </div>
        </header>

        <Outlet />
      </main>
    </div>
  )
}
