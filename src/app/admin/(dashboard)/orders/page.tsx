'use client'

import { useState, useEffect } from 'react'

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
        if (!confirm(`هل أنت متأكد من تغيير الحالة إلى "${newStatus}"؟`)) return

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
            alert('فشل تحديث الحالة')
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
            return 'خطأ في البيانات'
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
            case 'new': return 'جديد'
            case 'completed': return 'مكتمل'
            case 'cancelled': return 'ملغي'
            default: return status
        }
    }

    if (loading) return <div>جاري التحميل...</div>

    return (
        <div>
            <h1>إدارة الطلبات</h1>

            <div className="orders-table-container">
                <table className="orders-table">
                    <thead>
                        <tr>
                            <th>رقم الطلب</th>
                            <th>العميل</th>
                            <th>الجوال</th>
                            <th>الإجمالي</th>
                            <th>طريقة الدفع</th>
                            <th>الحالة</th>
                            <th>التاريخ</th>
                            <th>الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map(order => (
                            <>
                                <tr key={order.id} className={expandedOrderId === order.id ? 'expanded-row-parent' : ''}>
                                    <td>#{order.id}</td>
                                    <td>{order.customerName}</td>
                                    <td dir="ltr">{order.customerPhone}</td>
                                    <td>{order.total} ر.س</td>
                                    <td>{order.paymentMethod === 'cash' ? 'عند الاستلام' : 'تحويل'}</td>
                                    <td>
                                        <span className="status-badge" style={{ backgroundColor: getStatusColor(order.status) }}>
                                            {getStatusText(order.status)}
                                        </span>
                                    </td>
                                    <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                                    <td>
                                        <button className="btn-sm" onClick={() => toggleExpand(order.id)}>
                                            {expandedOrderId === order.id ? 'إخفاء' : 'تفاصيل'}
                                        </button>
                                    </td>
                                </tr>
                                {expandedOrderId === order.id && (
                                    <tr className="details-row">
                                        <td colSpan={8}>
                                            <div className="details-content">
                                                <p><strong>العنوان:</strong> {order.address}</p>
                                                {(order.deliveryDate || order.deliveryTime) && (
                                                    <p><strong>وقت التوصيل:</strong> {order.deliveryDate} {order.deliveryTime}</p>
                                                )}
                                                {order.latitude && order.longitude && (
                                                    <p>
                                                        <strong>الموقع:</strong>{' '}
                                                        <a
                                                            href={`https://maps.google.com/?q=${order.latitude},${order.longitude}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            style={{ color: '#3b82f6', textDecoration: 'underline' }}
                                                        >
                                                            عرض على الخريطة
                                                        </a>
                                                    </p>
                                                )}
                                                <p><strong>المنتجات:</strong> {parseItems(order.items)}</p>
                                                <div className="actions">
                                                    <button
                                                        className="btn-action complete"
                                                        onClick={() => updateStatus(order.id, 'completed')}
                                                        disabled={order.status === 'completed'}
                                                    >
                                                        تم التوصيل
                                                    </button>
                                                    <button
                                                        className="btn-action cancel"
                                                        onClick={() => updateStatus(order.id, 'cancelled')}
                                                        disabled={order.status === 'cancelled'}
                                                    >
                                                        إلغاء الطلب
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
                    background: white;
                    border-radius: 8px;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                    margin-bottom: 1rem;
                    border: 1px solid #eee;
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
                    border-bottom: 1px solid #eee;
                    white-space: nowrap; /* Prevent ugly wrapping */
                }
                .orders-table th {
                    background: #f9fafb;
                    font-weight: 600;
                    color: #374151;
                }
                .status-badge {
                    padding: 0.25rem 0.5rem;
                    border-radius: 9999px;
                    color: white;
                    font-size: 0.75rem;
                }
                .btn-sm {
                    padding: 0.25rem 0.75rem;
                    background: #f3f4f6;
                    border-radius: 4px;
                    font-size: 0.875rem;
                    cursor: pointer;
                }
                .details-row {
                    background: #f9fafb;
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
