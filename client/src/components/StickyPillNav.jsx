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
  return (
    <nav
      style={{
        position: 'fixed', left: '50%', bottom: 36,
        transform: visible ? 'translateX(-50%) translateY(0)' : 'translateX(-50%) translateY(18px)',
        zIndex: 90, display: 'flex', alignItems: 'center', gap: 6, padding: 10, borderRadius: 99,
        background: 'rgba(40,54,42,.16)',
        backdropFilter: 'blur(18px) saturate(1.4)', WebkitBackdropFilter: 'blur(18px) saturate(1.4)',
        boxShadow: '0 14px 40px rgba(30,42,32,.12)', border: '1px solid rgba(255,255,255,.14)',
        whiteSpace: 'nowrap', maxWidth: 'calc(100vw - 32px)',
        opacity: visible ? 1 : 0, pointerEvents: visible ? 'auto' : 'none',
        transition: 'opacity .5s ease,transform .5s ease',
      }}
    >
      {ITEMS.map((item) => {
        const on = item.id === activeId
        return (
          <a
            key={item.id}
            href={item.href}
            style={{
              textDecoration: 'none',
              color: on ? '#2E3D32' : 'rgba(255,255,255,.85)',
              fontSize: 21, fontWeight: 500, padding: '16px 33px', borderRadius: 99,
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
