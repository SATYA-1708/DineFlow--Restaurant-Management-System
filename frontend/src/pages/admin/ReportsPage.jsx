import React, { useState, useEffect } from 'react'
import { reportAPI } from '../../services/api'
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
import toast from 'react-hot-toast'
import {
  BarChart3,
  Calendar,
  DollarSign,
  TrendingUp,
  Award,
  Armchair,
  CheckCircle2,
  AlertCircle,
  Filter
} from 'lucide-react'

const PIE_COLORS = ['#10b981', '#ef4444', '#3b82f6', '#f59e0b']

export default function ReportsPage() {
  const [revenue, setRevenue] = useState(null)
  const [topItems, setTopItems] = useState([])
  const [occupancy, setOccupancy] = useState(null)
  const [start, setStart] = useState(new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 16))
  const [end, setEnd] = useState(new Date().toISOString().slice(0, 16))
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    try {
      const [r, t, o] = await Promise.all([
        reportAPI.getRevenue(start, end),
        reportAPI.getTopItems(),
        reportAPI.getOccupancy()
      ])
      setRevenue(r.data.data)
      setTopItems(t.data.data || [])
      setOccupancy(o.data.data)
    } catch {
      toast.error('Failed to load reports')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const pieData = occupancy
    ? [
        { name: 'Available', value: occupancy.available },
        { name: 'Occupied', value: occupancy.occupied },
        { name: 'Reserved', value: occupancy.reserved },
      ].filter(d => d.value > 0)
    : []

  return (
    <div className="page-content">
      {/* ── Page Header ── */}
      <div className="flex-between page-header" style={{ alignItems: 'flex-start' }}>
        <div>
          <h1>
            <BarChart3 size={28} style={{ color: 'var(--primary)' }} />
            Business Reports & Analytics
          </h1>
          <p>Gain insights into sales performance, revenue metrics, and dining demand</p>
        </div>
      </div>

      {/* ── Date Range Filtering ── */}
      <div className="card" style={{ marginBottom: '24px', padding: '20px' }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Calendar size={13} /> Start Date & Time
            </label>
            <input
              className="form-input"
              type="datetime-local"
              value={start}
              onChange={e => setStart(e.target.value)}
              style={{ width: '220px' }}
            />
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Calendar size={13} /> End Date & Time
            </label>
            <input
              className="form-input"
              type="datetime-local"
              value={end}
              onChange={e => setEnd(e.target.value)}
              style={{ width: '220px' }}
            />
          </div>

          <button className="btn btn-primary" onClick={load} disabled={loading}>
            <Filter size={15} /> Generate Analytics
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading-page">
          <div className="spinner" />
        </div>
      ) : (
        <>
          {/* ── Revenue & Occupancy KPI Cards ── */}
          <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', marginBottom: '28px' }}>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: '#fff7ed', color: '#ea580c' }}>
                <DollarSign size={24} />
              </div>
              <div className="stat-info">
                <h3>₹{parseFloat(revenue?.totalRevenue || 0).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</h3>
                <p>Gross Period Sales</p>
                <div className="stat-change up">Settled closed tabs</div>
              </div>
            </div>

            {occupancy && (
              <>
                <div className="stat-card">
                  <div className="stat-icon" style={{ background: '#ecfdf5', color: '#10b981' }}>
                    <CheckCircle2 size={24} />
                  </div>
                  <div className="stat-info">
                    <h3 style={{ color: '#10b981' }}>{occupancy.available}</h3>
                    <p>Available Tables</p>
                    <div className="stat-change up">Ready for guests</div>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon" style={{ background: '#fef2f2', color: '#dc2626' }}>
                    <Armchair size={24} />
                  </div>
                  <div className="stat-info">
                    <h3 style={{ color: '#ef4444' }}>{occupancy.occupied}</h3>
                    <p>Occupied Tables</p>
                    <div className="stat-change" style={{ background: '#fef2f2', color: '#dc2626' }}>Active dining</div>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon" style={{ background: '#eff6ff', color: '#3b82f6' }}>
                    <TrendingUp size={24} />
                  </div>
                  <div className="stat-info">
                    <h3 style={{ color: '#3b82f6' }}>{occupancy.occupancyRate}</h3>
                    <p>Floor Utilization</p>
                    <div className="stat-change" style={{ background: '#eff6ff', color: '#3b82f6' }}>Seating ratio</div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* ── Visual Analytics ── */}
          <div className="grid-2">
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
                    <p>No dish sales recorded in period</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={topItems} layout="vertical" margin={{ left: 60, right: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis type="number" tick={{ fontSize: 11.5, fill: '#64748b' }} />
                      <YAxis type="category" dataKey="itemName" tick={{ fontSize: 11.5, fill: '#64748b' }} width={80} />
                      <Tooltip
                        contentStyle={{
                          background: '#0f172a',
                          border: 'none',
                          borderRadius: '8px',
                          color: '#fff',
                          fontSize: '12px'
                        }}
                      />
                      <Bar dataKey="totalSold" fill="#f97316" radius={[0, 6, 6, 0]} name="Orders" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <h2>
                  <Armchair size={18} color="#3b82f6" />
                  Floor Seating Breakdown
                </h2>
              </div>
              <div className="card-body">
                {pieData.length === 0 ? (
                  <div className="empty-state">
                    <p>No table status data</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={260}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        outerRadius={90}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {pieData.map((_, i) => (
                          <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
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
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
