import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { LayoutDashboard, ShoppingBag, Settings, LogOut, Image as ImageIcon, Home, ClipboardList, BarChart3, Users, Users2, CreditCard } from 'lucide-react'
import LogoutButton from '@/components/admin/LogoutButton'

// Permission to page mapping
const permissionPages: Record<string, string> = {
    'orders': '/admin/orders',
    'products': '/admin/products',
    'gallery': '/admin/gallery',
    'customers': '/admin/customers',
    'reports': '/admin/reports',
    'payments': '/admin/payments',
    'settings': '/admin/settings',
}

interface StaffSession {
    id: number
    name: string
    role: string
    permissions: string[]
}

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
    const cookieStore = await cookies()
    const adminSession = cookieStore.get('admin_session')
    const staffSessionCookie = cookieStore.get('staff_session')

    const isAdmin = adminSession?.value === 'true'
    let staffSession: StaffSession | null = null

    if (staffSessionCookie?.value) {
        try {
            staffSession = JSON.parse(staffSessionCookie.value) as StaffSession
        } catch {
            staffSession = null
        }
    }

    if (!isAdmin && !staffSession) {
        redirect('/admin/login')
    }

    const hasPermission = (perm: string) => {
        if (isAdmin) return true
        if (staffSession?.role === 'manager') return true
        return staffSession?.permissions?.includes(perm) || false
    }

    const displayName = isAdmin ? 'المدير' : staffSession?.name || 'موظف'
    const roleLabel = isAdmin ? 'مالك النظام' : (staffSession?.role === 'manager' ? 'مدير' : 'موظف')

    return (
        <div className="dashboard-layout">
            <aside className="sidebar">
                <div className="brand">
                    <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'center' }}>
                        <Image src="/logo-brand.svg" alt="Logo" width={0} height={0} sizes="100vw" style={{ width: '100%', maxWidth: '160px', height: 'auto', marginBottom: '10px', filter: 'brightness(0) invert(1)' }} />
                    </div>
                    <h3>لوحة التحكم</h3>
                    <div className="user-info">
                        <span className="user-name">{displayName}</span>
                        <span className="user-role">{roleLabel}</span>
                    </div>
                </div>
                <nav>
                    <Link href="/" className="nav-item nav-item-home">
                        <Home size={20} />
                        <span>عرض الموقع</span>
                    </Link>
                    <div className="nav-divider"></div>
                    <Link href="/admin/dashboard" className="nav-item">
                        <LayoutDashboard size={20} />
                        <span>الرئيسية</span>
                    </Link>
                    {hasPermission('orders') && (
                        <Link href="/admin/orders" className="nav-item">
                            <ClipboardList size={20} />
                            <span>الطلبات</span>
                        </Link>
                    )}
                    {hasPermission('products') && (
                        <Link href="/admin/products" className="nav-item">
                            <ShoppingBag size={20} />
                            <span>المنتجات</span>
                        </Link>
                    )}
                    {hasPermission('gallery') && (
                        <Link href="/admin/gallery" className="nav-item">
                            <ImageIcon size={20} />
                            <span>معرض الصور</span>
                        </Link>
                    )}
                    {hasPermission('customers') && (
                        <Link href="/admin/customers" className="nav-item">
                            <Users size={20} />
                            <span>العملاء</span>
                        </Link>
                    )}
                    {hasPermission('reports') && (
                        <Link href="/admin/reports" className="nav-item">
                            <BarChart3 size={20} />
                            <span>التقارير</span>
                        </Link>
                    )}
                    {hasPermission('payments') && (
                        <Link href="/admin/payments" className="nav-item">
                            <CreditCard size={20} />
                            <span>طرق الدفع</span>
                        </Link>
                    )}
                    {isAdmin && (
                        <>
                            <Link href="/admin/staff" className="nav-item">
                                <Users2 size={20} />
                                <span>الموظفين</span>
                            </Link>
                            <Link href="/admin/settings" className="nav-item">
                                <Settings size={20} />
                                <span>الإعدادات</span>
                            </Link>
                        </>
                    )}
                    {!isAdmin && hasPermission('settings') && (
                        <Link href="/admin/settings" className="nav-item">
                            <Settings size={20} />
                            <span>الإعدادات</span>
                        </Link>
                    )}
                </nav>
                <div className="logout-wrapper">
                    <LogoutButton />
                </div>
            </aside>
            <main className="main-content">
                <header className="dashboard-header">
                    <div className="header-title">
                        <h2>لوحة التحكم</h2>
                    </div>
                    <div className="header-actions">
                        <LogoutButton />
                    </div>
                </header>
                <div className="content-wrapper">
                    {children}
                </div>
            </main>

            <style>{`
           .dashboard-layout {
              display: flex;
              min-height: 100vh;
           }
           .sidebar {
              width: 250px;
              background: #1a1a1a;
              color: white;
              display: flex;
              flex-direction: column;
              position: fixed;
              height: 100vh;
              overflow-y: auto;
           }
           .brand {
              padding: 1.5rem 2rem;
              border-bottom: 1px solid #333;
           }
           .brand h3 {
              margin-bottom: 0.5rem;
           }
           .user-info {
              display: flex;
              flex-direction: column;
              gap: 0.15rem;
           }
           .user-name {
              font-size: 0.85rem;
              color: #f59e0b;
              font-weight: 500;
           }
           .user-role {
              font-size: 0.7rem;
              color: #6b7280;
              background: #2a2a2a;
              display: inline-block;
              padding: 0.1rem 0.5rem;
              border-radius: 10px;
              width: fit-content;
           }
           .nav-item {
              display: flex;
              align-items: center;
              gap: 1rem;
              padding: 1rem 2rem;
              color: #ccc;
              transition: all 0.2s;
           }
            .nav-item:hover {
               background: #333;
               color: white;
            }
            .nav-item-home {
               background: #2a2a2a;
               border-bottom: 1px solid #444;
            }
            .nav-divider {
               height: 1px;
               background: #333;
               margin: 0.5rem 0;
            }
           .logout-wrapper {
              margin-top: auto;
              padding: 2rem;
              border-top: 1px solid #333;
           }
           .main-content {
              flex: 1;
              margin-right: 250px;
              background: #f4f6f8;
              min-height: 100vh;
              display: flex;
              flex-direction: column;
           }
           .dashboard-header {
              background: white;
              padding: 1rem 2rem;
              display: flex;
              align-items: center;
              justify-content: space-between;
              border-bottom: 1px solid #e5e7eb;
              position: sticky;
              top: 0;
              z-index: 10;
           }
           .header-title h2 {
              font-size: 1.25rem;
              color: #1f2937;
              margin: 0;
           }
           .content-wrapper {
              padding: 2rem;
              flex: 1;
              width: 100%; /* Ensure it doesnt overflow */
              overflow-x: hidden; /* Prevent body scroll */
           }
           @media (max-width: 768px) {
               .main-content { 
                    margin-right: 0 !important; 
                    width: 100%;
               }
               .content-wrapper { 
                    padding: 1rem; 
                    width: 100vw; /* Explicitly set viewport width */
                    max-width: 100%;
                    overflow-x: hidden;
               }
               .dashboard-header { 
                    padding: 1rem; 
                    width: 100%;
               }
           }
           @media (max-width: 768px) {
              .sidebar {
                 position: fixed;
                 bottom: 0;
                 top: auto;
                 width: 100%;
                 height: auto;
                 flex-direction: row;
                 z-index: 100;
                 border-top: 1px solid #333;
              }
              .brand { display: none; }
              .sidebar nav {
                 display: flex;
                 overflow-x: auto;
                 padding: 0;
              }
              .nav-item {
                 flex-direction: column;
                 padding: 0.5rem 0.75rem;
                 font-size: 0.7rem;
                 gap: 0.25rem;
                 white-space: nowrap;
              }
              .nav-item-home { border-bottom: none; }
              .nav-divider { display: none; }
              .logout-wrapper { display: none; }
              .main-content {
                 margin-right: 0;
                 padding: 1rem;
                 padding-bottom: 80px;
              }
           }
        `}</style>
        </div>
    )
}
