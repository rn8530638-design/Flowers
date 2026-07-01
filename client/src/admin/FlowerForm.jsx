import { useEffect, useRef, useState } from 'react'
import { api } from './api'

// Add/Edit modal. `flower` null = create, otherwise edit (form pre-filled).
// Calls onSaved(savedFlower) on success, onClose() to dismiss.
export default function FlowerForm({ flower, onSaved, onClose }) {
  const editing = Boolean(flower)
  const [form, setForm] = useState({
    name_ru: flower?.name_ru || '',
    name_latin: flower?.name_latin || '',
    description: flower?.description || '',
    fact: flower?.fact || '',
  })
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(flower?.image_url || '')
  const [over, setOver] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const fileInput = useRef(null)

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  // Revoke the object URL we create for local previews (avoid leaks).
  useEffect(() => () => { if (file && preview.startsWith('blob:')) URL.revokeObjectURL(preview) }, [file, preview])

  function pickFile(f) {
    if (!f) return
    if (!f.type.startsWith('image/')) { setError('Можно загружать только изображения'); return }
    setError('')
    setFile(f)
    setPreview(URL.createObjectURL(f))
  }

  function onDrop(e) {
    e.preventDefault()
    setOver(false)
    pickFile(e.dataTransfer.files?.[0])
  }

  async function submit(e) {
    e.preventDefault()
    setError('')
    if (!form.name_ru.trim()) { setError('Укажите название цветка'); return }
    if (!editing && !file) { setError('Добавьте фотографию'); return }

    const fd = new FormData()
    fd.append('name_ru', form.name_ru.trim())
    fd.append('name_latin', form.name_latin.trim())
    fd.append('description', form.description.trim())
    fd.append('fact', form.fact.trim())
    if (file) fd.append('image', file)

    setBusy(true)
    try {
      const saved = editing ? await api.updateFlower(flower.id, fd) : await api.createFlower(fd)
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
        <h3>{editing ? 'Редактировать цветок' : 'Новый цветок'}</h3>

        {error && <div className="adm-error">{error}</div>}

        {/* image drop zone + preview */}
        <div className="adm-field">
          <label className="adm-label">Фотография</label>
          <div
            className={`adm-drop${over ? ' over' : ''}`}
            onClick={() => fileInput.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setOver(true) }}
            onDragLeave={() => setOver(false)}
            onDrop={onDrop}
          >
            {preview
              ? <img className="adm-preview" src={preview} alt="" />
              : <div className="adm-preview adm-preview--empty">🌸</div>}
            <div className="adm-drop-text">
              <b>Выберите файл</b> или перетащите сюда
              <span>{file ? file.name : 'PNG / JPG, до 8 МБ'}</span>
            </div>
            <input ref={fileInput} type="file" accept="image/*"
              onChange={(e) => pickFile(e.target.files?.[0])} />
          </div>
        </div>

        <div className="adm-field">
          <label className="adm-label" htmlFor="nr">Название (русское)</label>
          <input id="nr" className="adm-input" value={form.name_ru} onChange={set('name_ru')} autoFocus />
        </div>
        <div className="adm-field">
          <label className="adm-label" htmlFor="nl">Латинское название</label>
          <input id="nl" className="adm-input" value={form.name_latin} onChange={set('name_latin')} placeholder="напр. Paeonia" />
        </div>
        <div className="adm-field">
          <label className="adm-label" htmlFor="ds">Описание</label>
          <textarea id="ds" className="adm-textarea" rows={3} value={form.description} onChange={set('description')} />
        </div>
        <div className="adm-field">
          <label className="adm-label" htmlFor="ft">Интересный факт</label>
          <textarea id="ft" className="adm-textarea" rows={3} value={form.fact} onChange={set('fact')} />
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
