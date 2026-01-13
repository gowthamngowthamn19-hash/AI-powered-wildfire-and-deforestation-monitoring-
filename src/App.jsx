import './App.css'
import { useState } from 'react'
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom'
import Dashboard from './pages/Dashboard.jsx'
import LiveMonitoring from './pages/LiveMonitoring.jsx'
import HistoryPage from './pages/HistoryPage.jsx'
import AnalyticsPage from './pages/AnalyticsPage.jsx'
import { login } from './api/client'

function App() {
  const [user, setUser] = useState(null)
  const [authError, setAuthError] = useState('')
  const [pending, setPending] = useState(false)
  const [form, setForm] = useState({ username: 'forest_officer', password: 'password123' })

  async function handleLogin(e) {
    e.preventDefault()
    try {
      setPending(true)
      const res = await login(form.username, form.password)
      setUser(res)
      setAuthError('')
    } catch (err) {
      setAuthError(err.message || 'Login failed')
    } finally {
      setPending(false)
    }
  }

  function handleLogout() {
    setUser(null)
    setAuthError('')
  }

  return (
    <BrowserRouter>
      <div className="app-shell">
        <aside className="sidebar">
          <div className="logo">EcoGuard</div>
          <nav className="nav-links">
            <NavLink to="/" end className="nav-link">
              Dashboard
            </NavLink>
            <NavLink to="/live" className="nav-link">
              Live Monitoring
            </NavLink>
            <NavLink to="/history" className="nav-link">
              History & Records
            </NavLink>
            <NavLink to="/analytics" className="nav-link">
              Analytics & Reports
            </NavLink>
          </nav>
        </aside>
        <main className="main-content">
          <header className="topbar">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1.25rem' }}>
              <div>
                <h1>EcoGuard: AI Forest Monitoring</h1>
                <p className="topbar-subtitle">
                  Real-time wildfire detection and long-term deforestation intelligence
                </p>
              </div>
              <div>
                {user ? (
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.85rem', marginBottom: '0.2rem' }}>
                      Logged in as <strong>{user.display_name}</strong>
                    </div>
                    <div className="chip-row" style={{ justifyContent: 'flex-end' }}>
                      {user.roles.map((r) => (
                        <span key={r} className="chip">
                          {r.replace(/_/g, ' ')}
                        </span>
                      ))}
                      <button type="button" onClick={handleLogout} style={{ marginLeft: '0.4rem' }}>
                        Logout
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.25rem' }}>
                    <div style={{ display: 'flex', gap: '0.35rem' }}>
                      <input
                        className="input"
                        style={{ minWidth: '7.5rem' }}
                        placeholder="Username"
                        value={form.username}
                        onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
                      />
                      <input
                        className="input"
                        style={{ minWidth: '7.5rem' }}
                        type="password"
                        placeholder="Password"
                        value={form.password}
                        onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                      />
                      <button type="submit" disabled={pending}>
                        {pending ? 'Signing in…' : 'Authority login'}
                      </button>
                    </div>
                    {authError && (
                      <div style={{ fontSize: '0.72rem', color: '#fca5a5' }}>{authError}</div>
                    )}
                  </form>
                )}
              </div>
            </div>
          </header>
          <section className="content">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/live" element={<LiveMonitoring />} />
              <Route path="/history" element={<HistoryPage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
            </Routes>
          </section>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App
