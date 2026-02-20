'use client'

import Link from 'next/link'
import { ShoppingBag, Settings, Moon, Sun, User } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { useTheme } from '@/context/ThemeContext'

import Image from 'next/image'

export default function Navbar() {
  const { toggleCart, items } = useCart()
  const { theme, toggleTheme } = useTheme()
  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <nav className="navbar">
      <div className="container navbar-content">
        <Link href="/" className="logo-link">
          <Image
            src="/logo-brand.svg"
            alt="Cinnamon Basbosa Brand Logo"
            width={0}
            height={0}
            sizes="100vw"
            style={{ width: 'auto', height: '80px', maxWidth: 'none' }}
            className="logo-img"
            priority
          />
        </Link>

        <div className="nav-actions">
          <button
            className="theme-btn"
            onClick={toggleTheme}
            aria-label={theme === 'light' ? 'الوضع الليلي' : 'الوضع النهاري'}
            title={theme === 'light' ? 'الوضع الليلي' : 'الوضع النهاري'}
          >
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>
          <Link href="/my-account" className="account-btn" aria-label="حسابي" title="حسابي">
            <User size={22} />
          </Link>
          <Link href="/admin" className="admin-btn" aria-label="Admin Dashboard">
            <Settings size={24} />
          </Link>
          <button className="cart-btn" aria-label="Open Cart" onClick={toggleCart}>
            <ShoppingBag size={24} />
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </button>
        </div>
      </div>

      <style jsx>{`
        .navbar {
          background-color: var(--white);
          height: var(--header-height);
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          z-index: 1000;
          box-shadow: 0 2px 10px rgba(0,0,0,0.05);
          display: flex;
          align-items: center;
          transition: background-color 0.3s;
        }
        .navbar-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .logo {
          font-family: var(--font-heading);
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--primary);
        }
        .nav-actions {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .theme-btn {
          color: var(--text);
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: var(--gray-100);
          transition: all 0.3s;
        }
        .theme-btn:hover {
          color: var(--primary);
          background: var(--gray-200);
          transform: rotate(20deg);
        }
        .account-btn {
          color: var(--text);
          transition: color 0.2s;
          display: flex;
          align-items: center;
        }
        .account-btn:hover {
          color: var(--primary);
        }
        .admin-btn {
          color: var(--text);
          transition: color 0.2s;
          display: flex;
          align-items: center;
        }
        .admin-btn:hover {
          color: var(--primary);
        }
        .cart-btn {
          position: relative;
          color: var(--text);
          transition: color 0.2s;
        }
        .cart-btn:hover {
          color: var(--primary);
        }
        .cart-badge {
          position: absolute;
          top: -5px;
          right: -5px;
          background-color: var(--primary);
          color: white;
          font-size: 0.75rem;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
        }
      `}</style>
    </nav>
  )
}
