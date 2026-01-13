import { useEffect, useState } from 'react'
import { fetchSummary } from '../api/client'

function SummaryCard({ title, value, badge, badgeClass, chips }) {
  return (
    <div className="card">
      <div className="card-header">
        <span className="card-title">{title}</span>
        {badge && <span className={`badge ${badgeClass}`}>{badge}</span>}
      </div>
      <div className="card-value">{value}</div>
      {chips && chips.length > 0 && (
        <div className="chip-row">
          {chips.map((chip) => (
            <span key={chip} className="chip">
              {chip}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

export default function Dashboard() {
  const [summary, setSummary] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true
    fetchSummary()
      .then((data) => {
        if (mounted) {
          setSummary(data)
          setError('')
        }
      })
      .catch((err) => setError(err.message || 'Failed to load summary'))

    const id = setInterval(() => {
      fetchSummary().then((data) => mounted && setSummary(data)).catch(() => {})
    }, 15000)

    return () => {
      mounted = false
      clearInterval(id)
    }
  }, [])

  const last = summary?.last_event

  return (
    <div className="page-grid" style={{ gridTemplateRows: 'auto auto' }}>
      <div style={{ gridColumn: 'span 8' }}>
        <div className="page-grid">
          <div style={{ gridColumn: 'span 4' }}>
            <SummaryCard
              title="Live Wildfire Count"
              value={summary ? summary.live_wildfire_count : '—'}
              badge="Real-time"
              badgeClass="badge-red"
              chips={["Active incidents monitored", "Multi-frame AI validation (simulated)"]}
            />
          </div>
          <div style={{ gridColumn: 'span 4' }}>
            <SummaryCard
              title="Deforestation Events (Recorded)"
              value={summary ? summary.active_deforestation_events : '—'}
              badge="Long-term"
              badgeClass="badge-amber"
              chips={["Satellite-driven change detection (simulated)", "Forest → non-forest transitions"]}
            />
          </div>
          <div style={{ gridColumn: 'span 4' }}>
            <SummaryCard
              title="Total Area Burnt"
              value={summary ? `${summary.total_area_burnt_sq_km.toFixed(2)} sq km` : '—'}
              badge="Cumulative"
              badgeClass="badge-green"
              chips={["Brightness-based intensity (simulated)", "Drone + FIRMS fusion ready"]}
            />
          </div>
        </div>
      </div>

      <div style={{ gridColumn: 'span 4' }}>
        <div className="card">
          <div className="card-header">
            <span className="card-title">Last Detected Event</span>
          </div>
          {last ? (
            <div>
              <div className="chip-row">
                <span className="chip">ID: {last.event_id}</span>
                <span className="chip">Type: {last.event_type}</span>
                {last.fire_density && <span className="chip">Density: {last.fire_density}</span>}
                {last.forest_loss_percent && (
                  <span className="chip">Loss: {last.forest_loss_percent}%</span>
                )}
              </div>
              <p style={{ marginTop: '0.6rem', fontSize: '0.8rem', color: '#e5e7eb' }}>
                <strong>Location:</strong>{' '}
                {[last.village, last.town, last.district, last.state, last.country]
                  .filter(Boolean)
                  .join(', ') || '—'}{' '}
                <span style={{ color: '#9ca3af' }}>
                  ({last.latitude.toFixed(3)}, {last.longitude.toFixed(3)})
                </span>
                <br />
                <strong>Detected:</strong> {new Date(last.detected_at).toLocaleString()}
                <br />
                <strong>Status:</strong> {last.status}
              </p>
            </div>
          ) : (
            <p style={{ fontSize: '0.85rem', color: '#9ca3af' }}>Waiting for first simulated event…</p>
          )}
        </div>
      </div>

      {error && (
        <div style={{ gridColumn: 'span 12', marginTop: '0.75rem' }}>
          <div className="alert-banner">
            <div className="alert-title">Backend connection error</div>
            <div className="alert-meta">{error}</div>
          </div>
        </div>
      )}
    </div>
  )
}
