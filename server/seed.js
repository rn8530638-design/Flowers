// One-shot seed / bootstrap script.  Run with:  npm run seed
//
//   * Creates the first admin account (idempotent — skips if the username exists).
//     Override the defaults with env vars:  ADMIN_USER=me ADMIN_PASS=secret npm run seed
//   * Populates the four original "Цветок дня" slides if the flowers table is empty,
//     so the public carousel has content the moment the API comes up.
import bcrypt from 'bcryptjs'
import db from './db.js'
import { SEED_ADMIN_USER, SEED_ADMIN_PASS } from './config.js'

// --- admin ----------------------------------------------------------------
const existingAdmin = db.prepare('SELECT id FROM admins WHERE username = ?').get(SEED_ADMIN_USER)
if (existingAdmin) {
  console.log(`✓ Admin "${SEED_ADMIN_USER}" already exists — left unchanged.`)
} else {
  const hash = bcrypt.hashSync(SEED_ADMIN_PASS, 10)
  db.prepare('INSERT INTO admins (username, password_hash) VALUES (?, ?)').run(SEED_ADMIN_USER, hash)
  console.log(`✓ Created admin account:`)
  console.log(`    username: ${SEED_ADMIN_USER}`)
  console.log(`    password: ${SEED_ADMIN_PASS}`)
  console.log(`  (change the password by re-running with ADMIN_PASS=... after deleting the row, or via env on first seed)`)
}

// --- flowers (only if empty) ----------------------------------------------
const count = db.prepare('SELECT COUNT(*) AS n FROM flowers').get().n
if (count > 0) {
  console.log(`✓ Flowers table already has ${count} row(s) — not seeding slides.`)
} else {
  // Mirrors the original client/src/data/flowers.js, including the per-slide
  // visual tuning (accent / bg / stem_end) the carousel uses.
  const slides = [
    {
      name_ru: 'Пион', name_latin: 'Paeonia', accent: '#E79BAE', bg_top: '#BDDCBA', bg_bot: '#BAD9B6',
      stem_end: 0.795, image_url: '/assets/peony-slide.png',
      description: 'Пышный символ изобилия и нежности. Пион наполняет букет объёмом, лёгкостью и тонким, едва уловимым ароматом.',
      fact: 'В Китае пион считают королём цветов — его изображали на императорских одеждах больше тысячи лет.',
    },
    {
      name_ru: 'Роза', name_latin: 'Rosa', accent: '#E0A94F', bg_top: '#BFDFC7', bg_bot: '#B9D9BF',
      stem_end: 0.776, image_url: '/assets/rose-slide.png',
      description: 'Классика, которая никогда не выходит из моды. Тёплый персиковый оттенок дарит ощущение уюта и тепла.',
      fact: 'У розы более 30 000 сортов — от миниатюрных до садовых гигантов высотой в человеческий рост.',
    },
    {
      name_ru: 'Лизиантус', name_latin: 'Eustoma', accent: '#A88AC9', bg_top: '#C5E0C1', bg_bot: '#C1DCBD',
      stem_end: 0.833, image_url: '/assets/lisianthus-slide.png',
      description: 'Нежные волнистые лепестки напоминают розу, но выглядят ещё воздушнее и легче. Тонкая лавандовая дымка.',
      fact: 'Лизиантус стоит в вазе до трёх недель, постепенно раскрывая всё новые и новые бутоны.',
    },
    {
      name_ru: 'Незабудка', name_latin: 'Myosotis', accent: '#6FA2C4', bg_top: '#C7E3C4', bg_bot: '#B7D7B4',
      stem_end: 0.854, image_url: '/assets/forget-me-not-slide.png',
      description: 'Маленькие голубые цветы — символ памяти, верности и самых тёплых воспоминаний о близких.',
      fact: 'По легенде незабудки выросли там, где влюблённые обещали друг другу никогда не забывать.',
    },
  ]

  const insert = db.prepare(`
    INSERT INTO flowers (name_ru, name_latin, description, fact, image_url, accent, bg_top, bg_bot, stem_end, sort_order)
    VALUES (@name_ru, @name_latin, @description, @fact, @image_url, @accent, @bg_top, @bg_bot, @stem_end, @sort_order)
  `)
  db.transaction((rows) => rows.forEach((r, i) => insert.run({ ...r, sort_order: i })))(slides)
  console.log(`✓ Seeded ${slides.length} flower slides.`)
}

// --- features / "Почему мы" cards (only if empty) --------------------------
const fCount = db.prepare('SELECT COUNT(*) AS n FROM features').get().n
if (fCount > 0) {
  console.log(`✓ Features table already has ${fCount} row(s) — not seeding cards.`)
} else {
  // Mirrors the original client/src/components/Features.jsx cards, with the tint
  // that was cycling through them (blush→pink, peach, lavender, sky→blue).
  const cards = [
    { title: 'Свежесть', description: 'Цветы поступают с плантаций каждое утро — всегда живые и стойкие.', color_tint: 'pink' },
    { title: 'Доставка в день заказа', description: 'Привезём букет по городу бережно и вовремя — за пару часов.', color_tint: 'peach' },
    { title: 'Авторские букеты', description: 'Уникальные композиции под ваш повод, цвет и настроение.', color_tint: 'lavender' },
    { title: 'Внимание к деталям', description: 'Упаковка, открытка от руки и забота в каждом штрихе.', color_tint: 'blue' },
    { title: 'Экологичность', description: 'Цветы от ответственных поставщиков, минимум упаковочного пластика.', color_tint: 'pink' },
    { title: 'Гибкая оплата', description: 'Картой, переводом или при получении — без скрытых комиссий.', color_tint: 'peach' },
    { title: 'Подбор под настроение', description: 'Флорист поможет выбрать букет, даже если вы не знаете, что хотите.', color_tint: 'lavender' },
    { title: 'Долгая свежесть', description: 'В каждом заказе — средство для продления жизни цветов.', color_tint: 'blue' },
  ]
  const insertF = db.prepare('INSERT INTO features (title, description, color_tint, sort_order) VALUES (@title, @description, @color_tint, @sort_order)')
  db.transaction((rows) => rows.forEach((r, i) => insertF.run({ ...r, sort_order: i })))(cards)
  console.log(`✓ Seeded ${cards.length} feature cards.`)
}

console.log('Done.')
