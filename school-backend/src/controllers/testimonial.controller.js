import Testimonial from '../models/Testimonial.model.js'

// ── GET /api/testimonials — Public: active only ────────────────
export const getActiveTestimonials = async (req, res, next) => {
  try {
    const testimonials = await Testimonial.find({ isActive: true })
      .sort({ order: 1, createdAt: 1 })
      .select('name role school text rating')
    res.status(200).json({ success: true, testimonials })
  } catch (error) {
    next(error)
  }
}

// ── GET /api/testimonials/all — Admin: all records ─────────────
export const getAllTestimonials = async (req, res, next) => {
  try {
    const testimonials = await Testimonial.find().sort({ order: 1, createdAt: 1 })
    res.status(200).json({ success: true, testimonials })
  } catch (error) {
    next(error)
  }
}

// ── POST /api/testimonials — Admin: create ─────────────────────
export const addTestimonial = async (req, res, next) => {
  try {
    const { name, role, school, text, rating, order, isActive } = req.body

    const testimonial = await Testimonial.create({
      name:     name?.trim(),
      role:     role?.trim(),
      school:   school?.trim(),
      text:     text?.trim(),
      rating:   rating   !== undefined ? Number(rating)   : 5,
      order:    order    !== undefined ? Number(order)    : 0,
      isActive: isActive !== undefined ? isActive === 'true' || isActive === true : true,
    })

    res.status(201).json({ success: true, message: 'Testimonial added', testimonial })
  } catch (error) {
    next(error)
  }
}

// ── PUT /api/testimonials/:id — Admin: update ──────────────────
export const updateTestimonial = async (req, res, next) => {
  try {
    const testimonial = await Testimonial.findById(req.params.id)
    if (!testimonial) {
      res.status(404)
      throw new Error('Testimonial not found')
    }

    const { name, role, school, text, rating, order, isActive } = req.body

    if (name     !== undefined) testimonial.name     = name.trim()
    if (role     !== undefined) testimonial.role     = role.trim()
    if (school   !== undefined) testimonial.school   = school.trim()
    if (text     !== undefined) testimonial.text     = text.trim()
    if (rating   !== undefined) testimonial.rating   = Number(rating)
    if (order    !== undefined) testimonial.order    = Number(order)
    if (isActive !== undefined) testimonial.isActive = isActive === 'true' || isActive === true

    await testimonial.save()
    res.status(200).json({ success: true, message: 'Testimonial updated', testimonial })
  } catch (error) {
    next(error)
  }
}

// ── PUT /api/testimonials/:id/toggle — Admin: toggle active ───
export const toggleTestimonial = async (req, res, next) => {
  try {
    const testimonial = await Testimonial.findById(req.params.id)
    if (!testimonial) {
      res.status(404)
      throw new Error('Testimonial not found')
    }

    testimonial.isActive = !testimonial.isActive
    await testimonial.save()

    res.status(200).json({
      success: true,
      message: `Testimonial ${testimonial.isActive ? 'activated' : 'deactivated'}`,
      isActive: testimonial.isActive,
    })
  } catch (error) {
    next(error)
  }
}

// ── DELETE /api/testimonials/:id — Admin: delete ───────────────
export const deleteTestimonial = async (req, res, next) => {
  try {
    const testimonial = await Testimonial.findById(req.params.id)
    if (!testimonial) {
      res.status(404)
      throw new Error('Testimonial not found')
    }

    await Testimonial.findByIdAndDelete(req.params.id)
    res.status(200).json({ success: true, message: 'Testimonial deleted' })
  } catch (error) {
    next(error)
  }
}