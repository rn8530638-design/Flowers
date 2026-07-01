import { useMemo, useRef } from 'react'
import Header from './components/Header'
import Hero from './components/Hero'
import StickyPillNav from './components/StickyPillNav'
import FlowerCarousel from './components/FlowerCarousel'
import About from './components/About'
import Features from './components/Features'
import Footer from './components/Footer'
import { useActiveSection } from './hooks/useActiveSection'

// Defaults carried over from the original component props.
const CTA_COLOR = '#F4C2C8'
const HERO_OVERLAY = 0.18

export default function App() {
  const heroRef = useRef(null)
  const carouselRef = useRef(null)
  const aboutRef = useRef(null)
  const featuresRef = useRef(null)
  const footerRef = useRef(null)

  const sections = useMemo(
    () => [
      { id: 'top', ref: heroRef },
      { id: 'assortiment', ref: carouselRef },
      { id: 'o-nas', ref: aboutRef },
      { id: 'features', ref: featuresRef },
      { id: 'kontakty', ref: footerRef },
    ],
    [],
  )

  const { activeId, pillVisible } = useActiveSection(sections)

  return (
    <div className="page">
      <Header ctaColor={CTA_COLOR} />
      <StickyPillNav activeId={activeId} visible={pillVisible} />

      <Hero ref={heroRef} heroOv={HERO_OVERLAY} />
      <FlowerCarousel ref={carouselRef} />
      <About ref={aboutRef} />
      <Features ref={featuresRef} />
      <Footer ref={footerRef} />
    </div>
  )
}
