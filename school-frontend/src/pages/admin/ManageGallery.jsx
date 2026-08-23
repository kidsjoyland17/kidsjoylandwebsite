import { useState, useEffect, useRef } from 'react'
import {
  Upload, Trash2, Eye, EyeOff, Plus, X, Pencil, ImageIcon,
  Trophy, Palette, Music, PersonStanding, Bus, BookOpen,
  PartyPopper, Globe, GraduationCap, Camera, Grid2x2
} from 'lucide-react'
import api from '@/lib/api'
import toast from 'react-hot-toast'

const CATEGORIES = [
  'sports', 'arts', 'music', 'dance',
  'field-trip', 'classroom', 'events',
  'cultural', 'graduation', 'general',
]

const CATEGORY_ICONS = {
  'sports': Trophy,
  'arts': Palette,
  'music': Music,
  'dance': PersonStanding,
  'field-trip': Bus,
  'classroom': BookOpen,
  'events': PartyPopper,
  'cultural': Globe,
  'graduation': GraduationCap,
  'general': Camera,
}

const CATEGORY_LABELS = {
  'sports': 'Sports',
  'arts': 'Arts',
  'music': 'Music',
  'dance': 'Dance',
  'field-trip': 'Field Trip',
  'classroom': 'Classroom',
  'events': 'Events',
  'cultural': 'Cultural',
  'graduation': 'Graduation',
  'general': 'General',
}

const EMPTY_FORM = {
  title: '',
  description: '',
  category: 'general',
  order: 0,
  isActive: true,
  takenAt: '',
}

function CategoryLabel({ category, className = '' }) {
  const Icon = CATEGORY_ICONS[category]
  return (
    <span className={`inline-flex items-center gap-1 ${className}`}>
      {Icon && <Icon className="w-3 h-3" />}
      {CATEGORY_LABELS[category] || category}
    </span>
  )
}

export default function ManageGallery() {
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [editingImage, setEditingImage] = useState(null)
  const [preview, setPreview] = useState(null)
  const [filterCat, setFilterCat] = useState('All')
  const [form, setForm] = useState(EMPTY_FORM)
  const fileRef = useRef(null)

  const fetchImages = async () => {
    try {
      setLoading(true)
      const { data } = await api.get('/gallery/all')
      setImages(data.images)
    } catch {
      toast.error('Failed to load gallery images')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchImages() }, [])

  const handleSubmit = async () => {
    if (!form.title.trim()) return toast.error('Title is required')
    if (!editingImage && !fileRef.current?.files[0]) return toast.error('Please select an image')

    const fd = new FormData()
    fd.append('title', form.title.trim())
    fd.append('description', form.description.trim())
    fd.append('category', form.category)
    fd.append('order', form.order)
    fd.append('isActive', form.isActive)
    if (form.takenAt) fd.append('takenAt', form.takenAt)
    if (fileRef.current?.files[0]) fd.append('image', fileRef.current.files[0])

    try {
      setSubmitting(true)
      if (editingImage) {
        await api.put(`/gallery/${editingImage._id}`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        toast.success('Image updated')
      } else {
        await api.post('/gallery', fd, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        toast.success('Image added to gallery')
      }
      closeModal()
      fetchImages()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed')
    } finally {
      setSubmitting(false)
    }
  }

  const handleToggle = async (img) => {
    try {
      await api.put(`/gallery/${img._id}/toggle`)
      setImages(prev => prev.map(i =>
        i._id === img._id ? { ...i, isActive: !i.isActive } : i
      ))
      toast.success(`Image ${img.isActive ? 'hidden' : 'shown'} in gallery`)
    } catch {
      toast.error('Failed to update visibility')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this image permanently? This cannot be undone.')) return
    try {
      await api.delete(`/gallery/${id}`)
      setImages(prev => prev.filter(i => i._id !== id))
      toast.success('Image deleted')
    } catch {
      toast.error('Failed to delete image')
    }
  }

  const openAdd = () => {
    setEditingImage(null)
    setForm({ ...EMPTY_FORM, order: images.length })
    setPreview(null)
    if (fileRef.current) fileRef.current.value = ''
    setShowModal(true)
  }

  const openEdit = (img) => {
    setEditingImage(img)
    setForm({
      title: img.title,
      description: img.description || '',
      category: img.category,
      order: img.order,
      isActive: img.isActive,
      takenAt: img.takenAt ? img.takenAt.slice(0, 10) : '',
    })
    setPreview(img.imageUrl)
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingImage(null)
    setPreview(null)
  }

  const handleFile = (e) => {
    const file = e.target.files[0]
    if (file) setPreview(URL.createObjectURL(file))
  }

  const filtered = filterCat === 'All'
    ? images
    : images.filter(i => i.category === filterCat)

  const catCounts = CATEGORIES.reduce((acc, c) => {
    acc[c] = images.filter(i => i.category === c).length
    return acc
  }, {})

  return (
    <div className="p-3 sm:p-4 md:p-6 max-w-7xl mx-auto">

      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-black" style={{ fontFamily: 'Poppins' }}>
            Manage Gallery
          </h1>
          <p className="text-black text-xs sm:text-sm mt-0.5">
            Upload and organise school photos by category
          </p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-lg w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Photo
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-4 sm:mb-6">
        {[
          { label: 'Total', val: images.length },
          { label: 'Visible', val: images.filter(i => i.isActive).length },
          { label: 'Hidden', val: images.filter(i => !i.isActive).length },
        ].map(({ label, val }) => (
          <div key={label} className="bg-white border border-black/20 rounded-xl p-3 sm:p-4 text-center">
            <div className="text-xl sm:text-2xl font-black text-black" style={{ fontFamily: 'Poppins' }}>{val}</div>
            <div className="text-black/60 text-[10px] sm:text-xs mt-0.5 sm:mt-1">{label}</div>
          </div>
        ))}
      </div>

      {/* Category filter tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4 sm:mb-6 scrollbar-hide">
        {/* All tab */}
        <button
          onClick={() => setFilterCat('All')}
          className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all
            ${filterCat === 'All'
              ? 'bg-blue-600 border-blue-600 text-white'
              : 'bg-white border-black/20 text-black hover:border-black/40 hover:bg-gray-50'
            }`}
        >
          <Grid2x2 className="w-3 h-3" />
          All
          <span className={`text-[10px] px-1 py-0 rounded-full
            ${filterCat === 'All' ? 'bg-white/20 text-white' : 'bg-black/10 text-black'}`}>
            {images.length}
          </span>
        </button>

        {/* Category tabs */}
        {CATEGORIES.map(cat => {
          const Icon = CATEGORY_ICONS[cat]
          return (
            <button
              key={cat}
              onClick={() => setFilterCat(cat)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all
                ${filterCat === cat
                  ? 'bg-blue-600 border-blue-600 text-white'
                  : 'bg-white border-black/20 text-black hover:border-black/40 hover:bg-gray-50'
                }`}
            >
              {Icon && <Icon className="w-3 h-3" />}
              {CATEGORY_LABELS[cat]}
              <span className={`text-[10px] px-1 py-0 rounded-full
                ${filterCat === cat ? 'bg-white/20 text-white' : 'bg-black/10 text-black'}`}>
                {catCounts[cat] || 0}
              </span>
            </button>
          )
        })}
      </div>

      {/* Image grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <div key={i} className="animate-pulse bg-black/10 rounded-xl h-44 sm:h-52 border border-black/10" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 sm:py-20 border border-dashed border-black/20 rounded-2xl">
          <ImageIcon className="w-8 h-8 sm:w-10 sm:h-10 text-black/30 mx-auto mb-3" />
          <p className="text-black/50 text-sm">
            {filterCat === 'All'
              ? 'No photos yet. Add your first one.'
              : `No photos in "${CATEGORY_LABELS[filterCat]}" yet.`}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {filtered.map((img) => (
            <div
              key={img._id}
              className={`relative group rounded-xl overflow-hidden border transition-all duration-200
                ${img.isActive
                  ? 'border-black/20 hover:border-black/40'
                  : 'border-black/10 opacity-55 hover:opacity-75'
                }`}
            >
              {/* Image */}
              <div className="relative h-36 sm:h-44 bg-black/30">
                <img
                  src={img.imageUrl}
                  alt={img.title}
                  className="w-full h-full object-cover"
                />

                {/* Hover actions */}
                <div className="absolute inset-0 bg-black/55 flex items-center justify-center gap-2
                  opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200">
                  <button
                    onClick={() => openEdit(img)}
                    className="p-2 rounded-lg bg-white/10 border border-white/20 text-white hover:bg-white/20 hover:border-white/40 transition-all"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleToggle(img)}
                    className="p-2 rounded-lg bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-all"
                  >
                    {img.isActive ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={() => handleDelete(img._id)}
                    className="p-2 rounded-lg bg-white/10 border border-white/20 text-white hover:bg-red-500/20 hover:border-red-500/40 transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Category badge */}
                <div className="absolute top-2 left-2 bg-black/60 border border-white/15 text-white/70
                  text-[9px] font-semibold px-1.5 py-0.5 rounded-full truncate max-w-[80%]">
                  <CategoryLabel category={img.category} />
                </div>

                {/* Visibility badge */}
                <div className={`absolute top-2 right-2 text-[9px] font-semibold px-1.5 py-0.5 rounded-full border
                  ${img.isActive
                    ? 'bg-green-500/20 border-green-500/30 text-green-400'
                    : 'bg-white/10 border-white/15 text-white/40'
                  }`}>
                  {img.isActive ? 'Visible' : 'Hidden'}
                </div>
              </div>

              {/* Card footer */}
              <div className="p-2.5 sm:p-3 bg-white">
                <p className="text-black text-xs sm:text-sm font-medium truncate">{img.title}</p>
                {img.takenAt && (
                  <p className="text-black/50 text-[10px] mt-0.5">
                    {new Date(img.takenAt).toLocaleDateString('en-IN', {
                      day: '2-digit', month: 'short', year: 'numeric'
                    })}
                  </p>
                )}

                {/* Action buttons */}
                <div className="flex items-center gap-2 mt-2.5">
                  <button
                    onClick={() => openEdit(img)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-black/5
                      border border-black/15 text-black/70 hover:bg-black/10 hover:border-black/25
                      hover:text-black transition-all text-[11px] font-medium"
                  >
                    <Pencil className="w-3 h-3" /> Edit
                  </button>
                  <button
                    onClick={() => handleToggle(img)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-black/5
                      border border-black/15 text-black/70 hover:bg-black/10 hover:text-black
                      transition-all text-[11px] font-medium"
                  >
                    {img.isActive
                      ? <><EyeOff className="w-3 h-3" /> Hide</>
                      : <><Eye className="w-3 h-3" /> Show</>
                    }
                  </button>
                  <button
                    onClick={() => handleDelete(img._id)}
                    className="p-1.5 rounded-lg bg-black/5 border border-black/15 text-black/70
                      hover:bg-red-500/10 hover:border-red-500/20 hover:text-red-600 transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full sm:max-w-md bg-white border border-black/10 rounded-t-2xl sm:rounded-2xl
            shadow-2xl max-h-[92vh] overflow-y-auto">

            {/* Modal header */}
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-black/8 sticky top-0 bg-white z-10">
              <h2 className="text-base sm:text-lg font-bold text-black" style={{ fontFamily: 'Poppins' }}>
                {editingImage ? 'Edit Photo' : 'Add New Photo'}
              </h2>
              <button onClick={closeModal} className="text-black/40 hover:text-black/70 transition-colors p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 sm:p-5 space-y-4">

              {/* Image upload */}
              <div>
                <label className="text-black/60 text-xs font-semibold uppercase tracking-wide mb-2 block">
                  Photo <span className="text-red-500">*</span>{' '}
                  {editingImage && (
                    <span className="text-black/30 normal-case font-normal">(leave empty to keep current)</span>
                  )}
                </label>
                <div
                  onClick={() => fileRef.current?.click()}
                  className="relative rounded-xl border-2 border-dashed border-black/15 hover:border-blue-500/40
                    bg-gray-50 hover:bg-blue-50/30 cursor-pointer overflow-hidden transition-colors group"
                  style={{ height: preview ? '160px' : '90px' }}
                >
                  {preview ? (
                    <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full gap-1.5">
                      <Upload className="w-5 h-5 sm:w-6 sm:h-6 text-black/25 group-hover:text-blue-500/60 transition-colors" />
                      <span className="text-black/35 text-[11px] sm:text-xs text-center px-2">
                        Tap to upload · JPG, PNG, WebP · max 5MB
                      </span>
                    </div>
                  )}
                  {preview && (
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <span className="text-white text-xs font-medium">Tap to change</span>
                    </div>
                  )}
                </div>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handleFile}
                  required={!editingImage}
                />
              </div>

              {/* Title */}
              <div>
                <label className="text-black/60 text-xs font-semibold uppercase tracking-wide mb-2 block">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                  placeholder="e.g. Annual Sports Day 2024"
                  required
                  className="w-full bg-white border border-black/15 rounded-lg px-3 py-2.5 text-black text-sm
                    placeholder:text-black/25 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/10
                    transition-colors invalid:border-red-400"
                />
              </div>

              {/* Description */}
              <div>
                <label className="text-black/60 text-xs font-semibold uppercase tracking-wide mb-2 block">
                  Description <span className="text-black/30 font-normal normal-case">(optional)</span>
                </label>
                <textarea
                  value={form.description}
                  onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                  placeholder="Short description of the photo..."
                  rows={2}
                  className="w-full bg-white border border-black/15 rounded-lg px-3 py-2.5 text-black text-sm
                    placeholder:text-black/25 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/10
                    transition-colors resize-none"
                />
              </div>

              {/* Category + Status */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-black/60 text-xs font-semibold uppercase tracking-wide mb-2 block">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={form.category}
                    onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                    required
                    className="w-full bg-white border border-black/15 rounded-lg px-3 py-2.5 text-black text-sm
                      focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/10 transition-colors"
                  >
                    {CATEGORIES.map(c => (
                      <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-black/60 text-xs font-semibold uppercase tracking-wide mb-2 block">
                    Visibility <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={form.isActive ? 'true' : 'false'}
                    onChange={e => setForm(p => ({ ...p, isActive: e.target.value === 'true' }))}
                    required
                    className="w-full bg-white border border-black/15 rounded-lg px-3 py-2.5 text-black text-sm
                      focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/10 transition-colors"
                  >
                    <option value="true">Visible</option>
                    <option value="false">Hidden</option>
                  </select>
                </div>
              </div>

              {/* Order + Date taken */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-black/60 text-xs font-semibold uppercase tracking-wide mb-2 block">
                    Display Order <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={form.order}
                    onChange={e => setForm(p => ({ ...p, order: e.target.value }))}
                    required
                    className="w-full bg-white border border-black/15 rounded-lg px-3 py-2.5 text-black text-sm
                      focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/10 transition-colors
                      invalid:border-red-400"
                  />
                </div>
                <div>
                  <label className="text-black/60 text-xs font-semibold uppercase tracking-wide mb-2 block">
                    Date Taken
                  </label>
                  <input
                    type="date"
                    value={form.takenAt}
                    onChange={e => setForm(p => ({ ...p, takenAt: e.target.value }))}
                    className="w-full bg-white border border-black/15 rounded-lg px-3 py-2.5 text-black text-sm
                      focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/10 transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Modal footer */}
            <div className="flex gap-3 p-4 sm:p-5 pt-0 pb-6 sm:pb-5">
              <button
                onClick={closeModal}
                className="flex-1 px-4 py-2.5 rounded-lg border border-black/15 text-black/50
                  hover:text-black/75 hover:border-black/25 hover:bg-gray-50 text-sm font-semibold transition-all"

              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold
    disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2
    ${editingImage ? 'btn-gold' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
              >
                {submitting && (
                  <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                )}
                {editingImage ? 'Save Changes' : 'Add Photo'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}