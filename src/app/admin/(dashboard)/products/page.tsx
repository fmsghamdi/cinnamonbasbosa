'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, X } from 'lucide-react'
import { Product } from '@/types'

export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(true)
    const [modalOpen, setModalOpen] = useState(false)
    const [editingProduct, setEditingProduct] = useState<Product | null>(null)
    const [uploading, setUploading] = useState(false)
    const [imagePreview, setImagePreview] = useState<string>('')

    const [formData, setFormData] = useState({
        name: '', price: '', description: '', imagePath: ''
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
        if (!confirm('هل أنت متأكد من الحذف؟')) return
        await fetch(`/api/products/${id}`, { method: 'DELETE' })
        fetchProducts()
    }

    const openModal = (product?: Product) => {
        if (product) {
            setEditingProduct(product)
            setFormData({
                name: product.name,
                price: String(product.price),
                description: product.description || '',
                imagePath: product.imagePath
            })
            setImagePreview(product.imagePath)
        } else {
            setEditingProduct(null)
            setFormData({ name: '', price: '', description: '', imagePath: '' })
            setImagePreview('')
        }
        setModalOpen(true)
    }

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        // Check file size on client side first (20MB max)
        if (file.size > 20 * 1024 * 1024) {
            alert(`حجم الملف كبير جداً (${(file.size / 1024 / 1024).toFixed(1)} MB). الحد الأقصى 20 ميجابايت`)
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
                alert(`خطأ في السيرفر (${res.status}). حاول مرة أخرى أو قلل حجم الصورة.`)
                return
            }

            const data = await res.json()

            if (!res.ok) {
                alert(data.error || 'فشل رفع الصورة')
                return
            }

            if (data.url) {
                setFormData(prev => ({ ...prev, imagePath: data.url }))
                setImagePreview(data.url)
            }
        } catch (error: any) {
            console.error('Upload error:', error)
            alert(`فشل رفع الصورة: ${error?.message || 'خطأ غير معروف'}`)
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
                <h1>إدارة المنتجات</h1>
                <button className="btn btn-primary" onClick={() => openModal()}>
                    <Plus size={18} style={{ marginLeft: '0.5rem' }} />
                    منتج جديد
                </button>
            </div>

            {loading ? <p>جاري التحميل...</p> : (
                <div className="table-wrapper">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>الصورة</th>
                                <th>الاسم</th>
                                <th>السعر</th>
                                <th>الإجراءات</th>
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
                                    <td>{p.price} ر.س</td>
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
                            <h3>{editingProduct ? 'تعديل منتج' : 'إضافة منتج'}</h3>
                            <button onClick={() => setModalOpen(false)}><X /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="modal-body">
                            <div className="form-group">
                                <label>اسم المنتج</label>
                                <input
                                    required
                                    className="input"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>السعر</label>
                                <input
                                    required
                                    type="number"
                                    className="input"
                                    value={formData.price}
                                    onChange={e => setFormData({ ...formData, price: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>صورة المنتج</label>
                                <div className="image-upload-section">
                                    {imagePreview && (
                                        <div className="image-preview">
                                            <img src={imagePreview} alt="معاينة" />
                                        </div>
                                    )}
                                    <label htmlFor="file-upload" className="file-upload-btn">
                                        {uploading ? 'جاري الرفع...' : 'اختر صورة'}
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
                            <div className="form-group">
                                <label>الوصف</label>
                                <textarea
                                    className="input"
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>
                            <button type="submit" className="btn btn-primary full-width">حفظ</button>
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
             background: white;
             border-radius: 8px;
             overflow: hidden;
             box-shadow: 0 2px 4px rgba(0,0,0,0.05);
          }
          .table {
             width: 100%;
             border-collapse: collapse;
          }
          th, td {
             padding: 1rem;
             text-align: right;
             border-bottom: 1px solid #eee;
          }
          th {
             background: #f9f9f9;
             font-weight: 600;
          }
          .thumb {
             width: 50px;
             height: 50px;
             background: #eee;
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
             background: #eee;
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
             background: white;
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
          .input { width: 100%; padding: 0.75rem; border: 1px solid #ddd; border-radius: 6px; }
          .full-width { width: 100%; }
           
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
