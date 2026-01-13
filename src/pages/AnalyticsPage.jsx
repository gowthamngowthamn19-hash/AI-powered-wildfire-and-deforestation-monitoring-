import { useEffect, useState } from 'react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { fetchFireDensityTrends, fetchForestLossTrends } from '../api/client'

export default function AnalyticsPage() {
  const [fireSeries, setFireSeries] = useState([])
  const [lossSeries, setLossSeries] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      try {
        const [fire, loss] = await Promise.all([
          fetchFireDensityTrends(30),
          fetchForestLossTrends(12),
        ])
        setFireSeries(fire.points || [])
        setLossSeries(loss.points || [])
        setError('')
      } catch (err) {
        setError(err.message || 'Failed to load analytics')
      }
    }

    load()
  }, [])

  return (
    <div className="page-grid">
      <div style={{ gridColumn: 'span 7' }}>
        <div className="card" style={{ height: 360 }}>
          <div className="card-header">
            <span className="card-title">Fire Density Trends (Last 30 days)</span>
          </div>
          <ResponsiveContainer width="100%" height="90%">
            <AreaChart data={fireSeries} margin={{ top: 12, right: 24, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorLow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorMedium" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#eab308" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#eab308" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorHigh" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.85} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(55,65,81,0.7)" />
              <XAxis dataKey="date" stroke="#9ca3af" fontSize={11} />
              <YAxis stroke="#9ca3af" fontSize={11} allowDecimals={false} />
              <Tooltip contentStyle={{ backgroundColor: '#020617', borderRadius: 8, border: '1px solid #4b5563' }} />
              <Legend />
              <Area
                type="monotone"
                dataKey="low"
                stroke="#22c55e"
                fillOpacity={1}
                fill="url(#colorLow)"
                name="LOW"
              />
              <Area
                type="monotone"
                dataKey="medium"
                stroke="#eab308"
                fillOpacity={1}
                fill="url(#colorMedium)"
                name="MEDIUM"
              />
              <Area
                type="monotone"
                dataKey="high"
                stroke="#ef4444"
                fillOpacity={1}
                fill="url(#colorHigh)"
                name="HIGH"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={{ gridColumn: 'span 5' }}>
        <div className="card" style={{ height: 360 }}>
          <div className="card-header">
            <span className="card-title">Forest Loss (Monthly, sq km)</span>
          </div>
          <ResponsiveContainer width="100%" height="90%">
            <AreaChart data={lossSeries} margin={{ top: 12, right: 24, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorLoss" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#38bdf8" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(55,65,81,0.7)" />
              <XAxis dataKey="period" stroke="#9ca3af" fontSize={11} />
              <YAxis stroke="#9ca3af" fontSize={11} />
              <Tooltip contentStyle={{ backgroundColor: '#020617', borderRadius: 8, border: '1px solid #4b5563' }} />
              <Legend />
              <Area
                type="monotone"
                dataKey="forest_loss_sq_km"
                stroke="#38bdf8"
                fillOpacity={1}
                fill="url(#colorLoss)"
                name="Forest loss"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {error && (
        <div style={{ gridColumn: 'span 12', marginTop: '0.75rem' }}>
          <div className="alert-banner">
            <div className="alert-title">Error loading analytics</div>
            <div className="alert-meta">{error}</div>
          </div>
        </div>
      )}
    </div>
  )
}
