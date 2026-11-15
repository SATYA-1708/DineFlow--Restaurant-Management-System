import React, { useState, useEffect } from 'react'
import { reservationAPI, tableAPI } from '../../services/api'
import toast from 'react-hot-toast'
import {
  CalendarDays,
  Plus,
  Users,
  Armchair,
  Clock,
  FileText,
  XCircle,
  X,
  Calendar,
  Sparkles
} from 'lucide-react'

const SC = {
  PENDING: 'badge-warning',
  CONFIRMED: 'badge-info',
  SEATED: 'badge-purple',
  COMPLETED: 'badge-success',
  CANCELLED: 'badge-danger'
}

export default function MyReservations() {
  const [reservations, setReservations] = useState([])
  const [tables, setTables] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ tableId: '', partySize: 2, reservedAt: '', notes: '' })
  const [loading, setLoading] = useState(true)

  const load = () => {
    Promise.all([reservationAPI.getMy(), tableAPI.getAvailable()])
      .then(([r, t]) => {
        setReservations(r.data.data || [])
        setTables(t.data.data || [])
      })
      .catch(() => toast.error('Failed to load reservations'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const create = async () => {
    if (!form.tableId || !form.reservedAt) {
      toast.error('Please select table and booking date')
      return
    }
    try {
      await reservationAPI.create({
        ...form,
        tableId: parseInt(form.tableId, 10),
        partySize: parseInt(form.partySize, 10)
      })
      toast.success('🎉 Table reservation confirmed!')
      setShowModal(false)
      load()
      setForm({ tableId: '', partySize: 2, reservedAt: '', notes: '' })
    } catch (e) {
      toast.error(e.response?.data?.message || 'Reservation booking failed')
    }
  }

  const cancel = async id => {
    if (!confirm('Cancel this table reservation?')) return
    try {
      await reservationAPI.cancel(id)
      toast.success('Reservation cancelled')
      load()
    } catch {
      toast.error('Cancellation failed')
    }
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
      <div className="flex-between page-header" style={{ alignItems: 'flex-start' }}>
        <div>
          <h1>
            <CalendarDays size={28} style={{ color: 'var(--primary)' }} />
            My Table Reservations
          </h1>
          <p>Book dining tables ahead, request celebrations, and manage upcoming schedules</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={16} /> New Reservation
        </button>
      </div>

      {/* ── Reservations Cards ── */}
      {reservations.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="icon">
              <CalendarDays size={32} />
            </div>
            <h3>No reservations scheduled</h3>
            <p>Plan your next dining experience by booking a preferred table in advance.</p>
            <button className="btn btn-primary" onClick={() => setShowModal(true)} style={{ marginTop: '16px' }}>
              <Plus size={15} /> Book a Table
            </button>
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
          {reservations.map(r => (
            <div key={r.id} className="card" style={{ padding: '22px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '17px', color: 'var(--text)' }}>
                    Table {r.tableNumber || 'Pending'}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                    #RES-{String(r.id).padStart(4, '0')}
                  </div>
                </div>
                <span className={`badge ${SC[r.status] || 'badge-gray'}`}>
                  {r.status}
                </span>
              </div>

              <div style={{ fontSize: '13.5px', display: 'flex', flexDirection: 'column', gap: '8px', color: 'var(--text-secondary)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Users size={15} color="var(--primary)" />
                  <span>Party of <strong>{r.partySize} guests</strong></span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Clock size={15} color="var(--primary)" />
                  <span>
                    {r.reservedAt
                      ? new Date(r.reservedAt).toLocaleString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })
                      : '—'}
                  </span>
                </div>

                {r.notes && (
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginTop: '4px' }}>
                    <FileText size={15} color="var(--text-light)" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <span style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>&ldquo;{r.notes}&rdquo;</span>
                  </div>
                )}
              </div>

              {(r.status === 'PENDING' || r.status === 'CONFIRMED') && (
                <div style={{ marginTop: '18px', paddingTop: '12px', borderTop: '1px solid var(--border-light)' }}>
                  <button
                    className="btn btn-sm"
                    onClick={() => cancel(r.id)}
                    style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', width: '100%', justifyContent: 'center' }}
                  >
                    <XCircle size={14} /> Cancel Booking
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── Booking Modal ── */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" style={{ maxWidth: '460px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Reserve Dining Table</h3>
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
                <label className="form-label">Select Table *</label>
                <select
                  className="form-select"
                  value={form.tableId}
                  onChange={e => setForm({ ...form, tableId: e.target.value })}
                  required
                >
                  <option value="">Choose an available dining table...</option>
                  {tables.map(t => (
                    <option key={t.id} value={t.id}>
                      Table {t.tableNumber} — {t.capacity} Guests ({t.section || 'General Dining'})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Party Size *</label>
                  <input
                    className="form-input"
                    type="number"
                    min="1"
                    max="50"
                    value={form.partySize}
                    onChange={e => setForm({ ...form, partySize: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Booking Time *</label>
                  <input
                    className="form-input"
                    type="datetime-local"
                    value={form.reservedAt}
                    onChange={e => setForm({ ...form, reservedAt: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Celebration / Special Requests</label>
                <textarea
                  className="form-textarea"
                  value={form.notes}
                  onChange={e => setForm({ ...form, notes: e.target.value })}
                  placeholder="Anniversary celebration, window seating, dietary accommodations..."
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={create}>
                Confirm Reservation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
