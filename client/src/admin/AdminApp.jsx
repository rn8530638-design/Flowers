import { useEffect, useState } from 'react'
import { api } from './api'
import Login from './Login'
import Dashboard from './Dashboard'
import './admin.css'

// Admin shell. Checks the session on mount, then renders Login or Dashboard.
// Keeps the URL in sync (/admin/login when logged out, /admin when in) without
// pulling in a router dependency — the brief asked to keep deps minimal.
export default function AdminApp() {
  const [user, setUser] = useState(null)
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    api.me()
      .then(({ user }) => setUser(user))
      .catch(() => setUser(null))
      .finally(() => setChecked(true))
  }, [])

  // Reflect auth state in the address bar.
  useEffect(() => {
    if (!checked) return
    const want = user ? '/admin' : '/admin/login'
    if (window.location.pathname !== want) window.history.replaceState({}, '', want)
  }, [user, checked])

  if (!checked) {
    return (
      <div className="adm">
        <div className="adm-splash"><div className="adm-spin" /></div>
      </div>
    )
  }

  return (
    <div className="adm">
      {user
        ? <Dashboard user={user} onLogout={() => setUser(null)} />
        : <Login onSuccess={setUser} />}
    </div>
  )
}
