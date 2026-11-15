import React from 'react'
import {
  FileText,
  CheckCircle2,
  ChefHat,
  Bell,
  UtensilsCrossed,
  Clock,
  Package,
  Armchair,
  XCircle
} from 'lucide-react'

const STEPS = [
  { status: 'PENDING', label: 'Order Placed', icon: FileText, desc: 'Your order has been received by front desk' },
  { status: 'CONFIRMED', label: 'Confirmed', icon: CheckCircle2, desc: 'Order confirmed by restaurant staff' },
  { status: 'IN_PROGRESS', label: 'In Kitchen', icon: ChefHat, desc: 'Our chefs are cooking your meal fresh' },
  { status: 'READY', label: 'Ready', icon: Bell, desc: 'Plated and ready for pickup / service' },
  { status: 'SERVED', label: 'Served', icon: UtensilsCrossed, desc: 'Delivered to table! Enjoy your meal' },
]

const ORDER_INDEX = {
  PENDING: 0,
  CONFIRMED: 1,
  IN_PROGRESS: 2,
  READY: 3,
  SERVED: 4,
  CLOSED: 4,
  CANCELLED: -1
}

export default function OrderProgress({ order }) {
  if (!order) return null
  const currentIdx = ORDER_INDEX[order.status] ?? 0
  const isCancelled = order.status === 'CANCELLED'

  // Compute elapsed time
  const createdMs = order.createdAt ? new Date(order.createdAt).getTime() : Date.now()
  const elapsedMin = Math.floor((Date.now() - createdMs) / 60000)
  const remaining = Math.max(0, (order.estimatedMinutes || 15) - elapsedMin)

  return (
    <div
      style={{
        background: 'linear-gradient(135deg, #fff7ed 0%, #ffffff 100%)',
        border: '1px solid #fed7aa',
        borderRadius: '14px',
        padding: '22px',
        marginTop: '16px'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '22px', flexWrap: 'wrap', gap: '8px' }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: '15px', color: 'var(--text)' }}>Live Preparation Tracker</div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '5px', marginTop: '3px' }}>
            {order.isParcel ? (
              <>
                <Package size={12} color="#2563eb" /> Takeaway / Parcel Order
              </>
            ) : order.tableNumber ? (
              <>
                <Armchair size={12} color="#1d4ed8" /> Table {order.tableNumber}
              </>
            ) : (
              'Counter Order'
            )}
          </div>
        </div>

        {!isCancelled && order.status !== 'SERVED' && order.status !== 'CLOSED' && (
          <div
            style={{
              background: 'var(--primary-gradient)',
              color: '#fff',
              borderRadius: '9999px',
              padding: '6px 14px',
              fontSize: '12px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 2px 8px rgba(234, 88, 12, 0.3)'
            }}
          >
            <Clock size={13} /> {remaining <= 0 ? 'Almost ready!' : `~${remaining} min left`}
          </div>
        )}

        {(order.status === 'SERVED' || order.status === 'CLOSED') && (
          <div
            style={{
              background: '#ecfdf5',
              color: '#059669',
              borderRadius: '9999px',
              padding: '6px 14px',
              fontSize: '12px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              border: '1px solid #a7f3d0'
            }}
          >
            <CheckCircle2 size={13} /> Order Fulfilled
          </div>
        )}
      </div>

      {isCancelled ? (
        <div style={{ textAlign: 'center', padding: '16px', color: 'var(--danger)', fontWeight: 700, fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
          <XCircle size={18} /> This order was cancelled
        </div>
      ) : (
        <div style={{ position: 'relative' }}>
          {/* Progress bar line */}
          <div
            style={{
              position: 'absolute',
              top: '20px',
              left: '20px',
              right: '20px',
              height: '3px',
              background: '#e2e8f0',
              zIndex: 0
            }}
          >
            <div
              style={{
                height: '100%',
                background: 'var(--primary-gradient)',
                width: currentIdx === 0 ? '0%' : `${(currentIdx / (STEPS.length - 1)) * 100}%`,
                transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                borderRadius: '3px'
              }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
            {STEPS.map((step, idx) => {
              const done = idx <= currentIdx
              const active = idx === currentIdx
              const Icon = step.icon
              return (
                <div key={step.status} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      background: done ? 'var(--primary-gradient)' : '#ffffff',
                      border: done ? '2px solid transparent' : '2px solid #cbd5e1',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: done ? '#ffffff' : '#94a3b8',
                      boxShadow: active ? '0 0 0 4px rgba(249, 115, 22, 0.25)' : 'none',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}
                  >
                    <Icon size={18} strokeWidth={2.2} />
                  </div>
                  <div
                    style={{
                      marginTop: '8px',
                      fontSize: '11.5px',
                      fontWeight: active ? 800 : done ? 600 : 500,
                      color: active ? 'var(--primary)' : done ? 'var(--text)' : 'var(--text-muted)',
                      textAlign: 'center',
                      lineHeight: 1.3
                    }}
                  >
                    {step.label}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Current step explanation */}
          <div
            style={{
              marginTop: '18px',
              padding: '10px 16px',
              borderRadius: '10px',
              background: 'rgba(249, 115, 22, 0.08)',
              border: '1px solid rgba(249, 115, 22, 0.2)',
              fontSize: '13px',
              color: 'var(--text)',
              textAlign: 'center',
              fontWeight: 500
            }}
          >
            {STEPS[currentIdx]?.desc || 'Processing your order...'}
          </div>
        </div>
      )}
    </div>
  )
}
