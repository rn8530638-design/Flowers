import { useEffect, useRef, useState } from 'react'

/**
 * Reveal-on-scroll wrapper — React port of the original [data-reveal] behaviour:
 * starts at opacity:0 / translateY(offset), animates to visible once it enters the
 * viewport, then stops observing. Transition timing copied verbatim from the original.
 *
 * @param {number} delay  stagger in seconds (original used data-d * 0.1)
 * @param {number} offset initial translateY in px (original: 30, dots used 20)
 */
export default function Reveal({ children, delay = 0, offset = 30, style, ...rest }) {
  const ref = useRef(null)
  const [shown, setShown] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setShown(true)
            io.unobserve(e.target)
          }
        })
      },
      { threshold: 0.1, rootMargin: '0px 0px -7% 0px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      style={{
        opacity: shown ? 1 : 0,
        transform: shown ? 'none' : `translateY(${offset}px)`,
        transition: `opacity .9s cubic-bezier(.2,.8,.2,1) ${delay}s, transform .9s cubic-bezier(.2,.8,.2,1) ${delay}s`,
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  )
}
