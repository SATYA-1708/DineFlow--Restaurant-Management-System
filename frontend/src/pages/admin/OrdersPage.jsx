import React, { useState, useEffect } from 'react'
import { orderAPI, paymentAPI, chatAPI } from '../../services/api'
import ChatBox from '../../components/chat/ChatBox'
import toast from 'react-hot-toast'
import {
  ShoppingBag,
  Eye,
  MessageSquare,
  ArrowRight,
  CreditCard,
  Clock,
  Package,
  RefreshCw,
  X,
  CheckCircle2,
  AlertCircle,
  Armchair
} from 'lucide-react'

const STATUS_ORDER = ['PENDING', 'CONFIRMED', 'IN_PROGRESS', 'READY', 'SERVED', 'CLOSED', 'CANCELLED']
const STATUS_COLORS = {
  PENDING: 'badge-warning',
  CONFIRMED: 'badge-info',
  IN_PROGRESS: 'badge-purple',
  READY: 'badge-orange',
  SERVED: 'badge-success',
  CLOSED: 'badge-gray',
  CANCELLED: 'badge-danger'
}
const NEXT_STATUS = {
  PENDING: 'CONFIRMED',
  CONFIRMED: 'IN_PROGRESS',
  IN_PROGRESS: 'READY',
  READY: 'SERVED',
  SERVED: 'CLOSED'
}

export default function OrdersPage() {
  const [orders, setOrders] = useState([])
  const [filter, setFilter] = useState('')
  const [selected, setSelected] = useState(null)
  const [payModal, setPayModal] = useState(null)
  const [payMethod, setPayMethod] = useState('CASH')
  const [loading, setLoading] = useState(true)
  const [chatOrderId, setChatOrderId] = useState(null)
  const [unreadCounts, setUnreadCounts] = useState({})

  const load = () => {
    orderAPI.getAll()
      .then(r => setOrders(r.data.data || []))
      .catch(() => toast.error('Failed to load orders'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  // Poll unread counts for active orders
  useEffect(() => {
    const active = orders.filter(o => !['CLOSED', 'CANCELLED'].includes(o.status))
    if (!active.length) return
    const fetchCounts = async () => {
      const counts = {}
      for (const o of active) {
        try {
          const r = await chatAPI.getUnread(o.id)
          counts[o.id] = r.data.data || 0
        } catch {
          counts[o.id] = 0
        }
      }
      setUnreadCounts(counts)
    }
    fetchCounts()
    const iv = setInterval(fetchCounts, 5000)
    return () => clearInterval(iv)
  }, [orders])

  const filtered = filter ? orders.filter(o => o.status === filter) : orders

  const updateStatus = async (id, status) => {
    try {
      await orderAPI.updateStatus(id, status)
      toast.success(`Order status moved to ${status}`)
      load()
      setSelected(null)
    } catch {
      toast.error('Status update failed')
    }
  }

  const processPayment = async () => {
    try {
      await paymentAPI.process({ orderId: payModal.id, paymentMethod: payMethod })
      toast.success('Payment successfully recorded')
      setPayModal(null)
      load()
    } catch (e) {
      toast.error(e.response?.data?.message || 'Payment processing failed')
    }
  }

  const totalUnread = Object.values(unreadCounts).reduce((a, b) => a + b, 0)

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
            <ShoppingBag size={28} style={{ color: 'var(--primary)' }} />
            Live Orders Management
          </h1>
          <p>Monitor real-time kitchen pipeline, update fulfillment, and settle invoices</p>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {totalUnread > 0 && (
            <div
              style={{
                background: 'var(--danger)',
                color: '#fff',
                borderRadius: '9999px',
                padding: '6px 14px',
                fontSize: '12.5px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 2px 8px rgba(239, 68, 68, 0.4)'
              }}
            >
              <MessageSquare size={14} /> {totalUnread} new message{totalUnread > 1 ? 's' : ''}
            </div>
          )}
          <button className="btn btn-secondary" onClick={load}>
            <RefreshCw size={14} /> Refresh
          </button>
        </div>
      </div>

      {/* ── Filter Tabs ── */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '22px', flexWrap: 'wrap' }}>
        <button
          onClick={() => setFilter('')}
          className={`btn btn-sm ${!filter ? 'btn-primary' : 'btn-secondary'}`}
        >
          All Orders ({orders.length})
        </button>
        {STATUS_ORDER.map(s => {
          const count = orders.filter(o => o.status === s).length
          if (count === 0) return null
          return (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`btn btn-sm ${filter === s ? 'btn-primary' : 'btn-secondary'}`}
            >
              {s.replace('_', ' ')} ({count})
            </button>
          )
        })}
      </div>

      {/* ── Orders Table Card ── */}
      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Order Ref</th>
                <th>Customer</th>
                <th>Seating / Type</th>
                <th>Items Ordered</th>
                <th>Bill Amount</th>
                <th>Est. Time</th>
                <th>Current Status</th>
                <th style={{ textAlign: 'right' }}>Order Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8}>
                    <div className="empty-state">
                      <div className="icon">
                        <ShoppingBag size={28} />
                      </div>
                      <h3>No orders found</h3>
                      <p>No orders currently match the selected status filter.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map(o => (
                  <tr key={o.id}>
                    <td>
                      <span style={{ fontWeight: 800, color: 'var(--text)', fontFamily: 'monospace' }}>
                        #ORD-{String(o.id).padStart(4, '0')}
                      </span>
                      <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                        {o.createdAt ? new Date(o.createdAt).toLocaleDateString() : ''}
                      </div>
                    </td>

                    <td>
                      <span style={{ fontWeight: 600, color: 'var(--text)' }}>
                        {o.customerName || 'Walk-in Guest'}
                      </span>
                    </td>

                    <td>
                      {o.isParcel ? (
                        <span className="parcel-badge">
                          <Package size={11} style={{ display: 'inline', marginRight: '3px' }} /> Parcel
                        </span>
                      ) : o.tableNumber ? (
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            background: '#eff6ff',
                            color: '#1d4ed8',
                            padding: '3px 8px',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: 600
                          }}
                        >
                          <Armchair size={11} /> Table {o.tableNumber}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-light)' }}>—</span>
                      )}
                    </td>

                    <td>
                      <span className="badge badge-gray">
                        {(o.orderItems || []).length} items
                      </span>
                    </td>

                    <td>
                      <span className="price">₹{parseFloat(o.totalAmount || 0).toFixed(0)}</span>
                    </td>

                    <td>
                      <span style={{ fontSize: '12.5px', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={12} /> {o.estimatedMinutes || 15}m
                      </span>
                    </td>

                    <td>
                      <span className={`badge ${STATUS_COLORS[o.status]}`}>
                        {o.status.replace('_', ' ')}
                      </span>
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px', alignItems: 'center' }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => setSelected(o)}
                          title="View Details"
                          style={{ padding: '6px 9px' }}
                        >
                          <Eye size={13} />
                        </button>

                        <button
                          className="btn btn-secondary btn-sm"
                          style={{ position: 'relative', padding: '6px 9px' }}
                          onClick={() => setChatOrderId(chatOrderId === o.id ? null : o.id)}
                          title="Open Order Chat"
                        >
                          <MessageSquare size={13} />
                          {unreadCounts[o.id] > 0 && (
                            <span
                              style={{
                                position: 'absolute',
                                top: '-5px',
                                right: '-5px',
                                background: 'var(--danger)',
                                color: '#fff',
                                borderRadius: '50%',
                                width: '15px',
                                height: '15px',
                                fontSize: '9px',
                                display: 'flex',
                                alignItems: 'center',
                                justifySelf: 'center',
                                fontWeight: 800
                              }}
                            >
                              {unreadCounts[o.id]}
                            </span>
                          )}
                        </button>

                        {NEXT_STATUS[o.status] && (
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => updateStatus(o.id, NEXT_STATUS[o.status])}
                            style={{ padding: '6px 12px' }}
                          >
                            {NEXT_STATUS[o.status].replace('_', ' ')} <ArrowRight size={13} />
                          </button>
                        )}

                        {o.status === 'SERVED' && (
                          <button
                            className="btn btn-success btn-sm"
                            onClick={() => setPayModal(o)}
                            style={{ padding: '6px 12px' }}
                          >
                            <CreditCard size={13} /> Settle Bill
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Order Detail Modal ── */}
      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal" style={{ maxWidth: '620px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Order Details #ORD-{selected.id}</h3>
              <button className="btn btn-secondary btn-sm" onClick={() => setSelected(null)} style={{ padding: '4px 8px' }}>
                <X size={15} />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-grid-2" style={{ marginBottom: '18px' }}>
                <div>
                  <span className="text-muted">Customer Name</span>
                  <div style={{ fontWeight: 700, marginTop: '2px' }}>{selected.customerName || 'Walk-in Guest'}</div>
                </div>
                <div>
                  <span className="text-muted">Table / Dining Mode</span>
                  <div style={{ fontWeight: 700, marginTop: '2px' }}>
                    {selected.isParcel ? '🛍️ Parcel / Takeaway' : selected.tableNumber ? `Table ${selected.tableNumber}` : 'Standard'}
                  </div>
                </div>
                <div>
                  <span className="text-muted">Status</span>
                  <div style={{ marginTop: '4px' }}>
                    <span className={`badge ${STATUS_COLORS[selected.status]}`}>
                      {selected.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
                <div>
                  <span className="text-muted">Total Bill</span>
                  <div className="price" style={{ fontSize: '18px', marginTop: '2px' }}>
                    ₹{parseFloat(selected.totalAmount || 0).toFixed(0)}
                  </div>
                </div>
              </div>

              {selected.specialInstructions && (
                <div style={{ background: '#fffbeb', border: '1px solid #fde68a', padding: '10px 14px', borderRadius: '8px', marginBottom: '16px', fontSize: '13px', color: '#92400e' }}>
                  <strong>Notes:</strong> {selected.specialInstructions}
                </div>
              )}

              <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '10px' }}>Items Summary</h4>
              <div style={{ border: '1px solid var(--border)', borderRadius: '10px', overflow: 'hidden' }}>
                <table style={{ margin: 0 }}>
                  <thead>
                    <tr>
                      <th>Dish</th>
                      <th>Qty</th>
                      <th>Unit Price</th>
                      <th style={{ textAlign: 'right' }}>Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(selected.orderItems || []).map(item => (
                      <tr key={item.id}>
                        <td style={{ fontWeight: 600 }}>{item.menuItemName}</td>
                        <td>{item.quantity}</td>
                        <td>₹{parseFloat(item.unitPrice || 0).toFixed(0)}</td>
                        <td style={{ textAlign: 'right', fontWeight: 700 }}>
                          ₹{(item.quantity * parseFloat(item.unitPrice || 0)).toFixed(0)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setSelected(null)}>
                Close
              </button>
              {NEXT_STATUS[selected.status] && (
                <button
                  className="btn btn-primary"
                  onClick={() => updateStatus(selected.id, NEXT_STATUS[selected.status])}
                >
                  Move to {NEXT_STATUS[selected.status].replace('_', ' ')}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Payment Settle Modal ── */}
      {payModal && (
        <div className="modal-overlay" onClick={() => setPayModal(null)}>
          <div className="modal" style={{ maxWidth: '420px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Settle Order #ORD-{payModal.id}</h3>
              <button className="btn btn-secondary btn-sm" onClick={() => setPayModal(null)} style={{ padding: '4px 8px' }}>
                <X size={15} />
              </button>
            </div>
            <div className="modal-body">
              <div style={{ textAlign: 'center', padding: '10px 0 20px' }}>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Payable Amount</div>
                <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--primary)', marginTop: '4px' }}>
                  ₹{parseFloat(payModal.totalAmount || 0).toFixed(0)}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Payment Mode</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                  {['CASH', 'CARD', 'ONLINE'].map(m => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setPayMethod(m)}
                      style={{
                        padding: '10px 6px',
                        borderRadius: '8px',
                        border: '1.5px solid',
                        borderColor: payMethod === m ? 'var(--primary)' : 'var(--border)',
                        background: payMethod === m ? 'var(--primary-subtle)' : '#fff',
                        color: payMethod === m ? 'var(--primary-dark)' : 'var(--text)',
                        fontWeight: 700,
                        fontSize: '12.5px',
                        cursor: 'pointer'
                      }}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setPayModal(null)}>
                Cancel
              </button>
              <button className="btn btn-success" onClick={processPayment}>
                <CheckCircle2 size={16} /> Confirm Payment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Live Chat Overlay Drawer ── */}
      {chatOrderId && (
        <div style={{ position: 'fixed', bottom: '24px', right: '24px', width: '380px', zIndex: 500 }}>
          <ChatBox orderId={chatOrderId} onClose={() => setChatOrderId(null)} />
        </div>
      )}
    </div>
  )
}
