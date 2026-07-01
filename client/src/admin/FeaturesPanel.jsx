import { useEffect, useRef, useState } from 'react'
import { api } from './api'
import { tintOf } from './tints'
import FeatureForm from './FeatureForm'

// "Почему мы" management panel — mirrors the flowers list pattern
// (grip drag-to-reorder, add/edit modal, per-card delete).
export default function FeaturesPanel() {
  const [features, setFeatures] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editing, setEditing] = useState(undefined) // undefined = closed, null = new, obj = edit
  const dragId = useRef(null)
  const [dragOverId, setDragOverId] = useState(null)

  async function load() {
    try {
      setFeatures(await api.listFeatures())
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => { load() }, [])

  function onSaved(saved) {
    setEditing(undefined)
    setFeatures((list) => {
      const idx = list.findIndex((f) => f.id === saved.id)
      if (idx === -1) return [...list, saved]
      const next = [...list]
      next[idx] = saved
      return next
    })
  }

  async function remove(f) {
    if (!confirm(`Удалить карточку «${f.title}»? Это действие необратимо.`)) return
    const prev = features
    setFeatures((l) => l.filter((x) => x.id !== f.id)) // optimistic
    try {
      await api.deleteFeature(f.id)
    } catch (err) {
      setError(err.message)
      setFeatures(prev) // rollback
    }
  }

  // ---- drag to reorder (same pattern as flowers) ----
  function onDrop(targetId) {
    const from = dragId.current
    dragId.current = null
    setDragOverId(null)
    if (from == null || from === targetId) return

    const order = [...features]
    const fromIdx = order.findIndex((f) => f.id === from)
    const toIdx = order.findIndex((f) => f.id === targetId)
    const [moved] = order.splice(fromIdx, 1)
    order.splice(toIdx, 0, moved)

    const prev = features
    setFeatures(order) // optimistic
    api.reorderFeatures(order.map((f) => f.id)).catch((err) => {
      setError(err.message)
      setFeatures(prev)
    })
  }

  return (
    <>
      <div className="adm-head">
        <div>
          <h2 className="adm-serif">Карточки «Почему мы»</h2>
          <div className="hint">Перетащите карточку за рукоятку, чтобы изменить порядок и нумерацию.</div>
        </div>
        <button className="adm-btn adm-btn--pink" onClick={() => setEditing(null)}>＋ Добавить карточку</button>
      </div>

      {error && <div className="adm-error" style={{ marginBottom: 16 }}>{error}</div>}

      {loading ? (
        <div className="adm-splash"><div className="adm-spin" /></div>
      ) : features.length === 0 ? (
        <div className="adm-empty">Пока нет ни одной карточки. Нажмите «Добавить карточку».</div>
      ) : (
        <div className="adm-list">
          {features.map((f, idx) => {
            const t = tintOf(f.color_tint)
            return (
              <div
                key={f.id}
                className={`adm-card${dragOverId === f.id ? ' drop-target' : ''}`}
                onDragOver={(e) => { e.preventDefault(); if (dragOverId !== f.id) setDragOverId(f.id) }}
                onDragLeave={() => setDragOverId((cur) => (cur === f.id ? null : cur))}
                onDrop={() => onDrop(f.id)}
              >
                <div
                  className="adm-grip"
                  title="Перетащить"
                  draggable
                  onDragStart={(e) => { dragId.current = f.id; e.dataTransfer.effectAllowed = 'move' }}
                  onDragEnd={() => { dragId.current = null; setDragOverId(null) }}
                >
                  <span /><span /><span />
                </div>

                {/* auto numeral reflects live position, like the public section */}
                <div className="adm-num adm-serif" style={{ color: t.swatch }}>
                  {String(idx + 1).padStart(2, '0')}
                </div>

                <div className="adm-card-body">
                  <div className="name adm-serif">{f.title}</div>
                  <div className="tint-row">
                    <span className="tint-dot" style={{ background: t.swatch }} />
                    {t.label}
                  </div>
                  {f.description && <div className="desc">{f.description}</div>}
                </div>

                <div className="adm-card-actions">
                  <button className="adm-btn adm-btn--ghost" onClick={() => setEditing(f)}>Изменить</button>
                  <button className="adm-btn adm-btn--danger" onClick={() => remove(f)}>Удалить</button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {editing !== undefined && (
        <FeatureForm feature={editing} onSaved={onSaved} onClose={() => setEditing(undefined)} />
      )}
    </>
  )
}
