'use client'

import { useState } from 'react'
import { Lock, User, Shield, Users2 } from 'lucide-react'

import Image from 'next/image'

type LoginMode = 'admin' | 'staff'

export default function AdminLogin() {
  const [mode, setMode] = useState<LoginMode>('admin')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // ... (keep handlers as is) ...
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })

      if (res.ok) {
        window.location.href = '/admin/dashboard'
      } else {
        setError('كلمة المرور غير صحيحة')
      }
    } catch {
      setError('حدث خطأ ما')
    } finally {
      setLoading(false)
    }
  }

  const handleStaffLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/staff/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })

      const data = await res.json()

      if (data.success) {
        window.location.href = '/admin/dashboard'
      } else {
        setError(data.error || 'بيانات الدخول غير صحيحة')
      }
    } catch {
      setError('حدث خطأ ما')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="logo-wrapper">
          <Image src="/logo-brand.svg" alt="Cinnamon Basbosa Brand Logo" width={180} height={60} style={{ width: '100%', height: 'auto', maxWidth: '180px' }} />
        </div>
        <h1>لوحة التحكم</h1>

        {/* Mode Toggle */}
        <div className="mode-toggle">
          <button
            className={`mode-btn ${mode === 'admin' ? 'active' : ''}`}
            onClick={() => { setMode('admin'); setError(''); setPassword(''); setUsername('') }}
            type="button"
          >
            <Lock size={16} />
            <span>المدير</span>
          </button>
          <button
            className={`mode-btn ${mode === 'staff' ? 'active' : ''}`}
            onClick={() => { setMode('staff'); setError(''); setPassword(''); setUsername('') }}
            type="button"
          >
            <Users2 size={16} />
            <span>موظف</span>
          </button>
        </div>

        {/* Admin Login */}
        {mode === 'admin' && (
          <form onSubmit={handleAdminLogin}>
            <div className="input-group">
              <Lock size={18} className="input-icon" />
              <input
                type="password"
                placeholder="كلمة مرور المدير"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>
            {error && <p className="error">{error}</p>}
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'جاري الدخول...' : 'دخول كمدير'}
            </button>
          </form>
        )}

        {/* Staff Login */}
        {mode === 'staff' && (
          <form onSubmit={handleStaffLogin}>
            <div className="input-group">
              <User size={18} className="input-icon" />
              <input
                type="text"
                placeholder="اسم المستخدم"
                value={username}
                onChange={e => setUsername(e.target.value)}
                autoFocus
              />
            </div>
            <div className="input-group">
              <Lock size={18} className="input-icon" />
              <input
                type="password"
                placeholder="كلمة المرور"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>
            {error && <p className="error">{error}</p>}
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'جاري الدخول...' : 'دخول كموظف'}
            </button>
          </form>
        )}
      </div>

      <style>{`
                .login-container {
                    height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
                    padding: 1.5rem;
                }
                .login-card {
                    background: white;
                    padding: 2.5rem 2rem;
                    border-radius: 16px;
                    box-shadow: 0 20px 60px rgba(0,0,0,0.3);
                    width: 100%;
                    max-width: 420px;
                    text-align: center;
                }
                .icon-wrapper {
                    width: 64px;
                    height: 64px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, var(--primary), #f59e0b);
                    color: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 auto 1rem;
                }
                .login-card h1 {
                    margin-bottom: 1.5rem;
                    font-size: 1.5rem;
                    color: #1f2937;
                }

                .mode-toggle {
                    display: flex;
                    gap: 0;
                    background: #f3f4f6;
                    border-radius: 10px;
                    padding: 4px;
                    margin-bottom: 1.5rem;
                }
                .mode-btn {
                    flex: 1;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.4rem;
                    padding: 0.65rem;
                    border-radius: 8px;
                    font-size: 0.9rem;
                    font-weight: 500;
                    color: #6b7280;
                    transition: all 0.2s;
                    cursor: pointer;
                    border: none;
                    background: transparent;
                    font-family: inherit;
                }
                .mode-btn.active {
                    background: white;
                    color: var(--primary);
                    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                }

                .input-group {
                    position: relative;
                    margin-bottom: 1rem;
                }
                .input-group input {
                    width: 100%;
                    padding: 0.8rem 1rem 0.8rem 2.75rem;
                    border: 1px solid #e5e7eb;
                    border-radius: 10px;
                    font-size: 0.95rem;
                    font-family: inherit;
                    color: #1f2937;
                    outline: none;
                    transition: border-color 0.2s;
                    background: #f9fafb;
                }
                .input-group input:focus {
                    border-color: var(--primary);
                    background: white;
                }
                .input-group :global(.input-icon) {
                    position: absolute;
                    right: 0.85rem;
                    top: 50%;
                    transform: translateY(-50%);
                    color: #9ca3af;
                }

                .error {
                    color: #ef4444;
                    margin-bottom: 1rem;
                    font-size: 0.85rem;
                    background: #fef2f2;
                    padding: 0.5rem;
                    border-radius: 6px;
                    border: 1px solid #fecaca;
                }

                .submit-btn {
                    width: 100%;
                    padding: 0.85rem;
                    background: var(--primary);
                    color: white;
                    border: none;
                    border-radius: 10px;
                    font-size: 1rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                    font-family: inherit;
                    box-shadow: 0 4px 12px rgba(210,105,30,0.25);
                }
                .submit-btn:hover:not(:disabled) {
                    background: var(--primary-hover);
                    transform: translateY(-1px);
                }
                .submit-btn:disabled {
                    opacity: 0.7;
                    cursor: not-allowed;
                }
            `}</style>
    </div>
  )
}
