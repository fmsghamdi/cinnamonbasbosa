'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { CheckCircle, Home, MessageCircle, Package } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

import { useLanguage } from '@/context/LanguageContext'

function OrderSuccessContent() {
    const searchParams = useSearchParams()
    const { t } = useLanguage()
    const orderId = searchParams.get('id') || ''
    const [countdown, setCountdown] = useState(15)
    const [whatsappLink, setWhatsappLink] = useState('')

    useEffect(() => {
        // Check for pending WhatsApp link
        const pendingLink = sessionStorage.getItem('pending_whatsapp_link')
        if (pendingLink) {
            setWhatsappLink(pendingLink)
            // Keep it for a bit in case they refresh, but maybe clear on navigating away?
            // For now let's keep it simple.
        }
    }, [])

    return (
        <div className="success-page">
            <div className="success-container">
                {/* Success Animation */}
                <div className="success-icon-wrapper">
                    <div className="success-circle">
                        <CheckCircle size={60} />
                    </div>
                    <div className="ripple ripple-1"></div>
                    <div className="ripple ripple-2"></div>
                    <div className="ripple ripple-3"></div>
                </div>

                <h1 className="success-title">{t('orderSuccess.title')}</h1>

                {orderId && (
                    <div className="order-id-badge">
                        <span>{t('orderSuccess.orderNumber')}</span>
                        <strong>#{orderId}</strong>
                    </div>
                )}

                <p className="success-message">
                    {t('orderSuccess.thanksMessage')} <strong>{t('orderSuccess.brandName')}</strong>
                    <br />
                    {t('orderSuccess.whatsappPrompt')}
                </p>

                {/* WhatsApp Button */}
                {whatsappLink ? (
                    <a
                        href={whatsappLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="whatsapp-btn-large"
                    >
                        <MessageCircle size={24} />
                        {t('orderSuccess.whatsappBtn')}
                    </a>
                ) : (
                    /* Fallback if link missing for some reason */
                    <Link href="/" className="btn-action btn-home">
                        {t('orderSuccess.backHome')}
                    </Link>
                )}

                {/* Steps */}
                <div className="steps">
                    <div className="step">
                        <div className="step-number">1</div>
                        <div className="step-text">
                            <h4>{t('orderSuccess.step1Title')}</h4>
                            <p>{t('orderSuccess.step1Desc')}</p>
                        </div>
                    </div>
                    <div className="step-line"></div>
                    <div className="step pending">
                        <div className="step-number">2</div>
                        <div className="step-text">
                            <h4>{t('orderSuccess.step2Title')}</h4>
                            <p>{t('orderSuccess.step2Desc')}</p>
                        </div>
                    </div>
                    <div className="step-line"></div>
                    <div className="step pending">
                        <div className="step-number">3</div>
                        <div className="step-text">
                            <h4>{t('orderSuccess.step3Title')}</h4>
                            <p>{t('orderSuccess.step3Desc')}</p>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="actions">
                    <Link href="/" className="btn-action btn-home-outline">
                        <Home size={20} />
                        <span>{t('orderSuccess.backHome')}</span>
                    </Link>
                </div>
            </div>

            {/* Confetti Effect */}
            <div className="confetti-container" aria-hidden="true">
                {Array.from({ length: 30 }).map((_, i) => (
                    <div
                        key={i}
                        className="confetti"
                        style={{
                            left: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 3}s`,
                            animationDuration: `${2 + Math.random() * 3}s`,
                            backgroundColor: ['#D2691E', '#f59e0b', '#22c55e', '#3b82f6', '#8b5cf6', '#ef4444'][i % 6],
                            width: `${6 + Math.random() * 6}px`,
                            height: `${6 + Math.random() * 6}px`,
                        }}
                    />
                ))}
            </div>

            <style jsx>{`
                .success-page {
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: linear-gradient(135deg, #fdf2e9 0%, #fef9f5 50%, #f0fdf4 100%);
                    padding: 2rem;
                    position: relative;
                    overflow: hidden;
                }

                .success-container {
                    text-align: center;
                    max-width: 500px;
                    width: 100%;
                    animation: slideUp 0.6s ease;
                }

                @keyframes slideUp {
                    from {
                        opacity: 0;
                        transform: translateY(30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                /* Success Icon */
                .success-icon-wrapper {
                    position: relative;
                    width: 120px;
                    height: 120px;
                    margin: 0 auto 2rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .success-circle {
                    width: 90px;
                    height: 90px;
                    background: linear-gradient(135deg, #22c55e, #16a34a);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    animation: scaleIn 0.5s ease 0.2s both;
                    z-index: 2;
                    box-shadow: 0 8px 25px rgba(34, 197, 94, 0.35);
                }
                @keyframes scaleIn {
                    from { transform: scale(0); }
                    to { transform: scale(1); }
                }

                .ripple {
                    position: absolute;
                    width: 100%;
                    height: 100%;
                    border-radius: 50%;
                    border: 2px solid #22c55e;
                    opacity: 0;
                    animation: rippleAnim 2s ease infinite;
                }
                .ripple-2 { animation-delay: 0.5s; }
                .ripple-3 { animation-delay: 1s; }
                @keyframes rippleAnim {
                    0% { transform: scale(0.5); opacity: 0.6; }
                    100% { transform: scale(1.5); opacity: 0; }
                }

                .success-title {
                    font-size: 1.75rem;
                    color: #1f2937;
                    margin-bottom: 1rem;
                    font-weight: 700;
                }

                .order-id-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5rem;
                    background: white;
                    padding: 0.5rem 1.25rem;
                    border-radius: 50px;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.06);
                    margin-bottom: 1.25rem;
                    font-size: 0.95rem;
                    color: #6b7280;
                }
                .order-id-badge strong {
                    color: var(--primary);
                    font-size: 1.1rem;
                }

                .success-message {
                    color: #6b7280;
                    font-size: 1rem;
                    line-height: 1.8;
                    margin-bottom: 2rem;
                }
                .success-message strong {
                    color: var(--primary);
                }

                /* Steps */
                .steps {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0;
                    margin-bottom: 2.5rem;
                    background: white;
                    padding: 1.5rem;
                    border-radius: 16px;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.04);
                }
                .step {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }
                .step-number {
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #22c55e, #16a34a);
                    color: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 700;
                    font-size: 0.85rem;
                    flex-shrink: 0;
                }
                .step.pending .step-number {
                    background: #e5e7eb;
                    color: #9ca3af;
                }
                .step-text h4 {
                    font-size: 0.75rem;
                    margin: 0;
                    color: #374151;
                }
                .step-text p {
                    font-size: 0.65rem;
                    color: #9ca3af;
                    margin: 0;
                }
                .step.pending .step-text h4 {
                    color: #9ca3af;
                }
                .step-line {
                    width: 30px;
                    height: 2px;
                    background: #e5e7eb;
                    margin: 0 0.25rem;
                }

                @media (max-width: 480px) {
                    .steps {
                        flex-direction: column;
                        gap: 0.5rem;
                    }
                    .step-line {
                        width: 2px;
                        height: 20px;
                    }
                }

                /* Actions */
                .actions {
                    display: flex;
                    gap: 1rem;
                    justify-content: center;
                    margin-bottom: 1.5rem;
                }
                .btn-action {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.75rem 1.5rem;
                    border-radius: 10px;
                    font-weight: 600;
                    font-size: 0.95rem;
                    text-decoration: none;
                    transition: all 0.2s ease;
                }
                .whatsapp-btn-large {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.75rem;
                    background: #25D366;
                    color: white;
                    padding: 1rem 2rem;
                    border-radius: 12px;
                    font-weight: 700;
                    font-size: 1.1rem;
                    text-decoration: none;
                    margin-bottom: 2rem;
                    box-shadow: 0 4px 15px rgba(37, 211, 102, 0.3);
                    transition: transform 0.2s ease;
                    width: 100%;
                }
                .whatsapp-btn-large:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(37, 211, 102, 0.4);
                }
                .btn-home {
                    background: var(--primary);
                    color: white;
                    box-shadow: 0 4px 12px rgba(210, 105, 30, 0.3);
                }
                .btn-home:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 18px rgba(210, 105, 30, 0.4);
                }
                .btn-home-outline {
                    background: transparent;
                    color: #6b7280;
                    border: 2px solid #e5e7eb;
                }
                .btn-home-outline:hover {
                    border-color: #d1d5db;
                    color: #374151;
                    background: #f9fafb;
                }

                .redirect-msg {
                    color: #9ca3af;
                    font-size: 0.8rem;
                }
                .redirect-msg strong {
                    color: var(--primary);
                }

                /* Confetti */
                .confetti-container {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    pointer-events: none;
                    z-index: 0;
                }
                .confetti {
                    position: absolute;
                    top: -10px;
                    border-radius: 2px;
                    animation: confettiFall linear infinite;
                    opacity: 0.8;
                }
                @keyframes confettiFall {
                    0% {
                        transform: translateY(-10vh) rotate(0deg);
                        opacity: 1;
                    }
                    100% {
                        transform: translateY(100vh) rotate(720deg);
                        opacity: 0;
                    }
                }
            `}</style>
        </div>
    )
}

export default function OrderSuccessPage() {
    return (
        <Suspense fallback={
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <p>Loading...</p>
            </div>
        }>
            <OrderSuccessContent />
        </Suspense>
    )
}
