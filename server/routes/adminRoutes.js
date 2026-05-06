import { Router } from 'express'
import { protect } from '../middleware/auth.js'
import { authorize } from '../middleware/role.js'
import { ROLES } from '../../shared/roles.js'
import {
  getDashboard,
  getUsers,
  changeUserRole,
  getSalts,
  createSalt,
  updateSalt,
  deleteSalt,
  getAllOrders,
  getMedicines,
} from '../controllers/adminController.js'
import { softDeleteMedicine, updateMedicine } from '../controllers/medicineController.js'

const router = Router()

// All admin routes require authentication + admin role
router.use(protect, authorize(ROLES.ADMIN))

// Dashboard
router.get('/dashboard', getDashboard)

// Users
router.get('/users', getUsers)
router.patch('/users/:id/role', changeUserRole)

// Salts
router.get('/salts', getSalts)
router.post('/salts', createSalt)
router.put('/salts/:id', updateSalt)
router.delete('/salts/:id', deleteSalt)

// Orders
router.get('/orders', getAllOrders)

// Medicines (admin list + soft-delete / reactivate)
router.get('/medicines', getMedicines)
router.delete('/medicines/:id', softDeleteMedicine)
router.put('/medicines/:id', updateMedicine)

export default router
