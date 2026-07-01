import { useEffect, useRef, useState } from 'react'
import { api } from './api'
import FlowerForm from './FlowerForm'

// "Цветок дня" management panel: list flowers, add/edit/delete, drag-to-reorder.
export default function FlowersPanel() {
  const [flowers, setFlowers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editing, setEditing] = useState(undefined) // undefined = closed, null = new, obj = edit
  const dragId = useRef(null)
  const [dragOverId, setDragOverId] = useState(null)

  async function load() {
    try {
      setFlowers(await api.listFlowers())
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => { load() }, [])

  function onSaved(saved) {
    setEditing(undefined)
    setFlowers((list) => {
      const idx = list.findIndex((f) => f.id === saved.id)
      if (idx === -1) return [...list, saved]
      const next = [...list]
      next[idx] = saved
      return next
    })
  }

  async function remove(f) {
    if (!confirm(`Удалить «${f.name_ru}»? Это действие необратимо.`)) return
    const prev = flowers
    setFlowers((l) => l.filter((x) => x.id !== f.id)) // optimistic
    try {
      await api.deleteFlower(f.id)
    } catch (err) {
      setError(err.message)
      setFlowers(prev) // rollback
    }
  }

  // ---- drag to reorder ----
  function onDrop(targetId) {
    const from = dragId.current
    dragId.current = null
    setDragOverId(null)
    if (from == null || from === targetId) return

    const order = [...flowers]
    const fromIdx = order.findIndex((f) => f.id === from)
    const toIdx = order.findIndex((f) => f.id === targetId)
    const [moved] = order.splice(fromIdx, 1)
    order.splice(toIdx, 0, moved)

    const prev = flowers
    setFlowers(order) // optimistic
    api.reorder(order.map((f) => f.id)).catch((err) => {
      setError(err.message)
      setFlowers(prev)
    })
  }

  return (
    <>
      <div className="adm-head">
        <div>
          <h2 className="adm-serif">Слайды карусели</h2>
          <div className="hint">Перетащите карточку за рукоятку, чтобы изменить порядок показа.</div>
        </div>
        <button className="adm-btn adm-btn--pink" onClick={() => setEditing(null)}>＋ Добавить цветок</button>
      </div>

      {error && <div className="adm-error" style={{ marginBottom: 16 }}>{error}</div>}

      {loading ? (
        <div className="adm-splash"><div className="adm-spin" /></div>
      ) : flowers.length === 0 ? (
        <div className="adm-empty">Пока нет ни одного слайда. Нажмите «Добавить цветок».</div>
      ) : (
        <div className="adm-list">
          {flowers.map((f) => (
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

              {f.image_url
                ? <img className="adm-thumb" src={f.image_url} alt={f.name_ru} />
                : <div className="adm-thumb adm-thumb--empty">нет фото</div>}

              <div className="adm-card-body">
                <div className="name adm-serif">{f.name_ru}</div>
                {f.name_latin && <div className="latin">{f.name_latin}</div>}
                {f.description && <div className="desc">{f.description}</div>}
              </div>

              <div className="adm-card-actions">
                <button className="adm-btn adm-btn--ghost" onClick={() => setEditing(f)}>Изменить</button>
                <button className="adm-btn adm-btn--danger" onClick={() => remove(f)}>Удалить</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing !== undefined && (
        <FlowerForm flower={editing} onSaved={onSaved} onClose={() => setEditing(undefined)} />
      )}
    </>
  )
}
