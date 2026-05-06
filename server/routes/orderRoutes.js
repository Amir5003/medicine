import { Router } from 'express'
import {
  placeOrder,
  getMyOrders,
  getOrderById,
  uploadPrescription,
  getOrderQueue,
  updateOrderStatus,
} from '../controllers/orderController.js'
import { protect } from '../middleware/auth.js'
import { authorize } from '../middleware/role.js'
import { uploadPrescription as uploadMiddleware } from '../config/cloudinary.js'
import { ROLES } from '../../shared/roles.js'

const router = Router()

router.post('/', protect, placeOrder)
router.get('/', protect, getMyOrders)
router.get('/queue', protect, authorize(ROLES.PHARMACIST, ROLES.ADMIN), getOrderQueue)
router.get('/:id', protect, getOrderById)
router.post('/:id/prescription', protect, uploadMiddleware.single('prescription'), uploadPrescription)
router.patch('/:id/status', protect, authorize(ROLES.PHARMACIST, ROLES.ADMIN), updateOrderStatus)

export default router
