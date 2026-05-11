import Banner from '../models/Banner.model.js'
import cloudinary from '../config/cloudinary.js'

export const getActiveBanners = async (req, res, next) => {
  try {
    const banners = await Banner.find({ isActive: true })
      .sort({ order: 1, createdAt: 1 })
      .select('label title highlight imageUrl order isActive')

    res.status(200).json({ success: true, banners })
  } catch (error) {
    next(error)
  }
}

// ── GET /api/admin/banners — Admin: fetch all banners ──────────────
export const getAllBanners = async (req, res, next) => {
  try {
    const banners = await Banner.find().sort({ order: 1, createdAt: 1 })
    res.status(200).json({ success: true, banners })
  } catch (error) {
    next(error)
  }
}

// ── POST /api/admin/banners — Admin: add banner ────────────────────
export const addBanner = async (req, res, next) => {
  try {
    if (!req.file) {
      res.status(400)
      throw new Error('Banner image is required')
    }

    const { label, title, highlight, order, isActive } = req.body

    const banner = await Banner.create({
      label,
      title: title || '',
      highlight: highlight || '',
      imageUrl: req.file.path,
      cloudinaryPublicId: req.file.filename,
      order: order ? Number(order) : 0,
      isActive: isActive !== undefined ? isActive === 'true' : true
    })

    res.status(201).json({ success: true, message: 'Banner added successfully', banner })
  } catch (error) {
    next(error)
  }
}

// ── PUT /api/admin/banners/:id — Admin: update banner ─────────────
export const updateBanner = async (req, res, next) => {
  try {
    const banner = await Banner.findById(req.params.id)
    if (!banner) {
      res.status(404)
      throw new Error('Banner not found')
    }

    const { label, title, highlight, order, isActive } = req.body

    // If new image uploaded, delete old one from Cloudinary
    if (req.file) {
      await cloudinary.uploader.destroy(banner.cloudinaryPublicId)
      banner.imageUrl = req.file.path
      banner.cloudinaryPublicId = req.file.filename
    }

    if (label !== undefined) banner.label = label
    if (title !== undefined) banner.title = title
    if (highlight !== undefined) banner.highlight = highlight
    if (order !== undefined) banner.order = Number(order)
    if (isActive !== undefined) banner.isActive = isActive === 'true'

    await banner.save()

    res.status(200).json({ success: true, message: 'Banner updated successfully', banner })
  } catch (error) {
    next(error)
  }
}

// ── PUT /api/admin/banners/:id/toggle — Toggle active ─────────────
export const toggleBannerActive = async (req, res, next) => {
  try {
    const banner = await Banner.findById(req.params.id)
    if (!banner) {
      res.status(404)
      throw new Error('Banner not found')
    }

    banner.isActive = !banner.isActive
    await banner.save()

    res.status(200).json({
      success: true,
      message: `Banner ${banner.isActive ? 'activated' : 'deactivated'}`,
      isActive: banner.isActive
    })
  } catch (error) {
    next(error)
  }
}

// ── PUT /api/admin/banners/reorder — Bulk reorder ─────────────────
export const reorderBanners = async (req, res, next) => {
  try {
    const { orders } = req.body
    if (!Array.isArray(orders)) {
      res.status(400)
      throw new Error('orders must be an array')
    }

    await Promise.all(
      orders.map(({ id, order }) =>
        Banner.findByIdAndUpdate(id, { order: Number(order) })
      )
    )

    res.status(200).json({ success: true, message: 'Banners reordered successfully' })
  } catch (error) {
    next(error)
  }
}

// ── DELETE /api/admin/banners/:id ─────────────────────────────────
export const deleteBanner = async (req, res, next) => {
  try {
    const banner = await Banner.findById(req.params.id)
    if (!banner) {
      res.status(404)
      throw new Error('Banner not found')
    }

    await cloudinary.uploader.destroy(banner.cloudinaryPublicId)
    await Banner.findByIdAndDelete(req.params.id)

    res.status(200).json({ success: true, message: 'Banner deleted successfully' })
  } catch (error) {
    next(error)
  }
}