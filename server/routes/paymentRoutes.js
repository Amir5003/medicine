import { Router } from 'express'
import { createPaymentOrder, verifyPayment } from '../controllers/paymentController.js'
import { protect } from '../middleware/auth.js'

const router = Router()

router.post('/create-order', protect, createPaymentOrder)
router.post('/verify', protect, verifyPayment)

export default router
