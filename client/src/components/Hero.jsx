import { forwardRef, useEffect, useRef, useState } from 'react'
import { useMediaQuery } from '../hooks/useMediaQuery'

// Desktop 16:9 / mobile 9:16 source swap. Drop a vertical cut at HERO_MOBILE (flowers in
// the lower third, empty top for the title); if it's missing we fall back to the desktop
// clip on error so the hero always plays.
const HERO_DESKTOP = '/assets/hero.mp4'
const HERO_MOBILE = '/assets/hero-mobile.mp4'

const Hero = forwardRef(function Hero({ heroOv = 0.18 }, ref) {
  const videoRef = useRef(null)
  const isMobile = useMediaQuery('(max-width:760px)')
  const [src, setSrc] = useState(isMobile ? HERO_MOBILE : HERO_DESKTOP)

  // Keep the source in sync with viewport; reset when the breakpoint flips.
  useEffect(() => { setSrc(isMobile ? HERO_MOBILE : HERO_DESKTOP) }, [isMobile])

  // If the vertical mobile clip isn't present yet, gracefully use the desktop one.
  const onError = () => { if (src !== HERO_DESKTOP) setSrc(HERO_DESKTOP) }

  // Force autoplay — some browsers ignore the attribute in embedded contexts.
  useEffect(() => {
    const hv = videoRef.current
    if (!hv) return
    hv.muted = true
    const tryPlay = () => hv.play().catch(() => {})
    tryPlay()
    hv.addEventListener('canplay', tryPlay, { once: true })
    return () => hv.removeEventListener('canplay', tryPlay)
  }, [src])

  return (
    <section
      id="top"
      ref={ref}
      style={{
        position: 'relative',
        minHeight: '100svh',
        display: 'flex',
        flexDirection: 'column',
        // Desktop: title anchored to the bottom. Mobile: title centered (nudged
        // slightly above true center via the content block's own margin) so it
        // reads mid-section, clear of the flowers lower down in the 9:16 video.
        justifyContent: isMobile ? 'center' : 'flex-end',
        overflow: 'hidden',
        background: 'linear-gradient(180deg,#cfe9f3 0%,#dbe9d2 42%,#7e9c6f 72%,#4f6f48 100%)',
      }}
    >
      <video
        ref={videoRef}
        key={src}
        id="heroVideo"
        src={src}
        onError={onError}
        autoPlay
        muted
        loop
        playsInline
        // On mobile, anchor the frame to the bottom so the flowers sit in the lower third.
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: isMobile ? 'center bottom' : 'center', zIndex: 0 }}
      />

      {/* legibility overlay */}
      <div
        style={{
          position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none',
          background: 'linear-gradient(180deg,rgba(168,208,230,.18) 0%,rgba(255,255,255,0) 26%,rgba(46,61,50,.05) 60%,rgba(46,61,50,.28) 100%)',
          opacity: heroOv,
        }}
      />
      {/* bottom transition: eases hero's foliage into the pastel-green of the showcase below */}
      <div
        style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: 'clamp(135px,13vh,225px)',
          zIndex: 1, pointerEvents: 'none',
          background: 'linear-gradient(180deg,rgba(198,227,182,0) 0%,#C6E3B6 100%)',
        }}
      />

      <div
        style={{
          position: 'relative', zIndex: 2, width: '100%', maxWidth: 1280, margin: '0 auto',
          padding: isMobile
            ? '0 20px'
            : '0 clamp(20px,5vw,56px) clamp(180px,18vh,270px)',
          // Pulls the centered block up off dead-center, since half of a bottom
          // margin's space is "spent" above the block when a single flex item
          // is centered — leaves the flowers at the video's bottom unobscured.
          marginBottom: isMobile ? 'clamp(40px,10vh,110px)' : 0,
          display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
        }}
      >
        <span
          style={{
            fontFamily: "'Manrope',sans-serif",
            fontSize: isMobile ? 'clamp(14px,4.2vw,20px)' : 'clamp(20px,1.6vw,24px)', fontWeight: 500,
            letterSpacing: isMobile ? '.24em' : '.34em', textTransform: 'uppercase', color: '#f3faf1',
            textShadow: '0 1px 14px rgba(46,61,50,.45)', marginBottom: 'clamp(12px,1.4vh,27px)',
          }}
        >
          Всё дело в цветах
        </span>
        <h1
          style={{
            margin: 0, fontFamily: "'Cormorant Garamond',serif", fontWeight: 600,
            // Sized (and tracked tighter) to fill the width right up to a safety
            // margin at a 320px viewport — the narrowest width still in play —
            // so "FLOWERS" reads as large as possible without wrapping or overflow.
            fontSize: isMobile ? 'clamp(60px,18.5vw,140px)' : 'clamp(102px,18vw,348px)',
            lineHeight: 0.86, letterSpacing: isMobile ? '.01em' : '.04em',
            color: '#eef6e8', textShadow: '0 8px 40px rgba(38,52,40,.4)',
          }}
        >
          FLOWERS
        </h1>
      </div>
    </section>
  )
})

export default Hero
