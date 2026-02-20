'use client'

import React, { useState } from 'react'
import { Product } from '@/types'
import { useCart } from '@/context/CartContext'
import { Plus, Grid3X3, List, SlidersHorizontal, X } from 'lucide-react'

interface ProductGridProps {
  products: Product[]
}

type SortOption = 'default' | 'price-low' | 'price-high' | 'name'
type ViewMode = 'grid' | 'list'

export default function ProductGrid({ products }: ProductGridProps) {
  const { addToCart } = useCart()
  const [sortBy, setSortBy] = useState<SortOption>('default')
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [addedId, setAddedId] = useState<number | null>(null)
  const [customizingProduct, setCustomizingProduct] = useState<Product | null>(null)

  const sortedProducts = [...products].sort((a, b) => {
    switch (sortBy) {
      case 'price-low': return a.price - b.price
      case 'price-high': return b.price - a.price
      case 'name': return a.name.localeCompare(b.name, 'ar')
      default: return 0
    }
  })

  const handleAddToCart = (product: Product) => {
    // Check if product is Basbosa (contains 'بسبوسة')
    if (product.name.includes('بسبوسة') || product.name.includes('Basbosa')) {
      setCustomizingProduct(product)
      return
    }

    addToCart(product)
    setAddedId(product.id)
    setTimeout(() => setAddedId(null), 800)
  }

  const handleOptionSelect = (option: string) => {
    if (customizingProduct) {
      addToCart(customizingProduct, option)
      setAddedId(customizingProduct.id)
      setTimeout(() => setAddedId(null), 800)
      setCustomizingProduct(null)
    }
  }

  if (products.length === 0) {
    return (
      <section className="container" id="products">
        <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text)', opacity: 0.7 }}>
          <p>لا توجد منتجات حالياً.</p>
        </div>
      </section>
    )
  }

  return (
    <section className="container" id="products" style={{ padding: '4rem 1.5rem' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '0.5rem', fontSize: '2rem' }}>منتجاتنا المميزة</h2>
      <p className="section-subtitle">اختر من تشكيلتنا الفاخرة المحضرة بعناية</p>

      {/* Controls Bar */}
      <div className="controls-bar">
        <div className="sort-control">
          <SlidersHorizontal size={16} />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
          >
            <option value="default">الترتيب الافتراضي</option>
            <option value="price-low">السعر: من الأقل</option>
            <option value="price-high">السعر: من الأعلى</option>
            <option value="name">الاسم</option>
          </select>
        </div>
        <div className="view-toggle">
          <button
            className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
            onClick={() => setViewMode('grid')}
            aria-label="عرض شبكي"
          >
            <Grid3X3 size={18} />
          </button>
          <button
            className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => setViewMode('list')}
            aria-label="عرض قائمة"
          >
            <List size={18} />
          </button>
        </div>
      </div>

      {/* Products Count */}
      <p className="products-count">{products.length} منتج</p>

      <div className={viewMode === 'grid' ? 'product-grid' : 'product-list'}>
        {sortedProducts.map((product, index) => (
          <div
            key={product.id}
            className={`product-card ${viewMode === 'list' ? 'list-card' : ''}`}
            style={{ animationDelay: `${index * 0.08}s` }}
          >
            <div className="product-image">
              <img
                src={product.imagePath || 'https://placehold.co/400x300/D2691E/FFFFFF?text=Product'}
                alt={product.name}
                className="img-cover"
              />
              <div className="image-overlay">
                <button
                  className="quick-add"
                  onClick={() => handleAddToCart(product)}
                >
                  <Plus size={20} />
                  <span>إضافة سريعة</span>
                </button>
              </div>
            </div>
            <div className="product-details">
              <h3>{product.name}</h3>
              <p className="price">{product.price} ر.س</p>
              {product.description && <p className="desc">{product.description}</p>}
              <button
                className={`add-btn ${addedId === product.id ? 'added' : ''}`}
                onClick={() => handleAddToCart(product)}
              >
                {addedId === product.id ? (
                  <span>✓ تمت الإضافة</span>
                ) : (
                  <>
                    <span>إضافة للسلة</span>
                    <Plus size={18} />
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Customization Modal */}
      {customizingProduct && (
        <div className="custom-modal-overlay" onClick={() => setCustomizingProduct(null)}>
          <div className="custom-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>خيارات المنتج</h3>
              <button onClick={() => setCustomizingProduct(null)}><X size={20} /></button>
            </div>
            <div className="modal-body">
              <p className="product-name">{customizingProduct.name}</p>
              <p className="modal-subtitle">كيف تحب البسبوسة؟ 😋</p>

              <div className="options-grid">
                <button
                  className="option-btn"
                  onClick={() => handleOptionSelect('مع قرفة')}
                >
                  <span className="emoji">🤎</span>
                  <span>مع قرفة</span>
                </button>
                <button
                  className="option-btn"
                  onClick={() => handleOptionSelect('بدون قرفة')}
                >
                  <span className="emoji">💛</span>
                  <span>بدون قرفة</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .custom-modal-overlay {
            position: fixed;
            inset: 0;
            background: rgba(0,0,0,0.5);
            z-index: 2000;
            display: flex;
            align-items: center;
            justify-content: center;
            animation: fadeIn 0.2s ease;
            backdrop-filter: blur(4px);
        }
        .custom-modal {
            background: var(--card-bg);
            width: 90%;
            max-width: 400px;
            border-radius: 16px;
            padding: 1.5rem;
            animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
            box-shadow: 0 20px 40px rgba(0,0,0,0.2);
        }
        .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1rem;
        }
        .modal-header h3 { font-size: 1.1rem; color: var(--text); margin: 0; }
        .product-name { font-weight: bold; font-size: 1.2rem; color: var(--primary); margin-bottom: 0.5rem; }
        .modal-subtitle { color: var(--text-muted); margin-bottom: 1.5rem; }
        
        .options-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1rem;
        }
        .option-btn {
            background: var(--gray-100);
            border: 2px solid var(--card-border);
            border-radius: 12px;
            padding: 1.5rem 1rem;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 0.75rem;
            transition: all 0.2s;
            cursor: pointer;
        }
        .option-btn:hover {
            border-color: var(--primary);
            background: var(--gray-200);
            transform: translateY(-2px);
        }
        .option-btn span { font-weight: 600; color: var(--text); }
        .option-btn .emoji { font-size: 2rem; }
        
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
      `}</style>

      <style jsx>{`
                .section-subtitle {
                    text-align: center;
                    color: var(--text);
                    opacity: 0.7;
                    margin-bottom: 2rem;
                    font-size: 1rem;
                }

                .controls-bar {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 0.5rem;
                    padding: 0.75rem 1rem;
                    background: var(--card-bg);
                    border-radius: 10px;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.04);
                }
                .sort-control {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    color: var(--text-muted);
                }
                .sort-control select {
                    border: none;
                    background: transparent;
                    font-family: inherit;
                    font-size: 0.9rem;
                    color: var(--text);
                    cursor: pointer;
                    outline: none;
                    padding: 0.25rem;
                }
                .view-toggle {
                    display: flex;
                    gap: 0.25rem;
                    background: var(--gray-100);
                    border-radius: 6px;
                    padding: 2px;
                }
                .view-btn {
                    padding: 0.4rem;
                    border-radius: 4px;
                    color: #999;
                    transition: all 0.2s;
                    display: flex;
                    align-items: center;
                }
                .view-btn.active {
                    background: var(--card-bg);
                    color: var(--primary);
                    box-shadow: 0 1px 2px rgba(0,0,0,0.08);
                }
                .products-count {
                    font-size: 0.8rem;
                    color: #999;
                    margin-bottom: 1rem;
                }

                /* Grid View */
                .product-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
                    gap: 1.5rem;
                }

                /* List View */
                .product-list {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                }
                .list-card {
                    flex-direction: row !important;
                }
                .list-card .product-image {
                    width: 180px !important;
                    height: 140px !important;
                    flex-shrink: 0;
                }
                .list-card .product-details {
                    flex: 1;
                }

                /* Card Styles */
                .product-card {
                    background: var(--card-bg);
                    border-radius: 12px;
                    overflow: hidden;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.05);
                    transition: transform 0.2s, box-shadow 0.2s;
                    opacity: 0;
                    animation: cardFadeIn 0.5s ease forwards;
                    display: flex;
                    flex-direction: column;
                }
                @keyframes cardFadeIn {
                    to { opacity: 1; }
                }
                .product-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 10px 25px rgba(0,0,0,0.1);
                }
                .product-image {
                    position: relative;
                    height: 220px;
                    background-color: var(--gray-100);
                    overflow: hidden;
                }
                .img-cover {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    transition: transform 0.3s;
                }
                .product-card:hover .img-cover {
                    transform: scale(1.05);
                }

                /* Image Overlay */
                .image-overlay {
                    position: absolute;
                    inset: 0;
                    background: rgba(0,0,0,0.35);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    opacity: 0;
                    transition: opacity 0.3s;
                }
                .product-card:hover .image-overlay {
                    opacity: 1;
                }
                .quick-add {
                    background: white;
                    color: var(--text);
                    padding: 0.5rem 1.25rem;
                    border-radius: 50px;
                    display: flex;
                    align-items: center;
                    gap: 0.35rem;
                    font-size: 0.85rem;
                    font-weight: 600;
                    transition: all 0.2s;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                }
                .quick-add:hover {
                    background: var(--primary);
                    color: white;
                }

                .product-details {
                    padding: 1.25rem;
                    display: flex;
                    flex-direction: column;
                }
                .product-details h3 {
                    font-size: 1.1rem;
                    margin-bottom: 0.5rem;
                }
                .price {
                    font-weight: 700;
                    color: var(--primary);
                    font-size: 1.15rem;
                    margin-bottom: 0.5rem;
                }
                .desc {
                    font-size: 0.85rem;
                    color: var(--text-muted);
                    margin-bottom: 1rem;
                    font-family: var(--font-body);
                    line-height: 1.5;
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }
                .add-btn {
                    margin-top: auto;
                    background-color: var(--gray-200);
                    color: var(--text);
                    padding: 0.75rem;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.5rem;
                    transition: all 0.3s;
                    font-weight: 600;
                }
                .add-btn:hover {
                    background-color: var(--primary);
                }
                .add-btn.added {
                    background-color: #22c55e;
                }

                @media (max-width: 768px) {
                    .product-grid {
                        grid-template-columns: repeat(2, 1fr);
                        gap: 0.75rem;
                    }
                    .product-image {
                        height: 160px;
                    }
                    .product-details {
                        padding: 0.75rem;
                    }
                    .product-details h3 {
                        font-size: 0.9rem;
                    }
                    .price {
                        font-size: 1rem;
                    }
                    .desc {
                        display: none;
                    }
                    .image-overlay {
                        display: none;
                    }
                    .list-card .product-image {
                        width: 120px !important;
                        height: 120px !important;
                    }
                    .controls-bar {
                        flex-wrap: wrap;
                        gap: 0.5rem;
                    }
                }
            `}</style>
    </section>
  )
}
