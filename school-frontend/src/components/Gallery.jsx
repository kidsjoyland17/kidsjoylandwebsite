import { useState, useEffect, useCallback } from 'react'
import {
  MdSportsScore,
  MdPalette,
  MdMusicNote,
  MdDirectionsRun,
  MdDirectionsBus,
  MdMenuBook,
  MdCelebration,
  MdPublic,
  MdSchool,
  MdPhotoCamera,
  MdClose,
  MdChevronLeft,
  MdChevronRight,
  MdFilterList,
  MdGridView,
  MdBrokenImage,
} from 'react-icons/md'
import api from '@/lib/api'

// ─── Category config ────────────────────────────────────────────
const CATEGORIES = [
  { key: 'all',        label: 'All Photos',   Icon: MdGridView },
  { key: 'sports',     label: 'Sports',       Icon: MdSportsScore },
  { key: 'arts',       label: 'Arts',         Icon: MdPalette },
  { key: 'music',      label: 'Music',        Icon: MdMusicNote },
  { key: 'dance',      label: 'Dance',        Icon: MdDirectionsRun },
  { key: 'field-trip', label: 'Field Trips',  Icon: MdDirectionsBus },
  { key: 'classroom',  label: 'Classroom',    Icon: MdMenuBook },
  { key: 'events',     label: 'Events',       Icon: MdCelebration },
  { key: 'cultural',   label: 'Cultural',     Icon: MdPublic },
  { key: 'graduation', label: 'Graduation',   Icon: MdSchool },
  { key: 'general',    label: 'General',      Icon: MdPhotoCamera },
]

// ─── Skeleton card ───────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="gallery-skeleton">
      <div className="skeleton-shimmer" />
    </div>
  )
}

// ─── Image card ──────────────────────────────────────────────────
function GalleryCard({ image, index, onClick }) {
  const [loaded, setLoaded] = useState(false)
  const [error, setError]   = useState(false)

  return (
    <div
      className="gallery-card"
      style={{ animationDelay: `${(index % 12) * 50}ms` }}
      onClick={() => onClick(image)}
    >
      {!loaded && !error && <div className="card-placeholder"><div className="skeleton-shimmer" /></div>}
      {error ? (
        <div className="card-error">
          <MdBrokenImage size={28} />
          <span>Image unavailable</span>
        </div>
      ) : (
        <img
          src={image.imageUrl}
          alt={image.title}
          className={`card-img ${loaded ? 'visible' : ''}`}
          onLoad={() => setLoaded(true)}
          onError={() => { setError(true); setLoaded(true) }}
        />
      )}

      {/* Hover overlay */}
      <div className="card-overlay">
        <div className="card-meta">
          <span className="card-category">
            {CATEGORIES.find(c => c.key === image.category)?.label || image.category}
          </span>
          <h3 className="card-title">{image.title}</h3>
          {image.takenAt && (
            <span className="card-date">
              {new Date(image.takenAt).toLocaleDateString('en-IN', {
                day: '2-digit', month: 'short', year: 'numeric',
              })}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Lightbox ────────────────────────────────────────────────────
function Lightbox({ images, currentIndex, onClose, onPrev, onNext }) {
  const img = images[currentIndex]

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft')  onPrev()
      if (e.key === 'ArrowRight') onNext()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose, onPrev, onNext])

  if (!img) return null

  return (
    <div className="lightbox-backdrop" onClick={onClose}>
      {/* Nav — left */}
      <button
        className="lb-nav lb-prev"
        onClick={e => { e.stopPropagation(); onPrev() }}
        disabled={currentIndex === 0}
      >
        <MdChevronLeft size={28} />
      </button>

      {/* Card */}
      <div className="lb-card" onClick={e => e.stopPropagation()}>
        <button className="lb-close" onClick={onClose}><MdClose size={20} /></button>
        <div className="lb-img-wrap">
          <img src={img.imageUrl} alt={img.title} className="lb-img" />
        </div>
        <div className="lb-info">
          <div className="lb-badge">
            {(() => {
              const cat = CATEGORIES.find(c => c.key === img.category)
              return cat ? <><cat.Icon size={13} /> {cat.label}</> : img.category
            })()}
          </div>
          <h2 className="lb-title">{img.title}</h2>
          {img.description && <p className="lb-desc">{img.description}</p>}
          {img.takenAt && (
            <p className="lb-date">
              {new Date(img.takenAt).toLocaleDateString('en-IN', {
                day: '2-digit', month: 'long', year: 'numeric',
              })}
            </p>
          )}
          <p className="lb-counter">{currentIndex + 1} / {images.length}</p>
        </div>
      </div>

      {/* Nav — right */}
      <button
        className="lb-nav lb-next"
        onClick={e => { e.stopPropagation(); onNext() }}
        disabled={currentIndex === images.length - 1}
      >
        <MdChevronRight size={28} />
      </button>
    </div>
  )
}

// ─── Main Gallery component ──────────────────────────────────────
export default function Gallery() {
  const [images,   setImages]   = useState([])
  const [loading,  setLoading]  = useState(true)
  const [activeCategory, setActiveCategory] = useState('all')
  const [lightboxIdx, setLightboxIdx] = useState(null)

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        setLoading(true)
        const params = activeCategory !== 'all' ? { category: activeCategory } : {}
        const { data } = await api.get('/gallery', { params })
        setImages(data.images || [])
      } catch (err) {
        console.error('Failed to load gallery', err)
      } finally {
        setLoading(false)
      }
    }
    fetchGallery()
  }, [activeCategory])

  const openLightbox  = useCallback((img) => {
    const idx = images.findIndex(i => i._id === img._id)
    setLightboxIdx(idx)
  }, [images])

  const closeLightbox = useCallback(() => setLightboxIdx(null), [])
  const prevImage     = useCallback(() => setLightboxIdx(i => Math.max(0, i - 1)), [])
  const nextImage     = useCallback(() => setLightboxIdx(i => Math.min(images.length - 1, i + 1)), [images.length])

  return (
    <section id="gallery" className="gallery-section">

      {/* ── Header ───────────────────────────────────────────── */}
      <div className="gallery-header">
        <div className="gallery-eyebrow">
          <MdPhotoCamera size={15} />
          <span>Our Gallery</span>
        </div>
        <h2 className="gallery-heading">Life at Our School</h2>
        <p className="gallery-subtext">
          Glimpses of vibrant campus life — celebrations, achievements,
          and everyday moments of learning and joy.
        </p>
      </div>

      {/* ── Filter tabs ──────────────────────────────────────── */}
      <div className="filter-bar">
        <MdFilterList size={16} className="filter-icon" />
        <div className="filter-tabs">
          {CATEGORIES.map(({ key, label, Icon }) => (
            <button
              key={key}
              onClick={() => setActiveCategory(key)}
              className={`filter-tab ${activeCategory === key ? 'active' : ''}`}
            >
              <Icon size={14} />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Grid ─────────────────────────────────────────────── */}
      <div className="gallery-container">
        {loading ? (
          <div className="gallery-grid">
            {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : images.length === 0 ? (
          <div className="gallery-empty">
            <MdPhotoCamera size={40} />
            <p>No photos in this category yet.</p>
          </div>
        ) : (
          <div className="gallery-grid">
            {images.map((img, i) => (
              <GalleryCard
                key={img._id}
                image={img}
                index={i}
                onClick={openLightbox}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Lightbox ─────────────────────────────────────────── */}
      {lightboxIdx !== null && (
        <Lightbox
          images={images}
          currentIndex={lightboxIdx}
          onClose={closeLightbox}
          onPrev={prevImage}
          onNext={nextImage}
        />
      )}

      {/* ── Styles ───────────────────────────────────────────── */}
      <style>{`
        /* ── Section ─────────────────────────────────── */
        .gallery-section {
          padding: 96px 40px 80px;
          background: linear-gradient(180deg, #e3f2fd 0%, #e8eaf6 50%, #ffffff 100%);
          background-repeat: no-repeat;
          background-size: 100% 200px;
          background-color: #ffffff;
          font-family: 'Segoe UI', system-ui, sans-serif;
        }

        /* ── Header ──────────────────────────────────── */
        .gallery-header {
          text-align: center;
          margin-bottom: 52px;
        }
        .gallery-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #e8eaf6;
          color: #1a237e;
          border-radius: 30px;
          padding: 6px 16px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 2px;
          text-transform: uppercase;
          margin-bottom: 18px;
        }
        .gallery-heading {
          font-size: clamp(24px, 4vw, 44px);
          font-family: 'Georgia', serif;
          font-weight: 700;
          color: #1a237e;
          margin: 0 0 14px;
          line-height: 1.15;
        }
        .gallery-subtext {
          color: #666;
          font-size: 15px;
          max-width: 540px;
          margin: 0 auto;
          line-height: 1.75;
        }

        /* ── Filter bar ──────────────────────────────── */
        .filter-bar {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          max-width: 1200px;
          margin: 0 auto 40px;
        }
        .filter-icon {
          color: #999;
          margin-top: 10px;
          flex-shrink: 0;
        }
        .filter-tabs {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
        .filter-tab {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          border-radius: 30px;
          border: 1.5px solid #e0e0e0;
          background: #fff;
          color: #555;
          font-weight: 600;
          font-size: 12.5px;
          cursor: pointer;
          transition: all 0.18s;
          white-space: nowrap;
        }
        .filter-tab:hover {
          border-color: #9fa8da;
          color: #1a237e;
          background: #f3f4fb;
        }
        .filter-tab.active {
          background: #1a237e;
          border-color: #1a237e;
          color: #fff;
        }

        /* ── Grid ────────────────────────────────────── */
        .gallery-container {
          max-width: 1200px;
          margin: 0 auto;
        }
        .gallery-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
        }

        /* ── Card ────────────────────────────────────── */
        .gallery-card {
          position: relative;
          aspect-ratio: 4/3;
          border-radius: 14px;
          overflow: hidden;
          cursor: pointer;
          background: #f0f0f0;
          animation: fadeUp 0.45s both;
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .card-placeholder {
          position: absolute;
          inset: 0;
        }
        .card-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          opacity: 0;
          transition: opacity 0.3s, transform 0.35s;
        }
        .card-img.visible { opacity: 1; }
        .gallery-card:hover .card-img { transform: scale(1.05); }

        .card-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(15,20,60,0.82) 0%, transparent 55%);
          opacity: 0;
          transition: opacity 0.25s;
          display: flex;
          align-items: flex-end;
          padding: 16px;
        }
        .gallery-card:hover .card-overlay { opacity: 1; }

        .card-meta { color: #fff; }
        .card-category {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          opacity: 0.75;
          display: block;
          margin-bottom: 4px;
        }
        .card-title {
          font-family: 'Georgia', serif;
          font-size: 15px;
          font-weight: 700;
          margin: 0 0 4px;
          line-height: 1.3;
        }
        .card-date {
          font-size: 11px;
          opacity: 0.6;
        }

        /* ── Card error/skeleton ─────────────────────── */
        .card-error {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 8px;
          color: #bbb;
          font-size: 12px;
          background: #f5f5f5;
        }

        /* ── Skeleton ────────────────────────────────── */
        .gallery-skeleton {
          aspect-ratio: 4/3;
          border-radius: 14px;
          overflow: hidden;
          background: #ebebeb;
        }
        .skeleton-shimmer {
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, #ebebeb 25%, #f5f5f5 50%, #ebebeb 75%);
          background-size: 200% 100%;
          animation: shimmer 1.4s infinite;
        }
        @keyframes shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        /* ── Empty state ─────────────────────────────── */
        .gallery-empty {
          grid-column: 1/-1;
          text-align: center;
          padding: 80px 20px;
          color: #ccc;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          font-size: 15px;
        }

        /* ── Lightbox ────────────────────────────────── */
        .lightbox-backdrop {
          position: fixed;
          inset: 0;
          z-index: 9999;
          background: rgba(5, 8, 24, 0.92);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          gap: 16px;
          backdrop-filter: blur(6px);
        }
        .lb-card {
          position: relative;
          background: #fff;
          border-radius: 20px;
          overflow: hidden;
          width: min(560px, 90vw);
          max-height: 90vh;
          display: flex;
          flex-direction: column;
          box-shadow: 0 32px 80px rgba(0,0,0,0.5);
        }
        .lb-close {
          position: absolute;
          top: 12px;
          right: 12px;
          z-index: 10;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: rgba(0,0,0,0.45);
          border: none;
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background 0.2s;
        }
        .lb-close:hover { background: rgba(0,0,0,0.7); }
        .lb-img-wrap {
          flex-shrink: 0;
          max-height: 58vh;
          overflow: hidden;
          background: #111;
        }
        .lb-img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          display: block;
        }
        .lb-info {
          padding: 16px 18px 20px;
          overflow-y: auto;
        }
        .lb-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          background: #e8eaf6;
          color: #1a237e;
          border-radius: 20px;
          padding: 4px 12px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          margin-bottom: 10px;
        }
        .lb-title {
          font-family: 'Georgia', serif;
          font-size: 20px;
          font-weight: 700;
          color: #1a237e;
          margin: 0 0 8px;
          line-height: 1.3;
        }
        .lb-desc {
          font-size: 13px;
          color: #666;
          line-height: 1.6;
          margin: 0 0 8px;
        }
        .lb-date {
          font-size: 12px;
          color: #999;
          margin: 0 0 6px;
        }
        .lb-counter {
          font-size: 12px;
          color: #bbb;
          margin: 4px 0 0;
        }
        .lb-nav {
          flex-shrink: 0;
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: rgba(255,255,255,0.12);
          border: 1.5px solid rgba(255,255,255,0.2);
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background 0.2s;
        }
        .lb-nav:hover:not(:disabled) { background: rgba(255,255,255,0.22); }
        .lb-nav:disabled { opacity: 0.25; cursor: default; }

        /* ── Responsive ──────────────────────────────── */
        @media (max-width: 1024px) {
          .gallery-grid { grid-template-columns: repeat(3, 1fr); }
        }
        @media (max-width: 768px) {
          .gallery-section { padding: 60px 20px 60px; }
          .gallery-header { margin-bottom: 36px; }
          .gallery-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; }
          .filter-bar { gap: 8px; }
          .filter-tab { padding: 7px 12px; font-size: 12px; }
          .lb-title { font-size: 17px; }
        }
        @media (max-width: 480px) {
          .gallery-section { padding: 48px 12px 48px; }
          .gallery-grid { grid-template-columns: repeat(2, 1fr); gap: 8px; }
          .gallery-subtext { font-size: 14px; }
          .filter-tab span { display: none; }
          .filter-tab { padding: 8px 10px; gap: 0; }
          .lb-nav { display: none; }
          .lb-card { width: 96vw; }
          .lb-img-wrap { max-height: 45vh; }
          .lb-info { padding: 12px 14px 16px; }
          .lb-title { font-size: 15px; }
        }
      `}</style>
    </section>
  )
}