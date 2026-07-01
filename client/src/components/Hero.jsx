import { forwardRef, useEffect, useRef } from 'react'
import { useMediaQuery } from '../hooks/useMediaQuery'

// Desktop 16:9 / mobile 9:16 source swap. Both currently point at the same placeholder
// clip (as in the original); replace with a vertical cut to differentiate.
const HERO_DESKTOP = '/assets/hero.mp4'
const HERO_MOBILE = '/assets/hero.mp4'

const Hero = forwardRef(function Hero({ heroOv = 0.18 }, ref) {
  const videoRef = useRef(null)
  const isMobile = useMediaQuery('(max-width:760px)')
  const src = isMobile ? HERO_MOBILE : HERO_DESKTOP

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
        justifyContent: 'flex-end',
        overflow: 'hidden',
        background: 'linear-gradient(180deg,#cfe9f3 0%,#dbe9d2 42%,#7e9c6f 72%,#4f6f48 100%)',
      }}
    >
      <video
        ref={videoRef}
        key={src}
        id="heroVideo"
        autoPlay
        muted
        loop
        playsInline
        poster=""
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', zIndex: 0 }}
      >
        <source src={src} type="video/mp4" />
      </video>

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
          padding: '0 clamp(20px,5vw,56px) clamp(180px,18vh,270px)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
        }}
      >
        <span
          style={{
            fontFamily: "'Manrope',sans-serif", fontSize: 'clamp(20px,1.6vw,24px)', fontWeight: 500,
            letterSpacing: '.34em', textTransform: 'uppercase', color: '#f3faf1',
            textShadow: '0 1px 14px rgba(46,61,50,.45)', marginBottom: 'clamp(12px,1.4vh,27px)',
          }}
        >
          Всё дело в цветах
        </span>
        <h1
          style={{
            margin: 0, fontFamily: "'Cormorant Garamond',serif", fontWeight: 600,
            fontSize: 'clamp(102px,18vw,348px)', lineHeight: 0.86, letterSpacing: '.04em',
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
