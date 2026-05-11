import FeatureCard from '../models/FeatureCard.model.js'
import cloudinary from '../config/cloudinary.js'

// ── GET /api/about/features — Public: active cards only ────────
export const getActiveFeatures = async (req, res, next) => {
  try {
    const features = await FeatureCard.find({ isActive: true })
      .sort({ order: 1, createdAt: 1 })
      .select('title desc imageUrl order')

    res.status(200).json({ success: true, features })
  } catch (error) {
    next(error)
  }
}

// ── GET /api/about/features/all — Admin: all cards ─────────────
export const getAllFeatures = async (req, res, next) => {
  try {
    const features = await FeatureCard.find().sort({ order: 1, createdAt: 1 })
    res.status(200).json({ success: true, features })
  } catch (error) {
    next(error)
  }
}

// ── POST /api/about/features — Admin: add card ─────────────────
export const addFeature = async (req, res, next) => {
  try {
    if (!req.file) {
      res.status(400)
      throw new Error('Card image is required')
    }

    const { title, desc, order, isActive } = req.body

    const feature = await FeatureCard.create({
      title,
      desc,
      imageUrl:           req.file.path,
      cloudinaryPublicId: req.file.filename,
      order:    order    !== undefined ? Number(order) : 0,
      isActive: isActive !== undefined ? isActive === 'true' : true,
    })

    res.status(201).json({ success: true, message: 'Feature card added', feature })
  } catch (error) {
    next(error)
  }
}

// ── PUT /api/about/features/:id — Admin: update card ──────────
export const updateFeature = async (req, res, next) => {
  try {
    const feature = await FeatureCard.findById(req.params.id)
    if (!feature) {
      res.status(404)
      throw new Error('Feature card not found')
    }

    const { title, desc, order, isActive } = req.body

    // Replace image on Cloudinary if a new one was uploaded
    if (req.file) {
      await cloudinary.uploader.destroy(feature.cloudinaryPublicId)
      feature.imageUrl           = req.file.path
      feature.cloudinaryPublicId = req.file.filename
    }

    if (title    !== undefined) feature.title    = title
    if (desc     !== undefined) feature.desc     = desc
    if (order    !== undefined) feature.order    = Number(order)
    if (isActive !== undefined) feature.isActive = isActive === 'true'

    await feature.save()
    res.status(200).json({ success: true, message: 'Feature card updated', feature })
  } catch (error) {
    next(error)
  }
}

// ── PUT /api/about/features/:id/toggle — Toggle active ────────
export const toggleFeature = async (req, res, next) => {
  try {
    const feature = await FeatureCard.findById(req.params.id)
    if (!feature) {
      res.status(404)
      throw new Error('Feature card not found')
    }

    feature.isActive = !feature.isActive
    await feature.save()

    res.status(200).json({
      success: true,
      message: `Feature card ${feature.isActive ? 'activated' : 'deactivated'}`,
      isActive: feature.isActive,
    })
  } catch (error) {
    next(error)
  }
}

// ── DELETE /api/about/features/:id ────────────────────────────
export const deleteFeature = async (req, res, next) => {
  try {
    const feature = await FeatureCard.findById(req.params.id)
    if (!feature) {
      res.status(404)
      throw new Error('Feature card not found')
    }

    await cloudinary.uploader.destroy(feature.cloudinaryPublicId)
    await FeatureCard.findByIdAndDelete(req.params.id)

    res.status(200).json({ success: true, message: 'Feature card deleted' })
  } catch (error) {
    next(error)
  }
}