'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, X, Languages } from 'lucide-react'
import { Product } from '@/types'
import { useLanguage } from '@/context/LanguageContext'

export default function ProductsPage() {
    const { t } = useLanguage()
    const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(true)
    const [modalOpen, setModalOpen] = useState(false)
    const [editingProduct, setEditingProduct] = useState<Product | null>(null)
    const [uploading, setUploading] = useState(false)
    const [imagePreview, setImagePreview] = useState<string>('')
    const [isTranslating, setIsTranslating] = useState(false)

    const [formData, setFormData] = useState({
        name: '', nameEn: '', price: '', description: '', descriptionEn: '', imagePath: ''
    })

    useEffect(() => {
        fetchProducts()
    }, [])

    const fetchProducts = () => {
        fetch('/api/products')
            .then(res => res.json())
            .then(data => {
                setProducts(data)
                setLoading(false)
            })
    }

    const handleDelete = async (id: number) => {
        if (!confirm(t('admin.confirmDelete'))) return
        await fetch(`/api/products/${id}`, { method: 'DELETE' })
        fetchProducts()
    }

    const openModal = (product?: Product) => {
        if (product) {
            setEditingProduct(product)
            setFormData({
                name: product.name,
                nameEn: product.nameEn || '',
                price: String(product.price),
                description: product.description || '',
                descriptionEn: product.descriptionEn || '',
                imagePath: product.imagePath
            })
            setImagePreview(product.imagePath)
        } else {
            setEditingProduct(null)
            setFormData({ name: '', nameEn: '', price: '', description: '', descriptionEn: '', imagePath: '' })
            setImagePreview('')
        }
        setModalOpen(true)
    }

    const handleTranslate = async () => {
        if (!formData.name && !formData.description) return
        setIsTranslating(true)
        try {
            let translatedName = formData.nameEn
            let translatedDesc = formData.descriptionEn

            if (formData.name && !formData.nameEn) {
                const res = await fetch('/api/translate', {
                    method: 'POST',
                    body: JSON.stringify({ text: formData.name, from: 'ar', to: 'en' })
                })
                const data = await res.json()
                if (data.translatedText) translatedName = data.translatedText
            }

            if (formData.description && !formData.descriptionEn) {
                const res = await fetch('/api/translate', {
                    method: 'POST',
                    body: JSON.stringify({ text: formData.description, from: 'ar', to: 'en' })
                })
                const data = await res.json()
                if (data.translatedText) translatedDesc = data.translatedText
            }

            setFormData(prev => ({
                ...prev,
                nameEn: translatedName,
                descriptionEn: translatedDesc
            }))
        } catch (error) {
            console.error('Translation failed', error)
            alert(t('admin.unexpectedErrorText'))
        } finally {
            setIsTranslating(false)
        }
    }

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        // Check file size on client side first (20MB max)
        if (file.size > 20 * 1024 * 1024) {
            alert(`${t('admin.fileTooLarge')} (${(file.size / 1024 / 1024).toFixed(1)} MB). ${t('admin.maxSize')}`)
            return
        }

        setUploading(true)
        const fd = new FormData()
        fd.append('file', file)

        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: fd
            })

            // Handle non-JSON responses (e.g. Cloudflare/Nginx error pages)
            const contentType = res.headers.get('content-type') || ''
            if (!contentType.includes('application/json')) {
                const text = await res.text()
                console.error('Non-JSON response:', res.status, text.substring(0, 500))
                alert(`${t('admin.serverError')} (${res.status}).`)
                return
            }

            const data = await res.json()

            if (!res.ok) {
                alert(data.error || t('admin.uploadFailed'))
                return
            }

            if (data.url) {
                setFormData(prev => ({ ...prev, imagePath: data.url }))
                setImagePreview(data.url)
            }
        } catch (error: any) {
            console.error('Upload error:', error)
            alert(`${t('admin.uploadFailed')}: ${error?.message || ''}`)
        } finally {
            setUploading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        const url = editingProduct ? `/api/products/${editingProduct.id}` : '/api/products'
        const method = editingProduct ? 'PUT' : 'POST'

        await fetch(url, {
            method,
            body: JSON.stringify(formData)
        })

        setModalOpen(false)
        fetchProducts()
    }

    return (
        <div>
            <div className="header-row">
                <h1>{t('admin.manageProducts')}</h1>
                <button className="btn btn-primary" onClick={() => openModal()}>
                    <Plus size={18} style={{ marginLeft: '0.5rem' }} />
                    {t('admin.newProduct')}
                </button>
            </div>

            {loading ? <p>{t('admin.loading')}</p> : (
                <div className="table-wrapper">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>{t('admin.image')}</th>
                                <th>{t('admin.name')}</th>
                                <th>{t('admin.price')}</th>
                                <th>{t('admin.actions')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map(p => (
                                <tr key={p.id}>
                                    <td>
                                        <div className="thumb">
                                            <img src={p.imagePath || 'https://placehold.co/100?text=Prod'} alt="" />
                                        </div>
                                    </td>
                                    <td>{p.name}</td>
                                    <td>{p.price} {t('common.currency')}</td>
                                    <td>
                                        <button className="icon-btn edit" onClick={() => openModal(p)}><Edit2 size={16} /></button>
                                        <button className="icon-btn delete" onClick={() => handleDelete(p.id)}><Trash2 size={16} /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {modalOpen && (
                <div className="modal-overlay">
                    <div className="modal">
                        <div className="modal-header">
                            <h3>{editingProduct ? t('admin.editProduct') : t('admin.addProduct')}</h3>
                            <button onClick={() => setModalOpen(false)}><X /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="modal-body">
                            <div className="form-group-translate-row">
                                <div className="form-group flex-1">
                                    <label>{t('admin.productNameAr')} *</label>
                                    <input
                                        required
                                        className="input"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                                <div className="form-group flex-1">
                                    <label>{t('admin.productNameEn')}</label>
                                    <input
                                        className="input"
                                        dir="ltr"
                                        value={formData.nameEn}
                                        onChange={e => setFormData({ ...formData, nameEn: e.target.value })}
                                        placeholder="Optional"
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <button type="button" className="btn translate-btn" onClick={handleTranslate} disabled={isTranslating}>
                                    <Languages size={16} />
                                    {isTranslating ? t('admin.translating') : t('admin.autoTranslate')}
                                </button>
                            </div>
                            <div className="form-group">
                                <label>{t('admin.price')}</label>
                                <input
                                    required
                                    type="number"
                                    className="input"
                                    value={formData.price}
                                    onChange={e => setFormData({ ...formData, price: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>{t('admin.productImage')}</label>
                                <div className="image-upload-section">
                                    {imagePreview && (
                                        <div className="image-preview">
                                            <img src={imagePreview} alt="Preview" />
                                        </div>
                                    )}
                                    <label htmlFor="file-upload" className="file-upload-btn">
                                        {uploading ? t('admin.uploading') : t('admin.chooseImage')}
                                    </label>
                                    <input
                                        id="file-upload"
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        disabled={uploading}
                                        style={{ display: 'none' }}
                                    />
                                </div>
                            </div>
                            <div className="form-group-translate-row">
                                <div className="form-group flex-1">
                                    <label>{t('admin.descriptionAr')}</label>
                                    <textarea
                                        className="input"
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    />
                                </div>
                                <div className="form-group flex-1">
                                    <label>{t('admin.descriptionEn')}</label>
                                    <textarea
                                        className="input"
                                        dir="ltr"
                                        value={formData.descriptionEn}
                                        onChange={e => setFormData({ ...formData, descriptionEn: e.target.value })}
                                    />
                                </div>
                            </div>
                            <button type="submit" className="btn btn-primary full-width">{t('admin.save')}</button>
                        </form>
                    </div>
                </div>
            )}

            <style>{`
          .header-row {
             display: flex;
             justify-content: space-between;
             align-items: center;
             margin-bottom: 2rem;
          }
          .table-wrapper {
             background: var(--card-bg, white);
             border-radius: 8px;
             overflow: hidden;
             box-shadow: 0 2px 4px rgba(0,0,0,0.05);
             border: 1px solid var(--card-border, transparent);
          }
          .table {
             width: 100%;
             border-collapse: collapse;
          }
          th, td {
             padding: 1rem;
             text-align: right;
             border-bottom: 1px solid var(--card-border, #eee);
          }
          th {
             background: var(--gray-100, #f9f9f9);
             color: var(--text, inherit);
             font-weight: 600;
          }
          .thumb {
             width: 50px;
             height: 50px;
             background: var(--gray-100, #eee);
             border-radius: 4px;
             overflow: hidden;
          }
          .thumb img {
             width: 100%;
             height: 100%;
             object-fit: cover;
          }
          .icon-btn {
             margin-left: 0.5rem;
             padding: 0.5rem;
             border-radius: 4px;
             background: var(--gray-100, #eee);
             border: none;
             cursor: pointer;
          }
          .icon-btn.delete { color: red; }
          .icon-btn.edit { color: blue; } // Should check theme colors
          
          .modal-overlay {
             position: fixed;
             inset: 0;
             background: rgba(0,0,0,0.5);
             display: flex;
             align-items: center;
             justify-content: center;
             z-index: 1000;
          }
          .modal {
             background: var(--bg, white);
             padding: 2rem;
             border-radius: 8px;
             width: 100%;
             max-width: 500px;
          }
          .modal-header {
             display: flex;
             justify-content: space-between;
             align-items: center;
             margin-bottom: 1.5rem;
          }
          .form-group { margin-bottom: 1rem; }
          .form-group-translate-row { display: flex; gap: 1rem; margin-bottom: 0.5rem; }
          .flex-1 { flex: 1; }
          .input { width: 100%; padding: 0.75rem; border: 1px solid var(--card-border, #ddd); border-radius: 6px; background: var(--bg, white); color: var(--text, inherit); }
          .full-width { width: 100%; }
           
          .translate-btn {
              display: flex;
              align-items: center;
              gap: 0.5rem;
              background: #4285f4;
              color: white;
              border: none;
              padding: 0.5rem 1rem;
              border-radius: 6px;
              font-size: 0.85rem;
              cursor: pointer;
              margin-bottom: 1rem;
              transition: 0.2s;
          }
          .translate-btn:hover { background: #3367d6; }
          .translate-btn:disabled { opacity: 0.7; cursor: not-allowed; }
           
           .image-upload-section {
              display: flex;
              flex-direction: column;
              gap: 1rem;
           }
           .image-preview {
              width: 200px;
              height: 200px;
              border: 2px dashed #ddd;
              border-radius: 8px;
              overflow: hidden;
              display: flex;
              align-items: center;
              justify-content: center;
           }
           .image-preview img {
              width: 100%;
              height: 100%;
              object-fit: cover;
           }
           .file-upload-btn {
              display: inline-block;
              padding: 0.75rem 1.5rem;
              background: var(--primary);
              color: white;
              border-radius: 6px;
              cursor: pointer;
              text-align: center;
              transition: opacity 0.2s;
              width: fit-content;
           }
           .file-upload-btn:hover {
              opacity: 0.9;
           }
       `}</style>
        </div>
    )
}
