'use client'

import { useState, useEffect } from 'react'
import { useLanguage } from '@/context/LanguageContext'
import Link from 'next/link'
import { MapPin, Phone, Clock, Instagram, MessageCircle, Twitter, Share2 } from 'lucide-react'

export default function Footer() {
    const { t } = useLanguage()
    const [settings, setSettings] = useState<Record<string, string>>({})

    useEffect(() => {
        fetch('/api/settings')
            .then(res => res.json())
            .then(data => setSettings(data))
            .catch(() => { })
    }, [])

    const whatsappNumber = settings['whatsappNumber'] || '966500000000'
    const storeName = settings['storeName'] || 'بسبوسة القرفة'

    return (
        <footer className="footer">
            <div className="footer-wave">
                <svg viewBox="0 0 1440 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M0 50L48 45.7C96 41.3 192 32.7 288 30.8C384 29 480 34 576 41.3C672 48.7 768 58.3 864 55.2C960 52 1056 36 1152 30.8C1248 25.7 1344 31.3 1392 34.2L1440 37V101H1392C1344 101 1248 101 1152 101C1056 101 960 101 864 101C768 101 672 101 576 101C480 101 384 101 288 101C192 101 96 101 48 101H0V50Z" fill="#1a1a1a" />
                </svg>
            </div>

            <div className="footer-main">
                <div className="container">
                    <div className="footer-grid">
                        {/* Brand Section */}
                        <div className="footer-brand">
                            <h3 className="footer-logo">{storeName}</h3>
                            <p className="footer-desc">
                                {settings['footerDesc'] || t('footer.desc')}
                            </p>
                            <div className="social-links">
                                <a
                                    href={`https://wa.me/${whatsappNumber}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="social-link whatsapp"
                                    aria-label="WhatsApp"
                                >
                                    <MessageCircle size={20} />
                                </a>

                                {settings.social_instagram && (
                                    <a
                                        href={settings.social_instagram}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="social-link instagram"
                                        aria-label="Instagram"
                                    >
                                        <Instagram size={20} />
                                    </a>
                                )}

                                {settings.social_twitter && (
                                    <a
                                        href={settings.social_twitter}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="social-link twitter"
                                        aria-label="Twitter"
                                    >
                                        <Twitter size={20} />
                                    </a>
                                )}

                                {settings.social_snapchat && (
                                    <a
                                        href={settings.social_snapchat}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="social-link snapchat"
                                        aria-label="Snapchat"
                                    >
                                        <Share2 size={20} />
                                    </a>
                                )}

                                {settings.social_tiktok && (
                                    <a
                                        href={settings.social_tiktok}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="social-link tiktok"
                                        aria-label="TikTok"
                                    >
                                        <Share2 size={20} />
                                    </a>
                                )}
                            </div>
                        </div>

                        {/* Quick Links */}
                        <div className="footer-links">
                            <h4>{t('footer.quickLinks')}</h4>
                            <ul>
                                <li>
                                    <a href="#" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }) }}>
                                        {t('footer.home')}
                                    </a>
                                </li>
                                <li>
                                    <a href="#products" onClick={(e) => { e.preventDefault(); document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' }) }}>
                                        {t('footer.products')}
                                    </a>
                                </li>
                                <li>
                                    <a href="#gallery" onClick={(e) => { e.preventDefault(); document.getElementById('gallery')?.scrollIntoView({ behavior: 'smooth' }) }}>
                                        {t('footer.gallery')}
                                    </a>
                                </li>
                            </ul>
                        </div>

                        {/* Contact */}
                        <div className="footer-contact">
                            <h4>{t('footer.contact')}</h4>
                            <div className="contact-items">
                                <a
                                    href={`https://wa.me/${whatsappNumber}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="contact-item"
                                >
                                    <Phone size={16} />
                                    <span dir="ltr">+{whatsappNumber}</span>
                                </a>
                                <div className="contact-item">
                                    <Clock size={16} />
                                    <span>{t('footer.hours')}</span>
                                </div>
                                <div className="contact-item">
                                    <MapPin size={16} />
                                    <span>{t('footer.country')}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom bar */}
            <div className="footer-bottom">
                <div className="container">
                    <p>© {new Date().getFullYear()} {storeName}. {t('footer.rights')}</p>
                </div>
            </div>

            <style jsx>{`
                .footer {
                    position: relative;
                    margin-top: 0;
                }

                .footer-wave {
                    line-height: 0;
                    margin-bottom: -2px;
                }
                .footer-wave svg {
                    width: 100%;
                    height: auto;
                }

                .footer-main {
                    background: #1a1a1a;
                    padding: 3rem 0 2rem;
                }

                .footer-grid {
                    display: grid;
                    grid-template-columns: 2fr 1fr 1.5fr;
                    gap: 3rem;
                }

                @media (max-width: 768px) {
                    .footer-grid {
                        grid-template-columns: 1fr;
                        gap: 2rem;
                        text-align: center;
                    }
                }

                .footer-logo {
                    font-family: var(--font-heading);
                    font-size: 1.5rem;
                    color: var(--primary);
                    margin-bottom: 0.75rem;
                }

                .footer-desc {
                    color: #9ca3af;
                    font-size: 0.9rem;
                    line-height: 1.7;
                    margin-bottom: 1.25rem;
                }

                .social-links {
                    display: flex;
                    gap: 0.75rem;
                }
                @media (max-width: 768px) {
                    .social-links {
                        justify-content: center;
                    }
                }

                .social-link {
                    width: 40px;
                    height: 40px;
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    transition: all 0.3s ease;
                }
                .social-link.whatsapp {
                    background: #25d366;
                }
                .social-link.whatsapp:hover {
                    background: #1da851;
                    transform: translateY(-3px);
                }
                .social-link.instagram {
                    background: linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888);
                }
                .social-link.instagram:hover {
                    opacity: 0.85;
                    transform: translateY(-3px);
                }
                .social-link.twitter {
                    background: #1DA1F2;
                }
                .social-link.twitter:hover {
                    background: #0d8bd9;
                    transform: translateY(-3px);
                }
                .social-link.snapchat {
                    background: #FFFC00;
                    color: #000;
                }
                .social-link.snapchat:hover {
                    background: #e6e300;
                    transform: translateY(-3px);
                }
                .social-link.tiktok {
                    background: #000000;
                    border: 1px solid #333;
                }
                .social-link.tiktok:hover {
                    background: #222;
                    transform: translateY(-3px);
                }

                .footer-links h4,
                .footer-contact h4 {
                    color: white;
                    font-size: 1rem;
                    margin-bottom: 1rem;
                    position: relative;
                    padding-bottom: 0.5rem;
                }
                .footer-links h4::after,
                .footer-contact h4::after {
                    content: '';
                    position: absolute;
                    bottom: 0;
                    right: 0;
                    width: 30px;
                    height: 2px;
                    background: var(--primary);
                }
                @media (max-width: 768px) {
                    .footer-links h4::after,
                    .footer-contact h4::after {
                        right: 50%;
                        transform: translateX(50%);
                    }
                }

                .footer-links ul {
                    list-style: none;
                    padding: 0;
                    margin: 0;
                }
                .footer-links li {
                    margin-bottom: 0.5rem;
                }
                .footer-links a {
                    color: #9ca3af;
                    text-decoration: none;
                    font-size: 0.9rem;
                    transition: color 0.2s, padding-right 0.2s;
                    display: inline-block;
                }
                .footer-links a:hover {
                    color: var(--primary);
                    padding-right: 5px;
                }

                .contact-items {
                    display: flex;
                    flex-direction: column;
                    gap: 0.75rem;
                }
                .contact-item {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    color: #9ca3af;
                    font-size: 0.9rem;
                    text-decoration: none;
                    transition: color 0.2s;
                }
                a.contact-item:hover {
                    color: var(--primary);
                }
                @media (max-width: 768px) {
                    .contact-items {
                        align-items: center;
                    }
                }

                .footer-bottom {
                    background: #111;
                    padding: 1rem 0;
                    text-align: center;
                }
                .footer-bottom p {
                    color: #6b7280;
                    font-size: 0.8rem;
                    margin: 0;
                }
            `}</style>
        </footer>
    )
}
