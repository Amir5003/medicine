import bcrypt from 'bcryptjs'
import User from '../models/User.js'
import { generateToken, sendTokenCookie } from '../utils/token.js'
import { ROLES } from '../../shared/roles.js'

export const register = async (req, res, next) => {
  try {
    const { name, email, password, phone, inviteCode } = req.body

    const existing = await User.findOne({ email: email.toLowerCase() })
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'Email already registered',
        code: 'EMAIL_TAKEN',
      })
    }

    // Determine role — pharmacist invite code grants pharmacist role
    let role = ROLES.PATIENT
    if (inviteCode) {
      const validCode = process.env.PHARMACIST_INVITE_CODE
      if (!validCode || inviteCode !== validCode) {
        return res.status(400).json({
          success: false,
          message: 'Invalid invite code',
          code: 'INVALID_INVITE_CODE',
        })
      }
      role = ROLES.PHARMACIST
    }

    const user = await User.create({ name, email, password, phone, role })
    const token = generateToken(user._id)
    sendTokenCookie(res, token)

    res.status(201).json({
      success: true,
      user: { _id: user._id, name: user.name, email: user.email, role: user.role },
    })
  } catch (err) {
    next(err)
  }
}

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password')
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
        code: 'INVALID_CREDENTIALS',
      })
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
        code: 'INVALID_CREDENTIALS',
      })
    }

    const token = generateToken(user._id)
    sendTokenCookie(res, token)

    res.json({
      success: true,
      user: { _id: user._id, name: user.name, email: user.email, role: user.role },
    })
  } catch (err) {
    next(err)
  }
}

export const logout = (req, res) => {
  res.cookie('token', '', { httpOnly: true, expires: new Date(0) })
  res.json({ success: true, message: 'Logged out' })
}

export const me = (req, res) => {
  res.json({ success: true, user: req.user })
}

export const addAddress = async (req, res, next) => {
  try {
    const { label, line1, line2, city, state, pincode, isDefault } = req.body

    const user = await User.findById(req.user._id)

    // If this is the first address or explicitly set as default, clear others
    const shouldBeDefault = isDefault || user.addresses.length === 0
    if (shouldBeDefault) {
      user.addresses.forEach((addr) => { addr.isDefault = false })
    }

    user.addresses.push({ label, line1, line2, city, state, pincode, isDefault: shouldBeDefault })
    await user.save()

    res.status(201).json({ success: true, addresses: user.addresses })
  } catch (err) {
    next(err)
  }
}

export const deleteAddress = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
    const addr = user.addresses.id(req.params.addressId)
    if (!addr) {
      return res.status(404).json({ success: false, message: 'Address not found', code: 'NOT_FOUND' })
    }
    addr.deleteOne()
    await user.save()
    res.json({ success: true, addresses: user.addresses })
  } catch (err) {
    next(err)
  }
}
