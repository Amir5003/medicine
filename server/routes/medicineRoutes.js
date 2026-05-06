import { Router } from 'express'
import {
  searchMedicines,
  getTrending,
  getCategories,
  getMedicineBySlug,
  createMedicine,
  updateMedicine,
  patchStock,
  softDeleteMedicine,
} from '../controllers/medicineController.js'
import { protect } from '../middleware/auth.js'
import { authorize } from '../middleware/role.js'
import { uploadMedicineImage } from '../config/cloudinary.js'
import { ROLES } from '../../shared/roles.js'

const router = Router()

// ─── Public routes ────────────────────────────────────────────────────────────
// NOTE: /search, /trending, /categories must come BEFORE /:slug to avoid 'search'
//       being matched as a slug parameter.
router.get('/search', searchMedicines)
router.get('/trending', getTrending)
router.get('/categories', getCategories)
router.get('/:slug', getMedicineBySlug)

// ─── Pharmacist + Admin write routes ─────────────────────────────────────────
router.post(
  '/',
  protect,
  authorize(ROLES.PHARMACIST, ROLES.ADMIN),
  uploadMedicineImage.single('image'),
  createMedicine
)

router.put(
  '/:id',
  protect,
  authorize(ROLES.PHARMACIST, ROLES.ADMIN),
  uploadMedicineImage.single('image'),
  updateMedicine
)

router.patch(
  '/:id/stock',
  protect,
  authorize(ROLES.PHARMACIST, ROLES.ADMIN),
  patchStock
)

// ─── Admin-only routes ────────────────────────────────────────────────────────
router.delete('/:id', protect, authorize(ROLES.ADMIN), softDeleteMedicine)

export default router
