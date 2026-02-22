'use client'

import { useState, useEffect } from 'react'
import { useLanguage } from '@/context/LanguageContext'

interface Order {
    id: number
    customerName: string
    customerPhone: string
    address: string
    items: string // JSON string
    total: number
    status: string
    paymentMethod: string
    createdAt: string
    latitude?: number
    longitude?: number
    deliveryDate?: string
    deliveryTime?: string
}

export default function OrdersPage() {
    const { t, language } = useLanguage()
    const [orders, setOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState(true)
    const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null)

    useEffect(() => {
        fetchOrders()
    }, [])

    const fetchOrders = () => {
        fetch('/api/orders')
            .then(res => res.json())
            .then(data => {
                setOrders(data)
                setLoading(false)
            })
            .catch(err => console.error(err))
    }

    const updateStatus = async (id: number, newStatus: string) => {
        if (!confirm(`${t('admin.confirmStatusChange')} "${newStatus}"${t('admin.confirmDeleteStatus')}`)) return

        try {
            const res = await fetch(`/api/orders/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            })

            if (res.ok) {
                setOrders(prev => prev.map(order =>
                    order.id === id ? { ...order, status: newStatus } : order
                ))
            }
        } catch (error) {
            alert(t('admin.updateStatusFailed'))
        }
    }

    const toggleExpand = (id: number) => {
        setExpandedOrderId(expandedOrderId === id ? null : id)
    }

    const parseItems = (itemsJson: string) => {
        try {
            const items = JSON.parse(itemsJson)
            return items.map((i: any) => `${i.name} (x${i.quantity})`).join(', ')
        } catch (e) {
            return t('admin.dataError')
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'new': return '#3b82f6' // blue
            case 'completed': return '#22c55e' // green
            case 'cancelled': return '#ef4444' // red
            default: return '#6b7280' // gray
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

    if (loading) return <div>{t('admin.loading')}</div>

    return (
        <div>
            <h1>{t('admin.manageOrders')}</h1>

            <div className="orders-table-container">
                <table className="orders-table" style={{ textAlign: language === 'ar' ? 'right' : 'left' }}>
                    <thead>
                        <tr>
                            <th>{t('admin.orderNumber')}</th>
                            <th>{t('admin.customerNameTh')}</th>
                            <th>{t('admin.mobile')}</th>
                            <th>{t('admin.totalTh')}</th>
                            <th>{t('admin.paymentMethodTh')}</th>
                            <th>{t('admin.statusTh')}</th>
                            <th>{t('admin.dateTh')}</th>
                            <th>{t('admin.actions')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map(order => (
                            <>
                                <tr key={order.id} className={expandedOrderId === order.id ? 'expanded-row-parent' : ''}>
                                    <td>#{order.id}</td>
                                    <td>{order.customerName}</td>
                                    <td dir="ltr">{order.customerPhone}</td>
                                    <td>{order.total} {t('common.currency')}</td>
                                    <td>{order.paymentMethod === 'cash' ? t('admin.payCash') : order.paymentMethod === 'transfer' ? t('admin.payTransfer') : t('admin.payApple')}</td>
                                    <td>
                                        <span className="status-badge" style={{ backgroundColor: getStatusColor(order.status) }}>
                                            {getStatusText(order.status)}
                                        </span>
                                    </td>
                                    <td>{new Date(order.createdAt).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}</td>
                                    <td>
                                        <button className="btn-sm" onClick={() => toggleExpand(order.id)}>
                                            {expandedOrderId === order.id ? t('admin.hideDetails') : t('admin.showDetails')}
                                        </button>
                                    </td>
                                </tr>
                                {expandedOrderId === order.id && (
                                    <tr className="details-row">
                                        <td colSpan={8}>
                                            <div className="details-content">
                                                <p><strong>{t('admin.addressLabel')}</strong> {order.address}</p>
                                                {(order.deliveryDate || order.deliveryTime) && (
                                                    <p><strong>{t('admin.deliveryTimeLabel')}</strong> {order.deliveryDate} {order.deliveryTime}</p>
                                                )}
                                                {order.latitude && order.longitude && (
                                                    <p>
                                                        <strong>{t('admin.locationLabel')}</strong>{' '}
                                                        <a
                                                            href={`https://maps.google.com/?q=${order.latitude},${order.longitude}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            style={{ color: '#3b82f6', textDecoration: 'underline' }}
                                                        >
                                                            {t('admin.viewOnMap')}
                                                        </a>
                                                    </p>
                                                )}
                                                <p><strong>{t('admin.productsLabel')}</strong> {parseItems(order.items)}</p>
                                                <div className="actions">
                                                    <button
                                                        className="btn-action complete"
                                                        onClick={() => updateStatus(order.id, 'completed')}
                                                        disabled={order.status === 'completed'}
                                                    >
                                                        {t('admin.markCompleted')}
                                                    </button>
                                                    <button
                                                        className="btn-action cancel"
                                                        onClick={() => updateStatus(order.id, 'cancelled')}
                                                        disabled={order.status === 'cancelled'}
                                                    >
                                                        {t('admin.cancelOrderBtn')}
                                                    </button>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </>
                        ))}
                    </tbody>
                </table>
            </div>

            <style>{`
                .orders-table-container {
                    display: block;
                    width: 100%;
                    max-width: 100%;
                    overflow-x: auto;
                    -webkit-overflow-scrolling: touch;
                    background: var(--card-bg);
                    border-radius: 8px;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                    margin-bottom: 1rem;
                    border: 1px solid var(--card-border);
                    padding-bottom: 5px; /* Space for scrollbar */
                }
                .orders-table {
                    width: 100%;
                    border-collapse: collapse;
                    text-align: right;
                    min-width: 800px; /* Force scroll if needed */
                }
                .orders-table th, .orders-table td {
                    padding: 1rem;
                    border-bottom: 1px solid var(--card-border);
                    white-space: nowrap; /* Prevent ugly wrapping */
                }
                .orders-table th {
                    background: var(--gray-100);
                    font-weight: 600;
                    color: var(--text);
                }
                .status-badge {
                    padding: 0.25rem 0.5rem;
                    border-radius: 9999px;
                    color: white;
                    font-size: 0.75rem;
                }
                .btn-sm {
                    padding: 0.25rem 0.75rem;
                    background: var(--gray-200);
                    color: var(--text);
                    border-radius: 4px;
                    border: none;
                    font-size: 0.875rem;
                    cursor: pointer;
                }
                .details-row {
                    background: var(--gray-100);
                }
                .details-content {
                    padding: 1rem;
                }
                .details-content p {
                    margin-bottom: 0.5rem;
                }
                .actions {
                    margin-top: 1rem;
                    display: flex;
                    gap: 0.5rem;
                }
                .btn-action {
                    padding: 0.5rem 1rem;
                    border-radius: 4px;
                    color: white;
                    cursor: pointer;
                    font-size: 0.875rem;
                }
                .btn-action.complete {
                    background: #22c55e;
                }
                .btn-action.cancel {
                    background: #ef4444;
                }
                .btn-action:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }
            `}</style>
        </div>
    )
}
