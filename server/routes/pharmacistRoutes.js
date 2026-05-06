import { Router } from 'express'
import {
  getPharmacistDashboard,
  getInventory,
  patchInventoryStock,
} from '../controllers/pharmacistController.js'
import { getOrderQueue, updateOrderStatus } from '../controllers/orderController.js'
import { protect } from '../middleware/auth.js'
import { authorize } from '../middleware/role.js'
import { ROLES } from '../../shared/roles.js'

const router = Router()

// All pharmacist routes require authentication + pharmacist or admin role
router.use(protect, authorize(ROLES.PHARMACIST, ROLES.ADMIN))

router.get('/dashboard', getPharmacistDashboard)

router.get('/inventory', getInventory)
router.patch('/inventory/:id', patchInventoryStock)

// Orders queue — delegates to the same orderController handlers
router.get('/orders', getOrderQueue)
router.patch('/orders/:id/status', updateOrderStatus)

export default router
