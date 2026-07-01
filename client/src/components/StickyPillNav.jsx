import { useEffect, useRef } from 'react'
import { useMediaQuery } from '../hooks/useMediaQuery'

// Frosted-glass pill nav, fixed at the bottom. Fades in once past the Hero (Section 2
// onward) and highlights the item matching the section that owns the viewport center.
const ITEMS = [
  { href: '#top', id: 'top', label: 'Главная' },
  { href: '#assortiment', id: 'assortiment', label: 'Ассортимент' },
  { href: '#o-nas', id: 'o-nas', label: 'О нас' },
  { href: '#features', id: 'features', label: 'Почему мы' },
  { href: '#kontakty', id: 'kontakty', label: 'Контакты' },
]

export default function StickyPillNav({ activeId, visible }) {
  // Use the compact, scrollable pill whenever the full 5-item bar would be too wide
  // for the viewport (phones and tablets up to 880px).
  const isMobile = useMediaQuery('(max-width:880px)')
  const trackRef = useRef(null)
  const activeRef = useRef(null)

  // On mobile the 5 items scroll horizontally inside the pill — keep the active one in view.
  useEffect(() => {
    if (!isMobile) return
    const el = activeRef.current
    if (el) el.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' })
  }, [activeId, isMobile, visible])

  return (
    <nav
      ref={trackRef}
      className={isMobile ? 'hscroll' : undefined}
      style={{
        position: 'fixed', left: '50%', bottom: isMobile ? 14 : 36,
        transform: visible ? 'translateX(-50%) translateY(0)' : 'translateX(-50%) translateY(18px)',
        zIndex: 90, display: 'flex', alignItems: 'center', gap: isMobile ? 1 : 6,
        padding: isMobile ? '7px 5px' : 10, borderRadius: 99,
        background: 'rgba(40,54,42,.16)',
        backdropFilter: 'blur(18px) saturate(1.4)', WebkitBackdropFilter: 'blur(18px) saturate(1.4)',
        boxShadow: '0 14px 40px rgba(30,42,32,.12)', border: '1px solid rgba(255,255,255,.14)',
        whiteSpace: 'nowrap', maxWidth: 'calc(100vw - 24px)',
        // Let the items scroll within the pill on narrow screens instead of overflowing.
        overflowX: isMobile ? 'auto' : 'visible',
        opacity: visible ? 1 : 0, pointerEvents: visible ? 'auto' : 'none',
        transition: 'opacity .5s ease,transform .5s ease',
      }}
    >
      {ITEMS.map((item) => {
        const on = item.id === activeId
        return (
          <a
            key={item.id}
            ref={on ? activeRef : null}
            href={item.href}
            style={{
              textDecoration: 'none', flex: 'none',
              color: on ? '#2E3D32' : 'rgba(255,255,255,.85)',
              fontSize: isMobile ? 11 : 21, fontWeight: 500,
              letterSpacing: isMobile ? '0' : undefined,
              // Small, tight text — but a taller bar (vertical padding + minHeight) keeps
              // the tap target comfortable while all 5 items fit on one row.
              padding: isMobile ? '14px 7px' : '16px 33px',
              display: 'inline-flex', alignItems: 'center', minHeight: isMobile ? 46 : 44,
              borderRadius: 99, whiteSpace: 'nowrap',
              background: on ? 'rgba(255,255,255,.42)' : 'transparent',
              transition: 'background .35s ease,color .35s ease',
            }}
          >
            {item.label}
          </a>
        )
      })}
    </nav>
  )
}
