import { useState } from 'react'
import { api } from './api'
import { TINTS } from './tints'

// Add/Edit modal for a "Почему мы" card. `feature` null = create, else edit (pre-filled).
export default function FeatureForm({ feature, onSaved, onClose }) {
  const editing = Boolean(feature)
  const [title, setTitle] = useState(feature?.title || '')
  const [description, setDescription] = useState(feature?.description || '')
  const [tint, setTint] = useState(feature?.color_tint || 'pink')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setError('')
    if (!title.trim()) { setError('Укажите заголовок'); return }

    const data = { title: title.trim(), description: description.trim(), color_tint: tint }
    setBusy(true)
    try {
      const saved = editing ? await api.updateFeature(feature.id, data) : await api.createFeature(data)
      onSaved(saved)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="adm-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <form className="adm-modal" onSubmit={submit}>
        <h3>{editing ? 'Редактировать карточку' : 'Новая карточка'}</h3>

        {error && <div className="adm-error">{error}</div>}

        <div className="adm-field">
          <label className="adm-label" htmlFor="ft-title">Заголовок</label>
          <input id="ft-title" className="adm-input" value={title} onChange={(e) => setTitle(e.target.value)} autoFocus />
        </div>

        <div className="adm-field">
          <label className="adm-label" htmlFor="ft-desc">Описание</label>
          <textarea id="ft-desc" className="adm-textarea" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>

        <div className="adm-field">
          <label className="adm-label">Цвет</label>
          <div className="adm-tints">
            {TINTS.map((t) => (
              <button
                type="button"
                key={t.value}
                className={`adm-tint${tint === t.value ? ' selected' : ''}`}
                onClick={() => setTint(t.value)}
                aria-pressed={tint === t.value}
              >
                <span className="adm-tint-dot" style={{ background: t.swatch }} />
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="adm-modal-actions">
          <button type="button" className="adm-btn adm-btn--ghost" onClick={onClose} disabled={busy}>Отмена</button>
          <button type="submit" className="adm-btn adm-btn--pink" disabled={busy}>
            {busy ? 'Сохраняем…' : 'Сохранить'}
          </button>
        </div>
      </form>
    </div>
  )
}
