import Gallery from '../models/Gallery.model.js'
import cloudinary from '../config/cloudinary.js'

// ── GET /api/gallery — Public: fetch all active images ────────────
export const getActiveGallery = async (req, res, next) => {
  try {
    const { category } = req.query

    const filter = { isActive: true }
    if (category && category !== 'all') filter.category = category

    const images = await Gallery.find(filter)
      .sort({ order: 1, createdAt: -1 })
      .select('title description imageUrl category order takenAt')

    res.status(200).json({ success: true, images })
  } catch (error) {
    next(error)
  }
}

// ── GET /api/admin/gallery/all — Admin: fetch all images ──────────
export const getAllGallery = async (req, res, next) => {
  try {
    const { category } = req.query

    const filter = {}
    if (category && category !== 'all') filter.category = category

    const images = await Gallery.find(filter).sort({ order: 1, createdAt: -1 })

    res.status(200).json({ success: true, images })
  } catch (error) {
    next(error)
  }
}

// ── POST /api/admin/gallery — Admin: add gallery image ────────────
export const addGalleryImage = async (req, res, next) => {
  try {
    if (!req.file) {
      res.status(400)
      throw new Error('Gallery image is required')
    }

    const { title, description, category, order, isActive, takenAt } = req.body

    if (!title || !title.trim()) {
      res.status(400)
      throw new Error('Title is required')
    }

    const image = await Gallery.create({
      title: title.trim(),
      description: description ? description.trim() : '',
      imageUrl: req.file.path,
      cloudinaryPublicId: req.file.filename,
      category: category || 'general',
      order: order !== undefined ? Number(order) : 0,
      isActive: isActive !== undefined ? isActive === 'true' : true,
      takenAt: takenAt ? new Date(takenAt) : null,
    })

    res.status(201).json({
      success: true,
      message: 'Image added to gallery successfully',
      image,
    })
  } catch (error) {
    next(error)
  }
}

// ── PUT /api/admin/gallery/:id — Admin: update gallery image ──────
export const updateGalleryImage = async (req, res, next) => {
  try {
    const image = await Gallery.findById(req.params.id)
    if (!image) {
      res.status(404)
      throw new Error('Gallery image not found')
    }

    const { title, description, category, order, isActive, takenAt } = req.body

    // If a new image was uploaded, delete the old one from Cloudinary
    if (req.file) {
      await cloudinary.uploader.destroy(image.cloudinaryPublicId)
      image.imageUrl = req.file.path
      image.cloudinaryPublicId = req.file.filename
    }

    if (title !== undefined)       image.title       = title.trim()
    if (description !== undefined) image.description = description.trim()
    if (category !== undefined)    image.category    = category
    if (order !== undefined)       image.order       = Number(order)
    if (isActive !== undefined)    image.isActive    = isActive === 'true'
    if (takenAt !== undefined)     image.takenAt     = takenAt ? new Date(takenAt) : null

    await image.save()

    res.status(200).json({
      success: true,
      message: 'Gallery image updated successfully',
      image,
    })
  } catch (error) {
    next(error)
  }
}

// ── PUT /api/admin/gallery/:id/toggle — Toggle visibility ─────────
export const toggleGalleryActive = async (req, res, next) => {
  try {
    const image = await Gallery.findById(req.params.id)
    if (!image) {
      res.status(404)
      throw new Error('Gallery image not found')
    }

    image.isActive = !image.isActive
    await image.save()

    res.status(200).json({
      success: true,
      message: `Image ${image.isActive ? 'shown' : 'hidden'} in gallery`,
      isActive: image.isActive,
    })
  } catch (error) {
    next(error)
  }
}

// ── DELETE /api/admin/gallery/:id — Admin: delete image ───────────
export const deleteGalleryImage = async (req, res, next) => {
  try {
    const image = await Gallery.findById(req.params.id)
    if (!image) {
      res.status(404)
      throw new Error('Gallery image not found')
    }

    // Remove from Cloudinary first
    await cloudinary.uploader.destroy(image.cloudinaryPublicId)
    await Gallery.findByIdAndDelete(req.params.id)

    res.status(200).json({
      success: true,
      message: 'Gallery image deleted successfully',
    })
  } catch (error) {
    next(error)
  }
}