'use client'

import { useState, useEffect } from 'react'
import { Save, Plus, Trash2, Upload, Instagram, Twitter, Share2, MapPin, Globe, Phone, Image as ImageIcon, Lock } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'

// --- Inline Styles System (To ensure design works without Tailwind) ---
const styles: Record<string, React.CSSProperties> = {
    pageWrapper: {
        backgroundColor: 'var(--bg)',
        minHeight: '100vh',
        padding: '24px',
        fontFamily: 'inherit'
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '32px',
        backgroundColor: 'var(--card-bg)',
        padding: '20px',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
    },
    headerTitle: {
        fontSize: '24px',
        fontWeight: 'bold',
        color: 'var(--text)',
        marginBottom: '4px'
    },
    headerSubtitle: {
        color: 'var(--text-muted)',
        fontSize: '14px'
    },
    saveButton: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        backgroundColor: 'var(--primary, #D2691E)',
        color: 'white',
        border: 'none',
        padding: '10px 24px',
        borderRadius: '8px',
        fontSize: '16px',
        fontWeight: 'bold',
        cursor: 'pointer',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        transition: 'opacity 0.2s'
    },
    gridContainer: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '24px',
    },
    mainColumn: {
        gridColumn: 'span 2', // Requires CSS Grid support, fallback is handled by flex wrap usually
        display: 'flex',
        flexDirection: 'column',
        gap: '24px'
    },
    sideColumn: {
        display: 'flex',
        flexDirection: 'column',
        gap: '24px'
    },
    card: {
        backgroundColor: 'var(--card-bg)',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        overflow: 'hidden',
        border: '1px solid var(--card-border)'
    },
    cardHeader: {
        padding: '16px 24px',
        borderBottom: '1px solid var(--card-border)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        backgroundColor: 'var(--card-bg)'
    },
    cardTitle: {
        fontSize: '18px',
        fontWeight: 'bold',
        color: 'var(--text)',
        margin: 0
    },
    cardBody: {
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
    },
    formGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
    },
    label: {
        fontSize: '14px',
        fontWeight: '600',
        color: 'var(--text)',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
    },
    input: {
        width: '100%',
        padding: '10px 12px',
        borderRadius: '8px',
        border: '1px solid var(--gray-200)',
        fontSize: '14px',
        outline: 'none',
        transition: 'border-color 0.2s',
        backgroundColor: 'transparent',
        color: 'var(--text)'
    },
    imageUploadBox: {
        border: '2px dashed var(--gray-200)',
        borderRadius: '12px',
        padding: '4px',
        textAlign: 'center',
        cursor: 'pointer',
        position: 'relative',
        backgroundColor: 'var(--gray-100)',
        minHeight: '200px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
    },
    previewImage: {
        width: '100%',
        height: '240px',
        objectFit: 'cover',
        borderRadius: '8px'
    },
    zoneItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '12px',
        backgroundColor: 'var(--gray-100)',
        border: '1px solid var(--card-border)',
        borderRadius: '8px',
        marginBottom: '12px'
    },
    addButton: {
        backgroundColor: 'var(--card-bg)',
        border: '1px solid var(--card-border)',
        color: 'var(--primary, #D2691E)',
        padding: '6px 16px',
        borderRadius: '20px',
        fontSize: '13px',
        fontWeight: 'bold',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '6px'
    }
}

// Interfaces
interface DeliveryZone {
    name: string
    price: number
}

interface SettingsState {
    storeName: string
    whatsappNumber: string
    heroImage: string
    deliveryZones: DeliveryZone[]
    social_instagram: string
    social_twitter: string
    social_snapchat: string
    social_tiktok: string
}

export default function SettingsPage() {
    const { t } = useLanguage()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [settings, setSettings] = useState<SettingsState>({
        storeName: '',
        whatsappNumber: '',
        heroImage: '',
        deliveryZones: [],
        social_instagram: '',
        social_twitter: '',
        social_snapchat: '',
        social_tiktok: ''
    })

    useEffect(() => {
        fetch('/api/settings')
            .then(res => res.json())
            .then(data => {
                if (!data.deliveryZones) data.deliveryZones = []
                setSettings(data)
                setLoading(false)
            })
            .catch(err => {
                console.error(err)
                setLoading(false)
            })
    }, [])

    const handleSave = async () => {
        setSaving(true)
        try {
            await fetch('/api/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings)
            })
            alert(t('admin.settingsSavedSuccess'))
        } catch (error) {
            alert(t('admin.settingsSaveError'))
        } finally {
            setSaving(false)
        }
    }

    const handleChange = (key: keyof SettingsState, value: any) => {
        setSettings(prev => ({ ...prev, [key]: value }))
    }

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.[0]) return
        setUploading(true)
        const formData = new FormData()
        formData.append('file', e.target.files[0])
        try {
            const res = await fetch('/api/upload', { method: 'POST', body: formData })
            const data = await res.json()
            if (data.url) handleChange('heroImage', data.url)
        } catch (error) {
            alert(t('admin.uploadFailed'))
        } finally {
            setUploading(false)
        }
    }

    const addZone = () => handleChange('deliveryZones', [...settings.deliveryZones, { name: '', price: 0 }])

    const removeZone = (index: number) => {
        const newZones = [...settings.deliveryZones]
        newZones.splice(index, 1)
        handleChange('deliveryZones', newZones)
    }

    const handleZoneChange = (index: number, field: keyof DeliveryZone, value: any) => {
        const newZones = [...settings.deliveryZones]
        newZones[index] = { ...newZones[index], [field]: value }
        handleChange('deliveryZones', newZones)
    }

    const [passwordData, setPasswordData] = useState({ old: '', new: '' })
    const [changingPassword, setChangingPassword] = useState(false)

    const handlePasswordUpdate = async () => {
        if (!passwordData.old || !passwordData.new) return alert(t('admin.passwordFillFields'))

        setChangingPassword(true)
        try {
            const res = await fetch('/api/auth/change-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ oldPassword: passwordData.old, newPassword: passwordData.new })
            })
            const data = await res.json()

            if (res.ok && data.success) {
                alert(t('admin.passwordChangedSuccess'))
                setPasswordData({ old: '', new: '' })
            } else {
                alert(data.error || t('admin.passwordChangeFailed'))
            }
        } catch (error) {
            alert(t('admin.unexpectedError'))
            console.error(error)
        } finally {
            setChangingPassword(false)
        }
    }

    if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '50px', color: 'var(--text-muted)' }}>{t('admin.loadingSettings')}</div>

    return (
        <div className="settings-page" style={styles.pageWrapper}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

                {/* Header */}
                <div style={styles.header}>
                    <div>
                        <h1 style={styles.headerTitle}>{t('admin.storeSettings')}</h1>
                        <p style={styles.headerSubtitle}>{t('admin.storeSettingsDesc')}</p>
                    </div>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        style={{ ...styles.saveButton, opacity: saving ? 0.7 : 1 }}
                    >
                        <Save size={18} />
                        {saving ? t('admin.saving') : t('admin.saveChanges')}
                    </button>
                </div>

                {/* Grid Layout Manual Implementation */}
                {/* We use flexbox with wrapping for responsiveness since simple grid might fail without media queries */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', alignItems: 'flex-start' }}>

                    {/* Main Column (Right) - takes 66% width roughly on large screens */}
                    <div style={{ flex: '2 1 600px', display: 'flex', flexDirection: 'column', gap: '24px' }}>

                        {/* Store Info Card */}
                        <div style={styles.card}>
                            <div style={styles.cardHeader}>
                                <Globe size={20} color="var(--primary)" />
                                <h2 style={styles.cardTitle}>{t('admin.storeData')}</h2>
                            </div>
                            <div style={styles.cardBody}>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>{t('admin.storeName')}</label>
                                    <input
                                        type="text"
                                        value={settings.storeName}
                                        onChange={e => handleChange('storeName', e.target.value)}
                                        style={styles.input}
                                        placeholder={t('admin.storeNamePlaceholder')}
                                    />
                                </div>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>{t('admin.whatsappNumber')}</label>
                                    <div style={{ position: 'relative' }}>
                                        <input
                                            type="text"
                                            value={settings.whatsappNumber}
                                            onChange={e => handleChange('whatsappNumber', e.target.value)}
                                            style={{ ...styles.input, direction: 'ltr', textAlign: 'left' }}
                                            placeholder="9665xxxxxxxx"
                                        />
                                        <Phone size={18} color="var(--text-muted)" style={{ position: 'absolute', right: '12px', top: '12px' }} />
                                    </div>
                                </div>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>{t('admin.heroImage')}</label>
                                    <div style={styles.imageUploadBox}>
                                        <input type="file" accept="image/*" onChange={handleFileUpload} style={{ position: 'absolute', width: '100%', height: '100%', opacity: 0, cursor: 'pointer', zIndex: 10 }} />

                                        {settings.heroImage ? (
                                            <div style={{ width: '100%', height: '100%', overflow: 'hidden', borderRadius: '8px' }}>
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img src={settings.heroImage} alt="Hero" style={styles.previewImage} />
                                                <div style={{ position: 'absolute', bottom: '10px', left: '10px', backgroundColor: 'rgba(255,255,255,0.9)', padding: '5px 10px', borderRadius: '5px', fontSize: '12px', fontWeight: 'bold', pointerEvents: 'none' }}>
                                                    {uploading ? t('admin.uploading') : t('admin.changeImage')}
                                                </div>
                                            </div>
                                        ) : (
                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: 'var(--text-muted)' }}>
                                                <ImageIcon size={40} style={{ marginBottom: '10px' }} />
                                                <span>{t('admin.clickToSelectImage')}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Delivery Zones Card */}
                        <div style={styles.card}>
                            <div style={{ ...styles.cardHeader, justifyContent: 'space-between' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <MapPin size={20} color="var(--primary)" />
                                    <h2 style={styles.cardTitle}>{t('admin.deliveryZones')}</h2>
                                </div>
                                <button onClick={addZone} style={styles.addButton}>
                                    <Plus size={14} /> {t('admin.addZone')}
                                </button>
                            </div>
                            <div style={styles.cardBody}>
                                {settings.deliveryZones.length === 0 ? (
                                    <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)', border: '1px dashed var(--gray-200)', borderRadius: '8px' }}>
                                        {t('admin.noZones')}
                                    </div>
                                ) : (
                                    settings.deliveryZones.map((zone, idx) => (
                                        <div key={idx} style={styles.zoneItem}>
                                            <div style={{ flex: 1 }}>
                                                <input
                                                    type="text"
                                                    value={zone.name}
                                                    onChange={(e) => handleZoneChange(idx, 'name', e.target.value)}
                                                    style={styles.input}
                                                    placeholder={t('admin.zoneName')}
                                                />
                                            </div>
                                            <div style={{ width: '100px' }}>
                                                <input
                                                    type="number"
                                                    value={zone.price}
                                                    onChange={(e) => handleZoneChange(idx, 'price', Number(e.target.value))}
                                                    style={styles.input}
                                                    placeholder={t('admin.price')}
                                                />
                                            </div>
                                            <button onClick={() => removeZone(idx)} style={{ border: 'none', background: 'none', color: '#ef4444', cursor: 'pointer' }}>
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                    </div>

                    {/* Sidebar Column (Left) - takes remaining space, min 300px */}
                    <div style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        <div style={styles.card}>
                            <div style={styles.cardHeader}>
                                <Share2 size={20} color="var(--primary)" />
                                <h2 style={styles.cardTitle}>{t('admin.socialAccounts')}</h2>
                            </div>
                            <div style={styles.cardBody}>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}><Instagram size={16} /> {t('admin.instagram')}</label>
                                    <input
                                        type="text"
                                        value={settings.social_instagram}
                                        onChange={e => handleChange('social_instagram', e.target.value)}
                                        style={{ ...styles.input, direction: 'ltr' }}
                                        placeholder="@username"
                                    />
                                </div>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}><Twitter size={16} /> {t('admin.twitter')}</label>
                                    <input
                                        type="text"
                                        value={settings.social_twitter}
                                        onChange={e => handleChange('social_twitter', e.target.value)}
                                        style={{ ...styles.input, direction: 'ltr' }}
                                        placeholder="@username"
                                    />
                                </div>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}><Share2 size={16} /> {t('admin.snapchat')}</label>
                                    <input
                                        type="text"
                                        value={settings.social_snapchat}
                                        onChange={e => handleChange('social_snapchat', e.target.value)}
                                        style={{ ...styles.input, direction: 'ltr' }}
                                        placeholder="username"
                                    />
                                </div>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}><Share2 size={16} /> {t('admin.tiktok')}</label>
                                    <input
                                        type="text"
                                        value={settings.social_tiktok}
                                        onChange={e => handleChange('social_tiktok', e.target.value)}
                                        style={{ ...styles.input, direction: 'ltr' }}
                                        placeholder="@username"
                                    />
                                </div>
                                <div style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', padding: '12px', borderRadius: '8px', fontSize: '12px', color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                                    {t('admin.socialLinksTip')}
                                </div>
                            </div>
                        </div>

                        {/* Password Change Card */}
                        <div style={styles.card}>
                            <div style={{ ...styles.cardHeader, backgroundColor: 'rgba(239, 68, 68, 0.05)' }}>
                                <Lock size={20} color="#ef4444" />
                                <h2 style={{ ...styles.cardTitle, color: '#ef4444' }}>{t('admin.changePassword')}</h2>
                            </div>
                            <div style={styles.cardBody}>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>{t('admin.currentPassword')}</label>
                                    <input
                                        type="password"
                                        value={passwordData.old}
                                        onChange={e => setPasswordData({ ...passwordData, old: e.target.value })}
                                        style={{ ...styles.input, direction: 'ltr' }}
                                        placeholder="********"
                                    />
                                </div>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>{t('admin.newPassword')}</label>
                                    <input
                                        type="password"
                                        value={passwordData.new}
                                        onChange={e => setPasswordData({ ...passwordData, new: e.target.value })}
                                        style={{ ...styles.input, direction: 'ltr' }}
                                        placeholder="********"
                                    />
                                </div>
                                <button
                                    onClick={handlePasswordUpdate}
                                    disabled={changingPassword}
                                    style={{
                                        backgroundColor: '#ef4444',
                                        color: 'white',
                                        border: 'none',
                                        padding: '10px',
                                        borderRadius: '8px',
                                        fontWeight: 'bold',
                                        cursor: changingPassword ? 'not-allowed' : 'pointer',
                                        marginTop: '10px',
                                        opacity: changingPassword ? 0.7 : 1
                                    }}
                                >
                                    {changingPassword ? t('admin.changing') : t('admin.updatePassword')}
                                </button>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    )
}
