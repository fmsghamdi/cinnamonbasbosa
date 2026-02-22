'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useLanguage } from '@/context/LanguageContext'
import { X, ChevronRight, ChevronLeft, Camera } from 'lucide-react'

interface GalleryImage {
  id: number
  imagePath: string
  title?: string
}

export default function Gallery() {
  const { t } = useLanguage()
  const [images, setImages] = useState<GalleryImage[]>([])
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const [visibleItems, setVisibleItems] = useState<Set<number>>(new Set())

  useEffect(() => {
    fetch('/api/gallery')
      .then(res => res.json())
      .then(data => setImages(Array.isArray(data) ? data : []))
      .catch(() => setImages([]))
  }, [])

  // Intersection Observer for scroll animation
  const observerCallback = useCallback((entries: IntersectionObserverEntry[]) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const idx = parseInt(entry.target.getAttribute('data-index') || '0')
        setVisibleItems(prev => new Set(prev).add(idx))
      }
    })
  }, [])

  const itemRefs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    const observer = new IntersectionObserver(observerCallback, {
      threshold: 0.1,
      rootMargin: '50px'
    })

    itemRefs.current.forEach(el => {
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [images, observerCallback])

  const openLightbox = (index: number) => {
    setActiveIndex(index)
    setLightboxOpen(true)
    document.body.style.overflow = 'hidden'
  }

  const closeLightbox = () => {
    setLightboxOpen(false)
    document.body.style.overflow = ''
  }

  const goNext = () => setActiveIndex(prev => (prev + 1) % images.length)
  const goPrev = () => setActiveIndex(prev => (prev - 1 + images.length) % images.length)

  // Keyboard navigation
  useEffect(() => {
    if (!lightboxOpen) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox()
      if (e.key === 'ArrowLeft') goNext()
      if (e.key === 'ArrowRight') goPrev()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [lightboxOpen, images.length])

  if (images.length === 0) return null

  const getSizeClass = (index: number) => {
    const pattern = index % 6
    if (pattern === 0) return 'gallery-tall'
    if (pattern === 3) return 'gallery-wide'
    return ''
  }

  return (
    <section className="gallery-section" id="gallery">
      <div className="container">
        <div className="gallery-section-header">
          <Camera size={24} color="#D2691E" />
          <h2>{t('gallery.title')}</h2>
          <p>{t('gallery.subtitle')}</p>
        </div>

        <div className="gallery-masonry-grid">
          {images.map((image, index) => (
            <div
              key={image.id}
              ref={el => { itemRefs.current[index] = el }}
              data-index={index}
              className={`gallery-grid-item ${getSizeClass(index)} ${visibleItems.has(index) ? 'gallery-visible' : ''}`}
              onClick={() => openLightbox(index)}
              style={{ transitionDelay: `${(index % 6) * 0.1}s` }}
            >
              <img
                src={image.imagePath}
                alt={image.title || `صورة ${index + 1}`}
                loading="lazy"
              />
              <div className="gallery-item-overlay">
                <span className="gallery-zoom-icon">🔍</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {lightboxOpen && (
        <div className="gallery-lightbox" onClick={closeLightbox}>
          <div className="gallery-lb-content" onClick={e => e.stopPropagation()}>
            <button className="gallery-lb-close" onClick={closeLightbox} aria-label="إغلاق">
              <X size={24} />
            </button>

            <button className="gallery-lb-nav gallery-lb-prev" onClick={goPrev} aria-label="السابق">
              <ChevronRight size={32} />
            </button>

            <div className="gallery-lb-image-wrapper">
              <img
                src={images[activeIndex]?.imagePath}
                alt={images[activeIndex]?.title || ''}
                key={activeIndex}
              />
              {/* Caption removed as per user request */}
            </div>

            <button className="gallery-lb-nav gallery-lb-next" onClick={goNext} aria-label="التالي">
              <ChevronLeft size={32} />
            </button>

            <div className="gallery-lb-counter">
              {activeIndex + 1} / {images.length}
            </div>

            <div className="gallery-lb-thumbnails">
              {images.map((img, i) => (
                <button
                  key={img.id}
                  className={`gallery-lb-thumb ${i === activeIndex ? 'gallery-lb-thumb-active' : ''}`}
                  onClick={() => setActiveIndex(i)}
                >
                  <img src={img.imagePath} alt="" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <style>{`
                .gallery-section {
                    padding: 5rem 0;
                    background: linear-gradient(180deg, var(--bg) 0%, color-mix(in srgb, var(--bg) 95%, var(--primary)) 100%);
                }
                .gallery-section-header {
                    text-align: center;
                    margin-bottom: 3rem;
                }
                .gallery-section-header h2 {
                    font-size: 2rem;
                    margin: 0.5rem 0;
                    color: var(--text);
                }
                .gallery-section-header p {
                    color: var(--text);
                    opacity: 0.6;
                    font-size: 1rem;
                }

                .gallery-masonry-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    grid-auto-rows: 200px;
                    gap: 12px;
                }
                .gallery-grid-item {
                    position: relative;
                    border-radius: 12px;
                    overflow: hidden;
                    cursor: pointer;
                    opacity: 0;
                    transform: translateY(20px);
                    transition: opacity 0.6s ease, transform 0.6s ease, box-shadow 0.3s;
                    background: var(--gray-200);
                }
                .gallery-grid-item.gallery-visible {
                    opacity: 1;
                    transform: translateY(0);
                }
                .gallery-tall {
                    grid-row: span 2;
                }
                .gallery-wide {
                    grid-column: span 2;
                }
                .gallery-grid-item img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    transition: transform 0.4s ease;
                }
                .gallery-grid-item:hover img {
                    transform: scale(1.08);
                }
                .gallery-grid-item:hover {
                    box-shadow: 0 8px 25px rgba(0,0,0,0.15);
                }

                .gallery-item-overlay {
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(transparent 40%, rgba(0,0,0,0.6) 100%);
                    display: flex;
                    align-items: flex-end;
                    justify-content: center;
                    padding: 1rem;
                    opacity: 0;
                    transition: opacity 0.3s;
                }
                .gallery-grid-item:hover .gallery-item-overlay {
                    opacity: 1;
                }
                .gallery-zoom-icon {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%) scale(0.5);
                    font-size: 2rem;
                    opacity: 0;
                    transition: all 0.3s;
                }
                .gallery-grid-item:hover .gallery-zoom-icon {
                    opacity: 1;
                    transform: translate(-50%, -50%) scale(1);
                }
                .gallery-item-title {
                    color: white;
                    font-size: 0.85rem;
                    font-weight: 500;
                }

                /* Lightbox */
                .gallery-lightbox {
                    position: fixed;
                    inset: 0;
                    background: rgba(0, 0, 0, 0.92);
                    z-index: 1000;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    animation: glbFadeIn 0.3s ease;
                    backdrop-filter: blur(10px);
                }
                @keyframes glbFadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                .gallery-lb-content {
                    position: relative;
                    width: 100%;
                    height: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .gallery-lb-close {
                    position: absolute;
                    top: 1.5rem;
                    left: 1.5rem;
                    color: white;
                    background: rgba(255,255,255,0.15);
                    border: none;
                    border-radius: 50%;
                    width: 44px;
                    height: 44px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 10;
                    cursor: pointer;
                    transition: background 0.2s;
                }
                .gallery-lb-close:hover {
                    background: rgba(255,255,255,0.3);
                }
                .gallery-lb-image-wrapper {
                    max-width: 85vw;
                    max-height: 75vh;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                }
                .gallery-lb-image-wrapper img {
                    max-width: 100%;
                    max-height: 70vh;
                    object-fit: contain;
                    border-radius: 8px;
                    animation: glbImageIn 0.3s ease;
                    box-shadow: 0 10px 40px rgba(0,0,0,0.5);
                }
                @keyframes glbImageIn {
                    from { opacity: 0; transform: scale(0.9); }
                    to { opacity: 1; transform: scale(1); }
                }
                .gallery-lb-caption {
                    color: white;
                    margin-top: 1rem;
                    font-size: 0.95rem;
                    opacity: 0.8;
                }
                .gallery-lb-nav {
                    position: absolute;
                    top: 50%;
                    transform: translateY(-50%);
                    color: white;
                    background: rgba(255,255,255,0.1);
                    border: none;
                    border-radius: 50%;
                    width: 50px;
                    height: 50px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 10;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .gallery-lb-nav:hover {
                    background: rgba(255,255,255,0.25);
                    transform: translateY(-50%) scale(1.1);
                }
                .gallery-lb-prev { right: 1.5rem; }
                .gallery-lb-next { left: 1.5rem; }
                .gallery-lb-counter {
                    position: absolute;
                    top: 1.5rem;
                    right: 1.5rem;
                    color: white;
                    font-size: 0.9rem;
                    opacity: 0.7;
                    background: rgba(0,0,0,0.3);
                    padding: 0.3rem 0.75rem;
                    border-radius: 20px;
                }
                .gallery-lb-thumbnails {
                    position: absolute;
                    bottom: 1.5rem;
                    left: 50%;
                    transform: translateX(-50%);
                    display: flex;
                    gap: 6px;
                    max-width: 90vw;
                    overflow-x: auto;
                    padding: 0.5rem;
                }
                .gallery-lb-thumb {
                    width: 50px;
                    height: 50px;
                    border-radius: 6px;
                    overflow: hidden;
                    flex-shrink: 0;
                    opacity: 0.5;
                    border: 2px solid transparent;
                    transition: all 0.2s;
                    padding: 0;
                    cursor: pointer;
                }
                .gallery-lb-thumb-active {
                    opacity: 1;
                    border-color: var(--primary);
                    transform: scale(1.1);
                }
                .gallery-lb-thumb:hover { opacity: 0.8; }
                .gallery-lb-thumb img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                @media (max-width: 768px) {
                    .gallery-masonry-grid {
                        grid-template-columns: repeat(2, 1fr);
                        grid-auto-rows: 160px;
                        gap: 8px;
                    }
                    .gallery-wide { grid-column: span 1; }
                    .gallery-lb-nav { width: 40px; height: 40px; }
                    .gallery-lb-prev { right: 0.5rem; }
                    .gallery-lb-next { left: 0.5rem; }
                    .gallery-lb-thumb { width: 40px; height: 40px; }
                }
                @media (max-width: 480px) {
                    .gallery-masonry-grid {
                        grid-template-columns: repeat(2, 1fr);
                        grid-auto-rows: 140px;
                    }
                    .gallery-tall { grid-row: span 1; }
                }
            `}</style>
    </section>
  )
}
