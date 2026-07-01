// Express API for the Flowers admin panel + public site.
//   Public:  GET  /api/flowers | GET /api/features
//   Auth:    POST /api/auth/login | POST /api/auth/logout | GET /api/auth/me
//   Admin:   POST /api/flowers  | PUT /api/flowers/:id  | DELETE /api/flowers/:id  | PUT /api/flowers/reorder
//            POST /api/features | PUT /api/features/:id | DELETE /api/features/:id | PUT /api/features/reorder
import express from 'express'
import cookieParser from 'cookie-parser'
import multer from 'multer'
import bcrypt from 'bcryptjs'
import fs from 'node:fs'
import path from 'node:path'
import { PORT, UPLOAD_DIR, COOKIE_NAME } from './config.js'
import db, { serializeFlower, serializeFeature } from './db.js'
import { signToken, setAuthCookie, clearAuthCookie, readAdmin, requireAuth } from './auth.js'

const app = express()
app.use(express.json())
app.use(cookieParser())

// ----- file uploads (multer → server/uploads) -----------------------------
fs.mkdirSync(UPLOAD_DIR, { recursive: true })
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.png'
    const safe = path.basename(file.originalname, ext).replace(/[^a-z0-9_-]+/gi, '-').slice(0, 40)
    cb(null, `${Date.now()}-${safe || 'flower'}${ext}`)
  },
})
const upload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024 }, // 8 MB
  fileFilter: (_req, file, cb) => {
    if (/^image\//.test(file.mimetype)) cb(null, true)
    else cb(new Error('Можно загружать только изображения'))
  },
})

// Serve uploaded images statically at /uploads/<filename>.
app.use('/uploads', express.static(UPLOAD_DIR))

// ----- auth ----------------------------------------------------------------
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body || {}
  if (!username || !password) return res.status(400).json({ error: 'Введите логин и пароль' })

  const admin = db.prepare('SELECT * FROM admins WHERE username = ?').get(username)
  if (!admin || !bcrypt.compareSync(password, admin.password_hash)) {
    return res.status(401).json({ error: 'Неверный логин или пароль' })
  }
  setAuthCookie(res, signToken(admin))
  res.json({ user: { id: admin.id, username: admin.username } })
})

app.post('/api/auth/logout', (req, res) => {
  clearAuthCookie(res)
  res.json({ ok: true })
})

app.get('/api/auth/me', (req, res) => {
  const admin = readAdmin(req)
  if (!admin) return res.status(401).json({ error: 'Не авторизован' })
  res.json({ user: { id: admin.id, username: admin.username } })
})

// ----- flowers -------------------------------------------------------------
const listFlowers = db.prepare('SELECT * FROM flowers ORDER BY sort_order ASC, id ASC')
const getFlower = db.prepare('SELECT * FROM flowers WHERE id = ?')

// Public: all slides in display order.
app.get('/api/flowers', (_req, res) => {
  res.json(listFlowers.all().map(serializeFlower))
})

// Pull editable text fields out of a (possibly multipart) body.
function textFields(body = {}) {
  const out = {}
  for (const key of ['name_ru', 'name_latin', 'description', 'fact', 'accent', 'bg_top', 'bg_bot']) {
    if (body[key] !== undefined) out[key] = String(body[key])
  }
  if (body.stem_end !== undefined && body.stem_end !== '') out.stem_end = Number(body.stem_end)
  return out
}

// Admin: create a slide (multipart: image file + text fields).
app.post('/api/flowers', requireAuth, upload.single('image'), (req, res) => {
  const f = textFields(req.body)
  if (!f.name_ru) return res.status(400).json({ error: 'Укажите название цветка' })

  const image_url = req.file ? `/uploads/${req.file.filename}` : (req.body.image_url || null)
  const nextOrder = (db.prepare('SELECT COALESCE(MAX(sort_order), -1) + 1 AS n FROM flowers').get()).n

  const info = db.prepare(`
    INSERT INTO flowers (name_ru, name_latin, description, fact, image_url, accent, bg_top, bg_bot, stem_end, sort_order)
    VALUES (@name_ru, @name_latin, @description, @fact, @image_url, @accent, @bg_top, @bg_bot, @stem_end, @sort_order)
  `).run({
    name_ru: f.name_ru,
    name_latin: f.name_latin ?? null,
    description: f.description ?? null,
    fact: f.fact ?? null,
    image_url,
    accent: f.accent ?? '#E79BAE',
    bg_top: f.bg_top ?? '#C5E0C1',
    bg_bot: f.bg_bot ?? '#B7D7B4',
    stem_end: f.stem_end ?? 0.86,
    sort_order: nextOrder,
  })
  res.status(201).json(serializeFlower(getFlower.get(info.lastInsertRowid)))
})

// Admin: reorder — accepts { ids: [...] } in new order.
// NOTE: must be declared before `/api/flowers/:id`, else "reorder" matches as an :id.
app.put('/api/flowers/reorder', requireAuth, (req, res) => {
  const ids = req.body?.ids
  if (!Array.isArray(ids)) return res.status(400).json({ error: 'Ожидается массив ids' })
  const stmt = db.prepare('UPDATE flowers SET sort_order = ?, updated_at = datetime(\'now\') WHERE id = ?')
  const tx = db.transaction((list) => list.forEach((id, idx) => stmt.run(idx, id)))
  tx(ids)
  res.json(listFlowers.all().map(serializeFlower))
})

// Admin: update a slide (text fields and/or a replacement image).
app.put('/api/flowers/:id', requireAuth, upload.single('image'), (req, res) => {
  const existing = getFlower.get(req.params.id)
  if (!existing) return res.status(404).json({ error: 'Цветок не найден' })

  const f = textFields(req.body)
  const merged = {
    name_ru: f.name_ru ?? existing.name_ru,
    name_latin: f.name_latin ?? existing.name_latin,
    description: f.description ?? existing.description,
    fact: f.fact ?? existing.fact,
    accent: f.accent ?? existing.accent,
    bg_top: f.bg_top ?? existing.bg_top,
    bg_bot: f.bg_bot ?? existing.bg_bot,
    stem_end: f.stem_end ?? existing.stem_end,
    image_url: req.file ? `/uploads/${req.file.filename}` : existing.image_url,
    id: existing.id,
  }

  db.prepare(`
    UPDATE flowers SET
      name_ru = @name_ru, name_latin = @name_latin, description = @description, fact = @fact,
      image_url = @image_url, accent = @accent, bg_top = @bg_top, bg_bot = @bg_bot,
      stem_end = @stem_end, updated_at = datetime('now')
    WHERE id = @id
  `).run(merged)

  // If we replaced an uploaded image, remove the now-orphaned old file.
  if (req.file && existing.image_url?.startsWith('/uploads/')) {
    fs.promises.unlink(path.join(UPLOAD_DIR, path.basename(existing.image_url))).catch(() => {})
  }
  res.json(serializeFlower(getFlower.get(existing.id)))
})

// Admin: delete a slide (and its uploaded image, if any).
app.delete('/api/flowers/:id', requireAuth, (req, res) => {
  const existing = getFlower.get(req.params.id)
  if (!existing) return res.status(404).json({ error: 'Цветок не найден' })
  db.prepare('DELETE FROM flowers WHERE id = ?').run(existing.id)
  if (existing.image_url?.startsWith('/uploads/')) {
    fs.promises.unlink(path.join(UPLOAD_DIR, path.basename(existing.image_url))).catch(() => {})
  }
  res.json({ ok: true })
})

// ----- features ("Почему мы" cards) ----------------------------------------
const listFeatures = db.prepare('SELECT * FROM features ORDER BY sort_order ASC, id ASC')
const getFeature = db.prepare('SELECT * FROM features WHERE id = ?')
const VALID_TINTS = ['pink', 'peach', 'lavender', 'blue']
const cleanTint = (t) => (VALID_TINTS.includes(t) ? t : 'pink')

// Public: all feature cards in display order.
app.get('/api/features', (_req, res) => {
  res.json(listFeatures.all().map(serializeFeature))
})

// Admin: create a card.
app.post('/api/features', requireAuth, (req, res) => {
  const { title, description, color_tint } = req.body || {}
  if (!title || !String(title).trim()) return res.status(400).json({ error: 'Укажите заголовок' })
  const nextOrder = (db.prepare('SELECT COALESCE(MAX(sort_order), -1) + 1 AS n FROM features').get()).n
  const info = db.prepare(
    'INSERT INTO features (title, description, color_tint, sort_order) VALUES (?, ?, ?, ?)'
  ).run(String(title).trim(), description != null ? String(description) : null, cleanTint(color_tint), nextOrder)
  res.status(201).json(serializeFeature(getFeature.get(info.lastInsertRowid)))
})

// Admin: reorder — declared before `/:id` so "reorder" isn't matched as an id.
app.put('/api/features/reorder', requireAuth, (req, res) => {
  const ids = req.body?.ids
  if (!Array.isArray(ids)) return res.status(400).json({ error: 'Ожидается массив ids' })
  const stmt = db.prepare('UPDATE features SET sort_order = ?, updated_at = datetime(\'now\') WHERE id = ?')
  db.transaction((list) => list.forEach((id, idx) => stmt.run(idx, id)))(ids)
  res.json(listFeatures.all().map(serializeFeature))
})

// Admin: update a card.
app.put('/api/features/:id', requireAuth, (req, res) => {
  const existing = getFeature.get(req.params.id)
  if (!existing) return res.status(404).json({ error: 'Карточка не найдена' })
  const b = req.body || {}
  const merged = {
    title: b.title !== undefined ? String(b.title).trim() : existing.title,
    description: b.description !== undefined ? String(b.description) : existing.description,
    color_tint: b.color_tint !== undefined ? cleanTint(b.color_tint) : existing.color_tint,
    id: existing.id,
  }
  if (!merged.title) return res.status(400).json({ error: 'Укажите заголовок' })
  db.prepare(
    'UPDATE features SET title=@title, description=@description, color_tint=@color_tint, updated_at=datetime(\'now\') WHERE id=@id'
  ).run(merged)
  res.json(serializeFeature(getFeature.get(existing.id)))
})

// Admin: delete a card.
app.delete('/api/features/:id', requireAuth, (req, res) => {
  const existing = getFeature.get(req.params.id)
  if (!existing) return res.status(404).json({ error: 'Карточка не найдена' })
  db.prepare('DELETE FROM features WHERE id = ?').run(existing.id)
  res.json({ ok: true })
})

// Multer / generic error handler → JSON (so the frontend always gets a message).
app.use((err, _req, res, _next) => {
  console.error(err)
  res.status(400).json({ error: err.message || 'Ошибка сервера' })
})

app.listen(PORT, () => {
  console.log(`Flowers API → http://localhost:${PORT}`)
})
