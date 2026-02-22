'use client'

import { CartProvider } from '@/context/CartContext'
import { ThemeProvider } from '@/context/ThemeContext'
import { LanguageProvider } from '@/context/LanguageContext'

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <LanguageProvider>
            <ThemeProvider>
                <CartProvider>
                    {children}
                </CartProvider>
            </ThemeProvider>
        </LanguageProvider>
    )
}
