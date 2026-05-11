import mongoose from 'mongoose'

const testimonialSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: 100,
    },
    role: {
      type: String,
      required: [true, 'Role is required'],
      trim: true,
      maxlength: 150,
    },
    school: {
      type: String,
      required: [true, 'School / Campus is required'],
      trim: true,
      maxlength: 100,
    },
    text: {
      type: String,
      required: [true, 'Testimonial text is required'],
      trim: true,
      maxlength: 600,
    },
    rating: {
      type: Number,
      default: 5,
      min: 1,
      max: 5,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
)

const Testimonial = mongoose.model('Testimonial', testimonialSchema)
export default Testimonial