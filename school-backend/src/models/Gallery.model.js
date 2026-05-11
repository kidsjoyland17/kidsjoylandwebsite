import mongoose from 'mongoose'

const gallerySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: 120,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
      default: '',
    },
    imageUrl: {
      type: String,
      required: [true, 'Image URL is required'],
    },
    cloudinaryPublicId: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: [
        'sports',
        'arts',
        'music',
        'dance',
        'field-trip',
        'classroom',
        'events',
        'cultural',
        'graduation',
        'general',
      ],
      default: 'general',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      default: 0,
    },
    takenAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
)

// Index for public gallery queries (active only, sorted by order)
gallerySchema.index({ isActive: 1, order: 1, createdAt: 1 })
// Index for category filtering
gallerySchema.index({ category: 1, isActive: 1 })

const Gallery = mongoose.model('Gallery', gallerySchema)
export default Gallery