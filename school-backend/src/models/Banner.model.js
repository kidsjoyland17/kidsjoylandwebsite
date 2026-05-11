import mongoose from 'mongoose'

const bannerSchema = new mongoose.Schema({
  label: {
    type: String,
    required: [true, 'Banner label is required'],
    trim: true,
    maxlength: 100
  },
  title: {
    type: String,
    trim: true,
    maxlength: 150,
    default: ''
  },
  highlight: {
    type: String,
    trim: true,
    maxlength: 100,
    default: ''
  },
  imageUrl: {
    type: String,
    required: [true, 'Image URL is required']
  },
  cloudinaryPublicId: {
    type: String,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  order: {
    type: Number,
    default: 0
  }
}, { timestamps: true })

const Banner = mongoose.model('Banner', bannerSchema)
export default Banner