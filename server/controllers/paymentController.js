import { razorpayCreateOrder, verifySignature } from '../services/paymentService.js'
import Order from '../models/Order.js'
import Medicine from '../models/Medicine.js'

export const createPaymentOrder = async (req, res, next) => {
  try {
    const { items } = req.body

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No items provided',
        code: 'VALIDATION_ERROR',
      })
    }

    const order = await razorpayCreateOrder({ items })
    res.json({ success: true, order })
  } catch (err) {
    // Propagate structured errors from paymentService
    if (err.status) {
      return res.status(err.status).json({ success: false, message: err.message, code: err.code })
    }
    next(err)
  }
}

export const verifyPayment = async (req, res, next) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, orderId } = req.body

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature || !orderId) {
      return res.status(400).json({
        success: false,
        message: 'Missing required payment fields',
        code: 'VALIDATION_ERROR',
      })
    }

    const { isValid } = verifySignature({ razorpayOrderId, razorpayPaymentId, razorpaySignature })
    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'Payment signature verification failed',
        code: 'INVALID_SIGNATURE',
      })
    }

    const order = await Order.findOneAndUpdate(
      { _id: orderId, user: req.user._id },
      { paymentStatus: 'paid', razorpayOrderId, razorpayPaymentId },
      { new: true }
    )

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found', code: 'NOT_FOUND' })
    }

    // Decrement stock and increment salesCount atomically per item
    for (const item of order.items) {
      await Medicine.findByIdAndUpdate(item.medicine, {
        $inc: { stock: -item.quantity, salesCount: item.quantity },
      })
    }

    res.json({ success: true, order })
  } catch (err) {
    next(err)
  }
}
