import { useEffect, useMemo, useState } from 'react'
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet'
import { fetchEvents, fetchLatestEvent } from '../api/client'

const MAP_CENTER = [14.5, 78.5]

const densityColor = {
  LOW: '#22c55e',
  MEDIUM: '#eab308',
  HIGH: '#ef4444',
}

export default function LiveMonitoring() {
  const [events, setEvents] = useState([])
  const [latest, setLatest] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true

    async function loadInitial() {
      try {
        const [all, latestEvt] = await Promise.all([
          fetchEvents({ event_type: 'wildfire', limit: 200 }),
          fetchLatestEvent('wildfire'),
        ])
        if (mounted) {
          setEvents(all)
          setLatest(latestEvt)
        }
      } catch (err) {
        setError(err.message || 'Failed to load live events')
      }
    }

    loadInitial()

    const id = setInterval(async () => {
      try {
        const latestEvt = await fetchLatestEvent('wildfire')
        if (!mounted || !latestEvt) return
        setLatest(latestEvt)
        setEvents((prev) => {
          const exists = prev.find((e) => e.id === latestEvt.id)
          if (exists) return prev
          return [latestEvt, ...prev].slice(0, 200)
        })
      } catch {
        // ignore periodic failures
      }
    }, 7000)

    return () => {
      mounted = false
      clearInterval(id)
    }
  }, [])

  const blinkingId = latest?.id

  const fireStats = useMemo(() => {
    const stats = { LOW: 0, MEDIUM: 0, HIGH: 0 }
    events.forEach((e) => {
      if (e.fire_density && stats[e.fire_density] !== undefined) {
        stats[e.fire_density] += 1
      }
    })
    return stats
  }, [events])

  return (
    <div className="page-grid">
      <div style={{ gridColumn: 'span 8' }}>
        <div className="card map-panel">
          <MapContainer center={MAP_CENTER} zoom={6} scrollWheelZoom={true} style={{ height: '100%' }}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {events.map((e) => (
              <CircleMarker
                key={e.id}
                center={[e.latitude, e.longitude]}
                radius={e.id === blinkingId ? 10 : 7}
                pathOptions={{
                  color: densityColor[e.fire_density] || '#38bdf8',
                  fillColor: densityColor[e.fire_density] || '#38bdf8',
                  fillOpacity: 0.8,
                }}
                className={e.id === blinkingId ? 'pulse-circle' : ''}
              >
                <Popup>
                  <div style={{ fontSize: '0.8rem' }}>
                    <strong>{e.event_type.toUpperCase()}</strong>
                    <br />
                    Density: {e.fire_density || 'N/A'}
                    <br />
                    Area: {e.area_affected_sq_km ? `${e.area_affected_sq_km} sq km` : 'N/A'}
                    <br />
                    Location: {[e.village, e.town, e.district, e.state, e.country].filter(Boolean).join(', ') || '—'}
                    <br />
                    Lat/Lon: {e.latitude.toFixed(3)}, {e.longitude.toFixed(3)}
                    <br />
                    Detected: {new Date(e.detected_at).toLocaleString()}
                  </div>
                </Popup>
              </CircleMarker>
            ))}
          </MapContainer>
        </div>
        <div className="map-legend">
          <div>
            <span className="legend-dot legend-low" /> LOW
          </div>
          <div>
            <span className="legend-dot legend-medium" /> MEDIUM
          </div>
          <div>
            <span className="legend-dot legend-high" /> HIGH
          </div>
        </div>
      </div>

      <div style={{ gridColumn: 'span 4' }}>
        <div className="card">
          <div className="card-header">
            <span className="card-title">Live Fire Density</span>
          </div>
          <p style={{ fontSize: '0.85rem', color: '#e5e7eb', marginBottom: '0.4rem' }}>
            Aggregated from simulated YOLO fire detections and FIRMS-style hotspot inputs.
          </p>
          <div className="chip-row">
            <span className="chip">LOW: {fireStats.LOW}</span>
            <span className="chip">MEDIUM: {fireStats.MEDIUM}</span>
            <span className="chip">HIGH: {fireStats.HIGH}</span>
          </div>
          {latest && (
            <div className="alert-banner">
              <div className="alert-title">Demo Alert: New Wildfire Detected</div>
              <div className="alert-meta">
                ID {latest.event_id} · Density {latest.fire_density || 'N/A'} ·{' '}
                {new Date(latest.detected_at).toLocaleTimeString()}
                <br />
                Website popup only (SMS architecture optional in production).
              </div>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div style={{ gridColumn: 'span 12', marginTop: '0.75rem' }}>
          <div className="alert-banner">
            <div className="alert-title">Error loading live monitoring data</div>
            <div className="alert-meta">{error}</div>
          </div>
        </div>
      )}
    </div>
  )
}
