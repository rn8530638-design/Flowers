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

| username | password   |
|----------|------------|
| `admin`  | `admin123` |

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
