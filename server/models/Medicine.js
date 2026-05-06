import mongoose from 'mongoose'
import slugify from 'slugify'

/** Normalize a salt name for fingerprinting: lowercase, trim, collapse spaces */
const normalizeSaltName = (str) =>
  str
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')

const saltSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    strength: { type: String, required: true, trim: true },
  },
  { _id: false }
)

const medicineSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, lowercase: true },
    brand: { type: String, required: true, trim: true },
    genericName: { type: String, trim: true },
    category: { type: String, required: true, trim: true },
    description: { type: String },
    mrp: { type: Number, required: true, min: 0 },
    discountedPrice: { type: Number, required: true, min: 0 },
    stock: { type: Number, required: true, min: 0, default: 0 },
    requiresPrescription: { type: Boolean, default: false },
    imageUrl: { type: String },
    imagePublicId: { type: String },
    salts: [saltSchema],
    saltFingerprint: { type: String },
    isActive: { type: Boolean, default: true },
    salesCount: { type: Number, default: 0 },
  },
  { timestamps: true }
)

// Auto-generate slug and saltFingerprint before save
medicineSchema.pre('save', function (next) {
  if (this.isModified('name') || this.isNew) {
    this.slug = slugify(this.name, { lower: true, strict: true })
  }
  if (this.isModified('salts') || this.isNew) {
    this.saltFingerprint = this.salts
      .map((s) => `${normalizeSaltName(s.name)}_${s.strength}`)
      .sort()
      .join('|')
  }
  next()
})

medicineSchema.index({ slug: 1 }, { unique: true })
medicineSchema.index({ saltFingerprint: 1 })
medicineSchema.index({ category: 1 })
medicineSchema.index({ isActive: 1 })
medicineSchema.index({ salesCount: -1 })

const Medicine = mongoose.model('Medicine', medicineSchema)
export default Medicine
