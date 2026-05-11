import mongoose from 'mongoose'

const featureCardSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: 100,
  },
  desc: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: 300,
  },
  imageUrl: {
    type: String,
    required: [true, 'Image URL is required'],
  },
  cloudinaryPublicId: {
    type: String,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  order: {
    type: Number,
    default: 0,
  },
}, { timestamps: true })

const FeatureCard = mongoose.model('FeatureCard', featureCardSchema)
export default FeatureCard