import mongoose from 'mongoose'

const saltSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    normalizedName: { type: String, unique: true, lowercase: true, trim: true },
    description: { type: String, trim: true },
  },
  { timestamps: true }
)

// Auto-populate normalizedName before save
saltSchema.pre('save', function (next) {
  if (this.isModified('name')) {
    this.normalizedName = this.name.toLowerCase().trim().replace(/\s+/g, ' ')
  }
  next()
})

saltSchema.index({ normalizedName: 1 })

const Salt = mongoose.model('Salt', saltSchema)

export default Salt
