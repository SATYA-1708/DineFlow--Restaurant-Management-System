import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { orderAPI, tableAPI, userAPI, reportAPI } from '../../services/api'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts'
import {
  LayoutDashboard,
  ShoppingBag,
  Armchair,
  Users,
  DollarSign,
  TrendingUp,
  ArrowUpRight,
  Clock,
  Sparkles,
  Award
} from 'lucide-react'

const COLORS = ['#10b981', '#f97316', '#3b82f6', '#f59e0b', '#8b5cf6']

export default function Dashboard() {
  const [stats, setStats] = useState({ orders: 0, tables: 0, users: 0, revenue: 0 })
  const [topItems, setTopItems] = useState([])
  const [occupancy, setOccupancy] = useState(null)
  const [recentOrders, setRecentOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      orderAPI.getAll(),
      tableAPI.getAll(),
      userAPI.getAll(),
      reportAPI.getTopItems(),
      reportAPI.getOccupancy(),
    ])
      .then(([orders, tables, users, items, occ]) => {
        const allOrders = orders.data.data || []
        setStats({
          orders: allOrders.length,
          tables: (tables.data.data || []).length,
          users: (users.data.data || []).length,
          revenue: allOrders
            .filter(o => o.status === 'CLOSED')
            .reduce((s, o) => s + parseFloat(o.totalAmount || 0), 0)
        })
        setTopItems((items.data.data || []).slice(0, 5))
        setOccupancy(occ.data.data)
        setRecentOrders(allOrders.slice(0, 6))
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const statusBadge = s => {
    const map = {
      PENDING: 'badge-warning',
      CONFIRMED: 'badge-info',
      IN_PROGRESS: 'badge-purple',
      READY: 'badge-orange',
      SERVED: 'badge-success',
      CLOSED: 'badge-gray',
      CANCELLED: 'badge-danger'
    }
    return <span className={`badge ${map[s] || 'badge-gray'}`}>{s}</span>
  }

  const pieData = occupancy
    ? [
        { name: 'Available', value: occupancy.available },
        { name: 'Occupied', value: occupancy.occupied },
        { name: 'Reserved', value: occupancy.reserved },
      ]
    : []

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
          <LayoutDashboard size={28} style={{ color: 'var(--primary)' }} />
          Operations Dashboard
        </h1>
        <p>Live metrics, sales overview, table occupancy, and recent order stream</p>
      </div>

      {/* ── Stats Metric Cards ── */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#fff7ed', color: '#ea580c' }}>
            <ShoppingBag size={24} />
          </div>
          <div className="stat-info">
            <h3>{stats.orders}</h3>
            <p>Total Orders</p>
            <div className="stat-change up">
              <TrendingUp size={12} /> Active pipeline
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#eff6ff', color: '#3b82f6' }}>
            <Armchair size={24} />
          </div>
          <div className="stat-info">
            <h3>{stats.tables}</h3>
            <p>Configured Tables</p>
            <div className="stat-change" style={{ background: '#eff6ff', color: '#3b82f6' }}>
              Dining Floor
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#ecfdf5', color: '#10b981' }}>
            <Users size={24} />
          </div>
          <div className="stat-info">
            <h3>{stats.users}</h3>
            <p>Registered Members</p>
            <div className="stat-change up">
              <Sparkles size={12} /> Platform users
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#fef3c7', color: '#d97706' }}>
            <DollarSign size={24} />
          </div>
          <div className="stat-info">
            <h3>₹{stats.revenue.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</h3>
            <p>Settled Revenue</p>
            <div className="stat-change up">
              <ArrowUpRight size={12} /> Closed tabs
            </div>
          </div>
        </div>
      </div>

      {/* ── Charts Grid ── */}
      <div className="grid-2">
        {/* Top Selling Items */}
        <div className="card">
          <div className="card-header">
            <h2>
              <Award size={18} color="var(--primary)" />
              Top Selling Dishes
            </h2>
          </div>
          <div className="card-body">
            {topItems.length === 0 ? (
              <div className="empty-state">
                <p>No dish order data recorded yet</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={230}>
                <BarChart data={topItems} margin={{ top: 10, right: 10, left: -20, bottom: 15 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis
                    dataKey="itemName"
                    tick={{ fontSize: 11.5, fill: '#64748b' }}
                    interval={0}
                    angle={-15}
                    textAnchor="end"
                    height={45}
                  />
                  <YAxis tick={{ fontSize: 11.5, fill: '#64748b' }} />
                  <Tooltip
                    contentStyle={{
                      background: '#0f172a',
                      border: 'none',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '12px'
                    }}
                  />
                  <Bar dataKey="totalSold" fill="#f97316" radius={[6, 6, 0, 0]} name="Orders" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Table Occupancy */}
        <div className="card">
          <div className="card-header">
            <h2>
              <Armchair size={18} color="#3b82f6" />
              Dining Floor Occupancy
            </h2>
          </div>
          <div className="card-body">
            {occupancy && (
              <>
                <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
                  {[
                    { label: 'Available', val: occupancy.available, color: '#10b981', bg: '#ecfdf5' },
                    { label: 'Occupied', val: occupancy.occupied, color: '#f97316', bg: '#fff7ed' },
                    { label: 'Reserved', val: occupancy.reserved, color: '#3b82f6', bg: '#eff6ff' },
                    { label: 'Total', val: occupancy.total, color: '#475569', bg: '#f1f5f9' },
                  ].map((t, i) => (
                    <div
                      key={i}
                      style={{
                        flex: 1,
                        minWidth: '65px',
                        textAlign: 'center',
                        padding: '10px 8px',
                        borderRadius: '10px',
                        background: t.bg
                      }}
                    >
                      <div style={{ fontSize: '20px', fontWeight: 800, color: t.color }}>{t.val}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>
                        {t.label}
                      </div>
                    </div>
                  ))}
                </div>
                <ResponsiveContainer width="100%" height={170}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={48}
                      outerRadius={72}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {pieData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: '#0f172a',
                        border: 'none',
                        borderRadius: '8px',
                        color: '#fff',
                        fontSize: '12px'
                      }}
                    />
                    <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Recent Orders Table Card ── */}
      <div className="card" style={{ marginTop: '24px' }}>
        <div className="card-header">
          <h2>
            <Clock size={18} color="var(--primary)" />
            Recent Orders Stream
          </h2>
          <Link to="/admin/orders" className="btn btn-secondary btn-sm">
            View All Orders →
          </Link>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Order Ref</th>
                <th>Guest / Customer</th>
                <th>Table</th>
                <th>Total Amount</th>
                <th>Status</th>
                <th>Placed Time</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '48px' }}>
                    No recent orders placed
                  </td>
                </tr>
              ) : (
                recentOrders.map(o => (
                  <tr key={o.id}>
                    <td>
                      <span style={{ fontWeight: 700, color: 'var(--text)', fontFamily: 'monospace' }}>
                        #ORD-{String(o.id).padStart(4, '0')}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--text)' }}>
                        {o.customerName || 'Walk-in Guest'}
                      </div>
                    </td>
                    <td>
                      {o.tableNumber ? (
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
                          Table {o.tableNumber}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-light)' }}>Takeaway</span>
                      )}
                    </td>
                    <td>
                      <span className="price">₹{parseFloat(o.totalAmount || 0).toFixed(0)}</span>
                    </td>
                    <td>{statusBadge(o.status)}</td>
                    <td>
                      <span style={{ color: 'var(--text-muted)', fontSize: '12.5px' }}>
                        {o.createdAt
                          ? new Date(o.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                          : '—'}
                      </span>
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
