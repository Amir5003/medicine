import mongoose from 'mongoose'
import { ORDER_STATUS } from '../../shared/orderStatus.js'

const orderItemSchema = new mongoose.Schema(
  {
    medicine: { type: mongoose.Schema.Types.ObjectId, ref: 'Medicine', required: true },
    quantity: { type: Number, required: true, min: 1 },
    priceAtPurchase: { type: Number, required: true },
    isAlternateChosen: { type: Boolean, default: false },
    originalMedicineId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Medicine',
      default: null,
    },
    savingsAmount: { type: Number, default: 0 },
  },
  { _id: false }
)

const addressSnapshotSchema = new mongoose.Schema(
  {
    label: String,
    line1: String,
    line2: String,
    city: String,
    state: String,
    pincode: String,
  },
  { _id: false }
)

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, unique: true },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    items: [orderItemSchema],
    address: addressSnapshotSchema,
    totalAmount: { type: Number, required: true },
    totalSavings: { type: Number, default: 0 },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed'],
      default: 'pending',
    },
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
    prescriptionUrl: { type: String },
    status: {
      type: String,
      enum: Object.values(ORDER_STATUS),
      default: ORDER_STATUS.PENDING,
      index: true,
    },
  },
  { timestamps: true }
)

orderSchema.index({ createdAt: -1 })

// Auto-generate orderNumber (MED-XXXXXXXX) before first save
orderSchema.pre('save', function (next) {
  if (!this.orderNumber) {
    const rand = Math.random().toString(36).substring(2, 10).toUpperCase()
    this.orderNumber = `MED-${rand}`
  }
  next()
})

const Order = mongoose.model('Order', orderSchema)
export default Order
