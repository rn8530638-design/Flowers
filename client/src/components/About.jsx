import { forwardRef } from 'react'
import Reveal from './Reveal'

const About = forwardRef(function About(props, ref) {
  return (
    <section
      id="o-nas"
      ref={ref}
      style={{
        position: 'relative', overflow: 'hidden', backgroundColor: '#F7E2DC',
        backgroundImage: "url('/assets/about-bg.png')", backgroundSize: 'cover', backgroundPosition: '70% center',
        display: 'flex', alignItems: 'flex-start', padding: 'clamp(120px,16vh,180px) 0 clamp(450px,44vh,630px)',
      }}
    >
      {/* top seal: keeps About's first pixels solid #F7E2DC so there is no seam */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 60, zIndex: 5, pointerEvents: 'none', background: 'linear-gradient(180deg,#F7E2DC 0%,rgba(247,226,220,0) 100%)' }} />
      {/* bottom fade: coral → features blue */}
      <div
        style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: 'clamp(150px,14vh,240px)', zIndex: 4, pointerEvents: 'none',
          background: 'linear-gradient(180deg,rgba(240,195,185,0) 0%,rgba(222,200,222,0.55) 45%,rgba(218,234,252,0.92) 75%,#EAF4FF 100%)',
        }}
      />

      <div style={{ position: 'relative', zIndex: 5, width: '100%', maxWidth: 1280, margin: 0, padding: '0 clamp(40px,6vw,110px)' }}>
        <Reveal style={{ maxWidth: '60ch' }}>
          <span style={{ display: 'inline-block', fontSize: 18, fontWeight: 600, letterSpacing: '.26em', textTransform: 'uppercase', color: '#a3707f', marginBottom: 26 }}>
            О нас
          </span>
          <h2 style={{ margin: '0 0 34px', fontFamily: "'Cormorant Garamond',serif", fontWeight: 600, fontSize: 'clamp(64px,7vw,120px)', lineHeight: 0.96, color: '#4a3a45' }}>
            Flowers
          </h2>
          <p style={{ margin: '0 0 50px', fontSize: 31, lineHeight: 1.72, color: '#6a5563', maxWidth: '40ch', textWrap: 'pretty' }}>
            Мастерская авторской флористики. Мы собираем букеты из свежих сезонных цветов и помогаем сказать языком цветов то, что трудно выразить словами. Каждый букет рождается вручную — с любовью к деталям и вниманием к настроению.
          </p>
          <a
            href="#assortiment"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 13, textDecoration: 'none', color: '#fff',
              fontSize: 19, fontWeight: 600, padding: '20px 48px', borderRadius: 99, background: '#E79BAE',
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
