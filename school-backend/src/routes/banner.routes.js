import express from 'express'
import {
  getActiveBanners,
  getAllBanners, addBanner, updateBanner,
  toggleBannerActive, reorderBanners, deleteBanner
} from '../controllers/banner.controller.js'
import { protect } from '../middleware/auth.middleware.js'
import { isAdmin } from '../middleware/role.middleware.js'
import { uploadBannerImage } from '../middleware/upload.middleware.js'

const router = express.Router()

// ✅ PUBLIC
router.get('/', getActiveBanners)

// 🔒 ADMIN ONLY
router.get('/all', protect, isAdmin, getAllBanners)
router.put('/reorder', protect, isAdmin, reorderBanners)
router.post('/', protect, isAdmin, uploadBannerImage, addBanner)
router.put('/:id/toggle', protect, isAdmin, toggleBannerActive)
router.put('/:id', protect, isAdmin, uploadBannerImage, updateBanner)
router.delete('/:id', protect, isAdmin, deleteBanner)

export default router