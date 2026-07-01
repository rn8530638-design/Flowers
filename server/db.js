// SQLite layer (better-sqlite3 — synchronous, single file, perfect for this scale).
// The schema is created on first run, so there is no separate migration step.
import Database from 'better-sqlite3'
import { DB_PATH } from './config.js'

const db = new Database(DB_PATH)
db.pragma('journal_mode = WAL')

db.exec(`
  CREATE TABLE IF NOT EXISTS flowers (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name_ru     TEXT NOT NULL,
    name_latin  TEXT,
    description TEXT,
    fact        TEXT,
    image_url   TEXT,
    -- per-slide visual tuning the public carousel relies on. Not exposed in the
    -- admin form (kept simple per the brief); new flowers fall back to defaults.
    accent      TEXT    DEFAULT '#E79BAE',
    bg_top      TEXT    DEFAULT '#C5E0C1',
    bg_bot      TEXT    DEFAULT '#B7D7B4',
    stem_end    REAL    DEFAULT 0.86,
    sort_order  INTEGER DEFAULT 0,
    created_at  TEXT    DEFAULT (datetime('now')),
    updated_at  TEXT    DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS admins (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    username      TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL
  );

  -- "Почему мы" feature cards (text + numeral + pastel tint, no image).
  CREATE TABLE IF NOT EXISTS features (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    title       TEXT NOT NULL,
    description TEXT,
    color_tint  TEXT    DEFAULT 'pink',   -- pink | peach | lavender | blue
    sort_order  INTEGER DEFAULT 0,
    created_at  TEXT    DEFAULT (datetime('now')),
    updated_at  TEXT    DEFAULT (datetime('now'))
  );
`)

// Map a DB row to the public API shape. `sort_order` is exposed as `order`
// (which is a reserved SQL word, so we keep the column name distinct).
export function serializeFlower(row) {
  if (!row) return null
  return {
    id: row.id,
    name_ru: row.name_ru,
    name_latin: row.name_latin,
    description: row.description,
    fact: row.fact,
    image_url: row.image_url,
    accent: row.accent,
    bg_top: row.bg_top,
    bg_bot: row.bg_bot,
    stem_end: row.stem_end,
    order: row.sort_order,
  }
}

// Map a `features` row to the public API shape (sort_order → order, as above).
export function serializeFeature(row) {
  if (!row) return null
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    color_tint: row.color_tint,
    order: row.sort_order,
  }
}

export default db
