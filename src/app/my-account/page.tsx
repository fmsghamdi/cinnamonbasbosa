'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
    User, ShoppingBag, LogOut, Edit3, Save, X, Phone, MapPin,
    Package, CheckCircle, XCircle, Clock, ChevronDown, ChevronUp, ArrowRight,
    Home, Briefcase, MapPinned, Trash2, Bookmark
} from 'lucide-react'

interface CustomerData {
    id: number
    name: string
    phone: string
    address: string | null
}

interface OrderData {
    id: number
    items: string
    total: number
    status: string
    paymentMethod: string
    deliveryDate: string | null
    deliveryTime: string | null
    createdAt: string
}

interface SavedAddress {
    id: number
    label: string
    address: string
    latitude: number
    longitude: number
    isDefault: boolean
}

import { useLanguage } from '@/context/LanguageContext'

export default function MyAccountPage() {
    const router = useRouter()
    const { t } = useLanguage()
    const [customer, setCustomer] = useState<CustomerData | null>(null)
    const [orders, setOrders] = useState<OrderData[]>([])
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState<'orders' | 'profile'>('orders')
    const [editing, setEditing] = useState(false)
    const [editName, setEditName] = useState('')
    const [editAddress, setEditAddress] = useState('')
    const [saving, setSaving] = useState(false)
    const [expandedOrder, setExpandedOrder] = useState<number | null>(null)
    const [saveMsg, setSaveMsg] = useState('')
    const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([])

    useEffect(() => {
        const stored = localStorage.getItem('customer')
        if (!stored) {
            router.push('/my-account/login')
            return
        }

        const cust = JSON.parse(stored) as CustomerData
        setCustomer(cust)
        setEditName(cust.name)
        setEditAddress(cust.address || '')
        fetchOrders(cust.id)
        fetchSavedAddresses(cust.id)
    }, [])

    const fetchOrders = async (customerId: number) => {
        try {
            const res = await fetch(`/api/customer/orders?customerId=${customerId}`)
            const data = await res.json()
            if (data.customer) {
                setCustomer(data.customer)
                setEditName(data.customer.name)
                setEditAddress(data.customer.address || '')
            }
            setOrders(data.orders || [])
        } catch {
            console.error('Error fetching orders')
        } finally {
            setLoading(false)
        }
    }

    const fetchSavedAddresses = async (customerId: number) => {
        try {
            const res = await fetch(`/api/customer/addresses?customerId=${customerId}`)
            const data = await res.json()
            if (data.addresses) setSavedAddresses(data.addresses)
        } catch {
            console.error('Error fetching saved addresses')
        }
    }

    const handleDeleteAddress = async (addrId: number) => {
        if (!customer) return
        if (!confirm(t('checkout.confirmDeleteAddress'))) return

        try {
            const res = await fetch(`/api/customer/addresses?id=${addrId}&customerId=${customer.id}`, {
                method: 'DELETE'
            })
            if (res.ok) {
                setSavedAddresses(prev => prev.filter(a => a.id !== addrId))
            }
        } catch {
            console.error('Error deleting address')
        }
    }

    const getAddressIcon = (label: string) => {
        const lower = label.toLowerCase()
        if (lower.includes('منزل') || lower.includes('بيت') || lower.includes('home')) return <Home size={18} />
        if (lower.includes('مكتب') || lower.includes('عمل') || lower.includes('office') || lower.includes('work')) return <Briefcase size={18} />
        return <MapPinned size={18} />
    }

    const handleSaveProfile = async () => {
        if (!customer || !editName) return
        setSaving(true)
        try {
            const res = await fetch('/api/customer/update', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    customerId: customer.id,
                    name: editName,
                    address: editAddress
                })
            })
            const data = await res.json()
            if (data.success) {
                setCustomer(data.customer)
                localStorage.setItem('customer', JSON.stringify(data.customer))
                setEditing(false)
                setSaveMsg(t('myAccount.savedSuccess'))
                setTimeout(() => setSaveMsg(''), 3000)
            }
        } catch {
            console.error('Error updating profile')
        } finally {
            setSaving(false)
        }
    }

    const handleLogout = () => {
        localStorage.removeItem('customer')
        router.push('/')
    }

    const getStatusInfo = (status: string) => {
        switch (status) {
            case 'new': return { text: t('admin.statusNew'), color: '#3b82f6', bg: '#eff6ff', icon: <Clock size={14} /> }
            case 'completed': return { text: t('admin.statusCompleted'), color: '#22c55e', bg: '#f0fdf4', icon: <CheckCircle size={14} /> }
            case 'cancelled': return { text: t('admin.statusCancelled'), color: '#ef4444', bg: '#fef2f2', icon: <XCircle size={14} /> }
            default: return { text: status, color: '#6b7280', bg: '#f9fafb', icon: <Package size={14} /> }
        }
    }

    const getPaymentText = (method: string) => {
        switch (method) {
            case 'cash': return t('admin.payCash')
            case 'transfer': return t('admin.payTransfer')
            case 'apple': return t('admin.payApple')
            default: return method
        }
    }

    const parseItems = (s: string) => {
        try { return JSON.parse(s) as { name: string; price: number; quantity: number }[] }
        catch { return [] }
    }

    if (loading) {
        return (
            <div className="loading-screen">
                <div className="spinner"></div>
                <p>{t('myAccount.loading')}</p>
                <style jsx>{`
                    .loading-screen { min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1rem; background: var(--bg); }
                    .spinner { width: 40px; height: 40px; border: 3px solid var(--gray-200); border-top-color: var(--primary); border-radius: 50%; animation: spin 0.8s linear infinite; }
                    @keyframes spin { to { transform: rotate(360deg); } }
                `}</style>
            </div>
        )
    }

    if (!customer) return null

    const totalSpent = orders.reduce((sum, o) => sum + o.total, 0)
    const completedOrders = orders.filter(o => o.status === 'completed').length

    return (
        <div className="account-page">
            <div className="account-container">
                {/* Header */}
                <div className="account-header">
                    <Link href="/" className="back-link">
                        <ArrowRight size={18} />
                        <span>{t('myAccount.backToSite')}</span>
                    </Link>
                    <button className="logout-btn" onClick={handleLogout}>
                        <LogOut size={16} />
                        <span>{t('myAccount.logout')}</span>
                    </button>
                </div>

                {/* Profile Summary */}
                <div className="profile-summary">
                    <div className="profile-avatar">
                        {customer.name.charAt(0)}
                    </div>
                    <h1>{t('myAccount.welcome')}{customer.name}</h1>
                    <p className="profile-phone" dir="ltr">{customer.phone}</p>
                </div>

                {/* Stats */}
                <div className="stats-row">
                    <div className="stat-item">
                        <span className="stat-value">{orders.length}</span>
                        <span className="stat-label">{t('myAccount.order')}</span>
                    </div>
                    <div className="stat-divider"></div>
                    <div className="stat-item">
                        <span className="stat-value">{completedOrders}</span>
                        <span className="stat-label">{t('myAccount.completed')}</span>
                    </div>
                    <div className="stat-divider"></div>
                    <div className="stat-item">
                        <span className="stat-value">{totalSpent.toFixed(0)}</span>
                        <span className="stat-label">{t('myAccount.totalSpent')}</span>
                    </div>
                </div>

                {/* Tabs */}
                <div className="tabs">
                    <button
                        className={`tab ${activeTab === 'orders' ? 'active' : ''}`}
                        onClick={() => setActiveTab('orders')}
                    >
                        <ShoppingBag size={16} />
                        <span>{t('myAccount.myOrders')}</span>
                    </button>
                    <button
                        className={`tab ${activeTab === 'profile' ? 'active' : ''}`}
                        onClick={() => setActiveTab('profile')}
                    >
                        <User size={16} />
                        <span>{t('myAccount.myDetails')}</span>
                    </button>
                </div>

                {/* Orders Tab */}
                {activeTab === 'orders' && (
                    <div className="tab-content">
                        {orders.length === 0 ? (
                            <div className="empty">
                                <ShoppingBag size={48} />
                                <p>{t('myAccount.noOrders')}</p>
                                <Link href="/" className="shop-link">{t('myAccount.browseProducts')}</Link>
                            </div>
                        ) : (
                            <div className="orders-list">
                                {orders.map(order => {
                                    const status = getStatusInfo(order.status)
                                    const items = parseItems(order.items)
                                    const isExpanded = expandedOrder === order.id

                                    return (
                                        <div key={order.id} className="order-card">
                                            <div
                                                className="order-header"
                                                onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                                            >
                                                <div className="order-id-section">
                                                    <span className="order-num">#{order.id}</span>
                                                    <span className="order-date">
                                                        {new Date(order.createdAt).toLocaleDateString('ar-SA')}
                                                    </span>
                                                </div>
                                                <div className="order-status-section">
                                                    <span
                                                        className="status-pill"
                                                        style={{ color: status.color, backgroundColor: status.bg }}
                                                    >
                                                        {status.icon}
                                                        {status.text}
                                                    </span>
                                                    <span className="order-total-inline">{order.total} ر.س</span>
                                                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                                </div>
                                            </div>

                                            {isExpanded && (
                                                <div className="order-details">
                                                    <div className="items-list">
                                                        {items.map((item, i) => (
                                                            <div key={i} className="item-row">
                                                                <span className="item-name">{item.name}</span>
                                                                <span className="item-qty">×{item.quantity}</span>
                                                                <span className="item-price">{(item.price * item.quantity).toFixed(0)} ر.س</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <div className="order-meta">
                                                        <div className="meta-item">
                                                            <span>{t('myAccount.payment')}</span>
                                                            <span>{getPaymentText(order.paymentMethod)}</span>
                                                        </div>
                                                        {order.deliveryDate && (
                                                            <div className="meta-item">
                                                                <span>{t('myAccount.delivery')}</span>
                                                                <span>{order.deliveryDate} {order.deliveryTime || ''}</span>
                                                            </div>
                                                        )}
                                                        <div className="meta-item total-row">
                                                            <span>{t('myAccount.total')}</span>
                                                            <span>{order.total} {t('common.currency')}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* Profile Tab */}
                {activeTab === 'profile' && (
                    <div className="tab-content">
                        {saveMsg && <div className="success-msg">{saveMsg}</div>}

                        <div className="profile-card">
                            <div className="field">
                                <label><Phone size={14} /> {t('myAccount.phone')}</label>
                                <p className="field-value" dir="ltr">{customer.phone}</p>
                                <span className="field-note">{t('myAccount.phoneNote')}</span>
                            </div>

                            <div className="field">
                                <label><User size={14} /> {t('myAccount.name')}</label>
                                {editing ? (
                                    <input
                                        type="text"
                                        value={editName}
                                        onChange={(e) => setEditName(e.target.value)}
                                        className="edit-input"
                                    />
                                ) : (
                                    <p className="field-value">{customer.name}</p>
                                )}
                            </div>

                            <div className="field">
                                <label><MapPin size={14} /> {t('myAccount.address')}</label>
                                {editing ? (
                                    <textarea
                                        value={editAddress}
                                        onChange={(e) => setEditAddress(e.target.value)}
                                        placeholder={t('myAccount.addressPlaceholder')}
                                        className="edit-input"
                                        rows={2}
                                    />
                                ) : (
                                    <p className="field-value">{customer.address || t('myAccount.noAddress')}</p>
                                )}
                            </div>

                            {editing ? (
                                <div className="edit-actions">
                                    <button className="save-btn" onClick={handleSaveProfile} disabled={saving}>
                                        <Save size={16} />
                                        {saving ? t('myAccount.saving') : t('myAccount.save')}
                                    </button>
                                    <button className="cancel-btn" onClick={() => {
                                        setEditing(false)
                                        setEditName(customer.name)
                                        setEditAddress(customer.address || '')
                                    }}>
                                        <X size={16} />
                                        {t('myAccount.cancel')}
                                    </button>
                                </div>
                            ) : (
                                <button className="edit-btn" onClick={() => setEditing(true)}>
                                    <Edit3 size={16} />
                                    {t('myAccount.editDetails')}
                                </button>
                            )}
                        </div>

                        {/* Saved Addresses Section */}
                        <div className="saved-addr-section">
                            <div className="saved-addr-title">
                                <Bookmark size={16} />
                                <span>{t('myAccount.savedAddresses')}</span>
                            </div>

                            {savedAddresses.length === 0 ? (
                                <div className="no-addresses">
                                    <MapPin size={32} />
                                    <p>{t('myAccount.noSavedAddresses')}</p>
                                    <p className="no-addr-hint">{t('myAccount.noSavedAddressesHint')}</p>
                                </div>
                            ) : (
                                <div className="addr-grid">
                                    {savedAddresses.map(addr => (
                                        <div key={addr.id} className="addr-card">
                                            <div className="addr-card-header">
                                                <div className="addr-card-icon">
                                                    {getAddressIcon(addr.label)}
                                                </div>
                                                <div className="addr-card-info">
                                                    <span className="addr-card-label">{addr.label}</span>
                                                    {addr.isDefault && <span className="addr-badge">{t('checkout.defaultAddress')}</span>}
                                                </div>
                                                <button
                                                    className="addr-card-delete"
                                                    onClick={() => handleDeleteAddress(addr.id)}
                                                    title={t('checkout.deleteAddress')}
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                            <p className="addr-card-text">{addr.address}</p>
                                            <a
                                                href={`https://www.google.com/maps?q=${addr.latitude},${addr.longitude}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="addr-card-map-link"
                                            >
                                                <MapPin size={12} />
                                                {t('myAccount.viewOnMap')}
                                            </a>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <style jsx>{`
                .account-page {
                    min-height: 100vh;
                    background: var(--bg);
                    padding: 1.5rem;
                }
                .account-container {
                    max-width: 600px;
                    margin: 0 auto;
                }

                .account-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 2rem;
                }
                .back-link {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.35rem;
                    color: var(--text);
                    opacity: 0.7;
                    font-size: 0.9rem;
                    transition: opacity 0.2s;
                }
                .back-link:hover { opacity: 1; color: var(--primary); }
                .logout-btn {
                    display: flex;
                    align-items: center;
                    gap: 0.35rem;
                    color: #ef4444;
                    font-size: 0.85rem;
                    padding: 0.5rem 0.75rem;
                    border-radius: 8px;
                    transition: background 0.2s;
                }
                .logout-btn:hover { background: #fef2f2; }

                .profile-summary {
                    text-align: center;
                    margin-bottom: 1.5rem;
                }
                .profile-avatar {
                    width: 72px;
                    height: 72px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, var(--primary), #f59e0b);
                    color: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 700;
                    font-size: 2rem;
                    margin: 0 auto 1rem;
                    box-shadow: 0 4px 12px rgba(210,105,30,0.25);
                }
                .profile-summary h1 {
                    font-size: 1.5rem;
                    margin-bottom: 0.25rem;
                }
                .profile-phone {
                    color: #6b7280;
                    font-size: 0.9rem;
                }

                .stats-row {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 1.5rem;
                    background: white;
                    border-radius: 12px;
                    padding: 1.25rem;
                    margin-bottom: 1.5rem;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.04);
                    border: 1px solid #f3f4f6;
                }
                .stat-item { text-align: center; }
                .stat-value {
                    display: block;
                    font-size: 1.25rem;
                    font-weight: 700;
                    color: var(--primary);
                }
                .stat-label {
                    font-size: 0.75rem;
                    color: #9ca3af;
                }
                .stat-divider {
                    width: 1px;
                    height: 30px;
                    background: #e5e7eb;
                }

                .tabs {
                    display: flex;
                    gap: 0;
                    background: white;
                    border-radius: 12px;
                    padding: 4px;
                    margin-bottom: 1.5rem;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.04);
                    border: 1px solid #f3f4f6;
                }
                .tab {
                    flex: 1;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.4rem;
                    padding: 0.7rem;
                    border-radius: 10px;
                    font-size: 0.9rem;
                    font-weight: 500;
                    color: #6b7280;
                    transition: all 0.2s;
                }
                .tab.active {
                    background: var(--primary);
                    color: white;
                    box-shadow: 0 2px 8px rgba(210,105,30,0.2);
                }

                .empty {
                    text-align: center;
                    padding: 3rem 1rem;
                    color: #d1d5db;
                }
                .empty p {
                    color: #9ca3af;
                    margin: 1rem 0;
                }
                .shop-link {
                    display: inline-block;
                    background: var(--primary);
                    color: white;
                    padding: 0.6rem 1.5rem;
                    border-radius: 8px;
                    font-weight: 500;
                    transition: background 0.2s;
                }
                .shop-link:hover { background: var(--primary-hover); }

                /* Orders */
                .orders-list {
                    display: flex;
                    flex-direction: column;
                    gap: 0.75rem;
                }
                .order-card {
                    background: white;
                    border-radius: 12px;
                    overflow: hidden;
                    border: 1px solid #f3f4f6;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.03);
                }
                .order-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 1rem 1.25rem;
                    cursor: pointer;
                    transition: background 0.2s;
                }
                .order-header:hover { background: #fafafa; }
                .order-id-section {
                    display: flex;
                    flex-direction: column;
                    gap: 0.2rem;
                }
                .order-num {
                    font-weight: 700;
                    font-size: 1rem;
                }
                .order-date {
                    font-size: 0.75rem;
                    color: #9ca3af;
                }
                .order-status-section {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                }
                .status-pill {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.3rem;
                    padding: 0.25rem 0.6rem;
                    border-radius: 20px;
                    font-size: 0.75rem;
                    font-weight: 500;
                }
                .order-total-inline {
                    font-weight: 600;
                    font-size: 0.9rem;
                    color: #1f2937;
                }

                .order-details {
                    border-top: 1px solid #f3f4f6;
                    padding: 1rem 1.25rem;
                    background: #fafafa;
                    animation: slideDown 0.2s ease;
                }
                @keyframes slideDown {
                    from { opacity: 0; max-height: 0; }
                    to { opacity: 1; max-height: 500px; }
                }
                .items-list {
                    margin-bottom: 1rem;
                }
                .item-row {
                    display: flex;
                    align-items: center;
                    padding: 0.4rem 0;
                    font-size: 0.85rem;
                    border-bottom: 1px dashed #e5e7eb;
                }
                .item-row:last-child { border-bottom: none; }
                .item-name { flex: 1; }
                .item-qty { color: #9ca3af; margin: 0 1rem; }
                .item-price { font-weight: 500; }

                .order-meta {
                    display: flex;
                    flex-direction: column;
                    gap: 0.35rem;
                    padding-top: 0.75rem;
                    border-top: 1px solid #e5e7eb;
                }
                .meta-item {
                    display: flex;
                    justify-content: space-between;
                    font-size: 0.8rem;
                    color: #6b7280;
                }
                .total-row {
                    font-weight: 700;
                    font-size: 0.9rem;
                    color: var(--text);
                    padding-top: 0.35rem;
                    border-top: 1px solid #e5e7eb;
                }

                /* Profile */
                .success-msg {
                    background: #f0fdf4;
                    color: #22c55e;
                    padding: 0.75rem;
                    border-radius: 8px;
                    text-align: center;
                    margin-bottom: 1rem;
                    font-size: 0.9rem;
                    border: 1px solid #bbf7d0;
                }
                .profile-card {
                    background: white;
                    border-radius: 12px;
                    padding: 1.5rem;
                    border: 1px solid #f3f4f6;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.03);
                }
                .field {
                    margin-bottom: 1.25rem;
                    padding-bottom: 1.25rem;
                    border-bottom: 1px solid #f3f4f6;
                }
                .field:last-of-type { border-bottom: none; margin-bottom: 1rem; }
                .field label {
                    display: flex;
                    align-items: center;
                    gap: 0.4rem;
                    font-size: 0.8rem;
                    color: #9ca3af;
                    margin-bottom: 0.5rem;
                    font-weight: 500;
                }
                .field-value {
                    font-size: 1rem;
                    color: var(--text);
                }
                .field-note {
                    font-size: 0.7rem;
                    color: #d1d5db;
                    margin-top: 0.25rem;
                    display: block;
                }
                .edit-input {
                    width: 100%;
                    padding: 0.65rem 0.75rem;
                    border: 1px solid #e5e7eb;
                    border-radius: 8px;
                    font-size: 0.95rem;
                    font-family: inherit;
                    color: var(--text);
                    outline: none;
                    transition: border-color 0.2s;
                    resize: vertical;
                }
                .edit-input:focus { border-color: var(--primary); }

                .edit-btn {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.5rem;
                    width: 100%;
                    padding: 0.7rem;
                    border: 1px solid #e5e7eb;
                    border-radius: 8px;
                    font-size: 0.9rem;
                    color: var(--text);
                    transition: all 0.2s;
                }
                .edit-btn:hover { border-color: var(--primary); color: var(--primary); }

                .edit-actions {
                    display: flex;
                    gap: 0.5rem;
                }
                .save-btn {
                    flex: 1;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.35rem;
                    padding: 0.7rem;
                    background: var(--primary);
                    color: white;
                    border-radius: 8px;
                    font-weight: 500;
                }
                .save-btn:disabled { opacity: 0.7; }
                .cancel-btn {
                    display: flex;
                    align-items: center;
                    gap: 0.35rem;
                    padding: 0.7rem 1rem;
                    border: 1px solid #e5e7eb;
                    border-radius: 8px;
                    color: #6b7280;
                    transition: all 0.2s;
                }
                .cancel-btn:hover { border-color: #ef4444; color: #ef4444; }

                /* Saved Addresses in Profile */
                .saved-addr-section {
                    margin-top: 1.5rem;
                }
                .saved-addr-title {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    font-size: 1rem;
                    font-weight: 700;
                    color: var(--text);
                    margin-bottom: 1rem;
                }
                .no-addresses {
                    text-align: center;
                    padding: 2rem 1rem;
                    background: white;
                    border-radius: 12px;
                    border: 1px dashed #e5e7eb;
                    color: #d1d5db;
                }
                .no-addresses p {
                    color: #9ca3af;
                    margin-top: 0.75rem;
                    font-size: 0.9rem;
                    font-weight: 600;
                }
                .no-addr-hint {
                    font-size: 0.8rem !important;
                    font-weight: 400 !important;
                    color: #d1d5db !important;
                    margin-top: 0.25rem !important;
                }
                .addr-grid {
                    display: flex;
                    flex-direction: column;
                    gap: 0.75rem;
                }
                .addr-card {
                    background: white;
                    border-radius: 12px;
                    padding: 1rem 1.25rem;
                    border: 1px solid #f3f4f6;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.03);
                    transition: border-color 0.2s;
                }
                .addr-card:hover {
                    border-color: var(--primary);
                }
                .addr-card-header {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    margin-bottom: 0.5rem;
                }
                .addr-card-icon {
                    width: 36px;
                    height: 36px;
                    border-radius: 10px;
                    background: #fff7ed;
                    color: var(--primary);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                }
                .addr-card-info {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    gap: 2px;
                }
                .addr-card-label {
                    font-weight: 700;
                    font-size: 0.95rem;
                    color: var(--text);
                }
                .addr-badge {
                    font-size: 0.7rem;
                    color: #22c55e;
                    font-weight: 600;
                }
                .addr-card-delete {
                    color: #d1d5db;
                    padding: 6px;
                    border-radius: 8px;
                    transition: all 0.2s;
                }
                .addr-card-delete:hover {
                    color: #ef4444;
                    background: #fef2f2;
                }
                .addr-card-text {
                    font-size: 0.85rem;
                    color: #6b7280;
                    margin-bottom: 0.5rem;
                    line-height: 1.4;
                }
                .addr-card-map-link {
                    display: inline-flex;
                    align-items: center;
                    gap: 4px;
                    font-size: 0.8rem;
                    color: var(--primary);
                    font-weight: 600;
                    transition: opacity 0.2s;
                }
                .addr-card-map-link:hover { opacity: 0.7; }

                @media (max-width: 480px) {
                    .stats-row { gap: 1rem; padding: 1rem; }
                    .stat-value { font-size: 1rem; }
                }
            `}</style>
        </div>
    )
}
