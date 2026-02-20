'use client'

import { useState, useEffect } from 'react'
import {
    Users2, Plus, Edit3, Trash2, X, Save,
    Shield, Eye, ShoppingBag, Image, ClipboardList,
    BarChart3, Settings, UserCheck, UserX, Search, CreditCard
} from 'lucide-react'

interface StaffMember {
    id: number
    username: string
    name: string
    role: string
    permissions: string
    active: boolean
    createdAt: string
}

const PERMISSIONS = [
    { key: 'orders', label: 'الطلبات', icon: <ClipboardList size={16} />, desc: 'عرض وإدارة طلبات العملاء' },
    { key: 'products', label: 'المنتجات', icon: <ShoppingBag size={16} />, desc: 'إضافة وتعديل المنتجات' },
    { key: 'gallery', label: 'معرض الصور', icon: <Image size={16} />, desc: 'رفع وإدارة الصور' },
    { key: 'customers', label: 'العملاء', icon: <Users2 size={16} />, desc: 'عرض بيانات العملاء' },
    { key: 'reports', label: 'التقارير', icon: <BarChart3 size={16} />, desc: 'الاطلاع على التقارير' },
    { key: 'payments', label: 'طرق الدفع', icon: <CreditCard size={16} />, desc: 'إدارة وتهيئة طرق الدفع' },
    { key: 'settings', label: 'الإعدادات', icon: <Settings size={16} />, desc: 'تعديل إعدادات الموقع' },
]

const ROLES = [
    { value: 'staff', label: 'موظف', desc: 'صلاحيات محددة' },
    { value: 'manager', label: 'مدير', desc: 'جميع الصلاحيات' },
]

export default function StaffPage() {
    const [staff, setStaff] = useState<StaffMember[]>([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null)
    const [search, setSearch] = useState('')
    const [saving, setSaving] = useState(false)
    const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null)

    // Form state
    const [formName, setFormName] = useState('')
    const [formUsername, setFormUsername] = useState('')
    const [formPassword, setFormPassword] = useState('')
    const [formRole, setFormRole] = useState('staff')
    const [formPermissions, setFormPermissions] = useState<string[]>([])
    const [formError, setFormError] = useState('')

    useEffect(() => {
        fetchStaff()
    }, [])

    const fetchStaff = async () => {
        try {
            const res = await fetch('/api/staff')
            const data = await res.json()
            setStaff(Array.isArray(data) ? data : [])
        } catch {
            console.error('Error fetching staff')
        } finally {
            setLoading(false)
        }
    }

    const openCreateModal = () => {
        setEditingStaff(null)
        setFormName('')
        setFormUsername('')
        setFormPassword('')
        setFormRole('staff')
        setFormPermissions([])
        setFormError('')
        setShowModal(true)
    }

    const openEditModal = (s: StaffMember) => {
        setEditingStaff(s)
        setFormName(s.name)
        setFormUsername(s.username)
        setFormPassword('')
        setFormRole(s.role)
        try {
            setFormPermissions(JSON.parse(s.permissions))
        } catch {
            setFormPermissions([])
        }
        setFormError('')
        setShowModal(true)
    }

    const togglePermission = (perm: string) => {
        setFormPermissions(prev =>
            prev.includes(perm) ? prev.filter(p => p !== perm) : [...prev, perm]
        )
    }

    const handleSave = async () => {
        if (!formName || !formUsername) {
            setFormError('الاسم واسم المستخدم مطلوبين')
            return
        }
        if (!editingStaff && !formPassword) {
            setFormError('كلمة المرور مطلوبة')
            return
        }
        if (formRole === 'staff' && formPermissions.length === 0) {
            setFormError('اختر صلاحية واحدة على الأقل')
            return
        }

        setSaving(true)
        setFormError('')

        try {
            if (editingStaff) {
                // Update
                const body: Record<string, unknown> = {
                    name: formName,
                    role: formRole,
                    permissions: formRole === 'manager' ? PERMISSIONS.map(p => p.key) : formPermissions,
                }
                if (formPassword) body.password = formPassword

                const res = await fetch(`/api/staff/${editingStaff.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body)
                })
                if (res.ok) {
                    await fetchStaff()
                    setShowModal(false)
                } else {
                    const data = await res.json()
                    setFormError(data.error || 'حدث خطأ')
                }
            } else {
                // Create
                const res = await fetch('/api/staff', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: formName,
                        username: formUsername,
                        password: formPassword,
                        role: formRole,
                        permissions: formRole === 'manager' ? PERMISSIONS.map(p => p.key) : formPermissions,
                    })
                })
                const data = await res.json()
                if (res.ok) {
                    await fetchStaff()
                    setShowModal(false)
                } else {
                    setFormError(data.error || 'حدث خطأ')
                }
            }
        } catch {
            setFormError('حدث خطأ')
        } finally {
            setSaving(false)
        }
    }

    const handleToggleActive = async (s: StaffMember) => {
        try {
            await fetch(`/api/staff/${s.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ active: !s.active })
            })
            await fetchStaff()
        } catch {
            console.error('Error toggling staff status')
        }
    }

    const handleDelete = async (id: number) => {
        try {
            await fetch(`/api/staff/${id}`, { method: 'DELETE' })
            await fetchStaff()
            setDeleteConfirm(null)
        } catch {
            console.error('Error deleting staff')
        }
    }

    const filteredStaff = staff.filter(s =>
        s.name.includes(search) || s.username.includes(search)
    )

    const getPermLabels = (permsJson: string) => {
        try {
            const perms = JSON.parse(permsJson) as string[]
            return perms.map(p => PERMISSIONS.find(pp => pp.key === p)?.label || p).join('، ')
        } catch {
            return ''
        }
    }

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
                <p>جاري التحميل...</p>
            </div>
        )
    }

    return (
        <div className="staff-page">
            <div className="page-header">
                <div>
                    <h1>إدارة الموظفين</h1>
                    <p>إضافة وإدارة حسابات الموظفين وصلاحياتهم</p>
                </div>
                <button className="add-btn" onClick={openCreateModal}>
                    <Plus size={18} />
                    إضافة موظف
                </button>
            </div>

            {/* Search */}
            <div className="search-bar">
                <Search size={18} />
                <input
                    type="text"
                    placeholder="بحث بالاسم أو اسم المستخدم..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
            </div>

            {/* Staff List */}
            {filteredStaff.length === 0 ? (
                <div className="empty-state">
                    <Users2 size={48} />
                    <p>{search ? 'لا توجد نتائج' : 'لم يتم إضافة موظفين بعد'}</p>
                    {!search && (
                        <button className="add-btn-sm" onClick={openCreateModal}>
                            <Plus size={16} />
                            إضافة أول موظف
                        </button>
                    )}
                </div>
            ) : (
                <div className="staff-grid">
                    {filteredStaff.map(s => {
                        let perms: string[] = []
                        try { perms = JSON.parse(s.permissions) } catch { /* */ }

                        return (
                            <div key={s.id} className={`staff-card ${!s.active ? 'inactive' : ''}`}>
                                <div className="card-top">
                                    <div className="avatar">
                                        {s.name.charAt(0)}
                                    </div>
                                    <div className="card-info">
                                        <h3>{s.name}</h3>
                                        <span className="username">@{s.username}</span>
                                    </div>
                                    <span className={`role-badge ${s.role}`}>
                                        <Shield size={12} />
                                        {s.role === 'manager' ? 'مدير' : 'موظف'}
                                    </span>
                                </div>

                                <div className="card-perms">
                                    <span className="perms-label">الصلاحيات:</span>
                                    <div className="perms-tags">
                                        {s.role === 'manager' ? (
                                            <span className="perm-tag all">جميع الصلاحيات</span>
                                        ) : (
                                            perms.length > 0 ? perms.map(p => (
                                                <span key={p} className="perm-tag">
                                                    {PERMISSIONS.find(pp => pp.key === p)?.label || p}
                                                </span>
                                            )) : (
                                                <span className="perm-tag none">بدون صلاحيات</span>
                                            )
                                        )}
                                    </div>
                                </div>

                                <div className="card-meta">
                                    <span className={`status-dot ${s.active ? 'active' : 'inactive'}`}>
                                        {s.active ? 'نشط' : 'معطّل'}
                                    </span>
                                    <span className="date">{new Date(s.createdAt).toLocaleDateString('ar-SA')}</span>
                                </div>

                                <div className="card-actions">
                                    <button className="action-btn edit" onClick={() => openEditModal(s)} title="تعديل">
                                        <Edit3 size={15} />
                                    </button>
                                    <button
                                        className={`action-btn ${s.active ? 'deactivate' : 'activate'}`}
                                        onClick={() => handleToggleActive(s)}
                                        title={s.active ? 'تعطيل' : 'تفعيل'}
                                    >
                                        {s.active ? <UserX size={15} /> : <UserCheck size={15} />}
                                    </button>
                                    {deleteConfirm === s.id ? (
                                        <div className="delete-confirm">
                                            <button onClick={() => handleDelete(s.id)} className="action-btn delete-yes">حذف</button>
                                            <button onClick={() => setDeleteConfirm(null)} className="action-btn delete-no">إلغاء</button>
                                        </div>
                                    ) : (
                                        <button className="action-btn delete" onClick={() => setDeleteConfirm(s.id)} title="حذف">
                                            <Trash2 size={15} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}

            {/* Create/Edit Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{editingStaff ? 'تعديل موظف' : 'إضافة موظف جديد'}</h2>
                            <button onClick={() => setShowModal(false)}><X size={20} /></button>
                        </div>

                        {formError && <div className="form-error">{formError}</div>}

                        <div className="form-fields">
                            <div className="form-group">
                                <label>الاسم الكامل *</label>
                                <input
                                    type="text"
                                    value={formName}
                                    onChange={e => setFormName(e.target.value)}
                                    placeholder="مثال: أحمد محمد"
                                />
                            </div>
                            <div className="form-group">
                                <label>اسم المستخدم *</label>
                                <input
                                    type="text"
                                    value={formUsername}
                                    onChange={e => setFormUsername(e.target.value)}
                                    placeholder="مثال: ahmed"
                                    disabled={!!editingStaff}
                                    dir="ltr"
                                />
                                {editingStaff && <small>لا يمكن تغيير اسم المستخدم</small>}
                            </div>
                            <div className="form-group">
                                <label>{editingStaff ? 'كلمة المرور الجديدة (اتركها فارغة للإبقاء)' : 'كلمة المرور *'}</label>
                                <input
                                    type="password"
                                    value={formPassword}
                                    onChange={e => setFormPassword(e.target.value)}
                                    placeholder="••••••"
                                />
                            </div>

                            <div className="form-group">
                                <label>الدور</label>
                                <div className="role-select">
                                    {ROLES.map(r => (
                                        <button
                                            key={r.value}
                                            type="button"
                                            className={`role-option ${formRole === r.value ? 'selected' : ''}`}
                                            onClick={() => setFormRole(r.value)}
                                        >
                                            <strong>{r.label}</strong>
                                            <span>{r.desc}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {formRole === 'staff' && (
                                <div className="form-group">
                                    <label>الصلاحيات *</label>
                                    <div className="permissions-grid">
                                        {PERMISSIONS.map(p => (
                                            <button
                                                key={p.key}
                                                type="button"
                                                className={`perm-option ${formPermissions.includes(p.key) ? 'selected' : ''}`}
                                                onClick={() => togglePermission(p.key)}
                                            >
                                                <div className="perm-icon">{p.icon}</div>
                                                <div className="perm-text">
                                                    <strong>{p.label}</strong>
                                                    <span>{p.desc}</span>
                                                </div>
                                                <div className="perm-check">
                                                    {formPermissions.includes(p.key) ? '✓' : ''}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {formRole === 'manager' && (
                                <div className="manager-note">
                                    <Shield size={16} />
                                    <span>المدير يحصل على جميع الصلاحيات تلقائياً</span>
                                </div>
                            )}
                        </div>

                        <div className="modal-footer">
                            <button className="save-modal-btn" onClick={handleSave} disabled={saving}>
                                <Save size={16} />
                                {saving ? 'جاري الحفظ...' : editingStaff ? 'حفظ التغييرات' : 'إنشاء الحساب'}
                            </button>
                            <button className="cancel-modal-btn" onClick={() => setShowModal(false)}>
                                إلغاء
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .staff-page { max-width: 1000px; }
                .page-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 2rem;
                }
                .page-header h1 { font-size: 1.5rem; margin-bottom: 0.25rem; }
                .page-header p { color: #6b7280; font-size: 0.9rem; }
                .add-btn {
                    display: flex;
                    align-items: center;
                    gap: 0.4rem;
                    padding: 0.7rem 1.25rem;
                    background: var(--primary);
                    color: white;
                    border-radius: 8px;
                    font-weight: 600;
                    font-size: 0.9rem;
                    transition: all 0.2s;
                    border: none;
                    cursor: pointer;
                    font-family: inherit;
                }
                .add-btn:hover { background: var(--primary-hover); transform: translateY(-1px); }

                .search-bar {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    background: white;
                    border: 1px solid #e5e7eb;
                    border-radius: 10px;
                    padding: 0.75rem 1rem;
                    margin-bottom: 1.5rem;
                    color: #9ca3af;
                }
                .search-bar input {
                    flex: 1;
                    border: none;
                    outline: none;
                    font-size: 0.9rem;
                    background: transparent;
                    font-family: inherit;
                }

                .empty-state {
                    text-align: center;
                    padding: 4rem 1rem;
                    color: #d1d5db;
                }
                .empty-state p { color: #9ca3af; margin: 1rem 0; }
                .add-btn-sm {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.4rem;
                    padding: 0.5rem 1rem;
                    background: var(--primary);
                    color: white;
                    border-radius: 8px;
                    font-size: 0.85rem;
                    border: none;
                    cursor: pointer;
                    font-family: inherit;
                }

                .staff-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
                    gap: 1rem;
                }
                .staff-card {
                    background: white;
                    border-radius: 12px;
                    padding: 1.25rem;
                    border: 1px solid #f3f4f6;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.03);
                    transition: all 0.2s;
                }
                .staff-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.06); }
                .staff-card.inactive { opacity: 0.6; }

                .card-top {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    margin-bottom: 1rem;
                }
                .avatar {
                    width: 44px;
                    height: 44px;
                    border-radius: 10px;
                    background: linear-gradient(135deg, var(--primary), #f59e0b);
                    color: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 700;
                    font-size: 1.1rem;
                    flex-shrink: 0;
                }
                .card-info { flex: 1; }
                .card-info h3 { font-size: 1rem; margin-bottom: 0.1rem; }
                .username { font-size: 0.8rem; color: #9ca3af; }
                .role-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.25rem;
                    padding: 0.2rem 0.6rem;
                    border-radius: 20px;
                    font-size: 0.72rem;
                    font-weight: 600;
                }
                .role-badge.manager { background: #eef2ff; color: #6366f1; }
                .role-badge.staff { background: #f0fdf4; color: #22c55e; }

                .card-perms {
                    margin-bottom: 0.75rem;
                }
                .perms-label {
                    font-size: 0.72rem;
                    color: #9ca3af;
                    display: block;
                    margin-bottom: 0.4rem;
                }
                .perms-tags { display: flex; flex-wrap: wrap; gap: 4px; }
                .perm-tag {
                    padding: 0.15rem 0.5rem;
                    background: #f3f4f6;
                    border-radius: 12px;
                    font-size: 0.7rem;
                    color: #4b5563;
                }
                .perm-tag.all { background: #eef2ff; color: #6366f1; }
                .perm-tag.none { background: #fef2f2; color: #ef4444; }

                .card-meta {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 0.75rem;
                    padding-top: 0.75rem;
                    border-top: 1px solid #f3f4f6;
                }
                .status-dot {
                    font-size: 0.75rem;
                    font-weight: 500;
                    display: flex;
                    align-items: center;
                    gap: 0.35rem;
                }
                .status-dot::before {
                    content: '';
                    width: 7px;
                    height: 7px;
                    border-radius: 50%;
                }
                .status-dot.active { color: #22c55e; }
                .status-dot.active::before { background: #22c55e; }
                .status-dot.inactive { color: #ef4444; }
                .status-dot.inactive::before { background: #ef4444; }
                .date { font-size: 0.72rem; color: #9ca3af; }

                .card-actions {
                    display: flex;
                    gap: 0.35rem;
                }
                .action-btn {
                    padding: 0.4rem 0.6rem;
                    border-radius: 6px;
                    border: 1px solid #e5e7eb;
                    background: white;
                    cursor: pointer;
                    transition: all 0.2s;
                    display: flex;
                    align-items: center;
                    font-family: inherit;
                    font-size: 0.75rem;
                }
                .action-btn.edit:hover { border-color: #3b82f6; color: #3b82f6; }
                .action-btn.deactivate:hover { border-color: #f59e0b; color: #f59e0b; }
                .action-btn.activate:hover { border-color: #22c55e; color: #22c55e; }
                .action-btn.delete:hover { border-color: #ef4444; color: #ef4444; }
                .delete-confirm { display: flex; gap: 0.25rem; }
                .delete-yes { color: white !important; background: #ef4444 !important; border-color: #ef4444 !important; }
                .delete-no { color: #6b7280; }

                /* Modal */
                .modal-overlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(0,0,0,0.5);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                    padding: 1rem;
                    backdrop-filter: blur(4px);
                }
                .modal {
                    background: white;
                    border-radius: 16px;
                    width: 100%;
                    max-width: 520px;
                    max-height: 85vh;
                    overflow-y: auto;
                    box-shadow: 0 20px 60px rgba(0,0,0,0.2);
                }
                .modal-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 1.25rem 1.5rem;
                    border-bottom: 1px solid #f3f4f6;
                }
                .modal-header h2 { font-size: 1.15rem; }
                .modal-header button {
                    color: #9ca3af;
                    background: none;
                    border: none;
                    cursor: pointer;
                }

                .form-error {
                    background: #fef2f2;
                    color: #ef4444;
                    padding: 0.6rem 1.5rem;
                    font-size: 0.85rem;
                    border-bottom: 1px solid #fecaca;
                }

                .form-fields {
                    padding: 1.5rem;
                    display: flex;
                    flex-direction: column;
                    gap: 1.25rem;
                }
                .form-group label {
                    display: block;
                    font-size: 0.85rem;
                    font-weight: 500;
                    color: #374151;
                    margin-bottom: 0.5rem;
                }
                .form-group input {
                    width: 100%;
                    padding: 0.65rem 0.75rem;
                    border: 1px solid #e5e7eb;
                    border-radius: 8px;
                    font-size: 0.9rem;
                    font-family: inherit;
                    outline: none;
                    transition: border-color 0.2s;
                }
                .form-group input:focus { border-color: var(--primary); }
                .form-group input:disabled { background: #f9fafb; color: #9ca3af; }
                .form-group small { color: #9ca3af; font-size: 0.72rem; margin-top: 0.25rem; display: block; }

                .role-select {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 0.5rem;
                }
                .role-option {
                    padding: 0.75rem;
                    border: 2px solid #e5e7eb;
                    border-radius: 10px;
                    text-align: center;
                    cursor: pointer;
                    transition: all 0.2s;
                    background: white;
                    font-family: inherit;
                }
                .role-option strong { display: block; font-size: 0.9rem; margin-bottom: 0.15rem; }
                .role-option span { font-size: 0.72rem; color: #9ca3af; }
                .role-option.selected {
                    border-color: var(--primary);
                    background: color-mix(in srgb, var(--primary) 5%, white);
                }

                .permissions-grid {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                }
                .perm-option {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    padding: 0.75rem;
                    border: 1px solid #e5e7eb;
                    border-radius: 10px;
                    cursor: pointer;
                    transition: all 0.2s;
                    background: white;
                    text-align: right;
                    font-family: inherit;
                }
                .perm-option:hover { border-color: #d1d5db; }
                .perm-option.selected {
                    border-color: var(--primary);
                    background: color-mix(in srgb, var(--primary) 5%, white);
                }
                .perm-icon {
                    width: 36px;
                    height: 36px;
                    border-radius: 8px;
                    background: #f3f4f6;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                    color: #6b7280;
                }
                .perm-option.selected .perm-icon { background: var(--primary); color: white; }
                .perm-text { flex: 1; }
                .perm-text strong { display: block; font-size: 0.85rem; }
                .perm-text span { font-size: 0.72rem; color: #9ca3af; }
                .perm-check {
                    width: 22px;
                    height: 22px;
                    border-radius: 50%;
                    border: 2px solid #e5e7eb;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 0.75rem;
                    color: white;
                    flex-shrink: 0;
                }
                .perm-option.selected .perm-check {
                    background: var(--primary);
                    border-color: var(--primary);
                }

                .manager-note {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.75rem;
                    background: #eef2ff;
                    color: #6366f1;
                    border-radius: 8px;
                    font-size: 0.85rem;
                }

                .modal-footer {
                    display: flex;
                    gap: 0.5rem;
                    padding: 1rem 1.5rem;
                    border-top: 1px solid #f3f4f6;
                }
                .save-modal-btn {
                    flex: 1;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.4rem;
                    padding: 0.7rem;
                    background: var(--primary);
                    color: white;
                    border-radius: 8px;
                    font-weight: 600;
                    font-size: 0.9rem;
                    border: none;
                    cursor: pointer;
                    font-family: inherit;
                }
                .save-modal-btn:disabled { opacity: 0.7; cursor: not-allowed; }
                .cancel-modal-btn {
                    padding: 0.7rem 1.25rem;
                    border: 1px solid #e5e7eb;
                    border-radius: 8px;
                    color: #6b7280;
                    background: white;
                    cursor: pointer;
                    font-family: inherit;
                    font-size: 0.9rem;
                }

                @media (max-width: 480px) {
                    .staff-grid { grid-template-columns: 1fr; }
                    .page-header { flex-direction: column; gap: 1rem; }
                }
            `}</style>
        </div>
    )
}
