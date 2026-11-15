import React, { useState, useEffect, useCallback } from 'react'
import { orderAPI, chatAPI } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import ChatBox from '../../components/chat/ChatBox'
import OrderProgress from '../../components/order/OrderProgress'
import toast from 'react-hot-toast'
import {
  ShoppingBag,
  Clock,
  MessageSquare,
  XCircle,
  RefreshCw,
  Package,
  Armchair,
  CheckCircle2,
  ChevronDown,
  ChevronUp
} from 'lucide-react'

const SC = {
  PENDING: 'badge-warning',
  CONFIRMED: 'badge-info',
  IN_PROGRESS: 'badge-purple',
  READY: 'badge-orange',
  SERVED: 'badge-success',
  CLOSED: 'badge-gray',
  CANCELLED: 'badge-danger'
}

export default function MyOrders() {
  const { user } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [chatOrderId, setChatOrderId] = useState(null)
  const [unreadCounts, setUnreadCounts] = useState({})

  const load = useCallback(() => {
    orderAPI.getMy()
      .then(r => setOrders(r.data.data || []))
      .catch(() => toast.error('Failed to load orders'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    const activeOrders = orders.filter(o => !['CLOSED', 'CANCELLED', 'SERVED'].includes(o.status))
    if (activeOrders.length === 0) return
    const fetchUnreads = async () => {
      const counts = {}
      for (const o of activeOrders) {
        try {
          const r = await chatAPI.getUnread(o.id)
          counts[o.id] = r.data.data || 0
        } catch {
          counts[o.id] = 0
        }
      }
      setUnreadCounts(counts)
    }
    fetchUnreads()
    const interval = setInterval(fetchUnreads, 5000)
    return () => clearInterval(interval)
  }, [orders])

  const cancel = async id => {
    if (!confirm('Cancel this order?')) return
    try {
      await orderAPI.cancel(id)
      toast.success('Order cancelled')
      load()
    } catch (e) {
      toast.error(e.response?.data?.message || 'Cannot cancel')
    }
  }

  const activeOrders = orders.filter(o => !['CLOSED', 'CANCELLED'].includes(o.status))
  const pastOrders = orders.filter(o => ['CLOSED', 'CANCELLED'].includes(o.status))

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
            My Orders & Tracking
          </h1>
          <p>Follow live preparation progress, speak with restaurant staff, and review past receipts</p>
        </div>
        <button className="btn btn-secondary" onClick={load}>
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {orders.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="icon">
              <ShoppingBag size={32} />
            </div>
            <h3>No orders yet</h3>
            <p>Browse our menu and place your first delicious meal order!</p>
            <a href="/menu" className="btn btn-primary" style={{ marginTop: '16px' }}>
              Explore Menu
            </a>
          </div>
        </div>
      ) : (
        <>
          {/* ── Active Orders ── */}
          {activeOrders.length > 0 && (
            <div style={{ marginBottom: '32px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={18} color="var(--primary)" />
                Active Order Pipeline ({activeOrders.length})
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {activeOrders.map(o => (
                  <div key={o.id} className="card" style={{ padding: '22px' }}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '14px',
                        cursor: 'pointer'
                      }}
                      onClick={() => setSelected(selected?.id === o.id ? null : o)}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div
                          style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '14px',
                            background: 'var(--primary-light)',
                            color: 'var(--primary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                          }}
                        >
                          <ShoppingBag size={22} />
                        </div>

                        <div>
                          <div style={{ fontWeight: 800, fontSize: '16px', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            Order #ORD-{String(o.id).padStart(4, '0')}
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
                                  padding: '2px 8px',
                                  borderRadius: '6px',
                                  fontSize: '11.5px',
                                  fontWeight: 600
                                }}
                              >
                                <Armchair size={11} /> Table {o.tableNumber}
                              </span>
                            ) : null}
                          </div>

                          <div style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginTop: '2px' }}>
                            {o.createdAt ? new Date(o.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}
                          </div>
                          <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px', fontWeight: 500 }}>
                            {(o.orderItems || []).length} items ordered
                          </div>
                        </div>
                      </div>

                      <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                        <span className={`badge ${SC[o.status] || 'badge-gray'}`}>
                          {o.status.replace('_', ' ')}
                        </span>
                        <div className="price" style={{ fontSize: '20px' }}>
                          ₹{parseFloat(o.totalAmount || 0).toFixed(0)}
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Clock size={11} /> Est. {o.estimatedMinutes || 15} mins
                        </div>
                      </div>
                    </div>

                    {selected?.id === o.id && (
                      <div style={{ marginTop: '20px', borderTop: '1px solid var(--border-light)', paddingTop: '20px' }}>
                        <OrderProgress order={o} />

                        <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '16px', marginTop: '18px' }}>
                          {(o.orderItems || []).map(item => (
                            <div
                              key={item.id}
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                padding: '8px 0',
                                fontSize: '13.5px',
                                borderBottom: '1px dashed var(--border-light)'
                              }}
                            >
                              <span>
                                <strong style={{ color: 'var(--text)' }}>{item.menuItemName}</strong> × {item.quantity}
                                {item.specialRequest && (
                                  <span style={{ color: 'var(--text-muted)', fontSize: '12px', display: 'block' }}>
                                    Note: {item.specialRequest}
                                  </span>
                                )}
                              </span>
                              <span className="price">₹{parseFloat(item.subtotal || 0).toFixed(0)}</span>
                            </div>
                          ))}

                          <div
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              fontWeight: 800,
                              fontSize: '16px',
                              paddingTop: '12px',
                              marginTop: '8px'
                            }}
                          >
                            <span>Total (incl. tax)</span>
                            <span className="price" style={{ fontSize: '20px' }}>
                              ₹{parseFloat(o.totalAmount || 0).toFixed(0)}
                            </span>
                          </div>
                        </div>

                        <div style={{ display: 'flex', gap: '10px', marginTop: '16px', flexWrap: 'wrap' }}>
                          <button
                            className="btn btn-secondary btn-sm"
                            style={{ position: 'relative' }}
                            onClick={() => setChatOrderId(chatOrderId === o.id ? null : o.id)}
                          >
                            <MessageSquare size={14} /> Message Kitchen / Staff
                            {unreadCounts[o.id] > 0 && (
                              <span
                                style={{
                                  position: 'absolute',
                                  top: '-6px',
                                  right: '-6px',
                                  background: 'var(--danger)',
                                  color: '#fff',
                                  borderRadius: '50%',
                                  width: '18px',
                                  height: '18px',
                                  fontSize: '10px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontWeight: 800
                                }}
                              >
                                {unreadCounts[o.id]}
                              </span>
                            )}
                          </button>

                          {(o.status === 'PENDING' || o.status === 'CONFIRMED') && (
                            <button
                              className="btn btn-sm"
                              onClick={e => {
                                e.stopPropagation()
                                cancel(o.id)
                              }}
                              style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' }}
                            >
                              <XCircle size={14} /> Cancel Order
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Order History ── */}
          {pastOrders.length > 0 && (
            <div>
              <h2 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '14px', color: 'var(--text-muted)' }}>
                Order History & Past Receipts ({pastOrders.length})
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {pastOrders.map(o => (
                  <div
                    key={o.id}
                    className="card"
                    style={{ padding: '18px', cursor: 'pointer' }}
                    onClick={() => setSelected(selected?.id === o.id ? null : o)}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div
                          style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '10px',
                            background: '#f1f5f9',
                            color: '#64748b',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                          }}
                        >
                          <ShoppingBag size={18} />
                        </div>

                        <div>
                          <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text)' }}>
                            Order #ORD-{String(o.id).padStart(4, '0')}
                            {o.isParcel && (
                              <span className="parcel-badge" style={{ marginLeft: '6px' }}>
                                Parcel
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                            {o.createdAt ? new Date(o.createdAt).toLocaleDateString() : ''}
                          </div>
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <span className={`badge ${SC[o.status] || 'badge-gray'}`} style={{ display: 'block', marginBottom: '4px' }}>
                          {o.status}
                        </span>
                        <div className="price" style={{ fontSize: '16px' }}>
                          ₹{parseFloat(o.totalAmount || 0).toFixed(0)}
                        </div>
                      </div>
                    </div>

                    {selected?.id === o.id && (
                      <div style={{ marginTop: '14px', borderTop: '1px solid var(--border-light)', paddingTop: '14px' }}>
                        {(o.orderItems || []).map(item => (
                          <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: '13px' }}>
                            <span>{item.menuItemName} × {item.quantity}</span>
                            <span className="price">₹{parseFloat(item.subtotal || 0).toFixed(0)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* ── Order Chat Drawer ── */}
      {chatOrderId && (
        <div style={{ position: 'fixed', bottom: '24px', right: '24px', width: '380px', zIndex: 500 }}>
          <ChatBox orderId={chatOrderId} onClose={() => setChatOrderId(null)} />
        </div>
      )}
    </div>
  )
}
