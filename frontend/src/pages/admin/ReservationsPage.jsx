import React, { useState, useEffect } from 'react'
import { reservationAPI } from '../../services/api'
import toast from 'react-hot-toast'
import {
  CalendarDays,
  Users,
  Armchair,
  RefreshCw,
  Clock,
  CheckCircle2,
  Calendar,
  AlertCircle
} from 'lucide-react'

const SC = {
  PENDING: 'badge-warning',
  CONFIRMED: 'badge-info',
  SEATED: 'badge-purple',
  COMPLETED: 'badge-success',
  CANCELLED: 'badge-danger'
}

export default function ReservationsPage() {
  const [reservations, setReservations] = useState([])
  const [loading, setLoading] = useState(true)

  const load = () => {
    reservationAPI.getAll()
      .then(r => setReservations(r.data.data || []))
      .catch(() => toast.error('Failed to load reservations'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const updateStatus = async (id, status) => {
    try {
      await reservationAPI.updateStatus(id, status)
      toast.success(`Reservation status updated to ${status}`)
      load()
    } catch {
      toast.error('Update failed')
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
            Table Reservations
          </h1>
          <p>Upcoming bookings, guest party sizes, seating times, and check-in status</p>
        </div>
        <button className="btn btn-secondary" onClick={load}>
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* ── Reservations Table Card ── */}
      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Booking Ref</th>
                <th>Guest Details</th>
                <th>Assigned Table</th>
                <th>Party Size</th>
                <th>Reserved Time</th>
                <th>Current Status</th>
                <th style={{ textAlign: 'right' }}>Update Status</th>
              </tr>
            </thead>
            <tbody>
              {reservations.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <div className="empty-state">
                      <div className="icon">
                        <CalendarDays size={30} />
                      </div>
                      <h3>No reservations recorded</h3>
                      <p>Guest bookings will appear here when scheduled.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                reservations.map(r => (
                  <tr key={r.id}>
                    <td>
                      <span style={{ fontWeight: 800, color: 'var(--text)', fontFamily: 'monospace' }}>
                        #RES-{String(r.id).padStart(4, '0')}
                      </span>
                    </td>

                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--text)' }}>{r.customerName || 'Anonymous Guest'}</div>
                      {r.notes && (
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                          &ldquo;{r.notes}&rdquo;
                        </div>
                      )}
                    </td>

                    <td>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          background: '#eff6ff',
                          color: '#1d4ed8',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: 600
                        }}
                      >
                        <Armchair size={12} /> Table {r.tableNumber || 'Pending'}
                      </span>
                    </td>

                    <td>
                      <span className="badge badge-gray">
                        <Users size={11} /> {r.partySize} Guests
                      </span>
                    </td>

                    <td>
                      <div style={{ fontSize: '13px', color: 'var(--text-secondary)', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                        <Clock size={12} color="var(--text-muted)" />
                        {r.reservedAt ? new Date(r.reservedAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}
                      </div>
                    </td>

                    <td>
                      <span className={`badge ${SC[r.status] || 'badge-gray'}`}>
                        {r.status}
                      </span>
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      <select
                        onChange={e => updateStatus(r.id, e.target.value)}
                        value={r.status}
                        className="form-select"
                        style={{ width: 'auto', display: 'inline-block', padding: '5px 8px', fontSize: '12.5px', borderRadius: '8px' }}
                      >
                        {['PENDING', 'CONFIRMED', 'SEATED', 'COMPLETED', 'CANCELLED'].map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
