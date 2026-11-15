import React, { useState, useEffect, useMemo } from 'react'
import { userAPI } from '../../services/api'
import toast from 'react-hot-toast'
import {
  Users,
  Search,
  Shield,
  UserCheck,
  UserX,
  Phone,
  Mail,
  Calendar,
  Lock,
  Unlock,
  Filter,
  CheckCircle2,
  XCircle
} from 'lucide-react'

export default function UsersPage() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('ALL')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [updatingId, setUpdatingId] = useState(null)

  const load = () => {
    userAPI.getAll()
      .then(r => setUsers(r.data.data || []))
      .catch(() => toast.error('Failed to load users directory'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const toggle = async (id, currentStatus) => {
    setUpdatingId(id)
    try {
      await userAPI.toggleStatus(id)
      toast.success(currentStatus ? 'User account deactivated' : 'User account activated')
      load()
    } catch {
      toast.error('Failed to update status')
    } finally {
      setUpdatingId(null)
    }
  }

  // Filtered Users
  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const q = search.toLowerCase()
      const matchesSearch =
        !search ||
        u.fullName?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.phone?.toLowerCase().includes(q)

      const matchesRole = roleFilter === 'ALL' || u.role === roleFilter
      const matchesStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'ACTIVE' && u.isActive) ||
        (statusFilter === 'INACTIVE' && !u.isActive)

      return matchesSearch && matchesRole && matchesStatus
    })
  }, [users, search, roleFilter, statusFilter])

  // Stats calculation
  const stats = useMemo(() => {
    const total = users.length
    const admins = users.filter(u => u.role === 'ADMIN').length
    const staff = users.filter(u => u.role === 'STAFF').length
    const active = users.filter(u => u.isActive).length
    return { total, admins, staff, active }
  }, [users])

  // Deterministic Avatar Gradient
  const getAvatarGradient = (role, name = '') => {
    if (role === 'ADMIN') return 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
    if (role === 'STAFF') return 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
    const charCode = name.charCodeAt(0) || 0
    if (charCode % 3 === 0) return 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)'
    if (charCode % 3 === 1) return 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
    return 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)'
  }

  if (loading) {
    return (
      <div className="page-content">
        <div className="loading-page">
          <div className="spinner" />
        </div>
      </div>
    )
  }

  return (
    <div className="page-content">
      {/* ── Page Header ── */}
      <div className="page-header">
        <h1>
          <Users size={28} className="text-primary" style={{ color: 'var(--primary)' }} />
          User Directory
        </h1>
        <p>Manage permissions, inspect accounts, and oversee system access roles</p>
      </div>

      {/* ── Metrics Grid ── */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#fff7ed', color: '#ea580c' }}>
            <Users size={24} />
          </div>
          <div className="stat-info">
            <h3>{stats.total}</h3>
            <p>Total Registered</p>
            <div className="stat-change up">All platform users</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#fef2f2', color: '#dc2626' }}>
            <Shield size={24} />
          </div>
          <div className="stat-info">
            <h3>{stats.admins}</h3>
            <p>Administrators</p>
            <div className="stat-change" style={{ background: '#fef2f2', color: '#dc2626' }}>Full Access</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#fffbeb', color: '#d97706' }}>
            <UserCheck size={24} />
          </div>
          <div className="stat-info">
            <h3>{stats.staff}</h3>
            <p>Staff Members</p>
            <div className="stat-change" style={{ background: '#fffbeb', color: '#d97706' }}>Operational</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#ecfdf5', color: '#059669' }}>
            <CheckCircle2 size={24} />
          </div>
          <div className="stat-info">
            <h3>{stats.active}</h3>
            <p>Active Status</p>
            <div className="stat-change up">{Math.round((stats.active / (stats.total || 1)) * 100)}% enabled</div>
          </div>
        </div>
      </div>

      {/* ── Search & Filter Controls Card ── */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div
          style={{
            padding: '16px 20px',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px'
          }}
        >
          {/* Search Bar */}
          <div className="search-bar" style={{ width: '320px' }}>
            <Search size={18} color="var(--text-light)" />
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                ×
              </button>
            )}
          </div>

          {/* Filters */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-muted)' }}>
              <Filter size={15} /> Role:
            </div>
            {['ALL', 'ADMIN', 'STAFF', 'CUSTOMER'].map(r => (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '8px',
                  fontSize: '12.5px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: '1px solid',
                  borderColor: roleFilter === r ? 'var(--primary)' : 'var(--border)',
                  background: roleFilter === r ? 'var(--primary-subtle)' : '#ffffff',
                  color: roleFilter === r ? 'var(--primary-dark)' : 'var(--text-secondary)',
                  transition: 'all 0.15s ease'
                }}
              >
                {r === 'ALL' ? 'All Roles' : r}
              </button>
            ))}

            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="form-select"
              style={{ width: 'auto', padding: '6px 12px', fontSize: '12.5px' }}
            >
              <option value="ALL">All Status</option>
              <option value="ACTIVE">Active Only</option>
              <option value="INACTIVE">Inactive Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── Users Data Table Card ── */}
      <div className="card">
        <div className="card-header">
          <h2>
            <Users size={18} />
            Members List ({filteredUsers.length})
          </h2>
          {search && (
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              Matching &ldquo;{search}&rdquo;
            </span>
          )}
        </div>

        {filteredUsers.length === 0 ? (
          <div className="empty-state">
            <div className="icon">
              <UserX size={32} />
            </div>
            <h3>No users found</h3>
            <p>Try adjusting your search criteria or role filters to find what you&apos;re looking for.</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>User Profile</th>
                  <th>Contact Info</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Joined Date</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(u => (
                  <tr key={u.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div
                          className="avatar"
                          style={{
                            background: getAvatarGradient(u.role, u.fullName),
                            color: '#ffffff'
                          }}
                        >
                          {u.fullName?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, color: 'var(--text)', fontSize: '14px' }}>
                            {u.fullName}
                          </div>
                          <div style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Mail size={12} /> {u.email}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td>
                      <div style={{ fontSize: '13px', color: u.phone ? 'var(--text-secondary)' : 'var(--text-light)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Phone size={13} color="var(--text-muted)" />
                        {u.phone || 'No phone set'}
                      </div>
                    </td>

                    <td>
                      <span className={`role-chip role-${u.role?.toLowerCase()}`}>
                        {u.role}
                      </span>
                    </td>

                    <td>
                      <span className={`badge ${u.isActive ? 'badge-success' : 'badge-danger'}`}>
                        {u.isActive ? (
                          <>
                            <CheckCircle2 size={12} /> Active
                          </>
                        ) : (
                          <>
                            <XCircle size={12} /> Disabled
                          </>
                        )}
                      </span>
                    </td>

                    <td>
                      <div style={{ fontSize: '12.5px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Calendar size={13} />
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '—'}
                      </div>
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      <button
                        className={`btn btn-sm ${u.isActive ? 'btn-secondary' : 'btn-success'}`}
                        onClick={() => toggle(u.id, u.isActive)}
                        disabled={updatingId === u.id}
                        style={{
                          minWidth: '100px',
                          color: u.isActive ? '#dc2626' : '#fff',
                          borderColor: u.isActive ? '#fecaca' : undefined,
                          background: u.isActive ? '#fef2f2' : undefined
                        }}
                      >
                        {u.isActive ? (
                          <>
                            <Lock size={13} /> Deactivate
                          </>
                        ) : (
                          <>
                            <Unlock size={13} /> Activate
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
