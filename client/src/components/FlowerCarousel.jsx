import { forwardRef, useEffect, useRef, useState } from 'react'
import Reveal from './Reveal'
import { useMediaQuery } from '../hooks/useMediaQuery'
import { initialFlowersData } from '../data/flowers'

// Map an /api/flowers row to the flat shape this component renders. The static
// initialFlowersData already uses this shape, so it stays as a graceful fallback
// while the request is in flight or if the backend is unavailable.
function fromApi(row) {
  return {
    name: row.name_ru,
    latin: row.name_latin,
    desc: row.description,
    fact: row.fact,
    img: row.image_url,
    accent: row.accent || '#E79BAE',
    bgTop: row.bg_top || '#C5E0C1',
    bgBot: row.bg_bot || '#B7D7B4',
    stemEnd: row.stem_end ?? 0.86,
  }
}

const FlowerCarousel = forwardRef(function FlowerCarousel(props, ref) {
  // Fetched from GET /api/flowers on mount; initialFlowersData is the fallback
  // shown until the data arrives (and if the API can't be reached).
  const [flowers, setFlowers] = useState(initialFlowersData)
  const [i, setI] = useState(0)
  const [bgOpacity, setBgOpacity] = useState(1)
  const animating = useRef(false)
  const isTablet = useMediaQuery('(max-width:880px)')

  // Touch swipe (mobile): horizontal drag past a threshold flips the slide, while
  // vertical drags fall through to normal page scrolling.
  const touchStart = useRef(null)
  const onTouchStart = (e) => { const t = e.touches[0]; touchStart.current = { x: t.clientX, y: t.clientY } }
  const onTouchEnd = (e) => {
    if (!touchStart.current) return
    const t = e.changedTouches[0]
    const dx = t.clientX - touchStart.current.x
    const dy = t.clientY - touchStart.current.y
    touchStart.current = null
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.3) go(dx < 0 ? i + 1 : i - 1)
  }

  useEffect(() => {
    let alive = true
    fetch('/api/flowers')
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error('fetch failed'))))
      .then((rows) => {
        if (!alive || !Array.isArray(rows) || rows.length === 0) return
        setFlowers(rows.map(fromApi))
        setI(0)
      })
      .catch(() => { /* keep the static fallback */ })
    return () => { alive = false }
  }, [])

  const go = (n) => {
    const t = flowers.length
    const target = ((n % t) + t) % t
    if (target === i || animating.current) return
    animating.current = true
    setBgOpacity(0) // fade the background photo out (.42s ease)
    setTimeout(() => setI(target), 300) // swap content/photo at the crossfade midpoint
  }

  // After the index swaps, fade the new photo back in and release the lock.
  useEffect(() => {
    const raf = requestAnimationFrame(() => setBgOpacity(1))
    const id = setTimeout(() => { animating.current = false }, 320)
    return () => { cancelAnimationFrame(raf); clearTimeout(id) }
  }, [i])

  const cur = flowers[i]
  const curNum = String(i + 1).padStart(2, '0')
  const total = String(flowers.length).padStart(2, '0')

  // Section backdrop = the photo's own green sampled top→bottom, so the background is an exact
  // continuation of the photo's vertical gradient (no visible seam where the cropped photo ends).
  const bgTop = cur.bgTop || '#C5E0C1'
  const bgBot = cur.bgBot || '#B7D7B4'
  // Ramp to the photo's *bottom* green by ~60% and hold it, so wherever the cropped photo's
  // bottom edge lands (it rides up/down with viewport aspect) the backdrop underneath already
  // equals the photo's bottom colour — no tonal step at the crop edge.
  const bgGradient = `linear-gradient(180deg,${bgTop} 0%,${bgBot} 60%,${bgBot} 100%)`

  const arrowBtn = {
    position: 'absolute', top: '50%', transform: 'translateY(-50%)', zIndex: 3,
    width: 80, height: 80, borderRadius: '50%', border: '1px solid rgba(255,255,255,.5)',
    background: 'rgba(255,255,255,.22)',
    backdropFilter: 'blur(12px) saturate(1.2)', WebkitBackdropFilter: 'blur(12px) saturate(1.2)',
    boxShadow: '0 10px 28px rgba(46,61,50,.18)', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'transform .25s,background .25s',
  }

  return (
    <section id="assortiment" ref={ref} style={{ padding: 'clamp(126px,18vh,225px) 0', position: 'relative', overflow: 'hidden', background: bgGradient, transition: 'background .42s ease' }}>
      {/* flower photo — crossfades between slides.
          ROOT-CAUSE NOTE: the source PNGs have the stem chopped flat partway down with bare
          green padding below it (stem ends at cur.stemEnd of the 1376×1120 image). So the
          "abrupt cut" is in the pixels, not a layout clip. We give the image its own
          top-anchored box whose aspect-ratio crops the image to just below the stem-end, with
          `cover` — trimming ONLY the empty green padding (never a stem), so the stem ends with
          a small natural margin instead of floating above a large gap. The box sits over the
          matching per-slide green gradient base (cur.bgTop→cur.bgBot), so the crop edge is invisible. */}
      {!isTablet && (
      <div
        id="flowerStage"
        aria-label={cur.name}
        style={{
          position: 'absolute', top: 0, left: 0, right: 0, zIndex: 0,
          // crop to ~5.5% below the stem-end; aspect = imageWidth / (imageHeight * cropFraction)
          aspectRatio: `1376 / ${Math.round(1120 * Math.min((cur.stemEnd ?? 0.86) + 0.055, 1))}`,
          maxHeight: '100%',
          backgroundImage: `url('${cur.img}')`, backgroundSize: 'cover',
          backgroundPosition: 'center top', backgroundRepeat: 'no-repeat',
          opacity: bgOpacity, transition: 'opacity .42s ease', willChange: 'opacity',
          // soft-dissolve only the bottom sliver (bare green, below the stem) into the backdrop
          // so the photo's hard bottom edge never reads as a seam, wherever it falls.
          maskImage: 'linear-gradient(180deg,#000 0%,#000 95%,transparent 100%)',
          WebkitMaskImage: 'linear-gradient(180deg,#000 0%,#000 95%,transparent 100%)',
        }}
      />
      )}

      {/* side "green-wash": paints the slide's own green over the left/right edges so the
          text columns always read as sitting BESIDE the flower (on green), never on top of it,
          while the bloom stays fully visible in the transparent centre band. Uses the SAME
          vertical gradient as the section background (masked to the edges), so the washed sides
          are colour-identical to both the backdrop and the photo — no seam at any boundary. */}
      {!isTablet && (
        <div
          aria-hidden
          style={{
            position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none',
            opacity: bgOpacity, transition: 'opacity .42s ease',
            background: bgGradient,
            maskImage: 'linear-gradient(90deg,#000 0%,#000 17%,transparent 33%,transparent 67%,#000 83%,#000 100%)',
            WebkitMaskImage: 'linear-gradient(90deg,#000 0%,#000 17%,transparent 33%,transparent 67%,#000 83%,#000 100%)',
          }}
        />
      )}

      <div style={{ position: 'relative', zIndex: 2, maxWidth: isTablet ? 1280 : 1600, margin: '0 auto', padding: isTablet ? '0 clamp(20px,5vw,56px)' : '0 clamp(32px,3.5vw,64px)' }}>
        <Reveal
          style={{
            textAlign: 'center',
            // Mobile: pull the label+title up toward the top of the section (less dead
            // space above it), then keep only a tight gap before the flower image so the
            // whole stack below reads as one compact block.
            marginTop: isTablet ? 'calc(-1 * clamp(40px,7vh,64px))' : 0,
            marginBottom: isTablet ? 'clamp(18px,3vh,30px)' : 'clamp(48px,8vh,90px)',
          }}
        >
          <span style={{ display: 'inline-block', fontSize: 20, fontWeight: 600, letterSpacing: '.28em', textTransform: 'uppercase', color: '#7d9a82', marginBottom: 21 }}>
            Ассортимент
          </span>
          <h2 style={{ margin: 0, fontFamily: "'Cormorant Garamond',serif", fontWeight: 600, fontSize: 'clamp(50px,7.5vw,90px)', lineHeight: 1, color: '#2E3D32' }}>
            Цветок дня
          </h2>
        </Reveal>

        {isTablet ? (
          /* ---- MOBILE / TABLET: stacked — flower image, then name+desc, then fact ---- */
          <Reveal>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'clamp(14px,2.4vh,22px)' }}>
              {/* flower photo — zoomed background crop so the bloom+stem dominate the frame
                  (the source PNGs are mostly empty green padding). We scale past that padding and
                  crop to just below the stem tip (cur.stemEnd), mirroring the desktop treatment.
                  Swipe left/right to navigate. */}
              <div
                onTouchStart={onTouchStart}
                onTouchEnd={onTouchEnd}
                style={{
                  position: 'relative', width: '100%', maxWidth: 460, borderRadius: 28, overflow: 'hidden',
                  background: bgGradient, touchAction: 'pan-y',
                }}
              >
                <div
                  role="img"
                  aria-label={cur.name}
                  style={{
                    width: '100%', height: 'clamp(360px,52vh,460px)',
                    backgroundImage: `url('${cur.img}')`,
                    // Height % > 100 zooms in; derived from the flower's vertical extent
                    // (top of bloom ≈ 0.14 down to the stem tip) so the bloom fills the frame.
                    backgroundSize: `auto ${Math.round(100 / ((cur.stemEnd ?? 0.86) - 0.14))}%`,
                    backgroundPosition: 'center 42%',
                    backgroundRepeat: 'no-repeat',
                    opacity: bgOpacity, transition: 'opacity .42s ease',
                  }}
                />
                <button data-prev aria-label="Предыдущий" onClick={() => go(i - 1)} style={{ ...arrowBtn, width: 52, height: 52, left: 8 }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2E3D32" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
                </button>
                <button data-next aria-label="Следующий" onClick={() => go(i + 1)} style={{ ...arrowBtn, width: 52, height: 52, right: 8 }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2E3D32" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 6l6 6-6 6" /></svg>
                </button>
              </div>

              {/* name + description */}
              <div style={{ textAlign: 'center', width: '100%', maxWidth: 560 }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 12, fontSize: 15, fontWeight: 600, letterSpacing: '.2em', textTransform: 'uppercase', color: cur.accent }}>
                  <span style={{ width: 30, height: 2, background: cur.accent, display: 'inline-block' }} />
                  {cur.latin}
                </span>
                <h3 style={{ margin: '8px 0 10px', fontFamily: "'Cormorant Garamond',serif", fontWeight: 600, fontSize: 'clamp(46px,12vw,72px)', lineHeight: 0.98, color: '#2E3D32' }}>
                  {cur.name}
                </h3>
                <p style={{ margin: '0 auto', fontSize: 'clamp(16px,4.4vw,19px)', lineHeight: 1.65, color: '#46563f', maxWidth: '38ch', textWrap: 'pretty' }}>
                  {cur.desc}
                </p>
                <div style={{ display: 'flex', gap: 14, marginTop: 14, justifyContent: 'center', alignItems: 'flex-end' }}>
                  <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 40, fontWeight: 600, color: cur.accent, lineHeight: 1 }}>{curNum}</span>
                  <span style={{ fontSize: 16, letterSpacing: '.16em', color: '#7d8c7f', paddingBottom: 6 }}>/ {total}</span>
                </div>
              </div>

              {/* fact (frosted glass) */}
              <div
                style={{
                  width: '100%', maxWidth: 560, padding: 'clamp(24px,6vw,34px)', borderRadius: 28, background: 'rgba(255,255,255,.3)',
                  backdropFilter: 'blur(20px) saturate(1.3)', WebkitBackdropFilter: 'blur(20px) saturate(1.3)',
                  boxShadow: '0 20px 50px rgba(46,61,50,.16)', border: '1px solid rgba(255,255,255,.5)',
                }}
              >
                <span style={{ display: 'block', fontSize: 15, fontWeight: 700, letterSpacing: '.2em', textTransform: 'uppercase', color: cur.accent, marginBottom: 14 }}>
                  Интересный факт
                </span>
                <p style={{ margin: 0, fontSize: 'clamp(16px,4.4vw,19px)', lineHeight: 1.6, color: '#243029', fontWeight: 500, textWrap: 'pretty' }}>
                  {cur.fact}
                </p>
              </div>
            </div>
          </Reveal>
        ) : (
          <Reveal>
            <div
              style={{
                position: 'relative', display: 'grid',
                gridTemplateColumns: 'minmax(0,0.92fr) minmax(0,1.55fr) minmax(0,0.92fr)',
                gap: 'clamp(24px,3vw,66px)', alignItems: 'center', minHeight: 'clamp(620px,80vh,920px)',
              }}
            >
              {/* LEFT: name + description */}
              <div style={{ position: 'relative', zIndex: 2, minWidth: 0, textAlign: 'left' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 14, fontSize: 18, fontWeight: 600, letterSpacing: '.2em', textTransform: 'uppercase', color: cur.accent }}>
                  <span style={{ width: 39, height: 2, background: cur.accent, display: 'inline-block' }} />
                  {cur.latin}
                </span>
                <h3 style={{ margin: '24px 0 27px', fontFamily: "'Cormorant Garamond',serif", fontWeight: 600, fontSize: 'clamp(68px,9vw,114px)', lineHeight: 0.96, color: '#2E3D32' }}>
                  {cur.name}
                </h3>
                <p style={{ margin: 0, fontSize: 24, lineHeight: 1.75, color: '#46563f', maxWidth: '34ch', textWrap: 'pretty' }}>
                  {cur.desc}
                </p>
                <div style={{ display: 'flex', gap: 21, marginTop: 50 }}>
                  <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 51, fontWeight: 600, color: cur.accent, lineHeight: 1 }}>{curNum}</span>
                  <span style={{ alignSelf: 'flex-end', fontSize: 20, letterSpacing: '.16em', color: '#7d8c7f', paddingBottom: 9 }}>/ {total}</span>
                </div>
              </div>

              {/* CENTER: empty — flower shows through from the background. Holds nav arrows. */}
              <div style={{ position: 'relative', alignSelf: 'stretch' }}>
                <button data-prev aria-label="Предыдущий" onClick={() => go(i - 1)} style={{ ...arrowBtn, left: 0 }}>
                  <svg width="27" height="27" viewBox="0 0 24 24" fill="none" stroke="#2E3D32" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
                </button>
                <button data-next aria-label="Следующий" onClick={() => go(i + 1)} style={{ ...arrowBtn, right: 0 }}>
                  <svg width="27" height="27" viewBox="0 0 24 24" fill="none" stroke="#2E3D32" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 6l6 6-6 6" /></svg>
                </button>
              </div>

              {/* RIGHT: fact (frosted glass) */}
              <div style={{ position: 'relative', zIndex: 2, minWidth: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <div
                  style={{
                    maxWidth: '100%', padding: '42px 45px', borderRadius: 36, background: 'rgba(255,255,255,.24)',
                    backdropFilter: 'blur(20px) saturate(1.3)', WebkitBackdropFilter: 'blur(20px) saturate(1.3)',
                    boxShadow: '0 20px 50px rgba(46,61,50,.18)', border: '1px solid rgba(255,255,255,.5)',
                  }}
                >
                  <span style={{ display: 'block', fontSize: 18, fontWeight: 700, letterSpacing: '.2em', textTransform: 'uppercase', color: cur.accent, marginBottom: 21 }}>
                    Интересный факт
                  </span>
                  <p style={{ margin: 0, fontSize: 24, lineHeight: 1.72, color: '#243029', fontWeight: 500, textWrap: 'pretty' }}>
                    {cur.fact}
                  </p>
                </div>
              </div>
            </div>
          </Reveal>
        )}

        {/* dots */}
        <Reveal offset={20} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 18, marginTop: isTablet ? 'clamp(22px,3.6vh,36px)' : 'clamp(54px,8vh,84px)' }}>
          {flowers.map((fl, idx) => (
            <button
              key={fl.name}
              onClick={() => go(idx)}
              aria-label={fl.name}
              style={{
                height: 15, width: idx === i ? 51 : 15,
                background: idx === i ? fl.accent : 'rgba(46,61,50,.18)',
                border: 'none', borderRadius: 99, padding: 0, cursor: 'pointer',
                transition: 'width .4s ease,background .4s ease',
              }}
            />
          ))}
        </Reveal>
      </div>

      {/* bottom transition: showcase-green → about-blush (same structure as 3→4) */}
      <div
        style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: 'clamp(100px,14vh,160px)', zIndex: 3, pointerEvents: 'none',
          background: 'linear-gradient(180deg,rgba(198,227,182,0) 0%,rgba(210,220,195,0.55) 45%,rgba(238,218,212,0.92) 75%,#F7E2DC 100%)',
        }}
      />
    </section>
  )
})

export default FlowerCarousel
