// JWT-in-httpOnly-cookie auth helpers.
import jwt from 'jsonwebtoken'
import { JWT_SECRET, TOKEN_TTL, COOKIE_NAME, COOKIE_MAX_AGE } from './config.js'

export function signToken(admin) {
  return jwt.sign({ id: admin.id, username: admin.username }, JWT_SECRET, { expiresIn: TOKEN_TTL })
}

export function setAuthCookie(res, token) {
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: COOKIE_MAX_AGE,
    path: '/',
  })
}

export function clearAuthCookie(res) {
  res.clearCookie(COOKIE_NAME, { path: '/' })
}

// Reads + verifies the cookie, attaching req.admin. Used by GET /api/auth/me too.
export function readAdmin(req) {
  const token = req.cookies?.[COOKIE_NAME]
  if (!token) return null
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch {
    return null
  }
}

// Middleware that blocks unauthenticated requests to admin-only routes.
export function requireAuth(req, res, next) {
  const admin = readAdmin(req)
  if (!admin) return res.status(401).json({ error: 'Не авторизован' })
  req.admin = admin
  next()
}
