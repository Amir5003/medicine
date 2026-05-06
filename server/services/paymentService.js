import Razorpay from 'razorpay'
import crypto from 'crypto'
import Medicine from '../models/Medicine.js'

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
})

/**
 * Create a Razorpay order. Recalculates total from DB prices to prevent
 * client-side price tampering. Throws on stock issues or inactive medicines.
 *
 * @param {{ items: Array<{ medicineId: string, quantity: number }> }} param0
 * @returns {Promise<object>} Razorpay order object
 */
export const razorpayCreateOrder = async ({ items }) => {
  const medicineIds = items.map((i) => i.medicineId)
  const medicines = await Medicine.find({ _id: { $in: medicineIds }, isActive: true }).lean()

  const medicineMap = Object.fromEntries(medicines.map((m) => [m._id.toString(), m]))

  let totalPaise = 0
  for (const item of items) {
    const med = medicineMap[item.medicineId.toString()]
    if (!med) {
      throw Object.assign(new Error(`Medicine not found or inactive`), { code: 'VALIDATION_ERROR', status: 400 })
    }
    if (med.stock < item.quantity) {
      throw Object.assign(new Error(`Insufficient stock for ${med.name}`), { code: 'INSUFFICIENT_STOCK', status: 400 })
    }
    // Razorpay expects amount in paise (smallest currency unit)
    totalPaise += Math.round(med.discountedPrice * item.quantity * 100)
  }

  const order = await razorpay.orders.create({
    amount: totalPaise,
    currency: 'INR',
    receipt: `medicore_${Date.now()}`,
  })

  return order
}

/**
 * Verify a Razorpay payment signature using HMAC-SHA256.
 * @returns {{ isValid: boolean }}
 */
export const verifySignature = ({ razorpayOrderId, razorpayPaymentId, razorpaySignature }) => {
  const body = `${razorpayOrderId}|${razorpayPaymentId}`
  const expected = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest('hex')
  return { isValid: expected === razorpaySignature }
}
