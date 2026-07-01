// Central configuration. Everything is overridable via environment variables so the
// same code runs locally and in any host, but sensible local defaults mean you can
// `npm install && npm run seed && npm start` with zero setup.
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export const PORT = Number(process.env.PORT) || 4000

// Secret used to sign the session JWT. CHANGE THIS in production via env var.
export const JWT_SECRET = process.env.JWT_SECRET || 'flowers-dev-secret-change-me'

// How long a login session lasts.
export const TOKEN_TTL = '7d'
export const COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000 // 7 days in ms
export const COOKIE_NAME = 'flowers_token'

export const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'db.sqlite')
export const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(__dirname, 'uploads')

// Default admin credentials used by `npm run seed` when none are supplied.
export const SEED_ADMIN_USER = process.env.ADMIN_USER || 'admin'
export const SEED_ADMIN_PASS = process.env.ADMIN_PASS || 'admin123'
