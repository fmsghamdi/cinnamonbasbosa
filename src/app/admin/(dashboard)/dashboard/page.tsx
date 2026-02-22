import prisma from '@/lib/prisma'
import { Package, ShoppingCart, DollarSign, CheckCircle, Users, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { getServerLanguage } from '@/lib/serverLanguage'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
    const { t, language } = await getServerLanguage()
    const productCount = await prisma.product.count()
    const orderCount = await prisma.order.count()
    const newOrderCount = await prisma.order.count({ where: { status: 'new' } })
    const completedOrderCount = await prisma.order.count({ where: { status: 'completed' } })
    const cancelledOrderCount = await prisma.order.count({ where: { status: 'cancelled' } })
    const customerCount = await prisma.customer.count()

    // Calculate total revenue from completed orders
    const allOrders = await prisma.order.findMany()
    const totalRevenue = allOrders.reduce((sum, order) => sum + order.total, 0)
    const completedRevenue = allOrders
        .filter(o => o.status === 'completed')
        .reduce((sum, order) => sum + order.total, 0)

    // Recent orders (last 5)
    const recentOrders = await prisma.order.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5
    })

    // Today's orders
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayOrders = allOrders.filter(o => new Date(o.createdAt) >= today)
    const todayRevenue = todayOrders.reduce((sum, o) => sum + o.total, 0)

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

    // Order status percentages for the visual bar
    const totalForBar = orderCount || 1
    const newPercent = Math.round((newOrderCount / totalForBar) * 100)
    const completedPercent = Math.round((completedOrderCount / totalForBar) * 100)
    const cancelledPercent = Math.round((cancelledOrderCount / totalForBar) * 100)

    return (
        <div>
            <div className="dashboard-header">
                <h1>{t('admin.overview')}</h1>
                <p className="dashboard-date">
                    {new Date().toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    })}
                </p>
            </div>

            {/* Stats Grid */}
            <div className="stats-grid">
                <div className="stat-card stat-orders">
                    <div className="stat-icon" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
                        <ShoppingCart size={24} />
                    </div>
                    <div className="stat-info">
                        <h3>{t('admin.totalOrders')}</h3>
                        <p className="value">{orderCount}</p>
                        <small className="stat-sub">{todayOrders.length} {t('admin.ordersToday')}</small>
                    </div>
                </div>

                <div className="stat-card stat-new">
                    <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>
                        <TrendingUp size={24} />
                    </div>
                    <div className="stat-info">
                        <h3>{t('admin.newOrders')}</h3>
                        <p className="value" style={{ color: '#f59e0b' }}>{newOrderCount}</p>
                        <small className="stat-sub">{t('admin.pendingProcessing')}</small>
                    </div>
                </div>

                <div className="stat-card stat-revenue">
                    <div className="stat-icon" style={{ background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e' }}>
                        <DollarSign size={24} />
                    </div>
                    <div className="stat-info">
                        <h3>{t('admin.revenue')}</h3>
                        <p className="value" style={{ color: '#22c55e' }}>{totalRevenue.toFixed(0)} <span className="currency">{t('common.currency')}</span></p>
                        <small className="stat-sub">{todayRevenue.toFixed(0)} {t('common.currency')} {t('admin.revenueToday')}</small>
                    </div>
                </div>

                <div className="stat-card stat-completed">
                    <div className="stat-icon" style={{ background: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6' }}>
                        <CheckCircle size={24} />
                    </div>
                    <div className="stat-info">
                        <h3>{t('admin.completedOrders')}</h3>
                        <p className="value" style={{ color: '#8b5cf6' }}>{completedOrderCount}</p>
                        <small className="stat-sub">{completedRevenue.toFixed(0)} {t('common.currency')} {t('admin.revenue')}</small>
                    </div>
                </div>

                <div className="stat-card stat-products">
                    <div className="stat-icon" style={{ background: 'rgba(210, 105, 30, 0.1)', color: '#D2691E' }}>
                        <Package size={24} />
                    </div>
                    <div className="stat-info">
                        <h3>{t('admin.products')}</h3>
                        <p className="value" style={{ color: '#D2691E' }}>{productCount}</p>
                        <small className="stat-sub">{t('admin.activeProducts')}</small>
                    </div>
                </div>

                <div className="stat-card stat-customers">
                    <div className="stat-icon" style={{ background: 'rgba(6, 182, 212, 0.1)', color: '#06b6d4' }}>
                        <Users size={24} />
                    </div>
                    <div className="stat-info">
                        <h3>{t('admin.registeredCustomers')}</h3>
                        <p className="value" style={{ color: '#06b6d4' }}>{customerCount}</p>
                        <small className="stat-sub">{t('admin.customer')}</small>
                    </div>
                </div>
            </div>

            {/* Two Column Section */}
            <div className="dashboard-grid">
                {/* Recent Orders */}
                <div className="dashboard-card">
                    <div className="card-header">
                        <h2>{t('admin.latestOrders')}</h2>
                        <Link href="/admin/orders" className="view-all">{t('admin.viewAll')}</Link>
                    </div>

                    {recentOrders.length === 0 ? (
                        <div className="empty-state">
                            <p>{t('admin.noOrdersYet')}</p>
                        </div>
                    ) : (
                        <div className="recent-orders-list">
                            {recentOrders.map(order => (
                                <div key={order.id} className="recent-order-item">
                                    <div className="order-main">
                                        <div className="order-id">#{order.id}</div>
                                        <div className="order-customer">{order.customerName}</div>
                                    </div>
                                    <div className="order-meta">
                                        <span className="order-total">{order.total} {t('common.currency')}</span>
                                        <span className="order-payment">{getPaymentText(order.paymentMethod)}</span>
                                        <span
                                            className="order-status-badge"
                                            style={{ backgroundColor: getStatusColor(order.status) }}
                                        >
                                            {getStatusText(order.status)}
                                        </span>
                                    </div>
                                    <div className="order-date">
                                        {new Date(order.createdAt).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Order Status Breakdown */}
                <div className="dashboard-card">
                    <div className="card-header">
                        <h2>{t('admin.orderStatusDistribution')}</h2>
                    </div>

                    {orderCount === 0 ? (
                        <div className="empty-state">
                            <p>{t('admin.noDataToDisplay')}</p>
                        </div>
                    ) : (
                        <div className="status-breakdown">
                            {/* Visual Bar */}
                            <div className="status-bar">
                                {completedPercent > 0 && (
                                    <div
                                        className="status-bar-segment"
                                        style={{ width: `${completedPercent}%`, backgroundColor: '#22c55e' }}
                                        title={`${t('admin.statusCompleted')}: ${completedPercent}%`}
                                    />
                                )}
                                {newPercent > 0 && (
                                    <div
                                        className="status-bar-segment"
                                        style={{ width: `${newPercent}%`, backgroundColor: '#3b82f6' }}
                                        title={`${t('admin.statusNew')}: ${newPercent}%`}
                                    />
                                )}
                                {cancelledPercent > 0 && (
                                    <div
                                        className="status-bar-segment"
                                        style={{ width: `${cancelledPercent}%`, backgroundColor: '#ef4444' }}
                                        title={`${t('admin.statusCancelled')}: ${cancelledPercent}%`}
                                    />
                                )}
                            </div>

                            {/* Legend */}
                            <div className="status-legend">
                                <div className="legend-item">
                                    <span className="legend-dot" style={{ backgroundColor: '#22c55e' }}></span>
                                    <span className="legend-label">{t('admin.statusCompleted')}</span>
                                    <span className="legend-value">{completedOrderCount} ({completedPercent}%)</span>
                                </div>
                                <div className="legend-item">
                                    <span className="legend-dot" style={{ backgroundColor: '#3b82f6' }}></span>
                                    <span className="legend-label">{t('admin.statusNew')}</span>
                                    <span className="legend-value">{newOrderCount} ({newPercent}%)</span>
                                </div>
                                <div className="legend-item">
                                    <span className="legend-dot" style={{ backgroundColor: '#ef4444' }}></span>
                                    <span className="legend-label">{t('admin.statusCancelled')}</span>
                                    <span className="legend-value">{cancelledOrderCount} ({cancelledPercent}%)</span>
                                </div>
                            </div>

                            {/* Summary Cards */}
                            <div className="summary-cards">
                                <div className="summary-card">
                                    <h4>{t('admin.averageOrderValue')}</h4>
                                    <p>{orderCount > 0 ? (totalRevenue / orderCount).toFixed(0) : 0} {t('common.currency')}</p>
                                </div>
                                <div className="summary-card">
                                    <h4>{t('admin.completionPercentage')}</h4>
                                    <p>{completedPercent}%</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                .dashboard-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 2rem;
                }
                .dashboard-date {
                    color: #6b7280;
                    font-size: 0.9rem;
                }

                .stats-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 1.25rem;
                    margin-bottom: 2rem;
                }
                @media (max-width: 1024px) {
                    .stats-grid {
                        grid-template-columns: repeat(2, 1fr);
                    }
                }
                @media (max-width: 640px) {
                    .stats-grid {
                        grid-template-columns: 1fr;
                    }
                }

                .stat-card {
                    background: white;
                    padding: 1.25rem;
                    border-radius: 12px;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.06);
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    border: 1px solid #f3f4f6;
                    transition: transform 0.2s, box-shadow 0.2s;
                }
                .stat-card:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(0,0,0,0.08);
                }
                .stat-icon {
                    width: 48px;
                    height: 48px;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                }
                .stat-info h3 {
                    font-size: 0.8rem;
                    color: #6b7280;
                    margin-bottom: 0.25rem;
                    font-weight: 500;
                }
                .stat-info .value {
                    font-size: 1.5rem;
                    font-weight: 700;
                    color: var(--primary);
                    margin: 0;
                    line-height: 1.2;
                }
                .currency {
                    font-size: 0.85rem;
                    font-weight: 500;
                }
                .stat-sub {
                    color: #9ca3af;
                    font-size: 0.75rem;
                }

                .dashboard-grid {
                    display: grid;
                    grid-template-columns: 1.5fr 1fr;
                    gap: 1.5rem;
                }
                @media (max-width: 900px) {
                    .dashboard-grid {
                        grid-template-columns: 1fr;
                    }
                }
                .dashboard-card {
                    background: white;
                    border-radius: 12px;
                    padding: 1.5rem;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.06);
                    border: 1px solid #f3f4f6;
                }
                .card-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1.25rem;
                    border-bottom: 1px solid #f3f4f6;
                    padding-bottom: 0.75rem;
                }
                .card-header h2 {
                    font-size: 1rem;
                    font-weight: 600;
                    color: #1f2937;
                    margin: 0;
                }
                .view-all {
                    color: var(--primary);
                    font-size: 0.85rem;
                    font-weight: 500;
                    text-decoration: none;
                    transition: opacity 0.2s;
                }
                .view-all:hover {
                    opacity: 0.7;
                }

                .empty-state {
                    text-align: center;
                    padding: 2rem;
                    color: #9ca3af;
                }

                /* Recent Orders */
                .recent-orders-list {
                    display: flex;
                    flex-direction: column;
                    gap: 0;
                }
                .recent-order-item {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 0.75rem 0;
                    border-bottom: 1px solid #f9fafb;
                    gap: 1rem;
                    flex-wrap: wrap; /* Allow wrapping */
                }
                @media (max-width: 640px) {
                    .recent-order-item {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 0.5rem;
                    }
                    .order-meta {
                        width: 100%;
                        justify-content: space-between;
                    }
                    .order-date {
                        width: 100%;
                        text-align: left;
                        color: #9ca3af;
                        font-size: 0.7rem;
                    }
                }
                .recent-order-item:last-child {
                    border-bottom: none;
                }
                .order-main {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    min-width: 120px;
                }
                .order-id {
                    font-weight: 700;
                    color: #374151;
                    font-size: 0.9rem;
                }
                .order-customer {
                    color: #6b7280;
                    font-size: 0.85rem;
                }
                .order-meta {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    flex: 1;
                    justify-content: center;
                }
                .order-total {
                    font-weight: 600;
                    color: #1f2937;
                    font-size: 0.9rem;
                }
                .order-payment {
                    color: #9ca3af;
                    font-size: 0.75rem;
                    background: #f3f4f6;
                    padding: 0.15rem 0.5rem;
                    border-radius: 4px;
                }
                .order-status-badge {
                    padding: 0.2rem 0.5rem;
                    border-radius: 9999px;
                    color: white;
                    font-size: 0.7rem;
                    font-weight: 500;
                }
                .order-date {
                    color: #9ca3af;
                    font-size: 0.75rem;
                    min-width: 80px;
                    text-align: left;
                }

                /* Status Breakdown */
                .status-breakdown {
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                }
                .status-bar {
                    display: flex;
                    height: 16px;
                    border-radius: 8px;
                    overflow: hidden;
                    background: #f3f4f6;
                }
                .status-bar-segment {
                    height: 100%;
                    transition: width 0.3s ease;
                }
                .status-legend {
                    display: flex;
                    flex-direction: column;
                    gap: 0.75rem;
                }
                .legend-item {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }
                .legend-dot {
                    width: 10px;
                    height: 10px;
                    border-radius: 50%;
                    flex-shrink: 0;
                }
                .legend-label {
                    font-size: 0.85rem;
                    color: #374151;
                    flex: 1;
                }
                .legend-value {
                    font-size: 0.85rem;
                    font-weight: 600;
                    color: #1f2937;
                }

                .summary-cards {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1rem;
                }
                .summary-card {
                    background: #f9fafb;
                    padding: 1rem;
                    border-radius: 8px;
                    text-align: center;
                }
                .summary-card h4 {
                    font-size: 0.75rem;
                    color: #6b7280;
                    margin-bottom: 0.25rem;
                    font-weight: 500;
                }
                .summary-card p {
                    font-size: 1.25rem;
                    font-weight: 700;
                    color: #1f2937;
                    margin: 0;
                }
            `}</style>
        </div>
    )
}
