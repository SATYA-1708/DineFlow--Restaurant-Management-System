import React, { useState, useEffect } from 'react'
import { tableAPI } from '../../services/api'
import toast from 'react-hot-toast'
import {
  Armchair,
  Plus,
  Edit2,
  Trash2,
  Users,
  CheckCircle2,
  AlertCircle,
  X,
  Layers,
  Sparkles
} from 'lucide-react'

const STATUS_CONFIG = {
  AVAILABLE: {
    label: 'Available',
    color: '#10b981',
    bg: '#ecfdf5',
    border: '#a7f3d0',
    badgeClass: 'badge-success'
  },
  OCCUPIED: {
    label: 'Occupied',
    color: '#ef4444',
    bg: '#fef2f2',
    border: '#fecaca',
    badgeClass: 'badge-danger'
  },
  RESERVED: {
    label: 'Reserved',
    color: '#3b82f6',
    bg: '#eff6ff',
    border: '#bfdbfe',
    badgeClass: 'badge-info'
  },
  MAINTENANCE: {
    label: 'Maintenance',
    color: '#f59e0b',
    bg: '#fffbeb',
    border: '#fde68a',
    badgeClass: 'badge-warning'
  }
}

export default function TablesPage() {
  const [tables, setTables] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [editTable, setEditTable] = useState(null)
  const [form, setForm] = useState({ tableNumber: '', capacity: 4, section: '' })
  const [loading, setLoading] = useState(true)

  const load = () => {
    tableAPI.getAll()
      .then(r => setTables(r.data.data || []))
      .catch(() => toast.error('Failed to load tables'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const openNew = () => {
    setEditTable(null)
    setForm({ tableNumber: '', capacity: 4, section: '' })
    setShowModal(true)
  }

  const openEdit = t => {
    setEditTable(t)
    setForm({ tableNumber: t.tableNumber, capacity: t.capacity, section: t.section || '' })
    setShowModal(true)
  }

  const save = async () => {
    if (!form.tableNumber.trim()) {
      toast.error('Table number is required')
      return
    }
    try {
      if (editTable) await tableAPI.update(editTable.id, form)
      else await tableAPI.create(form)
      toast.success(editTable ? 'Table updated successfully' : 'New table added')
      setShowModal(false)
      load()
    } catch (e) {
      toast.error(e.response?.data?.message || 'Error saving table')
    }
  }

  const updateStatus = async (id, status) => {
    try {
      await tableAPI.updateStatus(id, status)
      toast.success(`Table status updated to ${status}`)
      load()
    } catch {
      toast.error('Status update failed')
    }
  }

  const deleteTable = async id => {
    if (!confirm('Are you sure you want to delete this table?')) return
    try {
      await tableAPI.delete(id)
      toast.success('Table deleted')
      load()
    } catch {
      toast.error('Failed to delete table')
    }
  }

  const summary = ['AVAILABLE', 'OCCUPIED', 'RESERVED', 'MAINTENANCE'].map(s => ({
    status: s,
    count: tables.filter(t => t.status === s).length,
    config: STATUS_CONFIG[s]
  }))

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
      <div className="flex-between page-header" style={{ alignItems: 'flex-start' }}>
        <div>
          <h1>
            <Armchair size={28} style={{ color: 'var(--primary)' }} />
            Dining Floor & Tables
          </h1>
          <p>Organize floor layout, capacity, sections, and live seating states</p>
        </div>
        <button className="btn btn-primary" onClick={openNew}>
          <Plus size={16} /> Add Table
        </button>
      </div>

      {/* ── Floor Overview Metric Badges ── */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', marginBottom: '28px' }}>
        {summary.map(s => (
          <div
            className="stat-card"
            key={s.status}
            style={{
              padding: '18px 20px',
              borderLeft: `4px solid ${s.config.color}`
            }}
          >
            <div
              className="stat-icon"
              style={{ background: s.config.bg, color: s.config.color, width: '44px', height: '44px' }}
            >
              <Armchair size={20} />
            </div>
            <div className="stat-info">
              <h3 style={{ fontSize: '24px' }}>{s.count}</h3>
              <p>{s.config.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Tables Visual Grid ── */}
      {tables.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="icon">
              <Armchair size={32} />
            </div>
            <h3>No tables configured</h3>
            <p>Add dining tables to begin accepting guest seatings and orders.</p>
            <button className="btn btn-primary" onClick={openNew} style={{ marginTop: '16px' }}>
              <Plus size={15} /> Add First Table
            </button>
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: '20px' }}>
          {tables.map(t => {
            const cfg = STATUS_CONFIG[t.status] || STATUS_CONFIG.AVAILABLE
            return (
              <div
                key={t.id}
                className="card"
                style={{
                  padding: '22px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                  position: 'relative',
                  borderTop: `4px solid ${cfg.color}`,
                  boxShadow: 'var(--shadow)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text)' }}>
                      Table {t.tableNumber}
                    </div>
                    <div style={{ fontSize: '12.5px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                      <Layers size={12} /> {t.section || 'General Area'}
                    </div>
                  </div>
                  <span className={`badge ${cfg.badgeClass}`}>
                    {cfg.label}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      background: 'var(--bg)',
                      border: '1px solid var(--border)',
                      padding: '4px 10px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: 700,
                      color: 'var(--text-secondary)'
                    }}
                  >
                    <Users size={13} color="var(--primary)" /> {t.capacity} Guests
                  </span>
                </div>

                {/* Actions Row */}
                <div style={{ display: 'flex', gap: '8px', marginTop: 'auto', paddingTop: '10px', borderTop: '1px solid var(--border-light)' }}>
                  <select
                    onChange={e => updateStatus(t.id, e.target.value)}
                    value={t.status}
                    className="form-select"
                    style={{ flex: 1, padding: '5px 8px', fontSize: '12px', borderRadius: '8px' }}
                  >
                    {['AVAILABLE', 'OCCUPIED', 'RESERVED', 'MAINTENANCE'].map(s => (
                      <option key={s} value={s}>{STATUS_CONFIG[s]?.label || s}</option>
                    ))}
                  </select>

                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => openEdit(t)}
                    title="Edit Table"
                    style={{ padding: '6px 10px' }}
                  >
                    <Edit2 size={13} />
                  </button>

                  <button
                    className="btn btn-sm"
                    onClick={() => deleteTable(t.id)}
                    title="Delete Table"
                    style={{ padding: '6px 10px', background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' }}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ── Modal ── */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" style={{ maxWidth: '440px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editTable ? 'Edit Table Info' : 'Add New Table'}</h3>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setShowModal(false)}
                style={{ padding: '4px 8px' }}
              >
                <X size={15} />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Table Number / Identifier *</label>
                <input
                  className="form-input"
                  value={form.tableNumber}
                  onChange={e => setForm({ ...form, tableNumber: e.target.value })}
                  placeholder="e.g. T-01, VIP-A"
                  required
                />
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Seating Capacity *</label>
                  <input
                    className="form-input"
                    type="number"
                    min="1"
                    max="50"
                    value={form.capacity}
                    onChange={e => setForm({ ...form, capacity: parseInt(e.target.value, 10) || 1 })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Section / Floor</label>
                  <input
                    className="form-input"
                    value={form.section}
                    onChange={e => setForm({ ...form, section: e.target.value })}
                    placeholder="e.g. Patio, Main Hall"
                  />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={save}>
                {editTable ? 'Update Table' : 'Create Table'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
