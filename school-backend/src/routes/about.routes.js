import express from 'express'
import {
  getActiveFeatures,
  getAllFeatures,
  addFeature,
  updateFeature,
  toggleFeature,
  deleteFeature,
} from '../controllers/about.controller.js'
import { protect }          from '../middleware/auth.middleware.js'
import { isAdmin }          from '../middleware/role.middleware.js'
import { uploadBannerImage } from '../middleware/upload.middleware.js'  // reuse existing uploader

const router = express.Router()

// ✅ PUBLIC
router.get('/features',           getActiveFeatures)

// 🔒 ADMIN ONLY
router.get('/features/all',              protect, isAdmin, getAllFeatures)
router.post('/features',                 protect, isAdmin, uploadBannerImage, addFeature)
router.put('/features/:id/toggle',       protect, isAdmin, toggleFeature)
router.put('/features/:id',              protect, isAdmin, uploadBannerImage, updateFeature)
router.delete('/features/:id',           protect, isAdmin, deleteFeature)

export default router