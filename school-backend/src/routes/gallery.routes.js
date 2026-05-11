import express from 'express'
import {
  getActiveGallery,
  getAllGallery,
  addGalleryImage,
  updateGalleryImage,
  toggleGalleryActive,
  deleteGalleryImage,
} from '../controllers/gallery.controller.js'
import { protect } from '../middleware/auth.middleware.js'
import { isAdmin } from '../middleware/role.middleware.js'
import { uploadGalleryImage } from '../middleware/upload.middleware.js'

const router = express.Router()

// ── PUBLIC ──────────────────────────────────────────────────────
// GET /api/gallery?category=sports  (optional category filter)
router.get('/', getActiveGallery)

// ── ADMIN ONLY ──────────────────────────────────────────────────
// GET  /api/admin/gallery/all
router.get('/all', protect, isAdmin, getAllGallery)

// POST /api/admin/gallery
router.post('/', protect, isAdmin, uploadGalleryImage, addGalleryImage)

// PUT  /api/admin/gallery/:id/toggle
router.put('/:id/toggle', protect, isAdmin, toggleGalleryActive)

// PUT  /api/admin/gallery/:id
router.put('/:id', protect, isAdmin, uploadGalleryImage, updateGalleryImage)

// DELETE /api/admin/gallery/:id
router.delete('/:id', protect, isAdmin, deleteGalleryImage)

export default router