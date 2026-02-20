'use client'

import { CartProvider } from '@/context/CartContext'
import { ThemeProvider } from '@/context/ThemeContext'

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <ThemeProvider>
            <CartProvider>
                {children}
            </CartProvider>
        </ThemeProvider>
    )
}
