import { useState } from 'react'
import { api } from './api'

// Simple admin login. On success it calls onSuccess(user) so the shell swaps to the dashboard.
export default function Login({ onSuccess }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      const { user } = await api.login(username.trim(), password)
      onSuccess(user)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="adm-login">
      <form className="adm-login-card" onSubmit={submit}>
        <h1 className="adm-serif">Цветок дня</h1>
        <p className="sub">Панель управления каруселью</p>

        {error && <div className="adm-error">{error}</div>}

        <div className="adm-field">
          <label className="adm-label" htmlFor="u">Логин</label>
          <input id="u" className="adm-input" autoFocus autoComplete="username"
            value={username} onChange={(e) => setUsername(e.target.value)} />
        </div>
        <div className="adm-field">
          <label className="adm-label" htmlFor="p">Пароль</label>
          <input id="p" className="adm-input" type="password" autoComplete="current-password"
            value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>

        <button className="adm-btn adm-btn--primary" style={{ width: '100%', justifyContent: 'center' }} disabled={busy}>
          {busy ? 'Входим…' : 'Войти'}
        </button>
      </form>
    </div>
  )
}
