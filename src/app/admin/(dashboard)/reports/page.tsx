import prisma from '@/lib/prisma'
import { BarChart3, TrendingUp, Calendar, DollarSign, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import Link from 'next/link'
import { getServerLanguage } from '@/lib/serverLanguage'

export const dynamic = 'force-dynamic'

export default async function ReportsPage() {
    const { t, language } = await getServerLanguage()
    const orders = await prisma.order.findMany({
        orderBy: { createdAt: 'desc' }
    })

    // Calculate stats
    const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0)
    const completedOrders = orders.filter(o => o.status === 'completed')
    const completedRevenue = completedOrders.reduce((sum, o) => sum + o.total, 0)
    const avgOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0

    // Today's stats
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayOrders = orders.filter(o => new Date(o.createdAt) >= today)
    const todayRevenue = todayOrders.reduce((sum, o) => sum + o.total, 0)

    // This week stats
    const weekStart = new Date()
    weekStart.setDate(weekStart.getDate() - weekStart.getDay())
    weekStart.setHours(0, 0, 0, 0)
    const weekOrders = orders.filter(o => new Date(o.createdAt) >= weekStart)
    const weekRevenue = weekOrders.reduce((sum, o) => sum + o.total, 0)

    // This month stats
    const monthStart = new Date()
    monthStart.setDate(1)
    monthStart.setHours(0, 0, 0, 0)
    const monthOrders = orders.filter(o => new Date(o.createdAt) >= monthStart)
    const monthRevenue = monthOrders.reduce((sum, o) => sum + o.total, 0)

    // Last 30 days daily breakdown
    const last30Days: { date: string, count: number, revenue: number }[] = []
    for (let i = 29; i >= 0; i--) {
        const d = new Date()
        d.setDate(d.getDate() - i)
        d.setHours(0, 0, 0, 0)
        const nextD = new Date(d)
        nextD.setDate(nextD.getDate() + 1)

        const dayOrders = orders.filter(o => {
            const od = new Date(o.createdAt)
            return od >= d && od < nextD
        })

        last30Days.push({
            date: d.toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', { month: 'short', day: 'numeric' }),
            count: dayOrders.length,
            revenue: dayOrders.reduce((sum, o) => sum + o.total, 0)
        })
    }

    const maxDailyRevenue = Math.max(...last30Days.map(d => d.revenue), 1)

    // Payment method breakdown
    const paymentBreakdown: Record<string, { count: number, total: number }> = {}
    orders.forEach(o => {
        if (!paymentBreakdown[o.paymentMethod]) {
            paymentBreakdown[o.paymentMethod] = { count: 0, total: 0 }
        }
        paymentBreakdown[o.paymentMethod].count++
        paymentBreakdown[o.paymentMethod].total += o.total
    })

    const paymentLabels: Record<string, string> = {
        'cash': t('admin.payCash'),
        'transfer': t('admin.payTransfer'),
        'apple': t('admin.payApple')
    }

    const paymentColors: Record<string, string> = {
        'cash': '#22c55e',
        'transfer': '#3b82f6',
        'apple': '#111'
    }

    // Top selling items
    const itemCounts: Record<string, { name: string, count: number, revenue: number }> = {}
    orders.forEach(o => {
        try {
            const items = JSON.parse(o.items)
            items.forEach((item: { name: string, price: number, quantity: number }) => {
                if (!itemCounts[item.name]) {
                    itemCounts[item.name] = { name: item.name, count: 0, revenue: 0 }
                }
                itemCounts[item.name].count += item.quantity
                itemCounts[item.name].revenue += item.price * item.quantity
            })
        } catch { }
    })
    const topItems = Object.values(itemCounts).sort((a, b) => b.count - a.count).slice(0, 5)
    const maxItemCount = Math.max(...topItems.map(i => i.count), 1)

    return (
        <div>
            <div className="page-header">
                <h1>📊 {t('admin.salesReportsTitle')}</h1>
            </div>

            {/* Time Period Cards */}
            <div className="period-grid">
                <div className="period-card">
                    <div className="period-icon" style={{ background: 'rgba(34,197,94,0.1)', color: '#22c55e' }}>
                        <Calendar size={20} />
                    </div>
                    <div>
                        <small>{t('admin.today')}</small>
                        <h3>{todayRevenue.toFixed(0)} {t('common.currency')}</h3>
                        <span className="period-count">{todayOrders.length} {t('admin.ordersCountLabel')}</span>
                    </div>
                </div>
                <div className="period-card">
                    <div className="period-icon" style={{ background: 'rgba(59,130,246,0.1)', color: '#3b82f6' }}>
                        <Calendar size={20} />
                    </div>
                    <div>
                        <small>{t('admin.thisWeek')}</small>
                        <h3>{weekRevenue.toFixed(0)} {t('common.currency')}</h3>
                        <span className="period-count">{weekOrders.length} {t('admin.ordersCountLabel')}</span>
                    </div>
                </div>
                <div className="period-card">
                    <div className="period-icon" style={{ background: 'rgba(139,92,246,0.1)', color: '#8b5cf6' }}>
                        <Calendar size={20} />
                    </div>
                    <div>
                        <small>{t('admin.thisMonth')}</small>
                        <h3>{monthRevenue.toFixed(0)} {t('common.currency')}</h3>
                        <span className="period-count">{monthOrders.length} {t('admin.ordersCountLabel')}</span>
                    </div>
                </div>
                <div className="period-card">
                    <div className="period-icon" style={{ background: 'rgba(210,105,30,0.1)', color: '#D2691E' }}>
                        <DollarSign size={20} />
                    </div>
                    <div>
                        <small>{t('admin.avgOrderValueTitle')}</small>
                        <h3>{avgOrderValue.toFixed(0)} {t('common.currency')}</h3>
                        <span className="period-count">{orders.length} {t('admin.totalOrdersDesc')}</span>
                    </div>
                </div>
            </div>

            <div className="reports-grid">
                {/* Daily Revenue Chart */}
                <div className="report-card chart-card">
                    <h2><BarChart3 size={20} /> {t('admin.dailyRevenueChartTitle')}</h2>
                    <div className="chart-container">
                        {last30Days.map((day, i) => (
                            <div key={i} className="chart-bar-wrapper">
                                <div className="chart-bar-bg">
                                    <div
                                        className="chart-bar-fill"
                                        style={{
                                            height: `${(day.revenue / maxDailyRevenue) * 100}%`,
                                            backgroundColor: day.revenue > 0 ? 'var(--primary)' : 'var(--gray-200)'
                                        }}
                                        title={`${day.date}: ${day.revenue} ${t('common.currency')} (${day.count} ${t('admin.ordersCountLabel')})`}
                                    />
                                </div>
                                {(i === 0 || i === 14 || i === 29) && (
                                    <span className="chart-label">{day.date}</span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Payment Methods */}
                <div className="report-card">
                    <h2>💳 {t('admin.paymentMethodsChartTitle')}</h2>
                    {Object.keys(paymentBreakdown).length === 0 ? (
                        <p className="empty">{t('admin.noData')}</p>
                    ) : (
                        <div className="payment-list">
                            {Object.entries(paymentBreakdown).map(([method, data]) => (
                                <div key={method} className="payment-item">
                                    <div className="payment-header">
                                        <span className="payment-dot" style={{ backgroundColor: paymentColors[method] || '#999' }}></span>
                                        <span className="payment-name">{paymentLabels[method] || method}</span>
                                        <span className="payment-count">{data.count} {t('admin.ordersCountLabel')}</span>
                                    </div>
                                    <div className="payment-bar-bg">
                                        <div
                                            className="payment-bar-fill"
                                            style={{
                                                width: `${(data.count / orders.length) * 100}%`,
                                                backgroundColor: paymentColors[method] || '#999'
                                            }}
                                        />
                                    </div>
                                    <span className="payment-total">{data.total.toFixed(0)} {t('common.currency')}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Top Selling Items */}
            <div className="report-card" style={{ marginTop: '1.5rem' }}>
                <h2><TrendingUp size={20} /> {t('admin.topSellingProductsTitle')}</h2>
                {topItems.length === 0 ? (
                    <p className="empty">{t('admin.noData')}</p>
                ) : (
                    <div className="top-items">
                        {topItems.map((item, i) => (
                            <div key={item.name} className="top-item">
                                <div className="top-item-rank">{i + 1}</div>
                                <div className="top-item-info">
                                    <h4>{item.name}</h4>
                                    <div className="item-bar-bg">
                                        <div
                                            className="item-bar-fill"
                                            style={{ width: `${(item.count / maxItemCount) * 100}%` }}
                                        />
                                    </div>
                                </div>
                                <div className="top-item-stats">
                                    <span className="item-count">{item.count} {t('admin.pieces')}</span>
                                    <span className="item-revenue">{item.revenue.toFixed(0)} {t('common.currency')}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <style>{`
                .page-header {
                    margin-bottom: 2rem;
                }
                .page-header h1 {
                    font-size: 1.5rem;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }

                .period-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 1rem;
                    margin-bottom: 1.5rem;
                }
                @media (max-width: 900px) {
                    .period-grid { grid-template-columns: repeat(2, 1fr); }
                }
                @media (max-width: 480px) {
                    .period-grid { grid-template-columns: 1fr; }
                }
                .period-card {
                    background: white;
                    border-radius: 12px;
                    padding: 1.25rem;
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.05);
                    border: 1px solid #f3f4f6;
                    transition: transform 0.2s;
                }
                .period-card:hover {
                    transform: translateY(-2px);
                }
                .period-icon {
                    width: 40px;
                    height: 40px;
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                }
                .period-card small {
                    color: #9ca3af;
                    font-size: 0.75rem;
                }
                .period-card h3 {
                    font-size: 1.2rem;
                    margin: 0.15rem 0;
                }
                .period-count {
                    font-size: 0.75rem;
                    color: #9ca3af;
                }

                .reports-grid {
                    display: grid;
                    grid-template-columns: 2fr 1fr;
                    gap: 1.5rem;
                }
                @media (max-width: 900px) {
                    .reports-grid { grid-template-columns: 1fr; }
                }
                .report-card {
                    background: white;
                    border-radius: 12px;
                    padding: 1.5rem;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.05);
                    border: 1px solid #f3f4f6;
                }
                .report-card h2 {
                    font-size: 1rem;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    margin-bottom: 1.25rem;
                    padding-bottom: 0.75rem;
                    border-bottom: 1px solid #f3f4f6;
                }

                /* Chart */
                .chart-container {
                    display: flex;
                    align-items: flex-end;
                    gap: 3px;
                    height: 200px;
                }
                .chart-bar-wrapper {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    height: 100%;
                }
                .chart-bar-bg {
                    flex: 1;
                    width: 100%;
                    display: flex;
                    align-items: flex-end;
                }
                .chart-bar-fill {
                    width: 100%;
                    min-height: 2px;
                    border-radius: 2px 2px 0 0;
                    transition: height 0.5s ease;
                }
                .chart-label {
                    font-size: 0.6rem;
                    color: #9ca3af;
                    margin-top: 4px;
                    white-space: nowrap;
                }

                /* Payment */
                .payment-list {
                    display: flex;
                    flex-direction: column;
                    gap: 1.25rem;
                }
                .payment-item {
                    display: flex;
                    flex-direction: column;
                    gap: 0.4rem;
                }
                .payment-header {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }
                .payment-dot {
                    width: 10px;
                    height: 10px;
                    border-radius: 50%;
                    flex-shrink: 0;
                }
                .payment-name {
                    font-weight: 500;
                    font-size: 0.9rem;
                    flex: 1;
                }
                .payment-count {
                    font-size: 0.75rem;
                    color: #9ca3af;
                }
                .payment-bar-bg {
                    height: 6px;
                    background: var(--gray-100);
                    border-radius: 3px;
                    overflow: hidden;
                }
                .payment-bar-fill {
                    height: 100%;
                    border-radius: 3px;
                    transition: width 0.5s;
                }
                .payment-total {
                    font-size: 0.8rem;
                    color: #6b7280;
                    font-weight: 600;
                }

                /* Top Items */
                .top-items {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                }
                .top-item {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }
                .top-item-rank {
                    width: 30px;
                    height: 30px;
                    border-radius: 50%;
                    background: var(--gray-100);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 700;
                    font-size: 0.85rem;
                    color: var(--primary);
                    flex-shrink: 0;
                }
                .top-item-info {
                    flex: 1;
                }
                .top-item-info h4 {
                    font-size: 0.9rem;
                    margin-bottom: 0.35rem;
                }
                .item-bar-bg {
                    height: 6px;
                    background: var(--gray-100);
                    border-radius: 3px;
                    overflow: hidden;
                }
                .item-bar-fill {
                    height: 100%;
                    background: var(--primary);
                    border-radius: 3px;
                    transition: width 0.5s;
                }
                .top-item-stats {
                    display: flex;
                    flex-direction: column;
                    align-items: flex-end;
                    gap: 0.2rem;
                    min-width: 80px;
                }
                .item-count {
                    font-weight: 600;
                    font-size: 0.85rem;
                }
                .item-revenue {
                    font-size: 0.75rem;
                    color: #6b7280;
                }
                .empty {
                    text-align: center;
                    color: #9ca3af;
                    padding: 2rem;
                }
            `}</style>
        </div>
    )
}
