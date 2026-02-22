'use client'

import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations, Language } from '@/translations';

type LanguageContextType = {
    language: Language;
    toggleLanguage: () => void;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [language, setLanguageState] = useState<Language>('ar');

    useEffect(() => {
        const savedLang = localStorage.getItem('language') as Language;
        if (savedLang && (savedLang === 'ar' || savedLang === 'en')) {
            setLanguageState(savedLang);
            document.cookie = `NEXT_LOCALE=${savedLang}; path=/; max-age=31536000; SameSite=Lax`;
        }
    }, []);

    useEffect(() => {
        document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
        document.documentElement.lang = language;
    }, [language]);

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
        localStorage.setItem('language', lang);
        document.cookie = `NEXT_LOCALE=${lang}; path=/; max-age=31536000; SameSite=Lax`;
    };

    const toggleLanguage = () => {
        setLanguage(language === 'ar' ? 'en' : 'ar');
    };

    const t = (path: string): string => {
        const keys = path.split('.');
        let current: any = translations[language];
        for (const key of keys) {
            if (current === undefined || current[key] === undefined) {
                // Fallback to arabic if english is missing
                let fallback: any = translations['ar'];
                for (const fbKey of keys) {
                    if (fallback === undefined || fallback[fbKey] === undefined) return path;
                    fallback = fallback[fbKey];
                }
                return fallback as string;
            }
            current = current[key];
        }
        return current as string;
    };

    return (
        <LanguageContext.Provider value={{ language, toggleLanguage, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}
