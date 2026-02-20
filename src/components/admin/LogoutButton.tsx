'use client'

import { LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function LogoutButton() {
    const router = useRouter()

    const handleLogout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' })
        router.push('/admin/login')
        router.refresh()
    }

    return (
        <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem' }}>
            <LogOut size={20} />
            <span>تسجيل خروج</span>
        </button>
    )
}
