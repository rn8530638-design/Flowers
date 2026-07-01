import { forwardRef, useEffect, useRef, useState } from 'react'
import Reveal from './Reveal'

// 4 pastel tints, keyed by the `color_tint` value stored per card in the DB
// (pink / peach / lavender / blue). Each drives bg, border, numeral, stroke + deco.
const TINTS = {
  pink: { bg: '#FEF4F6', border: 'rgba(231,155,174,.28)', shadow: 'rgba(231,155,174,.08)', num: 'rgba(231,155,174,.22)', stroke: '#E79BAE', deco: 'flower' },
  peach: { bg: '#FEF8EE', border: 'rgba(224,169,79,.28)', shadow: 'rgba(224,169,79,.07)', num: 'rgba(224,169,79,.22)', stroke: '#E0A94F', deco: 'leaf' },
  lavender: { bg: '#F7F2FD', border: 'rgba(168,138,201,.28)', shadow: 'rgba(168,138,201,.08)', num: 'rgba(168,138,201,.22)', stroke: '#A88AC9', deco: 'rose' },
  blue: { bg: '#F0F7FD', border: 'rgba(111,162,196,.28)', shadow: 'rgba(111,162,196,.08)', num: 'rgba(111,162,196,.22)', stroke: '#6FA2C4', deco: 'daisy' },
}
const tintOf = (t) => TINTS[t] || TINTS.pink

// Fallback shown until GET /api/features resolves (and if it can't be reached).
// Same shape the API returns: { title, description, color_tint }.
const FALLBACK_CARDS = [
  { title: 'Свежесть', description: 'Цветы поступают с плантаций каждое утро — всегда живые и стойкие.', color_tint: 'pink' },
  { title: 'Доставка в день заказа', description: 'Привезём букет по городу бережно и вовремя — за пару часов.', color_tint: 'peach' },
  { title: 'Авторские букеты', description: 'Уникальные композиции под ваш повод, цвет и настроение.', color_tint: 'lavender' },
  { title: 'Внимание к деталям', description: 'Упаковка, открытка от руки и забота в каждом штрихе.', color_tint: 'blue' },
  { title: 'Экологичность', description: 'Цветы от ответственных поставщиков, минимум упаковочного пластика.', color_tint: 'pink' },
  { title: 'Гибкая оплата', description: 'Картой, переводом или при получении — без скрытых комиссий.', color_tint: 'peach' },
  { title: 'Подбор под настроение', description: 'Флорист поможет выбрать букет, даже если вы не знаете, что хотите.', color_tint: 'lavender' },
  { title: 'Долгая свежесть', description: 'В каждом заказе — средство для продления жизни цветов.', color_tint: 'blue' },
]

function Deco({ type, stroke, scale = 1 }) {
  const common = { opacity: 0.09 }
  const size = 144 * scale
  if (type === 'flower') {
    return (
      <svg style={{ position: 'absolute', bottom: -24 * scale, right: -24 * scale, ...common }} width={size} height={size} viewBox="0 0 110 110" fill="none" stroke={stroke} strokeWidth="1.2" strokeLinecap="round">
        {[0, 72, 144, 216, 288].map((r) => <ellipse key={r} cx="55" cy="30" rx="9" ry="20" transform={`rotate(${r} 55 55)`} />)}
        <circle cx="55" cy="55" r="7" />
      </svg>
    )
  }
  if (type === 'leaf') {
    return (
      <svg style={{ position: 'absolute', bottom: -20 * scale, right: -20 * scale, ...common }} width={size} height={size} viewBox="0 0 110 110" fill="none" stroke={stroke} strokeWidth="1.2" strokeLinecap="round">
        <path d="M70 90 Q40 70 36 40 Q60 20 80 44 Q88 68 70 90Z" />
        <path d="M70 90 Q54 65 36 40" />
        <path d="M56 52 Q62 46 72 48" />
        <path d="M48 64 Q54 56 66 56" />
      </svg>
    )
  }
  if (type === 'rose') {
    return (
      <svg style={{ position: 'absolute', bottom: -22 * scale, right: -22 * scale, ...common }} width={size} height={size} viewBox="0 0 110 110" fill="none" stroke={stroke} strokeWidth="1.2" strokeLinecap="round">
        <path d="M55 55 Q62 48 68 55 Q74 62 67 70 Q58 78 48 70 Q36 60 44 48 Q52 36 66 38 Q82 40 84 58 Q84 78 68 86 Q50 94 36 82" />
      </svg>
    )
  }
  // daisy
  return (
    <svg style={{ position: 'absolute', bottom: -22 * scale, right: -22 * scale, ...common }} width={size} height={size} viewBox="0 0 110 110" fill="none" stroke={stroke} strokeWidth="1.2" strokeLinecap="round">
      {[0, 45, 90, 135].map((r) => <ellipse key={r} cx="55" cy="34" rx="7" ry="16" transform={`rotate(${r} 55 55)`} />)}
      <circle cx="55" cy="55" r="8" />
    </svg>
  )
}

const FROSTED = 'rgba(255,255,255,.22)'
const FROSTED_HOVER = 'rgba(255,255,255,.50)'

const Features = forwardRef(function Features(props, ref) {
  const trackRef = useRef(null)
  const wrapRef = useRef(null)
  const stepRef = useRef(0)
  const [cardWidth, setCardWidth] = useState(280)
  const [canPrev, setCanPrev] = useState(false)
  const [canNext, setCanNext] = useState(true)
  const [cards, setCards] = useState(FALLBACK_CARDS)

  // Load cards from the API; keep the fallback if it fails or returns nothing.
  useEffect(() => {
    let alive = true
    fetch('/api/features')
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error('fetch failed'))))
      .then((rows) => {
        if (!alive || !Array.isArray(rows) || rows.length === 0) return
        setCards(rows)
        // let the sizing/arrow effect recompute for the new track width
        requestAnimationFrame(() => window.dispatchEvent(new Event('resize')))
      })
      .catch(() => { /* keep FALLBACK_CARDS */ })
    return () => { alive = false }
  }, [])

  useEffect(() => {
    const track = trackRef.current
    const wrap = wrapRef.current
    if (!track || !wrap) return

    const gapPx = () => parseFloat(getComputedStyle(track).columnGap || getComputedStyle(track).gap) || 20
    const cpv = () =>
      window.matchMedia('(max-width:560px)').matches ? 1 : window.matchMedia('(max-width:880px)').matches ? 2 : 4

    const updateArrows = () => {
      const x = track.scrollLeft
      const maxX = track.scrollWidth - track.clientWidth
      setCanPrev(x > 4)
      setCanNext(x < maxX - 4)
    }

    const size = () => {
      const g = gapPx()
      const per = cpv()
      let w
      if (per === 1) {
        // ~1.5 cards per view: first card fully visible, ~half of the next peeks
        // in at the right edge as a scroll affordance.
        w = (wrap.clientWidth - g) / 1.5
        w = Math.max(180, Math.min(w, 260))
      } else {
        w = (wrap.clientWidth - g * (per - 1)) / per
        w = Math.max(240, w)
      }
      setCardWidth(w)
      stepRef.current = w + g
      updateArrows()
    }

    size()
    track.scrollLeft = 0
    updateArrows()
    window.addEventListener('resize', size)

    // arrow state on scroll (rAF throttled)
    let ticking = false
    const onScroll = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(() => { updateArrows(); ticking = false })
    }
    track.addEventListener('scroll', onScroll, { passive: true })

    // drag / swipe with momentum easing
    let down = false, moved = false, startX = 0, startScroll = 0, lastX = 0, lastT = 0, vel = 0, raf = 0
    const onDown = (e) => {
      down = true; moved = false; startX = e.clientX; startScroll = track.scrollLeft
      lastX = e.clientX; lastT = performance.now(); vel = 0; cancelAnimationFrame(raf)
      track.style.cursor = 'grabbing'
      try { track.setPointerCapture(e.pointerId) } catch (_) {}
    }
    const onMove = (e) => {
      if (!down) return
      const dx = e.clientX - startX
      if (Math.abs(dx) > 3) moved = true
      track.scrollLeft = startScroll - dx
      const now = performance.now()
      const dt = (now - lastT) || 16
      vel = (e.clientX - lastX) / dt
      lastX = e.clientX; lastT = now
    }
    const onUp = () => {
      if (!down) return
      down = false; track.style.cursor = 'grab'
      let v = vel * 16
      const decay = () => {
        if (Math.abs(v) < 0.5) return
        track.scrollLeft -= v; v *= 0.93
        raf = requestAnimationFrame(decay)
      }
      decay()
    }
    const onClickCapture = (e) => { if (moved) { e.preventDefault(); e.stopPropagation() } }
    track.addEventListener('pointerdown', onDown)
    track.addEventListener('pointermove', onMove)
    track.addEventListener('pointerup', onUp)
    track.addEventListener('pointercancel', onUp)
    track.addEventListener('pointerleave', onUp)
    track.addEventListener('click', onClickCapture, true)
    const noDrag = (e) => e.preventDefault()
    const draggables = track.querySelectorAll('a, img, svg')
    draggables.forEach((el) => el.addEventListener('dragstart', noDrag))

    return () => {
      window.removeEventListener('resize', size)
      track.removeEventListener('scroll', onScroll)
      track.removeEventListener('pointerdown', onDown)
      track.removeEventListener('pointermove', onMove)
      track.removeEventListener('pointerup', onUp)
      track.removeEventListener('pointercancel', onUp)
      track.removeEventListener('pointerleave', onUp)
      track.removeEventListener('click', onClickCapture, true)
      draggables.forEach((el) => el.removeEventListener('dragstart', noDrag))
    }
  }, [])

  const glide = (dir) => {
    const track = trackRef.current
    if (!track) return
    track.scrollTo({ left: track.scrollLeft + dir * stepRef.current, behavior: 'smooth' })
  }

  const navBtn = (enabled) => ({
    width: 68, height: 68, borderRadius: '50%', border: '1px solid rgba(255,255,255,.36)',
    background: FROSTED, backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
    boxShadow: '0 4px 18px rgba(46,61,50,.08)', cursor: 'pointer', display: 'flex',
    alignItems: 'center', justifyContent: 'center', color: '#2E3D32',
    transition: 'background .25s,transform .25s,box-shadow .25s,opacity .25s',
    opacity: enabled ? 1 : 0.28, pointerEvents: enabled ? 'auto' : 'none',
  })

  const hoverIn = (e, enabled) => {
    if (!enabled) return
    e.currentTarget.style.background = FROSTED_HOVER
    e.currentTarget.style.transform = 'translateY(-2px)'
    e.currentTarget.style.boxShadow = '0 8px 24px rgba(46,61,50,.14)'
  }
  const hoverOut = (e) => {
    e.currentTarget.style.background = FROSTED
    e.currentTarget.style.transform = 'none'
    e.currentTarget.style.boxShadow = '0 4px 18px rgba(46,61,50,.08)'
  }

  return (
    <section id="features" ref={ref} style={{ padding: 'clamp(126px,18vh,225px) 0 clamp(270px,26vh,390px)', background: '#EAF4FF', position: 'relative', overflow: 'hidden' }}>
      {/* bottom transition: features light blue → footer dark green */}
      <div
        style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: 'clamp(330px,34vh,540px)', zIndex: 1, pointerEvents: 'none',
          background: 'linear-gradient(180deg,rgba(234,244,255,0) 0%,rgba(218,236,248,0.10) 14%,rgba(190,220,225,0.28) 28%,rgba(150,195,200,0.48) 42%,rgba(105,158,160,0.66) 56%,rgba(68,108,98,0.82) 70%,rgba(46,68,55,0.93) 83%,rgba(46,61,50,0.98) 93%,#2E3D32 100%)',
        }}
      />

      <div style={{ position: 'relative', zIndex: 2, maxWidth: 1600, margin: '0 auto', padding: '0 clamp(20px,5vw,56px)' }}>
        <Reveal style={{ textAlign: 'center', marginBottom: 'clamp(54px,7vh,84px)' }}>
          <span style={{ display: 'inline-block', fontSize: 17, fontWeight: 600, letterSpacing: '.28em', textTransform: 'uppercase', color: '#7f9bb5', marginBottom: 20 }}>
            Почему мы
          </span>
          <h2 style={{ margin: 0, fontFamily: "'Cormorant Garamond',serif", fontWeight: 600, fontSize: 'clamp(44px,5vw,80px)', lineHeight: 1, color: '#2E3D32' }}>
            Забота в каждом букете
          </h2>
        </Reveal>

        <div ref={wrapRef} style={{ position: 'relative' }}>
          <div
            ref={trackRef}
            className="f-track"
            style={{ display: 'flex', gap: 'clamp(22px,2.2vw,34px)', overflowX: 'auto', cursor: 'grab', scrollBehavior: 'auto', padding: '6px 2px 12px', WebkitOverflowScrolling: 'touch' }}
          >
            {cards.map((c, idx) => {
              const th = tintOf(c.color_tint)
              const num = String(idx + 1).padStart(2, '0')
              const compact = cardWidth < 340 // narrow phone cards get tighter spacing/type
              const ultra = cardWidth < 260 // ~1.5-per-view mobile cards: scale down further still
              return (
                <div
                  key={c.id ?? idx}
                  style={{
                    position: 'relative', overflow: 'hidden', background: th.bg, borderRadius: ultra ? 22 : 34,
                    padding: ultra ? '26px 20px 30px' : compact ? '40px 26px 46px' : '54px 40px 64px',
                    border: `1px solid ${th.border}`, boxShadow: `0 12px 38px ${th.shadow}`,
                    flex: `0 0 ${cardWidth}px`, width: cardWidth, userSelect: 'none',
                  }}
                >
                  <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: ultra ? 44 : compact ? 68 : 90, fontWeight: 500, lineHeight: 1, color: th.num, marginBottom: ultra ? 10 : compact ? 16 : 24, letterSpacing: '-.01em' }}>
                    {num}
                  </div>
                  <h3 style={{ margin: ultra ? '0 0 8px' : '0 0 16px', fontFamily: "'Cormorant Garamond',serif", fontWeight: 600, fontSize: ultra ? 20 : compact ? 27 : 31, color: '#2E3D32' }}>{c.title}</h3>
                  <p style={{ margin: 0, fontSize: ultra ? 13.5 : compact ? 16 : 18, lineHeight: ultra ? 1.5 : 1.72, color: '#5d6e60' }}>{c.description}</p>
                  <Deco type={th.deco} stroke={th.stroke} scale={ultra ? 0.6 : 1} />
                </div>
              )
            })}
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 18, marginTop: 'clamp(40px,5vh,56px)' }}>
            <button aria-label="Назад" onClick={() => glide(-1)} onMouseEnter={(e) => hoverIn(e, canPrev)} onMouseLeave={hoverOut} style={navBtn(canPrev)}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M15 5l-7 7 7 7" /></svg>
            </button>
            <button aria-label="Вперёд" onClick={() => glide(1)} onMouseEnter={(e) => hoverIn(e, canNext)} onMouseLeave={hoverOut} style={navBtn(canNext)}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  )
})

export default Features
