'use client'

import React, { useEffect, useState } from 'react'
import { useCart } from '@/context/CartContext'
import { useLanguage } from '@/context/LanguageContext'
import { X, Minus, Plus, Trash2, ArrowLeft, ShoppingBag } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function Cart() {
  const { isOpen, toggleCart, items, removeFromCart, updateQuantity, total } = useCart()
  const { t } = useLanguage()
  const router = useRouter()
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) return null
  if (!isOpen) return null

  const handleProceedToCheckout = () => {
    toggleCart()
    router.push('/checkout')
  }

  return (
    <>
      <div className="cart-overlay" onClick={toggleCart}>
        <div className="cart-modal" onClick={e => e.stopPropagation()}>

          {/* Header */}
          <div className="cart-header">
            <div className="flex items-center gap-3">
              <div className="icon-bg">
                <ShoppingBag size={22} color="#D2691E" />
              </div>
              <h2 className="text-xl font-bold text-gray-800">{t('cartSection.title')}</h2>
              {items.length > 0 && (
                <span className="badge">{items.reduce((acc, item) => acc + item.quantity, 0)}</span>
              )}
            </div>
            <button onClick={toggleCart} className="close-btn">
              <X size={24} />
            </button>
          </div>

          {/* Items Container */}
          <div className="cart-body">
            {items.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon-wrapper">
                  <ShoppingBag size={56} color="#e5e7eb" />
                </div>
                <h3 className="text-lg font-bold text-gray-600 mt-4">{t('cartSection.emptyTitle')}</h3>
                <p className="text-gray-400 text-sm mt-2">{t('cartSection.emptySubtitle')}</p>
                <button onClick={toggleCart} className="start-shopping-btn">
                  {t('cartSection.browseBtn')}
                </button>
              </div>
            ) : (
              <div className="items-list">
                {items.map((item, index) => (
                  <div key={`${item.id}-${item.options || index}`} className="cart-item">
                    <div className="item-image-wrapper">
                      {/* Fallback image */}
                      <img
                        src={item.imagePath || '/placeholder.png'}
                        alt={item.name}
                        className="item-image"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://placehold.co/100x100?text=Sweet'
                        }}
                      />
                    </div>

                    <div className="item-details">
                      <div className="flex justify-between items-start">
                        <h4 className="font-bold text-gray-800 text-sm line-clamp-1">{item.name}</h4>
                        {item.options && (
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full mt-1 inline-block">
                            {item.options}
                          </span>
                        )}
                        <button className="delete-btn" onClick={() => removeFromCart(item.id, item.options)}>
                          <Trash2 size={18} />
                        </button>
                      </div>

                      <div className="flex justify-between items-end mt-2">
                        <p className="item-price">{item.price} {t('common.currency')}</p>

                        <div className="quantity-controls">
                          <button
                            className="qty-btn"
                            onClick={() => updateQuantity(item.id, item.quantity - 1, item.options)}
                            disabled={item.quantity <= 1}
                          >
                            <Minus size={14} />
                          </button>
                          <span className="qty-val">{item.quantity}</span>
                          <button
                            className="qty-btn"
                            onClick={() => updateQuantity(item.id, item.quantity + 1, item.options)}
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="cart-footer">
              <div className="flex justify-between items-center mb-4">
                <span className="text-gray-500 font-medium">{t('cartSection.total')}</span>
                <span className="total-price">{total} {t('common.currency')}</span>
              </div>

              <button className="checkout-btn-modern" onClick={handleProceedToCheckout}>
                <span>{t('cartSection.checkout')}</span>
                <ArrowLeft size={20} className="icon-slide" />
              </button>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        /* Overlay Backdrop */
        .cart-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.4);
          backdrop-filter: blur(6px); /* Strong blur for focus */
          z-index: 10000;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: bgFadeIn 0.3s ease forwards;
        }

        /* The Modal Card */
        .cart-modal {
          width: 90%;
          max-width: 500px;
          max-height: 85vh;
          background: white;
          border-radius: 24px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.2);
          display: flex;
          flex-direction: column;
          position: relative;
          overflow: hidden;
          animation: modalPop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1); /* Bouncy pop effect */
        }

        /* Header */
        .cart-header {
          padding: 1.25rem 1.5rem;
          border-bottom: 1px solid #f3f4f6;
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: #fff;
          z-index: 10;
        }

        .icon-bg {
            background: #fff7ed;
            padding: 8px;
            border-radius: 12px;
        }

        .badge {
            background: #D2691E;
            color: white;
            font-size: 0.75rem;
            padding: 2px 8px;
            border-radius: 12px;
            font-weight: bold;
        }

        .close-btn {
            background: #f3f4f6;
            width: 36px;
            height: 36px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #6b7280;
            transition: all 0.2s;
        }
        .close-btn:hover {
            background: #ffe4e6;
            color: #e11d48;
            transform: rotate(90deg);
        }

        /* Body & Scroll Area */
        .cart-body {
          flex: 1;
          overflow-y: auto;
          padding: 1.5rem;
          /* Custom Scrollbar */
          scrollbar-width: thin;
          scrollbar-color: #e5e7eb transparent;
        }

        /* Items List */
        .items-list {
            display: flex;
            flex-direction: column;
            gap: 1rem;
        }

        /* Cart Item Card */
        .cart-item {
          display: flex;
          gap: 1rem;
          padding: 0.75rem;
          background: #f9fafb;
          border: 1px solid transparent;
          border-radius: 16px;
          transition: all 0.2s;
        }
        .cart-item:hover {
            background: white;
            box-shadow: 0 4px 15px rgba(0,0,0,0.05);
            border-color: #f3f4f6;
            transform: translateY(-2px);
        }

        .item-image-wrapper {
            width: 70px;
            height: 70px;
            border-radius: 12px;
            overflow: hidden;
            flex-shrink: 0;
            background: white;
        }
        
        .item-image {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        .item-details {
            flex: 1;
            display: flex;
            flex-direction: column;
            justify-content: center;
        }

        .item-price {
            color: #D2691E;
            font-weight: 800;
        }

        .delete-btn {
            color: #9ca3af;
            padding: 4px;
            transition: color 0.2s;
        }
        .delete-btn:hover {
            color: #ef4444;
        }

        /* Quantity Controls */
        .quantity-controls {
            display: flex;
            align-items: center;
            gap: 8px;
            background: white;
            padding: 2px;
            border-radius: 8px;
            box-shadow: 0 1px 2px rgba(0,0,0,0.05);
        }

        .qty-btn {
            width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 6px;
            color: #374151;
            transition: all 0.2s;
        }
        .qty-btn:hover:not(:disabled) {
            background: #f3f4f6;
            color: #000;
        }
        .qty-btn:disabled {
            opacity: 0.3;
            cursor: default;
        }

        .qty-val {
            font-weight: 700;
            font-size: 0.9rem;
            color: #1f2937;
            min-width: 20px;
            text-align: center;
        }

        /* Footer */
        .cart-footer {
          padding: 1.5rem;
          background: white;
          border-top: 1px solid #f3f4f6;
          z-index: 10;
        }

        .total-price {
            font-size: 1.5rem;
            font-weight: 800;
            color: #D2691E;
        }

        /* Checkout Button */
        .checkout-btn-modern {
            width: 100%;
            background: #D2691E;
            color: white;
            padding: 1rem;
            border-radius: 16px;
            font-weight: bold;
            font-size: 1.1rem;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
            transition: all 0.3s;
            box-shadow: 0 4px 15px rgba(210, 105, 30, 0.3);
        }
        .checkout-btn-modern:hover {
            background: #b55a19;
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(210, 105, 30, 0.4);
        }
        .checkout-btn-modern:active {
            transform: translateY(0);
        }
        .checkout-btn-modern:hover .icon-slide {
            transform: translateX(-4px);
        }
        .icon-slide {
            transition: transform 0.2s;
        }

        /* Empty State */
        .empty-state {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100%;
            padding: 2rem;
            text-align: center;
        }
        .empty-icon-wrapper {
            background: #f9fafb;
            padding: 1.5rem;
            border-radius: 50%;
            margin-bottom: 1rem;
        }
        .start-shopping-btn {
            margin-top: 1.5rem;
            padding: 0.75rem 2rem;
            background: #1f2937;
            color: white;
            border-radius: 30px;
            font-weight: 600;
            transition: all 0.2s;
        }
        .start-shopping-btn:hover {
            background: #374151;
            transform: scale(1.05);
        }

        /* Animations */
        @keyframes bgFadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        @keyframes modalPop {
            0% { transform: scale(0.9); opacity: 0; }
            100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </>
  )
}
