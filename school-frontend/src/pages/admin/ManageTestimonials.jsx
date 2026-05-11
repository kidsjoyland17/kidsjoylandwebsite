import { useState, useEffect } from 'react'
import {
  Plus, X, Pencil, Trash2,
  Eye, EyeOff, MessageSquareQuote,
} from 'lucide-react'
import { MdStar, MdStarOutline } from 'react-icons/md'
import api from '@/lib/api'
import toast from 'react-hot-toast'

// ─── Star Rating Picker ───────────────────────────────────────
function StarPicker({ value, onChange }) {
  const [hovered, setHovered] = useState(0)
  return (
    <div style={{ display: 'flex', gap: '4px' }}>
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          onMouseEnter={() => setHovered(n)}
          onMouseLeave={() => setHovered(0)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px' }}
        >
          {n <= (hovered || value)
            ? <MdStar size={22} style={{ color: '#F5A623' }} />
            : <MdStarOutline size={22} style={{ color: '#d1d5db' }} />
          }
        </button>
      ))}
    </div>
  )
}

// ─── Add / Edit Modal ────────────────────────────────────────
function TestimonialModal({ item, totalItems, onClose, onSaved }) {
  const [form, setForm] = useState(
    item
      ? { name: item.name, role: item.role, school: item.school, text: item.text, rating: item.rating, order: item.order, isActive: item.isActive }
      : { name: '', role: '', school: '', text: '', rating: 5, order: totalItems, isActive: true }
  )
  const [saving, setSaving] = useState(false)

  const set = (key, val) => setForm(p => ({ ...p, [key]: val }))

  const handleSubmit = async () => {
    if (!form.name.trim())   return toast.error('Name is required')
    if (!form.role.trim())   return toast.error('Role is required')
    if (!form.school.trim()) return toast.error('School / Campus is required')
    if (!form.text.trim())   return toast.error('Testimonial text is required')

    const payload = {
      name:     form.name.trim(),
      role:     form.role.trim(),
      school:   form.school.trim(),
      text:     form.text.trim(),
      rating:   form.rating,
      order:    form.order,
      isActive: form.isActive,
    }

    setSaving(true)
    try {
      if (item?._id) {
        await api.put(`/testimonials/${item._id}`, payload)
        toast.success('Testimonial updated')
      } else {
        await api.post('/testimonials', payload)
        toast.success('Testimonial added')
      }
      onSaved()
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed')
    } finally {
      setSaving(false)
    }
  }

  const inputCls = `w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-black text-sm
    placeholder:text-gray-300 focus:outline-none focus:border-blue-400 transition-colors`

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full sm:max-w-lg bg-white border border-gray-200 rounded-t-2xl sm:rounded-2xl
        shadow-2xl max-h-[92vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-gray-200 sticky top-0 bg-white z-10">
          <h2 className="text-base sm:text-lg font-bold text-black" style={{ fontFamily: 'Poppins' }}>
            {item ? 'Edit Testimonial' : 'Add Testimonial'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 transition-colors p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-5 space-y-4">

          {/* Name + Role */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-gray-500 text-xs font-semibold uppercase tracking-wide mb-2 block">
                Full Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={form.name}
                onChange={e => set('name', e.target.value)}
                placeholder="e.g. Priya Sharma"
                className={inputCls}
              />
            </div>
            <div>
              <label className="text-gray-500 text-xs font-semibold uppercase tracking-wide mb-2 block">
                Role <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={form.role}
                onChange={e => set('role', e.target.value)}
                placeholder="e.g. Parent of Grade 8 Student"
                className={inputCls}
              />
            </div>
          </div>

          {/* School */}
          <div>
            <label className="text-gray-500 text-xs font-semibold uppercase tracking-wide mb-2 block">
              School / Campus <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={form.school}
              onChange={e => set('school', e.target.value)}
              placeholder="e.g. Delhi Campus"
              className={inputCls}
            />
          </div>

          {/* Text */}
          <div>
            <label className="text-gray-500 text-xs font-semibold uppercase tracking-wide mb-2 block">
              Testimonial Text <span className="text-red-400">*</span>{' '}
              <span className="text-gray-400 normal-case font-normal">({form.text.length}/600)</span>
            </label>
            <textarea
              rows={4}
              maxLength={600}
              value={form.text}
              onChange={e => set('text', e.target.value)}
              placeholder="Write the testimonial here..."
              className={`${inputCls} resize-none`}
            />
          </div>

          {/* Rating */}
          <div>
            <label className="text-gray-500 text-xs font-semibold uppercase tracking-wide mb-2 block">
              Rating
            </label>
            <StarPicker value={form.rating} onChange={v => set('rating', v)} />
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
                onChange={e => set('order', e.target.value)}
                className={inputCls}
              />
            </div>
            <div>
              <label className="text-gray-500 text-xs font-semibold uppercase tracking-wide mb-2 block">
                Status
              </label>
              <select
                value={form.isActive ? 'true' : 'false'}
                onChange={e => set('isActive', e.target.value === 'true')}
                className={inputCls}
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
            {item ? 'Save Changes' : 'Add Testimonial'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────
export default function ManageTestimonials() {
  const [items,      setItems]      = useState([])
  const [loading,    setLoading]    = useState(true)
  const [showModal,  setShowModal]  = useState(false)
  const [editing,    setEditing]    = useState(null)

  const fetchItems = async () => {
    try {
      setLoading(true)
      const { data } = await api.get('/testimonials/all')
      setItems(data.testimonials)
    } catch {
      toast.error('Failed to load testimonials')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchItems() }, [])

  const openAdd    = () => { setEditing(null); setShowModal(true) }
  const openEdit   = (t) => { setEditing(t);  setShowModal(true) }
  const closeModal = () => { setShowModal(false); setEditing(null) }

  const handleToggle = async (item) => {
    try {
      await api.put(`/testimonials/${item._id}/toggle`)
      setItems(prev =>
        prev.map(t => t._id === item._id ? { ...t, isActive: !t.isActive } : t)
      )
      toast.success(`Testimonial ${item.isActive ? 'deactivated' : 'activated'}`)
    } catch {
      toast.error('Failed to toggle testimonial')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this testimonial? This cannot be undone.')) return
    try {
      await api.delete(`/testimonials/${id}`)
      setItems(prev => prev.filter(t => t._id !== id))
      toast.success('Testimonial deleted')
    } catch {
      toast.error('Failed to delete testimonial')
    }
  }

  return (
    <div className="p-3 sm:p-4 md:p-6 max-w-6xl mx-auto">

      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-black" style={{ fontFamily: 'Poppins' }}>
            Manage Testimonials
          </h1>
          <p className="text-black text-xs sm:text-sm mt-0.5">
            Control testimonials shown on the public website
          </p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-lg
            w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Testimonial
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-4 sm:mb-6">
        {[
          { label: 'Total',    val: items.length },
          { label: 'Active',   val: items.filter(t => t.isActive).length },
          { label: 'Inactive', val: items.filter(t => !t.isActive).length },
        ].map(({ label, val }) => (
          <div key={label} className="bg-white border border-gray-200 rounded-xl p-3 sm:p-4 text-center">
            <div className="text-xl sm:text-2xl font-black text-black" style={{ fontFamily: 'Poppins' }}>{val}</div>
            <div className="text-black text-[10px] sm:text-xs mt-0.5 sm:mt-1">{label}</div>
          </div>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse bg-gray-100 rounded-xl h-52 sm:h-56 border border-gray-200" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 sm:py-20 border border-dashed border-gray-300 rounded-2xl">
          <MessageSquareQuote className="w-8 h-8 sm:w-10 sm:h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">No testimonials yet. Add your first one.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {items.map((item, idx) => (
            <div
              key={item._id}
              className={`relative group rounded-xl overflow-hidden border transition-all duration-200 bg-white
                ${item.isActive
                  ? 'border-[#F5A623]/40 hover:border-[#F5A623]/70'
                  : 'border-gray-200 opacity-60 hover:opacity-80'
                }`}
            >
              {/* Content area */}
              <div className="p-3 sm:p-4 pb-2">
                {/* Badges row */}
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[9px] sm:text-[10px] font-semibold text-gray-400">
                    #{idx + 1} · Order {item.order}
                  </span>
                  <span className={`text-[9px] sm:text-[10px] font-semibold px-1.5 py-0.5 rounded-full border
                    ${item.isActive
                      ? 'bg-green-50 border-green-200 text-green-600'
                      : 'bg-gray-100 border-gray-200 text-gray-400'
                    }`}>
                    {item.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>

                {/* Stars */}
                <div className="flex gap-0.5 mb-2">
                  {Array.from({ length: 5 }).map((_, si) => (
                    si < item.rating
                      ? <MdStar key={si} size={14} style={{ color: '#F5A623' }} />
                      : <MdStarOutline key={si} size={14} style={{ color: '#d1d5db' }} />
                  ))}
                </div>

                {/* Quote text */}
                <p className="text-gray-600 text-[11px] sm:text-xs leading-relaxed line-clamp-3 italic mb-3">
                  "{item.text}"
                </p>

                {/* Author */}
                <div className="border-t border-gray-100 pt-2">
                  <p className="text-black text-xs sm:text-sm font-semibold truncate">{item.name}</p>
                  <p className="text-red-500 text-[10px] sm:text-[11px] font-medium truncate">{item.role}</p>
                  <p className="text-gray-400 text-[10px] sm:text-[11px] truncate">{item.school}</p>
                </div>

                {/* Date */}
                <p className="text-gray-300 text-[10px] mt-1">
                  {new Date(item.createdAt).toLocaleDateString('en-IN', {
                    day: '2-digit', month: 'short', year: 'numeric',
                  })}
                </p>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 px-3 pb-3 sm:px-4 sm:pb-4">
                <button
                  onClick={() => openEdit(item)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-gray-50
                    border border-gray-200 text-black hover:bg-[#F5A623]/10 hover:border-[#F5A623]/30
                    hover:text-[#F5A623] transition-all text-[11px] font-medium"
                >
                  <Pencil className="w-3 h-3" />
                  Edit
                </button>
                <button
                  onClick={() => handleToggle(item)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-gray-50
                    border border-gray-200 text-black hover:bg-gray-100 transition-all text-[11px] font-medium"
                >
                  {item.isActive
                    ? <><EyeOff className="w-3 h-3" />Hide</>
                    : <><Eye className="w-3 h-3" />Show</>}
                </button>
                <button
                  onClick={() => handleDelete(item._id)}
                  className="p-1.5 rounded-lg bg-gray-50 border border-gray-200 text-black
                    hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400 transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <TestimonialModal
          item={editing}
          totalItems={items.length}
          onClose={closeModal}
          onSaved={fetchItems}
        />
      )}
    </div>
  )
}