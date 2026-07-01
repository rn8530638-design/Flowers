import { forwardRef } from 'react'
import Reveal from './Reveal'
import { useMediaQuery } from '../hooks/useMediaQuery'

const h4Style = { margin: '0 0 27px', fontSize: 15, fontWeight: 500, letterSpacing: '.22em', textTransform: 'uppercase', color: 'rgba(234,244,236,.3)' }
const socialA = { width: 63, height: 63, borderRadius: '50%', border: '1px solid rgba(234,244,236,.22)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#EAF4EC', transition: 'background .3s,border-color .3s' }

const Footer = forwardRef(function Footer(props, ref) {
  const isMobile = useMediaQuery('(max-width:760px)')
  const footGridCols = isMobile ? '1fr 1fr' : '1.4fr 1fr 1fr 1fr'

  return (
    <footer id="kontakty" ref={ref} style={{ background: '#2E3D32', color: '#EAF4EC', padding: 'clamp(108px,16vh,180px) 0 66px', position: 'relative', overflow: 'hidden' }}>
      {/* botanical decoration: delicate branch + flowers, bottom-right corner */}
      <svg style={{ position: 'absolute', bottom: -36, right: -36, width: 570, height: 510, opacity: 0.055, pointerEvents: 'none', zIndex: 0 }} viewBox="0 0 380 340" fill="none" stroke="#EAF4EC" strokeLinecap="round" strokeLinejoin="round">
        <path strokeWidth="1.1" d="M375 335 Q295 258 215 172 Q168 124 122 54" />
        <path strokeWidth="1" d="M215 172 Q196 142 188 104" />
        <path strokeWidth="1" d="M262 220 Q294 188 320 166" />
        <path strokeWidth=".9" d="M172 132 Q148 112 138 88" />
        {[0, 72, 144, 216, 288].map((r) => <ellipse key={`a${r}`} cx="122" cy="38" rx="6" ry="14" transform={`rotate(${r} 122 54)`} strokeWidth=".85" />)}
        <circle cx="122" cy="54" r="4.5" strokeWidth=".85" />
        {[0, 72, 144, 216, 288].map((r) => <ellipse key={`b${r}`} cx="188" cy="92" rx="5" ry="11" transform={`rotate(${r} 188 104)`} strokeWidth=".8" />)}
        <circle cx="188" cy="104" r="3.5" strokeWidth=".8" />
        <path strokeWidth=".8" d="M320 166 Q330 152 336 144" />
        {[0, 120, 240].map((r) => <ellipse key={`c${r}`} cx="336" cy="136" rx="3" ry="7" transform={`rotate(${r} 336 144)`} strokeWidth=".75" />)}
      </svg>

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 clamp(20px,5vw,56px)', position: 'relative', zIndex: 1 }}>
        <Reveal style={{ width: '100%', margin: '0 auto clamp(84px,9vh,135px)' }}>
          <h2 style={{ margin: 0, fontFamily: "'Cormorant Garamond',serif", fontWeight: 500, fontSize: 'clamp(57px,7vw,108px)', lineHeight: 1.12, color: '#F4FBF4', textAlign: 'center', letterSpacing: '.01em' }}>
            Дарите цветы — дарите <span style={{ color: '#E79BAE' }}>настроение</span>.
          </h2>
        </Reveal>

        <div style={{ display: 'grid', gridTemplateColumns: footGridCols, gap: 'clamp(42px,4vw,84px)', paddingBottom: 'clamp(60px,6vh,96px)', borderBottom: '1px solid rgba(234,244,236,.16)' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
              <svg width="42" height="48" viewBox="0 0 30 34" fill="none" aria-hidden="true">
                <path d="M15 17c0-6 2.4-9.6 6-12-1.2 4 .6 7.2 1.8 9.6C24 17.4 21.6 21 15 21Z" fill="#C9B6E4" />
                <path d="M15 17c0-6-2.4-9.6-6-12 1.2 4-.6 7.2-1.8 9.6C6 17.4 8.4 21 15 21Z" fill="#A8D0E6" />
                <path d="M15 21c-3-2.4-3.6-7.2-2.4-10.8C13.8 13.2 15 15 15 17c0-2 1.2-3.8 2.4-6.8C18.6 13.8 18 18.6 15 21Z" fill="#F4C2C8" />
                <path d="M15 21v11" stroke="#8FB89A" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <span style={{ fontFamily: "'Cormorant Garamond',serif", fontWeight: 600, fontSize: 39, color: '#F4FBF4' }}>Flowers</span>
            </div>
            <p style={{ margin: 0, fontSize: 22, lineHeight: 1.7, color: 'rgba(234,244,236,.62)', maxWidth: '30ch' }}>
              Авторская флористика и доставка свежих букетов по городу каждый день.
            </p>
          </div>

          <div>
            <h4 style={h4Style}>Контакты</h4>
            <a href="tel:+70000000000" style={{ display: 'block', textDecoration: 'none', color: '#F4FBF4', fontSize: 25, fontWeight: 500, marginBottom: 15 }}>+7 000 000-00-00</a>
            <a href="mailto:hello@flowers.ru" style={{ display: 'block', textDecoration: 'none', color: '#F4FBF4', fontSize: 25, fontWeight: 500 }}>hello@flowers.ru</a>
            <div style={{ marginTop: 33, paddingTop: 27, borderTop: '1px solid rgba(234,244,236,.1)' }}>
              <p style={{ margin: '0 0 15px', fontSize: 16, letterSpacing: '.06em', color: 'rgba(234,244,236,.36)' }}>Будьте в курсе скидок</p>
              <a href="#" style={{ display: 'inline-block', textDecoration: 'none', color: '#2E3D32', background: '#E79BAE', fontSize: 18, fontWeight: 600, padding: '12px 33px', borderRadius: 99, letterSpacing: '.04em', boxShadow: '0 6px 18px rgba(231,155,174,.3)' }}>Подписаться</a>
            </div>
          </div>

          <div>
            <h4 style={h4Style}>Адрес</h4>
            <p style={{ margin: '0 0 13px', fontSize: 25, fontWeight: 500, lineHeight: 1.6, color: '#F4FBF4' }}>г. Москва,<br />ул. Цветочная, 1</p>
            <p style={{ margin: 0, fontSize: 22, color: 'rgba(234,244,236,.76)' }}>Пн–Вс · 9:00–21:00</p>
          </div>

          <div>
            <h4 style={h4Style}>Мы в сети</h4>
            <div style={{ display: 'flex', gap: 15 }}>
              <a href="#" aria-label="Telegram" style={socialA}><svg width="27" height="27" viewBox="0 0 24 24" fill="currentColor"><path d="M21.9 4.3 18.6 20c-.2 1-.9 1.3-1.8.8l-4.9-3.6-2.4 2.3c-.3.3-.5.5-1 .5l.3-5 9.1-8.2c.4-.3-.1-.5-.6-.2L6.1 13.4l-4.8-1.5c-1-.3-1-1 .2-1.5l18.7-7.2c.9-.3 1.6.2 1.7 1.1z" /></svg></a>
              <a href="#" aria-label="Instagram" style={socialA}><svg width="27" height="27" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" /></svg></a>
              <a href="#" aria-label="WhatsApp" style={socialA}><svg width="27" height="27" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.5 15.2L2 22l4.9-1.5A10 10 0 1 0 12 2zm0 18a8 8 0 0 1-4.1-1.1l-.3-.2-2.9.9.9-2.8-.2-.3A8 8 0 1 1 12 20zm4.4-5.6c-.2-.1-1.4-.7-1.6-.8-.2-.1-.4-.1-.5.1l-.7.9c-.1.2-.3.2-.5.1a6.5 6.5 0 0 1-3.2-2.8c-.1-.2 0-.4.1-.5l.4-.5c.1-.2.1-.3 0-.5l-.7-1.7c-.2-.4-.4-.4-.5-.4h-.5c-.2 0-.4.1-.6.3-.2.2-.8.8-.8 1.9s.8 2.2 1 2.4c.1.2 1.7 2.6 4.1 3.5 1.5.6 2.1.7 2.8.6.5-.1 1.4-.6 1.6-1.1.2-.5.2-1 .1-1.1l-.3-.4z" /></svg></a>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 27, flexWrap: 'wrap', paddingTop: 39 }}>
          <p style={{ margin: 0, fontSize: 20, color: 'rgba(234,244,236,.5)' }}>© 2026 Flowers. Все права защищены.</p>
          <p style={{ margin: 0, fontSize: 20, color: 'rgba(234,244,236,.5)' }}>Сделано с любовью к цветам</p>
        </div>
      </div>
    </footer>
  )
})

export default Footer
