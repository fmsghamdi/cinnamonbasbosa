'use client'

import { useState, useEffect } from 'react'
import { Users, Phone, MapPin, ShoppingBag, Calendar, X, ChevronLeft, Search } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'

interface CustomerOrder {
    id: number
    items: string
    total: number
    status: string
    paymentMethod: string
    createdAt: string
}

interface Customer {
    id: number
    name: string
    phone: string
    address: string | null
    createdAt: string
    ordersCount: number
    totalSpent: number
    lastOrder: string | null
    orders: CustomerOrder[]
}

export default function CustomersPage() {
    const { t, language } = useLanguage()
    const [customers, setCustomers] = useState<Customer[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [resetPassportState, setResetPasswordState] = useState({ show: false, password: '' })
    const [isResetting, setIsResetting] = useState(false)

    useEffect(() => {
        fetchCustomers()
    }, [])

    const fetchCustomers = async () => {
        try {
            const res = await fetch('/api/customers')
            const data = await res.json()
            setCustomers(Array.isArray(data) ? data : [])
        } catch {
            setCustomers([])
        } finally {
            setLoading(false)
        }
    }

    const getStatusText = (status: string) => {
        switch (status) {
            case 'new': return t('admin.statusNew')
            case 'completed': return t('admin.statusCompleted')
            case 'cancelled': return t('admin.statusCancelled')
            default: return status
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'new': return '#3b82f6'
            case 'completed': return '#22c55e'
            case 'cancelled': return '#ef4444'
            default: return '#6b7280'
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

    const filteredCustomers = customers.filter(c =>
        c.name.includes(searchQuery) ||
        c.phone.includes(searchQuery) ||
        (c.address && c.address.includes(searchQuery))
    )

    const parseItems = (itemsStr: string) => {
        try {
            return JSON.parse(itemsStr) as { name: string; price: number; quantity: number }[]
        } catch {
            return []
        }
    }

    if (loading) {
        return <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>{t('admin.loading')}</div>
    }

    return (
        <div>
            <div className="page-header">
                <h1><Users size={24} /> {t('admin.manageCustomers')}</h1>
                <span className="customer-count">{customers.length} {t('admin.registeredCustomersCount')}</span>
            </div>

            {/* Search */}
            <div className="search-bar">
                <Search size={18} />
                <input
                    type="text"
                    placeholder={t('admin.searchByMobileName')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {filteredCustomers.length === 0 ? (
                <div className="empty-state">
                    <Users size={48} />
                    <p>{searchQuery ? t('admin.noResults') : t('admin.noCustomersRegistered')}</p>
                </div>
            ) : (
                <div className="customers-grid">
                    {filteredCustomers.map(customer => (
                        <div
                            key={customer.id}
                            className="customer-card"
                            onClick={() => setSelectedCustomer(customer)}
                        >
                            <div className="card-top">
                                <div className="avatar">
                                    {customer.name.charAt(0)}
                                </div>
                                <div className="card-info">
                                    <h3>{customer.name}</h3>
                                    <span className="phone-badge">
                                        <Phone size={12} />
                                        <span dir="ltr">{customer.phone}</span>
                                    </span>
                                </div>
                            </div>

                            <div className="card-stats">
                                <div className="stat">
                                    <ShoppingBag size={14} />
                                    <span>{customer.ordersCount} {t('admin.ordersCountLabel')}</span>
                                </div>
                                <div className="stat">
                                    <span className="spent">{customer.totalSpent.toFixed(0)} {t('common.currency')}</span>
                                </div>
                            </div>

                            <div className="card-footer">
                                <span className="date">
                                    <Calendar size={12} />
                                    {t('admin.registeredOn')} {new Date(customer.createdAt).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}
                                </span>
                                <span className="view-link">{t('admin.viewDetailsBtn')}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Customer Detail Modal */}
            {selectedCustomer && (
                <div className="modal-overlay" onClick={() => {
                    setSelectedCustomer(null)
                    setResetPasswordState({ show: false, password: '' })
                }}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <button className="back-btn" onClick={() => {
                                setSelectedCustomer(null)
                                setResetPasswordState({ show: false, password: '' })
                            }}>
                                <X size={20} />
                            </button>
                            <h2>{t('admin.customerDetails')}</h2>
                        </div>

                        <div className="modal-body">
                            {/* Customer Info */}
                            <div className="detail-section">
                                <div className="detail-avatar">
                                    {selectedCustomer.name.charAt(0)}
                                </div>
                                <h3>{selectedCustomer.name}</h3>

                                <div className="detail-items">
                                    <div className="detail-item">
                                        <Phone size={16} />
                                        <span dir="ltr">{selectedCustomer.phone}</span>
                                    </div>
                                    {selectedCustomer.address && (
                                        <div className="detail-item">
                                            <MapPin size={16} />
                                            <span>{selectedCustomer.address}</span>
                                        </div>
                                    )}
                                    <div className="detail-item">
                                        <Calendar size={16} />
                                        <span>{t('admin.registeredSince')} {new Date(selectedCustomer.createdAt).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}</span>
                                    </div>
                                </div>

                                <div className="detail-stats">
                                    <div className="d-stat">
                                        <span className="d-stat-value">{selectedCustomer.ordersCount}</span>
                                        <span className="d-stat-label">{t('admin.ordersCountLabel')}</span>
                                    </div>
                                    <div className="d-stat">
                                        <span className="d-stat-value">{selectedCustomer.totalSpent.toFixed(0)}</span>
                                        <span className="d-stat-label">{t('common.currency')} {t('admin.totalLabel')}</span>
                                    </div>
                                    <div className="d-stat">
                                        <span className="d-stat-value">
                                            {selectedCustomer.ordersCount > 0
                                                ? (selectedCustomer.totalSpent / selectedCustomer.ordersCount).toFixed(0)
                                                : 0}
                                        </span>
                                        <span className="d-stat-label">{t('common.currency')} {t('admin.avgLabel')}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Password Reset Section */}
                            <div className="reset-section">
                                {!resetPassportState.show ? (
                                    <button
                                        className="reset-btn-toggle"
                                        onClick={() => setResetPasswordState({ show: true, password: '' })}
                                    >
                                        {t('admin.changePassword')}
                                    </button>
                                ) : (
                                    <div className="reset-form">
                                        <input
                                            type="text"
                                            placeholder={t('admin.newPassword')}
                                            value={resetPassportState.password}
                                            onChange={e => setResetPasswordState({ ...resetPassportState, password: e.target.value })}
                                        />
                                        <button
                                            className="save-pass-btn"
                                            onClick={async () => {
                                                if (!resetPassportState.password) return alert(t('admin.enterPasswordAlert'))
                                                setIsResetting(true)
                                                try {
                                                    const res = await fetch('/api/customers/reset-password', {
                                                        method: 'POST',
                                                        headers: { 'Content-Type': 'application/json' },
                                                        body: JSON.stringify({
                                                            customerId: selectedCustomer.id,
                                                            newPassword: resetPassportState.password
                                                        })
                                                    })
                                                    if (res.ok) {
                                                        alert(t('admin.passwordChangedSuccess'))
                                                        setResetPasswordState({ show: false, password: '' })
                                                    } else {
                                                        alert(t('admin.errorOccurred'))
                                                    }
                                                } catch (e) {
                                                    alert(t('admin.connFailed'))
                                                } finally {
                                                    setIsResetting(false)
                                                }
                                            }}
                                            disabled={isResetting}
                                        >
                                            {isResetting ? '...' : t('admin.save')}
                                        </button>
                                        <button
                                            className="cancel-pass-btn"
                                            onClick={() => setResetPasswordState({ show: false, password: '' })}
                                        >
                                            {t('products.cancel')}
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Orders List */}
                            <div className="orders-section">
                                <h4>{t('admin.orderHistory')} ({selectedCustomer.orders.length})</h4>
                                {selectedCustomer.orders.length === 0 ? (
                                    <p className="no-orders">{t('admin.noOrdersHistory')}</p>
                                ) : (
                                    <div className="order-list">
                                        {selectedCustomer.orders.map(order => {
                                            const items = parseItems(order.items)
                                            return (
                                                <div key={order.id} className="order-card">
                                                    <div className="order-top">
                                                        <span className="order-id">#{order.id}</span>
                                                        <span
                                                            className="status-badge"
                                                            style={{ backgroundColor: getStatusColor(order.status) }}
                                                        >
                                                            {getStatusText(order.status)}
                                                        </span>
                                                    </div>
                                                    <div className="order-items">
                                                        {items.map((item, i) => (
                                                            <span key={i} className="order-item-tag">
                                                                {item.name} ×{item.quantity}
                                                            </span>
                                                        ))}
                                                    </div>
                                                    <div className="order-bottom">
                                                        <span className="order-total">{order.total} {t('common.currency')}</span>
                                                        <span className="order-payment">{getPaymentText(order.paymentMethod)}</span>
                                                        <span className="order-date">
                                                            {new Date(order.createdAt).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}
                                                        </span>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .page-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1.5rem;
                }
                .page-header h1 {
                    font-size: 1.5rem;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }
                .customer-count {
                    background: var(--primary);
                    color: white;
                    padding: 0.35rem 1rem;
                    border-radius: 20px;
                    font-size: 0.85rem;
                    font-weight: 500;
                }

                .search-bar {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    background: var(--card-bg, white);
                    padding: 0.75rem 1rem;
                    border-radius: 10px;
                    margin-bottom: 1.5rem;
                    border: 1px solid var(--card-border, #e5e7eb);
                    color: var(--text-muted, #9ca3af);
                }
                .search-bar input {
                    border: none;
                    outline: none;
                    flex: 1;
                    font-size: 0.95rem;
                    font-family: inherit;
                    color: var(--text, #374151);
                    background: transparent;
                }

                .empty-state {
                    text-align: center;
                    padding: 4rem;
                    color: #d1d5db;
                }
                .empty-state p {
                    margin-top: 1rem;
                    color: #9ca3af;
                }

                .customers-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
                    gap: 1rem;
                }

                .customer-card {
                    background: var(--card-bg, white);
                    border-radius: 12px;
                    padding: 1.25rem;
                    border: 1px solid var(--card-border, #f3f4f6);
                    cursor: pointer;
                    transition: all 0.2s;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.04);
                }
                .customer-card:hover {
                    border-color: var(--primary);
                    box-shadow: 0 4px 12px rgba(210,105,30,0.1);
                    transform: translateY(-2px);
                }

                .card-top {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    margin-bottom: 1rem;
                }
                .avatar {
                    width: 44px;
                    height: 44px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, var(--primary), #f59e0b);
                    color: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 700;
                    font-size: 1.1rem;
                    flex-shrink: 0;
                }
                .card-info h3 {
                    font-size: 1rem;
                    margin: 0 0 0.2rem;
                }
                .phone-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.3rem;
                    color: #6b7280;
                    font-size: 0.8rem;
                }

                .card-stats {
                    display: flex;
                    justify-content: space-between;
                    padding: 0.75rem 0;
                    border-top: 1px solid #f9fafb;
                    border-bottom: 1px solid #f9fafb;
                    margin-bottom: 0.75rem;
                }
                .stat {
                    display: flex;
                    align-items: center;
                    gap: 0.35rem;
                    font-size: 0.85rem;
                    color: #6b7280;
                }
                .spent {
                    font-weight: 600;
                    color: #22c55e;
                }

                .card-footer {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .date {
                    font-size: 0.75rem;
                    color: #9ca3af;
                    display: flex;
                    align-items: center;
                    gap: 0.3rem;
                }
                .view-link {
                    font-size: 0.8rem;
                    color: var(--primary);
                    font-weight: 500;
                }

                /* Modal */
                .modal-overlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(0,0,0,0.5);
                    z-index: 100;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 1rem;
                    animation: fadeIn 0.2s ease;
                }
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                .modal {
                    background: white;
                    border-radius: 16px;
                    width: 100%;
                    max-width: 600px;
                    max-height: 85vh;
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                    animation: slideUp 0.3s ease;
                }
                @keyframes slideUp {
                    from { transform: translateY(20px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                .modal-header {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    padding: 1.25rem;
                    border-bottom: 1px solid #f3f4f6;
                }
                .modal-header h2 {
                    font-size: 1.1rem;
                    margin: 0;
                }
                .back-btn {
                    color: #6b7280;
                    padding: 0.35rem;
                    border-radius: 6px;
                    display: flex;
                    transition: background 0.2s;
                }
                .back-btn:hover {
                    background: #f3f4f6;
                }
                .modal-body {
                    overflow-y: auto;
                    padding: 1.5rem;
                }

                .detail-section {
                    text-align: center;
                    margin-bottom: 2rem;
                }
                .detail-avatar {
                    width: 64px;
                    height: 64px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, var(--primary), #f59e0b);
                    color: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 700;
                    font-size: 1.5rem;
                    margin: 0 auto 0.75rem;
                }
                .detail-section h3 {
                    font-size: 1.25rem;
                    margin-bottom: 1rem;
                }
                .detail-items {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                    margin-bottom: 1.25rem;
                }
                .detail-item {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.5rem;
                    color: #6b7280;
                    font-size: 0.9rem;
                }
                .detail-stats {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 0.75rem;
                    background: #f9fafb;
                    border-radius: 12px;
                    padding: 1rem;
                }
                .d-stat {
                    text-align: center;
                }
                .d-stat-value {
                    display: block;
                    font-size: 1.25rem;
                    font-weight: 700;
                    color: var(--primary);
                }
                .d-stat-label {
                    font-size: 0.75rem;
                    color: #9ca3af;
                }

                .orders-section h4 {
                    font-size: 1rem;
                    margin-bottom: 1rem;
                    padding-bottom: 0.5rem;
                    border-bottom: 1px solid #f3f4f6;
                }
                .no-orders {
                    text-align: center;
                    color: #9ca3af;
                    padding: 1.5rem;
                }
                .order-list {
                    display: flex;
                    flex-direction: column;
                    gap: 0.75rem;
                }
                .order-card {
                    background: #f9fafb;
                    border-radius: 10px;
                    padding: 1rem;
                }
                .order-top {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 0.5rem;
                }
                .order-id {
                    font-weight: 700;
                    color: #374151;
                }
                .status-badge {
                    padding: 0.15rem 0.5rem;
                    border-radius: 20px;
                    color: white;
                    font-size: 0.7rem;
                    font-weight: 500;
                }
                .order-items {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 0.35rem;
                    margin-bottom: 0.75rem;
                }
                .order-item-tag {
                    background: white;
                    padding: 0.15rem 0.5rem;
                    border-radius: 4px;
                    font-size: 0.75rem;
                    color: #374151;
                    border: 1px solid #e5e7eb;
                }
                .order-bottom {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    font-size: 0.8rem;
                    color: #6b7280;
                }
                .order-total {
                    font-weight: 600;
                    color: #1f2937;
                }
                .order-payment {
                    background: #e5e7eb;
                    padding: 0.1rem 0.4rem;
                    border-radius: 4px;
                    font-size: 0.7rem;
                }

                @media (max-width: 640px) {
                    .customers-grid {
                        grid-template-columns: 1fr;
                    }
                    .modal {
                        max-height: 95vh;
                    }
                }
                    .reset-section {
                        margin-bottom: 20px;
                        padding: 10px;
                        background: #fff7ed;
                        border: 1px dashed #fdba74;
                        border-radius: 8px;
                        text-align: center;
                    }
                    .reset-btn-toggle {
                        background: none;
                        border: none;
                        color: #c2410c;
                        font-weight: 600;
                        cursor: pointer;
                        text-decoration: underline;
                        font-family: inherit;
                        font-size: 0.9rem;
                    }
                    .reset-form {
                        display: flex;
                        gap: 8px;
                        justify-content: center;
                    }
                    .reset-form input {
                        border: 1px solid #fdba74;
                        padding: 6px 10px;
                        border-radius: 6px;
                        outline: none;
                        font-family: inherit;
                    }
                    .save-pass-btn {
                        background: #c2410c;
                        color: white;
                        border: none;
                        padding: 6px 12px;
                        border-radius: 6px;
                        cursor: pointer;
                        font-weight: 600;
                    }
                    .cancel-pass-btn {
                        background: #e5e7eb;
                        color: #374151;
                        border: none;
                        padding: 6px 12px;
                        border-radius: 6px;
                        cursor: pointer;
                    }
            `}</style>
        </div>
    )
}
