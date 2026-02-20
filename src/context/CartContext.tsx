'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { Product, CartItem } from '@/types'

interface CartContextType {
    items: CartItem[]
    addToCart: (product: Product, options?: string) => void
    removeFromCart: (productId: number, options?: string) => void
    updateQuantity: (productId: number, quantity: number, options?: string) => void
    isOpen: boolean
    toggleCart: () => void
    clearCart: () => void
    total: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([])
    const [isOpen, setIsOpen] = useState(false)
    const [total, setTotal] = useState(0)
    const [isLoaded, setIsLoaded] = useState(false)

    // Load cart from localStorage on mount
    useEffect(() => {
        try {
            const saved = localStorage.getItem('cart_items')
            if (saved) {
                const parsed = JSON.parse(saved)
                if (Array.isArray(parsed) && parsed.length > 0) {
                    setItems(parsed)
                }
            }
        } catch (e) {
            console.error('Failed to load cart from localStorage', e)
        }
        setIsLoaded(true)
    }, [])

    // Save cart to localStorage whenever items change
    useEffect(() => {
        if (!isLoaded) return // Don't save until initial load is done
        try {
            localStorage.setItem('cart_items', JSON.stringify(items))
        } catch (e) {
            console.error('Failed to save cart to localStorage', e)
        }
    }, [items, isLoaded])

    // Calculate total whenever items change
    useEffect(() => {
        const newTotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
        setTotal(newTotal)
    }, [items])

    const addToCart = (product: Product, options?: string) => {
        setItems(prev => {
            const existing = prev.find(item => item.id === product.id && item.options === options)
            if (existing) {
                return prev.map(item =>
                    (item.id === product.id && item.options === options)
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                )
            }
            return [...prev, { ...product, quantity: 1, options }]
        })
        setIsOpen(true) // Open cart when adding item
    }

    const removeFromCart = (productId: number, options?: string) => {
        setItems(prev => prev.filter(item => !(item.id === productId && item.options === options)))
    }

    const updateQuantity = (productId: number, quantity: number, options?: string) => {
        if (quantity < 1) {
            removeFromCart(productId, options)
            return
        }
        setItems(prev => prev.map(item =>
            (item.id === productId && item.options === options)
                ? { ...item, quantity }
                : item
        ))
    }

    const toggleCart = () => setIsOpen(!isOpen)

    const clearCart = () => {
        setItems([])
        localStorage.removeItem('cart_items')
    }

    return (
        <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, isOpen, toggleCart, total }}>
            {children}
        </CartContext.Provider>
    )
}

export const useCart = () => {
    const context = useContext(CartContext)
    if (!context) throw new Error('useCart must be used within a CartProvider')
    return context
}
