import { useEffect, useState } from 'react'
import { fetchEvents } from '../api/client'

export default function HistoryPage() {
  const [events, setEvents] = useState([])
  const [typeFilter, setTypeFilter] = useState('')
  const [densityFilter, setDensityFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    loadEvents()
  }, [])

  async function loadEvents() {
    try {
      const data = await fetchEvents({ limit: 300 })
      setEvents(data)
      setError('')
    } catch (err) {
      setError(err.message || 'Failed to load history')
    }
  }

  const filtered = events.filter((e) => {
    if (typeFilter && e.event_type !== typeFilter) return false
    if (statusFilter && e.status !== statusFilter) return false
    if (densityFilter && e.fire_density !== densityFilter) return false
    return true
  })

  return (
    <div>
      <div className="filters-row">
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
          <option value="">All event types</option>
          <option value="wildfire">Wildfire</option>
          <option value="deforestation">Deforestation</option>
        </select>
        <select value={densityFilter} onChange={(e) => setDensityFilter(e.target.value)}>
          <option value="">Any fire density</option>
          <option value="LOW">LOW</option>
          <option value="MEDIUM">MEDIUM</option>
          <option value="HIGH">HIGH</option>
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">Any status</option>
          <option value="ACTIVE">ACTIVE</option>
          <option value="RECORDED">RECORDED</option>
        </select>
        <button onClick={loadEvents}>Refresh</button>
      </div>

      <div className="table-wrapper">
        <div className="table-header">
          <div>Type</div>
          <div>Location</div>
          <div>Fire density / Loss</div>
          <div>Area</div>
          <div>Date & time</div>
          <div>Status</div>
        </div>
        {filtered.map((e) => (
  <div className="table-row" key={e.id || e.detected_at}>
    <div className="table-cell">
      {e.event_type === 'wildfire' ? '🔥 Wildfire' : '🌲 Deforestation'}
    </div>

    <div className="table-cell">
      {e.fire_density || '--'}
    </div>

    <div className="table-cell">
      {e.forest_loss_percent ? `${e.forest_loss_percent}%` : '--'}
    </div>

    <div className="table-cell">
      {e.area_affected_sq_km
        ? `${e.area_affected_sq_km.toFixed(2)} sq km`
        : '--'}
    </div>

    <div className="table-cell">
      {new Date(e.detected_at).toLocaleString()}
    </div>

    <div className="table-cell">
      {e.status}
    </div>
  </div>
))}
      </div>

      {error && (
        <div style={{ marginTop: '0.75rem' }}>
          <div className="alert-banner">
            <div className="alert-title">Error loading history</div>
            <div className="alert-meta">{error}</div>
          </div>
        </div>
      )}
    </div>
  )
}
