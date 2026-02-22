'use client'

import { useState, useEffect } from 'react'
import {
    CreditCard, Banknote, Building2, Smartphone,
    Save, ToggleLeft, ToggleRight, ChevronDown, ChevronUp,
    AlertCircle, CheckCircle, Settings
} from 'lucide-react'

import { useLanguage } from '@/context/LanguageContext'

interface PaymentMethodSettings {
    [key: string]: string
}

interface PaymentMethod {
    id: string
    name: string
    enabled: boolean
    icon: string
    settings: PaymentMethodSettings
}

type PaymentMethods = Record<string, PaymentMethod>

const ICONS: Record<string, React.ReactNode> = {
    'banknote': <Banknote size={22} />,
    'building': <Building2 size={22} />,
    'credit-card': <CreditCard size={22} />,
    'smartphone': <Smartphone size={22} />,
}

export default function PaymentsPage() {
    const { t } = useLanguage()
    const [methods, setMethods] = useState<PaymentMethods>({})
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [saved, setSaved] = useState(false)
    const [expandedMethod, setExpandedMethod] = useState<string | null>(null)

    // Field labels using translation
    const getFieldLabel = (key: string) => {
        const labels: Record<string, string> = {
            bankName: t('admin.bankName'),
            accountHolder: t('admin.accountHolder'),
            accountNumber: t('admin.accountNumber'),
            iban: t('admin.iban'),
            instructions: t('admin.instructions'),
            provider: t('admin.provider'),
            merchantId: t('admin.merchantId'),
            apiKey: t('admin.apiKey'),
        }
        return labels[key] || key
    }

    useEffect(() => {
        fetchMethods()
    }, [])

    const fetchMethods = async () => {
        try {
            const res = await fetch('/api/payment-methods')
            const data = await res.json()
            setMethods(data)
        } catch {
            console.error('Error fetching payment methods')
        } finally {
            setLoading(false)
        }
    }

    const toggleMethod = (id: string) => {
        setMethods(prev => ({
            ...prev,
            [id]: { ...prev[id], enabled: !prev[id].enabled }
        }))
        setSaved(false)
    }

    const updateSetting = (methodId: string, key: string, value: string) => {
        setMethods(prev => ({
            ...prev,
            [methodId]: {
                ...prev[methodId],
                settings: { ...prev[methodId].settings, [key]: value }
            }
        }))
        setSaved(false)
    }

    const handleSave = async () => {
        setSaving(true)
        try {
            const res = await fetch('/api/payment-methods', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(methods)
            })
            if (res.ok) {
                setSaved(true)
                setTimeout(() => setSaved(false), 3000)
            }
        } catch {
            alert(t('checkout.errorOccurred'))
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
                <p>{t('admin.loading')}</p>
            </div>
        )
    }

    const enabledCount = Object.values(methods).filter(m => m.enabled).length

    return (
        <div className="payments-page">
            <div className="page-header">
                <div>
                    <h1>{t('admin.payments')}</h1>
                    <p>{t('admin.paymentsDesc')}</p>
                </div>
                <button className="save-btn" onClick={handleSave} disabled={saving}>
                    {saved ? <CheckCircle size={18} /> : <Save size={18} />}
                    {saving ? t('admin.saving') : saved ? t('admin.settingsSavedSuccess').replace(' ✅', '') : t('admin.saveChanges')}
                </button>
            </div>

            {/* Summary Bar */}
            <div className="summary-bar">
                <div className="summary-stat">
                    <span className="stat-num">{enabledCount}</span>
                    <span className="stat-label">{t('admin.enabledMethods')}</span>
                </div>
                <div className="summary-stat">
                    <span className="stat-num">{Object.keys(methods).length - enabledCount}</span>
                    <span className="stat-label">{t('admin.disabledMethods')}</span>
                </div>
            </div>

            {enabledCount === 0 && (
                <div className="warning-banner">
                    <AlertCircle size={18} />
                    <span>{t('admin.noEnabledMethodsWarning')}</span>
                </div>
            )}

            {/* Payment Methods List */}
            <div className="methods-list">
                {Object.entries(methods).map(([id, method]) => {
                    const isExpanded = expandedMethod === id
                    const hasSettings = Object.keys(method.settings).length > 0

                    return (
                        <div key={id} className={`method-card ${method.enabled ? 'enabled' : 'disabled'}`}>
                            <div className="method-header">
                                <div className="method-info">
                                    <div className={`method-icon ${method.enabled ? 'active' : ''}`}>
                                        {ICONS[method.icon] || <CreditCard size={22} />}
                                    </div>
                                    <div>
                                        <h3>{method.name}</h3>
                                        <span className={`method-status ${method.enabled ? 'on' : 'off'}`}>
                                            {method.enabled ? t('admin.enabled') : t('admin.disabled')}
                                        </span>
                                    </div>
                                </div>

                                <div className="method-actions">
                                    <button
                                        className={`toggle-btn ${method.enabled ? 'on' : 'off'}`}
                                        onClick={() => toggleMethod(id)}
                                        title={method.enabled ? t('admin.disable') : t('admin.enable')}
                                    >
                                        {method.enabled ?
                                            <ToggleRight size={32} /> :
                                            <ToggleLeft size={32} />
                                        }
                                    </button>
                                    {hasSettings && (
                                        <button
                                            className="expand-btn"
                                            onClick={() => setExpandedMethod(isExpanded ? null : id)}
                                        >
                                            <Settings size={16} />
                                            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Settings Panel */}
                            {isExpanded && hasSettings && (
                                <div className="method-settings">
                                    <div className="settings-divider">
                                        <span>{t('admin.settingsFor')} {method.name}</span>
                                    </div>
                                    <div className="settings-grid">
                                        {Object.entries(method.settings).map(([key, value]) => {
                                            // Provider special select
                                            if (key === 'provider') {
                                                return (
                                                    <div key={key} className="setting-field">
                                                        <label>{getFieldLabel(key)}</label>
                                                        <select
                                                            value={value}
                                                            onChange={e => updateSetting(id, key, e.target.value)}
                                                        >
                                                            <option value="manual">{t('admin.manualPaymentInfo')}</option>
                                                            <option value="moyasar">Moyasar</option>
                                                            <option value="tap">Tap Payments</option>
                                                        </select>
                                                        {value === 'manual' && (
                                                            <small>{t('admin.manualPaymentNote')}</small>
                                                        )}
                                                    </div>
                                                )
                                            }

                                            // Instructions use textarea
                                            if (key === 'instructions') {
                                                return (
                                                    <div key={key} className="setting-field full-width">
                                                        <label>{getFieldLabel(key)}</label>
                                                        <textarea
                                                            value={value}
                                                            onChange={e => updateSetting(id, key, e.target.value)}
                                                            placeholder={''}
                                                            rows={2}
                                                        />
                                                    </div>
                                                )
                                            }

                                            // Regular input
                                            return (
                                                <div key={key} className="setting-field">
                                                    <label>{getFieldLabel(key)}</label>
                                                    <input
                                                        type={key.toLowerCase().includes('key') || key.toLowerCase().includes('password') ? 'password' : 'text'}
                                                        value={value}
                                                        onChange={e => updateSetting(id, key, e.target.value)}
                                                        placeholder={''}
                                                        dir={key === 'iban' || key === 'accountNumber' || key === 'merchantId' || key === 'apiKey' ? 'ltr' : 'rtl'}
                                                    />
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>

            <style>{`
                .payments-page { max-width: 800px; }
                .page-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 1.5rem;
                    flex-wrap: wrap;
                    gap: 1rem;
                }
                .page-header h1 { font-size: 1.5rem; margin-bottom: 0.25rem; }
                .page-header p { color: #6b7280; font-size: 0.9rem; }

                .save-btn {
                    display: flex;
                    align-items: center;
                    gap: 0.4rem;
                    padding: 0.7rem 1.5rem;
                    background: var(--primary);
                    color: white;
                    border-radius: 8px;
                    font-weight: 600;
                    font-size: 0.9rem;
                    border: none;
                    cursor: pointer;
                    font-family: inherit;
                    transition: all 0.2s;
                    box-shadow: 0 2px 8px rgba(210,105,30,0.2);
                }
                .save-btn:hover:not(:disabled) { transform: translateY(-1px); }
                .save-btn:disabled { opacity: 0.7; cursor: not-allowed; }

                .summary-bar {
                    display: flex;
                    gap: 1.5rem;
                    background: white;
                    border-radius: 12px;
                    padding: 1.25rem;
                    margin-bottom: 1.5rem;
                    border: 1px solid #f3f4f6;
                }
                .summary-stat { text-align: center; }
                .stat-num {
                    display: block;
                    font-size: 1.5rem;
                    font-weight: 700;
                    color: var(--primary);
                }
                .stat-label { font-size: 0.8rem; color: #9ca3af; }

                .warning-banner {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.85rem 1rem;
                    background: #fef3c7;
                    color: #92400e;
                    border-radius: 10px;
                    font-size: 0.85rem;
                    margin-bottom: 1.5rem;
                    border: 1px solid #fcd34d;
                }

                .methods-list {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                }
                .method-card {
                    background: white;
                    border-radius: 12px;
                    border: 1px solid #f3f4f6;
                    overflow: hidden;
                    transition: all 0.2s;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.03);
                }
                .method-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.06); }
                .method-card.disabled { opacity: 0.7; }
                .method-card.enabled { border-right: 3px solid var(--primary); }

                .method-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 1.25rem;
                }
                .method-info {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }
                .method-icon {
                    width: 48px;
                    height: 48px;
                    border-radius: 12px;
                    background: #f3f4f6;
                    color: #9ca3af;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s;
                }
                .method-icon.active {
                    background: linear-gradient(135deg, var(--primary), #f59e0b);
                    color: white;
                }
                .method-info h3 {
                    font-size: 1rem;
                    margin-bottom: 0.15rem;
                }
                .method-status {
                    font-size: 0.75rem;
                    font-weight: 500;
                }
                .method-status.on { color: #22c55e; }
                .method-status.off { color: #9ca3af; }

                .method-actions {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }
                .toggle-btn {
                    background: none;
                    border: none;
                    cursor: pointer;
                    transition: color 0.2s;
                    display: flex;
                    align-items: center;
                }
                .toggle-btn.on { color: #22c55e; }
                .toggle-btn.off { color: #d1d5db; }

                .expand-btn {
                    display: flex;
                    align-items: center;
                    gap: 0.25rem;
                    padding: 0.4rem 0.6rem;
                    border: 1px solid #e5e7eb;
                    border-radius: 6px;
                    background: white;
                    color: #6b7280;
                    cursor: pointer;
                    transition: all 0.2s;
                    font-family: inherit;
                }
                .expand-btn:hover { border-color: var(--primary); color: var(--primary); }

                /* Settings */
                .method-settings {
                    padding: 0 1.25rem 1.25rem;
                    animation: settingsSlideDown 0.2s ease;
                }
                @keyframes settingsSlideDown {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .settings-divider {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    margin-bottom: 1.25rem;
                    color: #9ca3af;
                    font-size: 0.8rem;
                }
                .settings-divider::before,
                .settings-divider::after {
                    content: '';
                    flex: 1;
                    height: 1px;
                    background: #e5e7eb;
                }
                .settings-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1rem;
                }
                .setting-field {
                    display: flex;
                    flex-direction: column;
                    gap: 0.4rem;
                }
                .setting-field.full-width { grid-column: span 2; }
                .setting-field label {
                    font-size: 0.8rem;
                    font-weight: 500;
                    color: #4b5563;
                }
                .setting-field input,
                .setting-field textarea,
                .setting-field select {
                    padding: 0.6rem 0.75rem;
                    border: 1px solid #e5e7eb;
                    border-radius: 8px;
                    font-size: 0.85rem;
                    font-family: inherit;
                    outline: none;
                    transition: border-color 0.2s;
                    background: #fafafa;
                    width: 100%;
                }
                .setting-field input:focus,
                .setting-field textarea:focus,
                .setting-field select:focus {
                    border-color: var(--primary);
                    background: white;
                }
                .setting-field small {
                    font-size: 0.7rem;
                    color: #9ca3af;
                }

                @media (max-width: 640px) {
                    .settings-grid { grid-template-columns: 1fr; }
                    .setting-field.full-width { grid-column: span 1; }
                    .page-header { flex-direction: column; }
                    .method-header { flex-wrap: wrap; gap: 0.75rem; }
                }
            `}</style>
        </div>
    )
}
