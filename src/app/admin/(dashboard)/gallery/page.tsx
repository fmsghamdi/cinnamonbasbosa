'use client'

import { useState, useEffect } from 'react'
import { Plus, Trash2, Upload } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'

interface GalleryImage {
    id: number
    imagePath: string
    title?: string
    createdAt: string
}

export default function GalleryPage() {
    const { t } = useLanguage()
    const [images, setImages] = useState<GalleryImage[]>([])
    const [loading, setLoading] = useState(true)
    const [uploading, setUploading] = useState(false)

    useEffect(() => {
        fetchImages()
    }, [])

    const fetchImages = () => {
        fetch('/api/gallery')
            .then(res => res.json())
            .then(data => {
                setImages(data)
                setLoading(false)
            })
    }

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (!files || files.length === 0) return

        setUploading(true)

        for (let i = 0; i < files.length; i++) {
            const file = files[i]
            const formData = new FormData()
            formData.append('file', file)

            try {
                // Upload the file
                const uploadRes = await fetch('/api/upload', {
                    method: 'POST',
                    body: formData
                })
                const uploadData = await uploadRes.json()

                // Save to gallery
                if (uploadData.url) {
                    await fetch('/api/gallery', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            imagePath: uploadData.url,
                            title: file.name
                        })
                    })
                }
            } catch (error) {
                console.error('Upload failed:', error)
            }
        }

        setUploading(false)
        fetchImages()
    }

    const handleDelete = async (id: number) => {
        if (!confirm(t('admin.confirmDeleteImage'))) return

        await fetch(`/api/gallery/${id}`, { method: 'DELETE' })
        fetchImages()
    }

    return (
        <div>
            <div className="header-row">
                <h1>{t('admin.imageGallery')}</h1>
                <label htmlFor="gallery-upload" className="btn btn-primary upload-btn">
                    <Upload size={18} style={{ marginLeft: '0.5rem' }} />
                    {uploading ? t('admin.uploading') : t('admin.uploadImages')}
                    <input
                        id="gallery-upload"
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleFileUpload}
                        disabled={uploading}
                        style={{ display: 'none' }}
                    />
                </label>
            </div>

            {loading ? <p>{t('admin.loading')}</p> : (
                <div className="gallery-grid">
                    {images.map(img => (
                        <div key={img.id} className="gallery-item">
                            <img src={img.imagePath} alt={img.title || ''} />
                            <div className="gallery-item-overlay">
                                <button
                                    className="delete-btn"
                                    onClick={() => handleDelete(img.id)}
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {!loading && images.length === 0 && (
                <div className="empty-state">
                    <p>{t('admin.noImagesInGallery')}</p>
                    <p className="hint">{t('admin.uploadImagesHint')}</p>
                </div>
            )}

            <style>{`
                .header-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 2rem;
                }
                .upload-btn {
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                }
                .gallery-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
                    gap: 1.5rem;
                }
                .gallery-item {
                    position: relative;
                    aspect-ratio: 1;
                    border-radius: 8px;
                    overflow: hidden;
                    background: var(--card-bg, #f5f5f5);
                }
                .gallery-item img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }
                .gallery-item-overlay {
                    position: absolute;
                    inset: 0;
                    background: rgba(0,0,0,0.5);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    opacity: 0;
                    transition: opacity 0.2s;
                }
                .gallery-item:hover .gallery-item-overlay {
                    opacity: 1;
                }
                .delete-btn {
                    background: #ef4444;
                    color: white;
                    padding: 0.75rem;
                    border-radius: 8px;
                    cursor: pointer;
                    transition: background 0.2s;
                }
                .delete-btn:hover {
                    background: #dc2626;
                }
                .empty-state {
                    text-align: center;
                    padding: 4rem 2rem;
                    color: var(--text-muted, #666);
                }
                .empty-state .hint {
                    font-size: 0.875rem;
                    margin-top: 0.5rem;
                }
            `}</style>
        </div>
    )
}
