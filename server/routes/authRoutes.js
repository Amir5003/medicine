import { Router } from 'express'
import { body } from 'express-validator'
import { register, login, logout, me, addAddress, deleteAddress } from '../controllers/authController.js'
import { protect } from '../middleware/auth.js'
import { runValidation } from '../middleware/validate.js'

const router = Router()

router.post(
  '/register',
  [
    body('name').trim().isLength({ min: 2, max: 80 }).withMessage('Name must be 2–80 characters'),
    body('email').isEmail().normalizeEmail().withMessage('A valid email is required'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  ],
  runValidation,
  register
)

router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail().withMessage('Email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  runValidation,
  login
)

router.post('/logout', logout)

router.get('/me', protect, me)

router.post(
  '/addresses',
  protect,
  [
    body('line1').notEmpty().withMessage('Address line 1 is required'),
    body('city').notEmpty().withMessage('City is required'),
    body('state').notEmpty().withMessage('State is required'),
    body('pincode').matches(/^\d{6}$/).withMessage('Pincode must be 6 digits'),
  ],
  runValidation,
  addAddress
)

router.delete('/addresses/:addressId', protect, deleteAddress)

export default router
