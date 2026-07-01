import { useState } from 'react'
import { api } from './api'
import FlowersPanel from './FlowersPanel'
import FeaturesPanel from './FeaturesPanel'

const TABS = [
  { id: 'flowers', label: 'Цветок дня' },
  { id: 'features', label: 'Почему мы' },
]

// Protected dashboard shell: top bar + section tabs + logout.
// Each tab is a self-contained panel (own data, form, drag-to-reorder).
export default function Dashboard({ user, onLogout }) {
  const [tab, setTab] = useState('flowers')

  async function logout() {
    try { await api.logout() } catch { /* ignore */ }
    onLogout()
  }

  return (
    <>
      <header className="adm-topbar">
        <div className="adm-brand">
          <span className="mark adm-serif">Flowers</span>
          <span className="tag">Админ-панель</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <span style={{ fontSize: 14, color: '#7d8c7f' }}>{user?.username}</span>
          <button className="adm-btn adm-btn--ghost" onClick={logout}>Выйти</button>
        </div>
      </header>

      <div className="adm-tabs-bar">
        <div className="adm-tabs">
          {TABS.map((t) => (
            <button
              key={t.id}
              className={`adm-tab${tab === t.id ? ' active' : ''}`}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <main className="adm-wrap">
        {tab === 'flowers' ? <FlowersPanel /> : <FeaturesPanel />}
      </main>
    </>
  )
}
