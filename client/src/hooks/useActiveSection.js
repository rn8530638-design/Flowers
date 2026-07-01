import { useEffect, useState } from 'react'

/**
 * Scroll-spy reimplemented with IntersectionObserver (one observer per section ref),
 * replacing the original vanilla scroll listener.
 *
 * - `activeId`: the section currently owning the viewport center. A center-line observer
 *   (rootMargin pulling top & bottom to 50%) fires when a section straddles the middle —
 *   equivalent to the original "last section whose top has crossed the viewport midpoint".
 * - `pillVisible`: true once we've scrolled past the Hero. A dedicated observer on the Hero
 *   with the root bottom pulled up by 40% reproduces the original `hero.bottom < vh*0.6` rule:
 *   the Hero stops intersecting exactly when its bottom rises above the 60% line.
 *
 * @param {Array<{id: string, ref: React.RefObject<HTMLElement>}>} sections
 *        ordered top-to-bottom; sections[0] must be the Hero.
 */
export function useActiveSection(sections) {
  const [activeId, setActiveId] = useState(sections[0]?.id ?? null)
  const [pillVisible, setPillVisible] = useState(false)

  useEffect(() => {
    const nodes = sections
      .map((s) => ({ id: s.id, el: s.ref.current }))
      .filter((s) => s.el)
    if (!nodes.length) return

    // --- active-section highlighting: a zero-height band at the viewport center ---
    const centerObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const match = nodes.find((n) => n.el === entry.target)
            if (match) setActiveId(match.id)
          }
        })
      },
      { rootMargin: '-50% 0px -50% 0px', threshold: 0 },
    )
    nodes.forEach((n) => centerObserver.observe(n.el))

    // --- pill visibility: tied to the Hero leaving the lower 40% of the viewport ---
    const heroEl = nodes[0].el
    const heroObserver = new IntersectionObserver(
      ([entry]) => setPillVisible(!entry.isIntersecting),
      { rootMargin: '0px 0px -40% 0px', threshold: 0 },
    )
    heroObserver.observe(heroEl)

    return () => {
      centerObserver.disconnect()
      heroObserver.disconnect()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sections.map((s) => s.id).join(',')])

  return { activeId, pillVisible }
}
