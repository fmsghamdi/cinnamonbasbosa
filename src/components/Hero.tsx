'use client'

import Image from 'next/image'
import { useState, useEffect } from 'react'
import { useLanguage } from '@/context/LanguageContext'

export default function Hero() {
  const [heroImage, setHeroImage] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const { t } = useLanguage()

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data.heroImage) {
          setHeroImage(data.heroImage)
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  return (
    <section className="hero">
      <div className="container hero-content">
        <div className="hero-text">
          <h1>{t('hero.title')}</h1>
          <p>{t('hero.subtitle')}</p>
          <button
            className="btn-primary-hero"
            onClick={() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })}
          >
            {t('hero.cta')}
          </button>
        </div>

        <div className="hero-image-wrapper">
          {loading ? (
            <div className="hero-skeleton"></div>
          ) : (
            <img
              src={heroImage || '/hero-basbosa.jpg'}
              alt="بسبوسة القرفة الفاخرة"
              className="hero-img"
              onError={(e) => {
                // If the dynamic image fails, fallback to something safe or hide it
                (e.target as HTMLImageElement).src = 'https://placehold.co/600x400/D2691E/FFFFFF?text=Basbosa';
              }}
            />
          )}
        </div>
      </div>

      <style jsx>{`
        .hero {
          padding: 6rem 0 4rem;
          background: linear-gradient(135deg, var(--bg) 0%, var(--card-bg) 100%);
          transition: background 0.3s ease;
        }

        .hero-content {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4rem;
          align-items: center;
        }

        .hero-text {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          animation: slideUp 0.6s ease-out;
        }

        .hero-text h1 {
          font-size: 3.5rem;
          color: var(--primary);
          margin-bottom: 1.5rem;
          font-weight: 800;
          line-height: 1.2;
        }

        .hero-text p {
          font-size: 1.25rem;
          color: var(--text);
          margin-bottom: 2.5rem;
          opacity: 0.9;
          line-height: 1.8;
          max-width: 90%;
        }

        .btn-primary-hero {
          background: var(--primary);
          color: white;
          padding: 1rem 3rem;
          border-radius: 50px;
          font-size: 1.2rem;
          font-weight: bold;
          border: none;
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
          box-shadow: 0 10px 25px -5px rgba(208, 41, 48, 0.4);
        }
        
        .btn-primary-hero:hover {
          transform: translateY(-3px);
          box-shadow: 0 15px 30px -5px rgba(208, 41, 48, 0.5);
          background-color: var(--primary-hover);
        }

        .hero-image-wrapper {
          position: relative;
          width: 100%;
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 20px 40px -10px rgba(0,0,0,0.15);
          transform: perspective(1000px) rotateY(-5deg);
          transition: transform 0.5s ease;
          animation: fadeIn 0.8s ease-out;
          background-color: var(--gray-100);
          aspect-ratio: 4/3;
        }
        
        .hero-image-wrapper:hover {
          transform: perspective(1000px) rotateY(0deg);
        }

        .hero-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        /* Skeleton Loading */
        .hero-skeleton {
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, var(--gray-100) 25%, var(--gray-200) 50%, var(--gray-100) 75%);
          background-size: 200% 100%;
          animation: loading 1.5s infinite;
        }

        @keyframes loading {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }

        /* Dark Mode Specifics */
        :global([data-theme="dark"]) .hero {
          background: linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 100%);
        }
        :global([data-theme="dark"]) .hero-text p {
          color: #e5e5e5;
        }
        :global([data-theme="dark"]) .hero-image-wrapper {
          box-shadow: 0 20px 40px -10px rgba(0,0,0,0.5);
          background-color: #2a2a2a;
        }
        :global([data-theme="dark"]) .hero-skeleton {
          background: linear-gradient(90deg, #2a2a2a 25%, #333 50%, #2a2a2a 75%);
        }

        @media (max-width: 900px) {
          .hero { padding: 4rem 0; }
          .hero-content {
            grid-template-columns: 1fr;
            text-align: center;
            gap: 3rem;
          }
          .hero-text { align-items: center; }
          .hero-text h1 { font-size: 2.5rem; }
          .hero-text p { margin-right: auto; margin-left: auto; }
          .hero-image-wrapper {
            transform: none;
            order: -1;
            max-width: 600px;
            margin: 0 auto;
          }
          .hero-image-wrapper:hover { transform: none; }
        }
      `}</style>
    </section>
  )
}
