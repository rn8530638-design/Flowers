# Flowers

Public marketing site (React + Vite) with an admin panel for managing the **«Цветок дня»**
carousel. The carousel content (photo, name, latin name, description, interesting fact, order)
is stored in SQLite and edited through a small Express-backed admin UI.

```
Flowers/
├── client/                 # React + Vite front-end (public site + /admin panel)
│   └── src/admin/          # admin panel components
└── server/                 # Express + SQLite REST API
    ├── index.js            # routes
    ├── db.js               # SQLite schema (better-sqlite3)
    ├── seed.js             # create first admin + seed initial slides
    └── uploads/            # uploaded flower photos (git-ignored)
```

## Running it

You need **two** processes: the API (`server/`) and the Vite dev server (`client/`).
Vite proxies `/api` and `/uploads` to the backend, so everything stays same-origin and the
auth cookie just works.

### 1. Backend (Express + SQLite)

```bash
cd server
npm install
npm run seed     # creates the admin account + seeds the 4 original slides (run once)
npm start        # → http://localhost:4000
```

`npm run seed` is idempotent: it won't overwrite an existing admin or re-seed slides.

**First admin user** — created by the seed script. Defaults:

| username | password |
|----------|----------|
| `admin`  | `admin`  |

Override them on the first seed via env vars:

```bash
ADMIN_USER=yourname ADMIN_PASS=your-strong-password npm run seed
```

(For production, also set `JWT_SECRET` and run with `NODE_ENV=production` so the cookie is `secure`.)

### 2. Front-end (React + Vite)

```bash
cd client
npm install
npm run dev      # → http://localhost:5173
```

- Public site: <http://localhost:5173/>
- Admin panel: <http://localhost:5173/admin>  (redirects to `/admin/login` when logged out)

## Production deploy

The app runs as a **single Node process**: the Express server serves the built React
bundle, the `/api/*` routes, and `/uploads/*` all from one port. Works on any standard
Node.js host (a VPS, Railway, Render, etc.) — nothing platform-specific is required.

```bash
npm install          # installs client/ and server/ deps (root postinstall hook)
npm run build         # builds client/ → client/dist
npm run seed          # creates the first admin account (once) — see below
npm start              # NODE_ENV=production node server/index.js
```

Set `NODE_ENV=production` (most hosts do this automatically) so the server (a) marks the
auth cookie `secure` and (b) serves `client/dist` + falls back to `index.html` for
`/admin` and any client-side route. Without it, the server only exposes the API —
useful for local dev where Vite's dev server handles the frontend instead.

### Environment variables

Copy `server/.env.example` to `server/.env` and adjust, or set these directly in your
host's environment settings (no `.env` file needed either way):

| Var           | Default                        | Notes                                   |
|---------------|---------------------------------|------------------------------------------|
| `NODE_ENV`    | `development`                   | set to `production` for a real deploy    |
| `PORT`        | `4000`                          | port Express listens on                  |
| `JWT_SECRET`  | dev placeholder                 | **change this** — signs the login session |
| `DB_PATH`     | `server/db.sqlite`               | auto-created on first run if missing      |
| `UPLOAD_DIR`  | `server/uploads`                 | auto-created on first run if missing      |
| `ADMIN_USER`  | `admin`                          | used by `npm run seed`                    |
| `ADMIN_PASS`  | `admin`                          | used by `npm run seed` — change for real use |

The SQLite file and uploads folder are git-ignored; a fresh clone + `npm run seed` +
`npm start` recreates everything the app needs.

### Hosting notes

- **Native module**: `better-sqlite3` compiles a native binding — install (`npm install`)
  on the target platform/architecture rather than copying `node_modules` from your machine.
- **Persistent disk**: the SQLite file and `server/uploads/` must live on storage that
  survives restarts/redeploys. Most PaaS platforms wipe the local filesystem on each
  deploy — if so, point `DB_PATH`/`UPLOAD_DIR` at a mounted persistent volume (Railway
  volumes, Render disks, etc.), or attach one before going live.
- **HTTPS**: the auth cookie is marked `secure` in production, so the site must be served
  over HTTPS (or `localhost`, which browsers treat as secure). Any host that terminates
  TLS at the edge (Railway, Render, most VPS + reverse proxy setups) satisfies this.

## Admin panel

Log in at `/admin/login`. The dashboard has two tabs:

**Цветок дня** — the carousel slides:
- **Add** a flower — upload a photo (click or drag & drop, with live preview) and fill in
  name / latin name / description / interesting fact.
- **Edit** a flower — same form, pre-filled; replace the photo or just update text.
- **Delete** a flower.
- **Reorder** — drag a card by its grip handle; the new order is saved to the carousel.

**Почему мы** — the feature cards:
- **Add / Edit** a card — заголовок, описание, and a colour tint
  (Розовый / Персиковый / Лавандовый / Голубой).
- **Delete** a card.
- **Reorder** — drag by the grip handle; numerals (01, 02, …) follow the new order.

Plus a **Log out** button. Changes are immediately reflected on the public site — the
**«Цветок дня»** carousel loads from `GET /api/flowers` and the **«Почему мы»** section
from `GET /api/features` on page load.

## API

| Method & path             | Auth  | Purpose                                          |
|---------------------------|-------|--------------------------------------------------|
| `POST /api/auth/login`    | –     | `{ username, password }` → sets httpOnly cookie  |
| `POST /api/auth/logout`   | –     | clears the cookie                                |
| `GET  /api/auth/me`       | –     | current session (401 if none)                    |
| `GET  /api/flowers`       | –     | all slides in display order                      |
| `POST /api/flowers`       | admin | create (multipart: `image` + text fields)        |
| `PUT  /api/flowers/:id`   | admin | update text and/or replace image                 |
| `DELETE /api/flowers/:id` | admin | delete a slide                                   |
| `PUT  /api/flowers/reorder` | admin | `{ ids: [...] }` in new order                   |
| `GET  /api/features`      | –     | all "Почему мы" cards in display order           |
| `POST /api/features`      | admin | create `{ title, description, color_tint }`      |
| `PUT  /api/features/:id`  | admin | update a card                                    |
| `DELETE /api/features/:id`| admin | delete a card                                    |
| `PUT  /api/features/reorder` | admin | `{ ids: [...] }` in new order                 |

`color_tint` is one of `pink` / `peach` / `lavender` / `blue` — it maps to the pastel
background, numeral and corner-decoration colour used by the public cards. The numerals
(01, 02, …) are derived from position, so reordering renumbers them automatically.

Auth is a single admin account: password hashed with bcrypt, session as a JWT in an
httpOnly cookie. Uploaded photos live in `server/uploads/` and are served at `/uploads/...`;
only the path is stored in the DB.
