import { useState, useEffect, useRef } from 'react'
import { Upload, Trash2, Eye, EyeOff, Plus, X, Pencil, ImageIcon } from 'lucide-react'
import api from '@/lib/api'
import toast from 'react-hot-toast'

export default function ManageBanners() {
  const [banners, setBanners] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [editingBanner, setEditingBanner] = useState(null)
  const [preview, setPreview] = useState(null)
  const fileRef = useRef(null)

  const [form, setForm] = useState({ label: '', title: '', highlight: '', order: '', isActive: true })

  const fetchBanners = async () => {
    try {
      setLoading(true)
      const { data } = await api.get('/banners/all')
      setBanners(data.banners)
    } catch {
      toast.error('Failed to load banners')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchBanners() }, [])

  const openAdd = () => {
    setEditingBanner(null)
    setForm({ label: '', title: '', highlight: '', order: banners.length, isActive: true })
    setPreview(null)
    if (fileRef.current) fileRef.current.value = ''
    setShowModal(true)
  }

  const openEdit = (banner) => {
    setEditingBanner(banner)
    setForm({
      label: banner.label,
      title: banner.title || '',
      highlight: banner.highlight || '',
      order: banner.order,
      isActive: banner.isActive
    })
    setPreview(banner.imageUrl)
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingBanner(null)
    setPreview(null)
  }

  const handleFile = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setPreview(URL.createObjectURL(file))
  }

  const handleSubmit = async () => {
    if (!form.label.trim()) return toast.error('Label is required')
    if (!editingBanner && !fileRef.current?.files[0]) return toast.error('Please select an image')

    const fd = new FormData()
    fd.append('label', form.label.trim())
    fd.append('title', (form.title || '').trim())
    fd.append('highlight', (form.highlight || '').trim())
    fd.append('order', form.order)
    fd.append('isActive', form.isActive)
    if (fileRef.current?.files[0]) fd.append('image', fileRef.current.files[0])

    try {
      setSubmitting(true)
      if (editingBanner) {
        await api.put(`/banners/${editingBanner._id}`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        toast.success('Banner updated')
      } else {
        await api.post('/banners', fd, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        toast.success('Banner added')
      }
      closeModal()
      fetchBanners()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed')
    } finally {
      setSubmitting(false)
    }
  }

  const handleToggle = async (banner) => {
    try {
      await api.put(`/banners/${banner._id}/toggle`)
      setBanners(prev => prev.map(b =>
        b._id === banner._id ? { ...b, isActive: !b.isActive } : b
      ))
      toast.success(`Banner ${banner.isActive ? 'deactivated' : 'activated'}`)
    } catch {
      toast.error('Failed to toggle banner')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this banner? This cannot be undone.')) return
    try {
      await api.delete(`/banners/${id}`)
      setBanners(prev => prev.filter(b => b._id !== id))
      toast.success('Banner deleted')
    } catch {
      toast.error('Failed to delete banner')
    }
  }

  return (
    <div className="p-3 sm:p-4 md:p-6 max-w-6xl mx-auto">

      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-black" style={{ fontFamily: 'Poppins' }}>
            Manage Banners
          </h1>
          <p className="text-black text-xs sm:text-sm mt-0.5">
            Control hero section slides shown on the public homepage
          </p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-lg w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Banner
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-4 sm:mb-6">
        {[
          { label: 'Total', val: banners.length },
          { label: 'Active', val: banners.filter(b => b.isActive).length },
          { label: 'Inactive', val: banners.filter(b => !b.isActive).length },
        ].map(({ label, val }) => (
          <div key={label} className="bg-white border border-gray-200 rounded-xl p-3 sm:p-4 text-center">
            <div className="text-xl sm:text-2xl font-black text-black" style={{ fontFamily: 'Poppins' }}>{val}</div>
            <div className="text-black text-[10px] sm:text-xs mt-0.5 sm:mt-1">{label}</div>
          </div>
        ))}
      </div>

      {/* Banner Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse bg-gray-100 rounded-xl h-48 sm:h-56 border border-gray-200" />
          ))}
        </div>
      ) : banners.length === 0 ? (
        <div className="text-center py-16 sm:py-20 border border-dashed border-gray-300 rounded-2xl">
          <ImageIcon className="w-8 h-8 sm:w-10 sm:h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">No banners yet. Add your first one.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {banners.map((banner, idx) => (
            <div
              key={banner._id}
              className={`relative group rounded-xl overflow-hidden border transition-all duration-200
                ${banner.isActive
                  ? 'border-[#F5A623]/40 hover:border-[#F5A623]/70'
                  : 'border-gray-200 opacity-60 hover:opacity-80'}`}
            >
              {/* Image */}
              <div className="relative h-40 sm:h-44 bg-gray-100">
                <img
                  src={banner.imageUrl}
                  alt={banner.label}
                  className="w-full h-full object-cover"
                />

                {/* Actions */}
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center gap-2 sm:gap-3
                  opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200">
                  <button
                    onClick={() => openEdit(banner)}
                    className="p-2 rounded-lg bg-white/10 border border-white/20 text-white hover:bg-[#F5A623]/20 hover:border-[#F5A623]/40 transition-all"
                  >
                    <Pencil className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </button>
                  <button
                    onClick={() => handleToggle(banner)}
                    className="p-2 rounded-lg bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-all"
                  >
                    {banner.isActive
                      ? <EyeOff className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      : <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                  </button>
                  <button
                    onClick={() => handleDelete(banner._id)}
                    className="p-2 rounded-lg bg-white/10 border border-white/20 text-white hover:bg-red-500/20 hover:border-red-500/40 transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </button>
                </div>

                {/* Order badge */}
                <div className="absolute top-2 left-2 bg-black/60 border border-white/15 text-white/60 text-[9px] sm:text-[10px] font-semibold px-1.5 sm:px-2 py-0.5 rounded-full">
                  #{idx + 1} · Order {banner.order}
                </div>

                {/* Status badge */}
                <div className={`absolute top-2 right-2 text-[9px] sm:text-[10px] font-semibold px-1.5 sm:px-2 py-0.5 rounded-full border
                  ${banner.isActive
                    ? 'bg-green-500/20 border-green-500/30 text-green-400'
                    : 'bg-white/10 border-white/15 text-white/40'}`}
                >
                  {banner.isActive ? 'Active' : 'Inactive'}
                </div>
              </div>

              {/* Info */}
              <div className="p-2.5 sm:p-3 bg-white">
                <p className="text-black text-xs sm:text-sm font-medium truncate">{banner.label}</p>
                {banner.title && (
                  <p className="text-black text-[10px] sm:text-[11px] font-medium truncate mt-0.5">
                    ◆ {banner.title}
                  </p>
                )}
                {banner.highlight && (
                  <p className="text-[#F5A623] text-[10px] sm:text-[11px] font-medium truncate mt-0.5">
                    ✦ {banner.highlight}
                  </p>
                )}
                <p className="text-black text-[10px] sm:text-[11px] mt-0.5">
                  {new Date(banner.createdAt).toLocaleDateString('en-IN', {
                    day: '2-digit', month: 'short', year: 'numeric'
                  })}
                </p>

                {/* Action buttons */}
                <div className="flex items-center gap-2 mt-2.5">
                  <button
                    onClick={() => openEdit(banner)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-gray-50 border border-gray-200 text-black hover:bg-[#F5A623]/10 hover:border-[#F5A623]/30 hover:text-[#F5A623] transition-all text-[11px] font-medium"
                  >
                    <Pencil className="w-3 h-3" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleToggle(banner)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-gray-50 border border-gray-200 text-black hover:bg-gray-100 hover:text-black transition-all text-[11px] font-medium"
                  >
                    {banner.isActive
                      ? <><EyeOff className="w-3 h-3" />Hide</>
                      : <><Eye className="w-3 h-3" />Show</>}
                  </button>
                  <button
                    onClick={() => handleDelete(banner._id)}
                    className="p-1.5 rounded-lg bg-gray-50 border border-gray-200 text-black hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400 transition-all"
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
          <div className="w-full sm:max-w-md bg-white border border-gray-200 rounded-t-2xl sm:rounded-2xl shadow-2xl
            max-h-[92vh] overflow-y-auto">

            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-gray-200 sticky top-0 bg-white z-10">
              <h2 className="text-base sm:text-lg font-bold text-gray-900" style={{ fontFamily: 'Poppins' }}>
                {editingBanner ? 'Edit Banner' : 'Add New Banner'}
              </h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 transition-colors p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 sm:p-5 space-y-4">

              {/* Image Upload */}
              <div>
                <label className="text-gray-500 text-xs font-semibold uppercase tracking-wide mb-2 block">
                  Banner Image{' '}
                  {editingBanner && (
                    <span className="text-gray-400 normal-case font-normal">(leave empty to keep current)</span>
                  )}
                </label>
                <div
                  onClick={() => fileRef.current?.click()}
                  className="relative rounded-xl border-2 border-dashed border-gray-300 hover:border-blue-400 cursor-pointer overflow-hidden transition-colors group"
                  style={{ height: preview ? '150px' : '90px' }}
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

              {/* Label */}
              <div>
                <label className="text-gray-500 text-xs font-semibold uppercase tracking-wide mb-2 block">
                  Slide Label{' '}
                  <span className="text-gray-400 normal-case font-normal">(glass badge on hero)</span>
                </label>
                <input
                  type="text"
                  value={form.label}
                  onChange={e => setForm(p => ({ ...p, label: e.target.value }))}
                  placeholder="e.g. Beyond Academics"
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-gray-800 text-sm placeholder:text-gray-400 focus:outline-none focus:border-blue-400 transition-colors"
                />
              </div>

              {/* Main Text */}
              <div>
                <label className="text-gray-500 text-xs font-semibold uppercase tracking-wide mb-2 block">
                  Main Text{' '}
                  <span className="text-gray-400 normal-case font-normal">(white heading on hero)</span>
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                  placeholder="e.g. Nurturing Tomorrow's"
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-gray-800 text-sm placeholder:text-gray-400 focus:outline-none focus:border-blue-400 transition-colors"
                />
              </div>

              {/* Highlight */}
              <div>
                <label className="text-gray-500 text-xs font-semibold uppercase tracking-wide mb-2 block">
                  Highlight Text{' '}
                  <span className="text-gray-400 normal-case font-normal">(gold gradient line on hero)</span>
                </label>
                <input
                  type="text"
                  value={form.highlight}
                  onChange={e => setForm(p => ({ ...p, highlight: e.target.value }))}
                  placeholder="e.g. Global Leaders"
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-gray-800 text-sm placeholder:text-gray-400 focus:outline-none focus:border-blue-400 transition-colors"
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
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-gray-800 text-sm focus:outline-none focus:border-blue-400 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-gray-500 text-xs font-semibold uppercase tracking-wide mb-2 block">
                    Status
                  </label>
                  <select
                    value={form.isActive ? 'true' : 'false'}
                    onChange={e => setForm(p => ({ ...p, isActive: e.target.value === 'true' }))}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-gray-800 text-sm focus:outline-none focus:border-blue-400 transition-colors"
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
                onClick={closeModal}
                className="flex-1 px-4 py-2.5 rounded-lg border border-gray-200 text-gray-500 hover:text-gray-700 hover:border-gray-300 text-sm font-semibold transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
              >
                {submitting && (
                  <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                )}
                {editingBanner ? 'Save Changes' : 'Add Banner'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}