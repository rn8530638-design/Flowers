// Tiny fetch wrapper for the admin panel. Same-origin (Vite proxies /api → backend),
// so the httpOnly session cookie rides along automatically with credentials:'include'.

async function handle(res) {
  let body = null
  try { body = await res.json() } catch { /* no body */ }
  if (!res.ok) throw new Error(body?.error || `Ошибка ${res.status}`)
  return body
}

const json = (method, url, data) =>
  fetch(url, {
    method,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: data === undefined ? undefined : JSON.stringify(data),
  }).then(handle)

const form = (method, url, formData) =>
  fetch(url, { method, credentials: 'include', body: formData }).then(handle)

export const api = {
  // auth
  me: () => json('GET', '/api/auth/me'),
  login: (username, password) => json('POST', '/api/auth/login', { username, password }),
  logout: () => json('POST', '/api/auth/logout'),

  // flowers
  listFlowers: () => json('GET', '/api/flowers'),
  createFlower: (formData) => form('POST', '/api/flowers', formData),
  updateFlower: (id, formData) => form('PUT', `/api/flowers/${id}`, formData),
  deleteFlower: (id) => json('DELETE', `/api/flowers/${id}`),
  reorder: (ids) => json('PUT', '/api/flowers/reorder', { ids }),

  // features ("Почему мы" cards)
  listFeatures: () => json('GET', '/api/features'),
  createFeature: (data) => json('POST', '/api/features', data),
  updateFeature: (id, data) => json('PUT', `/api/features/${id}`, data),
  deleteFeature: (id) => json('DELETE', `/api/features/${id}`),
  reorderFeatures: (ids) => json('PUT', '/api/features/reorder', { ids }),
}
