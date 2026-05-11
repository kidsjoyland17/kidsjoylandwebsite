import { useState, useEffect, useRef } from 'react'
import {
  Plus, X, Pencil, Trash2, Upload, ImageIcon,
  Eye, EyeOff, LayoutGrid
} from 'lucide-react'
import api from '@/lib/api'
import toast from 'react-hot-toast'

// ─── Add / Edit Modal ─────────────────────────────────────────
function FeatureCardModal({ card, totalCards, onClose, onSaved }) {
  const [form, setForm] = useState(
    card
      ? { title: card.title, desc: card.desc, order: card.order, isActive: card.isActive }
      : { title: '', desc: '', order: totalCards, isActive: true }
  )
  const [preview, setPreview] = useState(card?.imageUrl || null)
  const [saving, setSaving]   = useState(false)
  const fileRef               = useRef(null)

  const handleFile = (e) => {
    const f = e.target.files[0]
    if (f) setPreview(URL.createObjectURL(f))
  }

  const handleSubmit = async () => {
    if (!form.title.trim()) return toast.error('Title is required')
    if (!form.desc.trim())  return toast.error('Description is required')
    if (!card && !fileRef.current?.files[0]) return toast.error('Please select an image')

    const fd = new FormData()
    fd.append('title',    form.title.trim())
    fd.append('desc',     form.desc.trim())
    fd.append('order',    form.order)
    fd.append('isActive', form.isActive)
    if (fileRef.current?.files[0]) fd.append('image', fileRef.current.files[0])

    setSaving(true)
    try {
      if (card?._id) {
        await api.put(`/about/features/${card._id}`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        toast.success('Feature card updated')
      } else {
        await api.post('/about/features', fd, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        toast.success('Feature card added')
      }
      onSaved()
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full sm:max-w-md bg-white border border-gray-200 rounded-t-2xl sm:rounded-2xl
        shadow-2xl max-h-[92vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-gray-200 sticky top-0 bg-white z-10">
          <h2 className="text-base sm:text-lg font-bold text-black" style={{ fontFamily: 'Poppins' }}>
            {card ? 'Edit Feature Card' : 'Add Feature Card'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 transition-colors p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-5 space-y-4">

          {/* Image upload */}
          <div>
            <label className="text-gray-500 text-xs font-semibold uppercase tracking-wide mb-2 block">
              Card Image{' '}
              {card && (
                <span className="text-gray-400 normal-case font-normal">(leave empty to keep current)</span>
              )}
            </label>
            <div
              onClick={() => fileRef.current?.click()}
              className="relative rounded-xl border-2 border-dashed border-gray-300 hover:border-blue-400
                cursor-pointer overflow-hidden transition-colors group"
              style={{ height: preview ? '160px' : '90px' }}
            >
              {preview ? (
                <img src={preview} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center justify-center h-full gap-1.5">
                  <Upload className="w-5 h-5 sm:w-6 sm:h-6 text-gray-300 group-hover:text-blue-400 transition-colors" />
                  <span className="text-gray-400 text-[11px] sm:text-xs text-center px-2">
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
            />
          </div>

          {/* Title */}
          <div>
            <label className="text-gray-500 text-xs font-semibold uppercase tracking-wide mb-2 block">
              Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={form.title}
              onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
              placeholder="e.g. Global Exposure"
              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-black text-sm
                placeholder:text-gray-300 focus:outline-none focus:border-blue-400 transition-colors"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-gray-500 text-xs font-semibold uppercase tracking-wide mb-2 block">
              Description <span className="text-red-400">*</span>{' '}
              <span className="text-gray-400 normal-case font-normal">(shown on card flip)</span>
            </label>
            <textarea
              rows={3}
              value={form.desc}
              onChange={e => setForm(p => ({ ...p, desc: e.target.value }))}
              placeholder="Short description shown on the back of the flip card..."
              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-black text-sm
                placeholder:text-gray-300 focus:outline-none focus:border-blue-400 transition-colors resize-none"
            />
          </div>

          {/* Order + Status */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-gray-500 text-xs font-semibold uppercase tracking-wide mb-2 block">
                Display Order
              </label>
              <input
                type="number"
                min={0}
                value={form.order}
                onChange={e => setForm(p => ({ ...p, order: e.target.value }))}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-black text-sm
                  focus:outline-none focus:border-blue-400 transition-colors"
              />
            </div>
            <div>
              <label className="text-gray-500 text-xs font-semibold uppercase tracking-wide mb-2 block">
                Status
              </label>
              <select
                value={form.isActive ? 'true' : 'false'}
                onChange={e => setForm(p => ({ ...p, isActive: e.target.value === 'true' }))}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-black text-sm
                  focus:outline-none focus:border-blue-400 transition-colors"
              >
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-4 sm:p-5 pt-0 pb-6 sm:pb-5">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-lg border border-gray-200 text-gray-500
              hover:text-gray-700 hover:border-gray-300 text-sm font-semibold transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-semibold
              disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
          >
            {saving && (
              <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
            )}
            {card ? 'Save Changes' : 'Add Card'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────
export default function ManageAbout() {
  const [cards, setCards]         = useState([])
  const [loading, setLoading]     = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing]     = useState(null)

  const fetchCards = async () => {
    try {
      setLoading(true)
      const { data } = await api.get('/about/features/all')
      setCards(data.features)
    } catch {
      toast.error('Failed to load feature cards')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchCards() }, [])

  const openAdd    = () => { setEditing(null); setShowModal(true) }
  const openEdit   = (c) => { setEditing(c);  setShowModal(true) }
  const closeModal = () => { setShowModal(false); setEditing(null) }

  const handleToggle = async (card) => {
    try {
      await api.put(`/about/features/${card._id}/toggle`)
      setCards(prev =>
        prev.map(c => c._id === card._id ? { ...c, isActive: !c.isActive } : c)
      )
      toast.success(`Card ${card.isActive ? 'deactivated' : 'activated'}`)
    } catch {
      toast.error('Failed to toggle card')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this feature card? This cannot be undone.')) return
    try {
      await api.delete(`/about/features/${id}`)
      setCards(prev => prev.filter(c => c._id !== id))
      toast.success('Feature card deleted')
    } catch {
      toast.error('Failed to delete card')
    }
  }

  return (
    <div className="p-3 sm:p-4 md:p-6 max-w-6xl mx-auto">

      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-black" style={{ fontFamily: 'Poppins' }}>
            Manage About Page
          </h1>
          <p className="text-black text-xs sm:text-sm mt-0.5">
            Control the flip cards shown at the bottom of the About section
          </p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-lg
            w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Card
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-4 sm:mb-6">
        {[
          { label: 'Total',    val: cards.length },
          { label: 'Active',   val: cards.filter(c => c.isActive).length },
          { label: 'Inactive', val: cards.filter(c => !c.isActive).length },
        ].map(({ label, val }) => (
          <div key={label} className="bg-white border border-gray-200 rounded-xl p-3 sm:p-4 text-center">
            <div className="text-xl sm:text-2xl font-black text-black" style={{ fontFamily: 'Poppins' }}>{val}</div>
            <div className="text-black text-[10px] sm:text-xs mt-0.5 sm:mt-1">{label}</div>
          </div>
        ))}
      </div>

      {/* Cards grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse bg-gray-100 rounded-xl h-52 sm:h-56 border border-gray-200" />
          ))}
        </div>
      ) : cards.length === 0 ? (
        <div className="text-center py-16 sm:py-20 border border-dashed border-gray-300 rounded-2xl">
          <LayoutGrid className="w-8 h-8 sm:w-10 sm:h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">No feature cards yet. Add your first one.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {cards.map((card, idx) => (
            <div
              key={card._id}
              className={`relative group rounded-xl overflow-hidden border transition-all duration-200
                ${card.isActive
                  ? 'border-[#F5A623]/40 hover:border-[#F5A623]/70'
                  : 'border-gray-200 opacity-60 hover:opacity-80'
                }`}
            >
              {/* Image */}
              <div className="relative h-40 sm:h-44 bg-gray-100">
                {card.imageUrl ? (
                  <img
                    src={card.imageUrl}
                    alt={card.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="w-8 h-8 text-gray-300" />
                  </div>
                )}

                {/* Hover actions */}
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center gap-2 sm:gap-3
                  opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200">
                  <button
                    onClick={() => openEdit(card)}
                    className="p-2 rounded-lg bg-white/10 border border-white/20 text-white hover:bg-[#F5A623]/20 hover:border-[#F5A623]/40 transition-all"
                  >
                    <Pencil className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </button>
                  <button
                    onClick={() => handleToggle(card)}
                    className="p-2 rounded-lg bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-all"
                  >
                    {card.isActive
                      ? <EyeOff className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      : <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                  </button>
                  <button
                    onClick={() => handleDelete(card._id)}
                    className="p-2 rounded-lg bg-white/10 border border-white/20 text-white hover:bg-red-500/20 hover:border-red-500/40 transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </button>
                </div>

                {/* Order badge */}
                <div className="absolute top-2 left-2 bg-black/60 border border-white/15 text-white/60
                  text-[9px] sm:text-[10px] font-semibold px-1.5 sm:px-2 py-0.5 rounded-full">
                  #{idx + 1} · Order {card.order}
                </div>

                {/* Status badge */}
                <div className={`absolute top-2 right-2 text-[9px] sm:text-[10px] font-semibold
                  px-1.5 sm:px-2 py-0.5 rounded-full border
                  ${card.isActive
                    ? 'bg-green-500/20 border-green-500/30 text-green-400'
                    : 'bg-white/10 border-white/15 text-white/40'
                  }`}
                >
                  {card.isActive ? 'Active' : 'Inactive'}
                </div>
              </div>

              {/* Info */}
              <div className="p-2.5 sm:p-3 bg-white">
                <p className="text-black text-xs sm:text-sm font-semibold truncate">{card.title}</p>
                <p className="text-black/50 text-[10px] sm:text-[11px] mt-0.5 line-clamp-2 leading-relaxed">
                  {card.desc}
                </p>
                <p className="text-black/30 text-[10px] sm:text-[11px] mt-1">
                  {new Date(card.createdAt).toLocaleDateString('en-IN', {
                    day: '2-digit', month: 'short', year: 'numeric'
                  })}
                </p>

                {/* Action buttons */}
                <div className="flex items-center gap-2 mt-2.5">
                  <button
                    onClick={() => openEdit(card)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-gray-50
                      border border-gray-200 text-black hover:bg-[#F5A623]/10 hover:border-[#F5A623]/30
                      hover:text-[#F5A623] transition-all text-[11px] font-medium"
                  >
                    <Pencil className="w-3 h-3" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleToggle(card)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-gray-50
                      border border-gray-200 text-black hover:bg-gray-100 hover:text-black
                      transition-all text-[11px] font-medium"
                  >
                    {card.isActive
                      ? <><EyeOff className="w-3 h-3" />Hide</>
                      : <><Eye className="w-3 h-3" />Show</>}
                  </button>
                  <button
                    onClick={() => handleDelete(card._id)}
                    className="p-1.5 rounded-lg bg-gray-50 border border-gray-200 text-black
                      hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400 transition-all"
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
        <FeatureCardModal
          card={editing}
          totalCards={cards.length}
          onClose={closeModal}
          onSaved={fetchCards}
        />
      )}
    </div>
  )
}