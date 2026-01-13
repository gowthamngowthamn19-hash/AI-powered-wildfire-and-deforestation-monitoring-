const API_BASE = 'http://localhost:8000'

async function handleResponse(res) {
  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || `Request failed with ${res.status}`)
  }
  return res.json()
}

export async function fetchSummary() {
  const res = await fetch(`${API_BASE}/api/summary`)
  return handleResponse(res)
}

export async function fetchLatestEvent(eventType) {
  const url = new URL(`${API_BASE}/api/events/latest`)
  if (eventType) url.searchParams.set('event_type', eventType)
  const res = await fetch(url)
  return handleResponse(res)
}

export async function fetchEvents(params = {}) {
  const url = new URL(`${API_BASE}/api/events`)
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, value)
    }
  })
  const res = await fetch(url)
  return handleResponse(res)
}

export async function fetchFireDensityTrends(days = 30) {
  const url = new URL(`${API_BASE}/api/analytics/fire-density-trends`)
  url.searchParams.set('days', days)
  const res = await fetch(url)
  return handleResponse(res)
}

export async function fetchForestLossTrends(months = 12) {
  const url = new URL(`${API_BASE}/api/analytics/forest-loss-trends`)
  url.searchParams.set('months', months)
  const res = await fetch(url)
  return handleResponse(res)
}

export async function login(username, password) {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  })
  return handleResponse(res)
}
