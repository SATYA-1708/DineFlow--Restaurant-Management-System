import React, { useState, useEffect } from 'react'
import { menuAPI, orderAPI, tableAPI } from '../../services/api'
import toast from 'react-hot-toast'
import {
  ShoppingBag,
  Search,
  Plus,
  Minus,
  Trash2,
  Clock,
  Armchair,
  Package,
  X,
  CheckCircle2,
  UtensilsCrossed,
  Sparkles
} from 'lucide-react'

export default function MenuPage() {
  const [categories, setCategories] = useState([])
  const [items, setItems] = useState([])
  const [activeCategory, setActiveCategory] = useState(null)
  const [search, setSearch] = useState('')
  const [cart, setCart] = useState([])
  const [tables, setTables] = useState([])
  const [showCart, setShowCart] = useState(false)
  const [tableId, setTableId] = useState('')
  const [notes, setNotes] = useState('')
  const [isParcel, setIsParcel] = useState(false)
  const [loading, setLoading] = useState(true)
  const [ordering, setOrdering] = useState(false)

  useEffect(() => {
    Promise.all([menuAPI.getCategories(), menuAPI.getItems(), tableAPI.getAvailable()])
      .then(([c, i, t]) => {
        setCategories(c.data.data || [])
        setItems(i.data.data || [])
        setTables(t.data.data || [])
      })
      .catch(() => toast.error('Failed to load menu'))
      .finally(() => setLoading(false))
  }, [])

  const filtered = items.filter(
    i =>
      (!activeCategory || i.categoryId === activeCategory) &&
      (!search || i.name.toLowerCase().includes(search.toLowerCase()))
  )

  const addToCart = item => {
    setCart(prev => {
      const ex = prev.find(c => c.id === item.id)
      if (ex) return prev.map(c => (c.id === item.id ? { ...c, qty: c.qty + 1 } : c))
      return [...prev, { ...item, qty: 1, specialRequest: '' }]
    })
    toast.success(`${item.name} added to cart`, { duration: 1500 })
  }

  const removeFromCart = id => setCart(prev => prev.filter(c => c.id !== id))

  const updateQty = (id, qty) => {
    if (qty < 1) {
      removeFromCart(id)
      return
    }
    setCart(prev => prev.map(c => (c.id === id ? { ...c, qty } : c)))
  }

  const cartTotal = cart.reduce((s, c) => s + parseFloat(c.price) * c.qty, 0)
  const cartCount = cart.reduce((s, c) => s + c.qty, 0)

  const placeOrder = async () => {
    if (cart.length === 0) {
      toast.error('Your cart is empty')
      return
    }
    setOrdering(true)
    try {
      await orderAPI.create({
        tableId: isParcel ? null : tableId || null,
        notes,
        isParcel,
        items: cart.map(c => ({ menuItemId: c.id, quantity: c.qty, specialRequest: c.specialRequest }))
      })
      toast.success('🎉 Order successfully sent to kitchen!')
      setCart([])
      setShowCart(false)
      setNotes('')
      setTableId('')
      setIsParcel(false)
    } catch (e) {
      toast.error(e.response?.data?.message || 'Order failed')
    } finally {
      setOrdering(false)
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
            <UtensilsCrossed size={28} style={{ color: 'var(--primary)' }} />
            Chef&apos;s Selections & Menu
          </h1>
          <p>Hand-crafted culinary dishes, fresh ingredients, and bespoke dining</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setShowCart(true)}
          style={{ position: 'relative', padding: '10px 20px' }}
        >
          <ShoppingBag size={18} /> Cart
          {cartCount > 0 && (
            <span
              style={{
                position: 'absolute',
                top: '-7px',
                right: '-7px',
                background: 'var(--danger)',
                color: '#fff',
                borderRadius: '50%',
                width: '22px',
                height: '22px',
                fontSize: '11px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                boxShadow: '0 2px 6px rgba(239, 68, 68, 0.4)'
              }}
            >
              {cartCount}
            </span>
          )}
        </button>
      </div>

      {/* ── Search Bar ── */}
      <div className="search-bar" style={{ width: '100%', maxWidth: '440px', marginBottom: '22px' }}>
        <Search size={18} color="var(--text-light)" />
        <input
          placeholder="Search by dish name or ingredient..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
          >
            ×
          </button>
        )}
      </div>

      {/* ── Category Filter Pills ── */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px', marginBottom: '28px' }}>
        <button
          onClick={() => setActiveCategory(null)}
          className={`btn btn-sm ${!activeCategory ? 'btn-primary' : 'btn-secondary'}`}
        >
          All Items ({items.length})
        </button>
        {categories.map(c => {
          const count = items.filter(i => i.categoryId === c.id).length
          return (
            <button
              key={c.id}
              onClick={() => setActiveCategory(activeCategory === c.id ? null : c.id)}
              className={`btn btn-sm ${activeCategory === c.id ? 'btn-primary' : 'btn-secondary'}`}
              style={{ whiteSpace: 'nowrap' }}
            >
              {c.name} ({count})
            </button>
          )
        })}
      </div>

      {/* ── Menu Dishes Grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '22px' }}>
        {filtered.length === 0 ? (
          <div className="card" style={{ gridColumn: '1/-1' }}>
            <div className="empty-state">
              <div className="icon">
                <UtensilsCrossed size={32} />
              </div>
              <h3>No dishes found</h3>
              <p>Try searching for a different item or category.</p>
            </div>
          </div>
        ) : (
          filtered.map(item => (
            <div
              key={item.id}
              className="card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                border: '1px solid var(--border)'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-3px)'
                e.currentTarget.style.boxShadow = 'var(--shadow-lg)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = ''
                e.currentTarget.style.boxShadow = 'var(--shadow)'
              }}
            >
              {/* Dish Visual Header */}
              <div
                style={{
                  height: '140px',
                  background: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderBottom: '1px solid var(--border-light)',
                  position: 'relative'
                }}
              >
                <div
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '20px',
                    background: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--primary)',
                    boxShadow: '0 4px 14px rgba(249, 115, 22, 0.15)'
                  }}
                >
                  <UtensilsCrossed size={30} strokeWidth={1.8} />
                </div>
                <span
                  className="badge badge-info"
                  style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    fontSize: '11px',
                    backdropFilter: 'blur(8px)',
                    background: 'rgba(255, 255, 255, 0.9)'
                  }}
                >
                  {item.categoryName || 'Special'}
                </span>
              </div>

              {/* Dish Content Body */}
              <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text)', marginBottom: '4px' }}>
                  {item.name}
                </h3>
                <p
                  style={{
                    fontSize: '12.5px',
                    color: 'var(--text-muted)',
                    marginBottom: '16px',
                    lineHeight: '1.5',
                    flex: 1
                  }}
                >
                  {item.description || 'Prepared fresh with finest ingredients.'}
                </p>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginTop: 'auto',
                    paddingTop: '12px',
                    borderTop: '1px solid var(--border-light)'
                  }}
                >
                  <div>
                    <span className="price" style={{ fontSize: '18px' }}>
                      ₹{parseFloat(item.price).toFixed(0)}
                    </span>
                    <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <Clock size={11} /> ~{item.estimatedMinutes || 15}m prep
                    </div>
                  </div>

                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => addToCart(item)}
                    style={{ padding: '7px 14px', borderRadius: '8px' }}
                  >
                    <Plus size={14} /> Add
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ── Cart Drawer / Modal ── */}
      {showCart && (
        <div className="modal-overlay" onClick={() => setShowCart(false)}>
          <div className="modal" style={{ maxWidth: '500px', maxHeight: '90vh' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                <ShoppingBag size={18} style={{ color: 'var(--primary)', display: 'inline', marginRight: '6px' }} />
                Your Dining Cart ({cartCount})
              </h3>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setShowCart(false)}
                style={{ padding: '4px 8px' }}
              >
                <X size={15} />
              </button>
            </div>

            <div className="modal-body" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
              {cart.length === 0 ? (
                <div className="empty-state">
                  <div className="icon">
                    <ShoppingBag size={28} />
                  </div>
                  <h3>Your cart is empty</h3>
                  <p>Browse our menu selections and add dishes to start your order.</p>
                </div>
              ) : (
                cart.map(item => (
                  <div
                    key={item.id}
                    style={{
                      display: 'flex',
                      gap: '12px',
                      alignItems: 'center',
                      padding: '14px 0',
                      borderBottom: '1px solid var(--border-light)'
                    }}
                  >
                    <div
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '10px',
                        background: 'var(--primary-light)',
                        color: 'var(--primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}
                    >
                      <UtensilsCrossed size={18} />
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: '13.5px', color: 'var(--text)' }}>
                        {item.name}
                      </div>
                      <div style={{ fontSize: '12.5px', color: 'var(--primary)', fontWeight: 700, marginTop: '2px' }}>
                        ₹{parseFloat(item.price).toFixed(0)}
                      </div>
                      <input
                        placeholder="Add special instructions / note..."
                        className="form-input"
                        style={{ marginTop: '6px', padding: '5px 8px', fontSize: '12px', borderRadius: '6px' }}
                        value={item.specialRequest}
                        onChange={e =>
                          setCart(prev =>
                            prev.map(c => (c.id === item.id ? { ...c, specialRequest: e.target.value } : c))
                          )
                        }
                      />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <button
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '4px 8px' }}
                        onClick={() => updateQty(item.id, item.qty - 1)}
                      >
                        <Minus size={12} />
                      </button>
                      <span style={{ fontWeight: 800, minWidth: '22px', textAlign: 'center', fontSize: '13px' }}>
                        {item.qty}
                      </span>
                      <button
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '4px 8px' }}
                        onClick={() => updateQty(item.id, item.qty + 1)}
                      >
                        <Plus size={12} />
                      </button>
                      <button
                        className="btn btn-sm"
                        style={{ padding: '4px 8px', background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' }}
                        onClick={() => removeFromCart(item.id)}
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                ))
              )}

              {cart.length > 0 && (
                <div style={{ marginTop: '16px' }}>
                  {/* Dining Mode Toggle */}
                  <div className="form-group">
                    <label className="form-label">Order Type</label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      <button
                        type="button"
                        onClick={() => setIsParcel(false)}
                        style={{
                          padding: '10px',
                          borderRadius: '10px',
                          border: `1.5px solid ${!isParcel ? 'var(--primary)' : 'var(--border)'}`,
                          background: !isParcel ? 'var(--primary-subtle)' : '#fff',
                          color: !isParcel ? 'var(--primary-dark)' : 'var(--text-secondary)',
                          cursor: 'pointer',
                          fontWeight: 700,
                          fontSize: '13px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px'
                        }}
                      >
                        <Armchair size={15} /> Dine In
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsParcel(true)
                          setTableId('')
                        }}
                        style={{
                          padding: '10px',
                          borderRadius: '10px',
                          border: `1.5px solid ${isParcel ? 'var(--primary)' : 'var(--border)'}`,
                          background: isParcel ? 'var(--primary-subtle)' : '#fff',
                          color: isParcel ? 'var(--primary-dark)' : 'var(--text-secondary)',
                          cursor: 'pointer',
                          fontWeight: 700,
                          fontSize: '13px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px'
                        }}
                      >
                        <Package size={15} /> Takeaway / Parcel
                      </button>
                    </div>
                  </div>

                  {!isParcel && (
                    <div className="form-group">
                      <label className="form-label">Table Assignment (Optional)</label>
                      <select
                        className="form-select"
                        value={tableId}
                        onChange={e => setTableId(e.target.value)}
                      >
                        <option value="">No table assigned (Walk-in counter)</option>
                        {tables.map(t => (
                          <option key={t.id} value={t.id}>
                            Table {t.tableNumber} ({t.capacity} seats)
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="form-group">
                    <label className="form-label">Special Order Notes</label>
                    <textarea
                      className="form-textarea"
                      value={notes}
                      onChange={e => setNotes(e.target.value)}
                      placeholder="Allergies, extra spices, preferred delivery time..."
                    />
                  </div>
                </div>
              )}
            </div>

            {cart.length > 0 && (
              <div className="modal-footer" style={{ flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                  <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Estimated Subtotal:</span>
                  <span className="price" style={{ fontSize: '22px' }}>
                    ₹{cartTotal.toFixed(0)}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
                  <button
                    className="btn btn-secondary"
                    onClick={() => setShowCart(false)}
                    style={{ flex: 1 }}
                  >
                    Keep Browsing
                  </button>
                  <button
                    className="btn btn-primary"
                    onClick={placeOrder}
                    disabled={ordering}
                    style={{ flex: 2 }}
                  >
                    {ordering ? 'Placing Order...' : 'Confirm & Place Order'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
