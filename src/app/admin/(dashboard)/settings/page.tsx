'use client'

import { useState, useEffect } from 'react'
import { Save, Plus, Trash2, Upload, Instagram, Twitter, Share2, MapPin, Globe, Phone, Image as ImageIcon, Lock } from 'lucide-react'

// --- Inline Styles System (To ensure design works without Tailwind) ---
const styles: Record<string, React.CSSProperties> = {
    pageWrapper: {
        backgroundColor: '#f3f4f6', // gray-100
        minHeight: '100vh',
        padding: '24px',
        fontFamily: 'inherit',
        direction: 'rtl'
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '32px',
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
    },
    headerTitle: {
        fontSize: '24px',
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: '4px'
    },
    headerSubtitle: {
        color: '#6b7280',
        fontSize: '14px'
    },
    saveButton: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        backgroundColor: '#D2691E',
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
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        overflow: 'hidden',
        border: '1px solid #e5e7eb'
    },
    cardHeader: {
        padding: '16px 24px',
        borderBottom: '1px solid #e5e7eb',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        backgroundColor: '#f9fafb'
    },
    cardTitle: {
        fontSize: '18px',
        fontWeight: 'bold',
        color: '#374151',
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
        color: '#374151',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
    },
    input: {
        width: '100%',
        padding: '10px 12px',
        borderRadius: '8px',
        border: '1px solid #d1d5db',
        fontSize: '14px',
        outline: 'none',
        transition: 'border-color 0.2s',
        backgroundColor: '#f9fafb'
    },
    imageUploadBox: {
        border: '2px dashed #d1d5db',
        borderRadius: '12px',
        padding: '4px',
        textAlign: 'center',
        cursor: 'pointer',
        position: 'relative',
        backgroundColor: '#f9fafb',
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
        backgroundColor: '#f9fafb',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        marginBottom: '12px'
    },
    addButton: {
        backgroundColor: 'white',
        border: '1px solid #e5e7eb',
        color: '#D2691E',
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
            alert('تم حفظ الإعدادات بنجاح ✅')
        } catch (error) {
            alert('حدث خطأ أثناء الحفظ')
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
            alert('فشل رفع الصورة')
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
        if (!passwordData.old || !passwordData.new) return alert('الرجاء تعبئة جميع حقول كلمة المرور')

        setChangingPassword(true)
        try {
            const res = await fetch('/api/auth/change-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ oldPassword: passwordData.old, newPassword: passwordData.new })
            })
            const data = await res.json()

            if (res.ok && data.success) {
                alert('تم تغيير كلمة المرور بنجاح ✅')
                setPasswordData({ old: '', new: '' })
            } else {
                alert(data.error || 'فشل تغيير كلمة المرور')
            }
        } catch (error) {
            alert('حدث خطأ غير متوقع')
            console.error(error)
        } finally {
            setChangingPassword(false)
        }
    }

    if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '50px', color: '#666' }}>جاري تحميل الإعدادات...</div>

    return (
        <div className="settings-page" style={styles.pageWrapper}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

                {/* Header */}
                <div style={styles.header}>
                    <div>
                        <h1 style={styles.headerTitle}>إعدادات المتجر</h1>
                        <p style={styles.headerSubtitle}>إدارة البيانات، التوصيل، وحسابات التواصل</p>
                    </div>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        style={{ ...styles.saveButton, opacity: saving ? 0.7 : 1 }}
                    >
                        <Save size={18} />
                        {saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
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
                                <Globe size={20} color="#D2691E" />
                                <h2 style={styles.cardTitle}>بيانات المتجر</h2>
                            </div>
                            <div style={styles.cardBody}>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>اسم المتجر</label>
                                    <input
                                        type="text"
                                        value={settings.storeName}
                                        onChange={e => handleChange('storeName', e.target.value)}
                                        style={styles.input}
                                        placeholder="مثال: بسبوسة القرفة"
                                    />
                                </div>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>رقم الواتساب (للتنبيهات)</label>
                                    <div style={{ position: 'relative' }}>
                                        <input
                                            type="text"
                                            value={settings.whatsappNumber}
                                            onChange={e => handleChange('whatsappNumber', e.target.value)}
                                            style={{ ...styles.input, direction: 'ltr', textAlign: 'left' }}
                                            placeholder="9665xxxxxxxx"
                                        />
                                        <Phone size={18} color="#9ca3af" style={{ position: 'absolute', right: '12px', top: '12px' }} />
                                    </div>
                                </div>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>صورة الواجهة (Hero Image)</label>
                                    <div style={styles.imageUploadBox}>
                                        <input type="file" accept="image/*" onChange={handleFileUpload} style={{ position: 'absolute', width: '100%', height: '100%', opacity: 0, cursor: 'pointer', zIndex: 10 }} />

                                        {settings.heroImage ? (
                                            <div style={{ width: '100%', height: '100%', overflow: 'hidden', borderRadius: '8px' }}>
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img src={settings.heroImage} alt="Hero" style={styles.previewImage} />
                                                <div style={{ position: 'absolute', bottom: '10px', left: '10px', backgroundColor: 'rgba(255,255,255,0.9)', padding: '5px 10px', borderRadius: '5px', fontSize: '12px', fontWeight: 'bold', pointerEvents: 'none' }}>
                                                    {uploading ? 'جاري الرفع...' : 'تغيير الصورة'}
                                                </div>
                                            </div>
                                        ) : (
                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: '#9ca3af' }}>
                                                <ImageIcon size={40} style={{ marginBottom: '10px' }} />
                                                <span>اضغط لاختيار صورة</span>
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
                                    <MapPin size={20} color="#D2691E" />
                                    <h2 style={styles.cardTitle}>مناطق التوصيل</h2>
                                </div>
                                <button onClick={addZone} style={styles.addButton}>
                                    <Plus size={14} /> إضافة منطقة
                                </button>
                            </div>
                            <div style={styles.cardBody}>
                                {settings.deliveryZones.length === 0 ? (
                                    <div style={{ textAlign: 'center', padding: '20px', color: '#9ca3af', border: '1px dashed #e5e7eb', borderRadius: '8px' }}>
                                        لا توجد مناطق مضافة
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
                                                    placeholder="اسم المنطقة"
                                                />
                                            </div>
                                            <div style={{ width: '100px' }}>
                                                <input
                                                    type="number"
                                                    value={zone.price}
                                                    onChange={(e) => handleZoneChange(idx, 'price', Number(e.target.value))}
                                                    style={styles.input}
                                                    placeholder="السعر"
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
                                <Share2 size={20} color="#D2691E" />
                                <h2 style={styles.cardTitle}>حسابات التواصل</h2>
                            </div>
                            <div style={styles.cardBody}>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}><Instagram size={16} /> انستقرام</label>
                                    <input
                                        type="text"
                                        value={settings.social_instagram}
                                        onChange={e => handleChange('social_instagram', e.target.value)}
                                        style={{ ...styles.input, direction: 'ltr' }}
                                        placeholder="@username"
                                    />
                                </div>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}><Twitter size={16} /> تويتر (X)</label>
                                    <input
                                        type="text"
                                        value={settings.social_twitter}
                                        onChange={e => handleChange('social_twitter', e.target.value)}
                                        style={{ ...styles.input, direction: 'ltr' }}
                                        placeholder="@username"
                                    />
                                </div>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}><Share2 size={16} /> سناب شات</label>
                                    <input
                                        type="text"
                                        value={settings.social_snapchat}
                                        onChange={e => handleChange('social_snapchat', e.target.value)}
                                        style={{ ...styles.input, direction: 'ltr' }}
                                        placeholder="username"
                                    />
                                </div>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}><Share2 size={16} /> تيك توك</label>
                                    <input
                                        type="text"
                                        value={settings.social_tiktok}
                                        onChange={e => handleChange('social_tiktok', e.target.value)}
                                        style={{ ...styles.input, direction: 'ltr' }}
                                        placeholder="@username"
                                    />
                                </div>
                                <div style={{ backgroundColor: '#fffbeb', padding: '12px', borderRadius: '8px', fontSize: '12px', color: '#92400e', border: '1px solid #fcd34d' }}>
                                    💡 الروابط ستظهر في أسفل الموقع تلقائياً.
                                </div>
                            </div>
                        </div>

                        {/* Password Change Card */}
                        <div style={styles.card}>
                            <div style={{ ...styles.cardHeader, backgroundColor: '#fef2f2' }}>
                                <Lock size={20} color="#ef4444" />
                                <h2 style={{ ...styles.cardTitle, color: '#ef4444' }}>تغيير كلمة المرور</h2>
                            </div>
                            <div style={styles.cardBody}>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>كلمة المرور الحالية</label>
                                    <input
                                        type="password"
                                        value={passwordData.old}
                                        onChange={e => setPasswordData({ ...passwordData, old: e.target.value })}
                                        style={{ ...styles.input, direction: 'ltr' }}
                                        placeholder="********"
                                    />
                                </div>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>كلمة المرور الجديدة</label>
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
                                    {changingPassword ? 'جاري التغيير...' : 'تحديث كلمة المرور'}
                                </button>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    )
}
