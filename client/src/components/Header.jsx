import { useState } from 'react'
import { useMediaQuery } from '../hooks/useMediaQuery'

const LogoMark = () => (
  <svg width="45" height="51" viewBox="0 0 30 34" fill="none" aria-hidden="true">
    <path d="M15 17c0-6 2.4-9.6 6-12-1.2 4 .6 7.2 1.8 9.6C24 17.4 21.6 21 15 21Z" fill="#C9B6E4" />
    <path d="M15 17c0-6-2.4-9.6-6-12 1.2 4-.6 7.2-1.8 9.6C6 17.4 8.4 21 15 21Z" fill="#A8D0E6" />
    <path d="M15 21c-3-2.4-3.6-7.2-2.4-10.8C13.8 13.2 15 15 15 17c0-2 1.2-3.8 2.4-6.8C18.6 13.8 18 18.6 15 21Z" fill="#F4C2C8" />
    <path d="M15 21v11" stroke="#6E9A78" strokeWidth="2" strokeLinecap="round" />
    <path d="M15 27c-2.4 0-4.6-1.4-5.4-3.6 2.6-.4 4.6.8 5.4 3.6Z" fill="#8FB89A" />
  </svg>
)

const navLink = { textDecoration: 'none', color: '#2E3D32', fontSize: 21, fontWeight: 500 }

export default function Header({ ctaColor = '#F4C2C8' }) {
  const isTablet = useMediaQuery('(max-width:880px)')
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <>
      <header
        id="siteNav"
        style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 100, paddingTop: 36, paddingBottom: 36 }}
      >
        <div
          style={{
            maxWidth: 1280,
            margin: '0 auto',
            padding: '0 clamp(20px,5vw,56px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 36,
          }}
        >
          <a href="#top" style={{ display: 'flex', alignItems: 'center', gap: 16, textDecoration: 'none', color: '#2E3D32' }}>
            <LogoMark />
            <span style={{ fontFamily: "'Cormorant Garamond',serif", fontWeight: 600, fontSize: 38, letterSpacing: '.02em' }}>
              Flowers
            </span>
          </a>

          {!isTablet && (
            <nav style={{ display: 'flex', gap: 51, alignItems: 'center' }}>
              <a href="#top" style={{ ...navLink, letterSpacing: '.01em' }}>Главная</a>
              <a href="#assortiment" style={navLink}>Ассортимент</a>
              <a href="#o-nas" style={navLink}>О нас</a>
              <a href="#kontakty" style={navLink}>Контакты</a>
            </nav>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            {!isTablet && (
              <>
                <a
                  href="#assortiment"
                  style={{
                    textDecoration: 'none', color: '#2E3D32', fontSize: 21, fontWeight: 600,
                    padding: '16px 33px', border: '1.5px solid rgba(46,61,50,.28)', borderRadius: 99,
                    transition: 'border-color .3s,background .3s',
                  }}
                >
                  Ассортимент
                </a>
                <a
                  href="#assortiment"
                  style={{
                    textDecoration: 'none', color: '#2E3D32', fontSize: 21, fontWeight: 600,
                    padding: '18px 39px', borderRadius: 99, background: ctaColor,
                    boxShadow: '0 8px 22px rgba(244,194,200,.5)',
                  }}
                >
                  Купить
                </a>
              </>
            )}
            {isTablet && (
              <button
                id="burger"
                aria-label="Меню"
                aria-expanded={menuOpen}
                onClick={() => setMenuOpen(true)}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 5, width: 44, height: 44, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              >
                <span style={{ width: 24, height: 2, background: '#2E3D32', borderRadius: 2, display: 'block' }} />
                <span style={{ width: 24, height: 2, background: '#2E3D32', borderRadius: 2, display: 'block' }} />
                <span style={{ width: 24, height: 2, background: '#2E3D32', borderRadius: 2, display: 'block' }} />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* MOBILE MENU */}
      <div
        id="mobileMenu"
        style={{
          position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(242,249,244,.97)',
          backdropFilter: 'blur(10px)', display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', gap: 26, opacity: menuOpen ? 1 : 0,
          pointerEvents: menuOpen ? 'auto' : 'none', transition: 'opacity .35s ease',
        }}
      >
        <button
          className="mclose"
          aria-label="Закрыть меню"
          onClick={() => setMenuOpen(false)}
          style={{ position: 'absolute', top: 16, right: 16, width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, lineHeight: 1, color: '#2E3D32', background: 'none', border: 'none', cursor: 'pointer' }}
        >
          ×
        </button>
        {[
          ['#top', 'Главная'],
          ['#assortiment', 'Ассортимент'],
          ['#o-nas', 'О нас'],
          ['#features', 'Почему мы'],
          ['#kontakty', 'Контакты'],
        ].map(([href, label]) => (
          <a
            key={href}
            href={href}
            onClick={() => setMenuOpen(false)}
            style={{ display: 'flex', alignItems: 'center', minHeight: 48, padding: '0 16px', textDecoration: 'none', color: '#2E3D32', fontFamily: "'Cormorant Garamond',serif", fontSize: 32, fontWeight: 600 }}
          >
            {label}
          </a>
        ))}
      </div>
    </>
  )
}
