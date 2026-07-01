import { forwardRef } from 'react'
import Reveal from './Reveal'
import { useMediaQuery } from '../hooks/useMediaQuery'

// Desktop: wide branch photo, right-anchored (70%). Mobile: a portrait-crop photo whose
// blossoms sit only along the very bottom edge, leaving the whole upper/middle area clear
// for the text — no positioning tricks needed to dodge the bloom.
const ABOUT_BG_DESKTOP = '/assets/about-bg.png'
const ABOUT_BG_MOBILE = '/assets/about-branch-mobile.png'

const About = forwardRef(function About(props, ref) {
  const isMobile = useMediaQuery('(max-width:760px)')
  return (
    <section
      id="o-nas"
      ref={ref}
      style={{
        position: 'relative', overflow: 'hidden', backgroundColor: '#F7E2DC',
        backgroundImage: `url('${isMobile ? ABOUT_BG_MOBILE : ABOUT_BG_DESKTOP}')`,
        // Mobile: the section's box has the exact same aspect ratio as the source photo
        // (768x1376), so `cover` needs zero cropping or zoom — the full frame renders as-is.
        backgroundSize: 'cover',
        backgroundPosition: isMobile ? 'center' : '70% center',
        aspectRatio: isMobile ? '768 / 1376' : undefined,
        display: 'flex', alignItems: 'flex-start',
        padding: isMobile ? 'clamp(28px,5vh,44px) 0 0' : 'clamp(96px,16vh,180px) 0 clamp(340px,44vh,630px)',
      }}
    >
      {/* top seal: keeps About's first pixels solid #F7E2DC so there is no seam */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 60, zIndex: 5, pointerEvents: 'none', background: 'linear-gradient(180deg,#F7E2DC 0%,rgba(247,226,220,0) 100%)' }} />
      {/* bottom fade: coral → features blue */}
      <div
        style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 4, pointerEvents: 'none',
          height: isMobile ? 'clamp(60px,9vh,100px)' : 'clamp(150px,14vh,240px)',
          background: 'linear-gradient(180deg,rgba(240,195,185,0) 0%,rgba(222,200,222,0.55) 45%,rgba(218,234,252,0.92) 75%,#EAF4FF 100%)',
        }}
      />

      <div style={{ position: 'relative', zIndex: 5, width: '100%', maxWidth: 1280, margin: 0, padding: isMobile ? '0 clamp(20px,6vw,32px)' : '0 clamp(24px,6vw,110px)' }}>
        <Reveal style={{ maxWidth: isMobile ? 'none' : '60ch' }}>
          <span style={{ display: 'inline-block', fontSize: isMobile ? 'clamp(13px,3.4vw,15px)' : 'clamp(15px,4vw,18px)', fontWeight: 600, letterSpacing: isMobile ? '.2em' : '.26em', textTransform: 'uppercase', color: '#75505b', marginBottom: isMobile ? 8 : 'clamp(16px,3vw,26px)' }}>
            О нас
          </span>
          <h2 style={{ margin: isMobile ? '0 0 12px' : '0 0 clamp(22px,4vw,34px)', fontFamily: "'Cormorant Garamond',serif", fontWeight: 600, fontSize: isMobile ? 'clamp(40px,10.5vw,56px)' : 'clamp(52px,11vw,120px)', lineHeight: 0.96, color: '#352932' }}>
            Flowers
          </h2>
          <p style={{ margin: isMobile ? '0 0 18px' : '0 0 clamp(34px,5vw,50px)', fontSize: isMobile ? 'clamp(14px,3.8vw,16px)' : 'clamp(18px,4.8vw,31px)', lineHeight: isMobile ? 1.5 : 1.66, color: '#4c3d47', maxWidth: isMobile ? 'none' : '40ch', textWrap: 'pretty' }}>
            Мастерская авторской флористики. Мы собираем букеты из свежих сезонных цветов и помогаем сказать языком цветов то, что трудно выразить словами. Каждый букет рождается вручную — с любовью к деталям и вниманием к настроению.
          </p>
          <a
            href="#assortiment"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 13, textDecoration: 'none', color: '#fff',
              fontSize: isMobile ? 15 : 19, fontWeight: 600, padding: isMobile ? '8px 18px' : '20px 48px', borderRadius: 99, background: '#E79BAE',
              boxShadow: '0 12px 30px rgba(231,155,174,.5)', transition: 'transform .2s',
            }}
          >
            Подробнее
            <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
          </a>
        </Reveal>
      </div>
    </section>
  )
})

export default About
