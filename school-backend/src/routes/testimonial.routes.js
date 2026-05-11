import express from 'express'
import {
  getActiveTestimonials,
  getAllTestimonials,
  addTestimonial,
  updateTestimonial,
  toggleTestimonial,
  deleteTestimonial,
} from '../controllers/testimonial.controller.js'
import { protect } from '../middleware/auth.middleware.js'
import { isAdmin } from '../middleware/role.middleware.js'

const router = express.Router()

// ✅ PUBLIC
router.get('/', getActiveTestimonials)

// 🔒 ADMIN ONLY
router.get('/all',           protect, isAdmin, getAllTestimonials)
router.post('/',             protect, isAdmin, addTestimonial)
router.put('/:id/toggle',   protect, isAdmin, toggleTestimonial)
router.put('/:id',          protect, isAdmin, updateTestimonial)
router.delete('/:id',       protect, isAdmin, deleteTestimonial)

export default router