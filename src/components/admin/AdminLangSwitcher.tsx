'use client'

import { useLanguage } from '@/context/LanguageContext'
import { Languages } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function AdminLangSwitcher() {
    const { language, toggleLanguage, t } = useLanguage()
    const router = useRouter()

    const handleToggle = () => {
        toggleLanguage()
        // Refresh the router to force server components to re-render with the new cookie
        router.refresh()
    }

    return (
        <button
            onClick={handleToggle}
            className="admin-lang-btn"
            title={t('common.language')}
            aria-label={t('common.language')}
        >
            <Languages size={20} />
            <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>
                {language === 'ar' ? 'English' : 'عربي'}
            </span>
            <style jsx>{`
                .admin-lang-btn {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    background: none;
                    border: 1px solid #e5e7eb;
                    padding: 0.4rem 0.8rem;
                    border-radius: 6px;
                    color: #4b5563;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .admin-lang-btn:hover {
                    background: #f3f4f6;
                    color: var(--primary);
                    border-color: #d1d5db;
                }
            `}</style>
        </button>
    )
}
