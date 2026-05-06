import Order from '../models/Order.js'
import Medicine from '../models/Medicine.js'
import User from '../models/User.js'
import { VALID_TRANSITIONS } from '../../shared/orderStatus.js'
import { ROLES } from '../../shared/roles.js'

export const placeOrder = async (req, res, next) => {
  try {
    const { items, addressId, razorpayOrderId } = req.body

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'No items provided', code: 'VALIDATION_ERROR' })
    }

    // Validate address belongs to the authenticated user
    const user = await User.findById(req.user._id)
    const address = user.addresses.id(addressId)
    if (!address) {
      return res.status(404).json({ success: false, message: 'Address not found', code: 'ADDRESS_NOT_FOUND' })
    }

    // Re-validate stock and build order items from DB prices
    const orderItems = []
    let totalAmount = 0
    let totalSavings = 0

    for (const item of items) {
      const med = await Medicine.findOne({ _id: item.medicineId, isActive: true })
      if (!med) {
        return res.status(400).json({
          success: false,
          message: `Medicine not found: ${item.medicineId}`,
          code: 'VALIDATION_ERROR',
        })
      }
      if (med.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${med.name}`,
          code: 'INSUFFICIENT_STOCK',
        })
      }

      const priceAtPurchase = med.discountedPrice
      const savings = item.isAlternateChosen
        ? Math.max(0, (item.originalPrice || 0) - priceAtPurchase)
        : 0

      orderItems.push({
        medicine: med._id,
        quantity: item.quantity,
        priceAtPurchase,
        isAlternateChosen: item.isAlternateChosen || false,
        originalMedicineId: item.originalMedicineId || null,
        savingsAmount: savings * item.quantity,
      })

      totalAmount += priceAtPurchase * item.quantity
      totalSavings += savings * item.quantity
    }

    const addressSnapshot = {
      label: address.label,
      line1: address.line1,
      line2: address.line2,
      city: address.city,
      state: address.state,
      pincode: address.pincode,
    }

    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      address: addressSnapshot,
      totalAmount,
      totalSavings,
      razorpayOrderId: razorpayOrderId || undefined,
      paymentStatus: 'pending',
    })

    await order.populate('items.medicine', 'name imageUrl brand slug')

    res.status(201).json({ success: true, order })
  } catch (err) {
    next(err)
  }
}

export const getMyOrders = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1)
    const limit = Math.min(20, parseInt(req.query.limit) || 10)
    const skip = (page - 1) * limit

    const query = { user: req.user._id }
    const total = await Order.countDocuments(query)
    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('items.medicine', 'name imageUrl brand slug')
      .lean()

    res.json({
      success: true,
      orders,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    })
  } catch (err) {
    next(err)
  }
}

export const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items.medicine', 'name imageUrl brand slug')
      .lean()

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found', code: 'NOT_FOUND' })
    }

    // Patients see only their own; pharmacist/admin see all
    const isOwner = order.user.toString() === req.user._id.toString()
    const isStaff = [ROLES.PHARMACIST, ROLES.ADMIN].includes(req.user.role)

    if (!isOwner && !isStaff) {
      return res.status(403).json({ success: false, message: 'Forbidden', code: 'FORBIDDEN' })
    }

    res.json({ success: true, order })
  } catch (err) {
    next(err)
  }
}

export const uploadPrescription = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded', code: 'VALIDATION_ERROR' })
    }

    const order = await Order.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { prescriptionUrl: req.file.path },
      { new: true }
    )

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found', code: 'NOT_FOUND' })
    }

    res.json({ success: true, prescriptionUrl: order.prescriptionUrl })
  } catch (err) {
    next(err)
  }
}

export const getOrderQueue = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1)
    const limit = Math.min(20, parseInt(req.query.limit) || 10)
    const skip = (page - 1) * limit

    const statusFilter = req.query.status
      ? { status: req.query.status }
      : { status: { $in: ['pending', 'processing'] } }

    const total = await Order.countDocuments(statusFilter)
    const orders = await Order.find(statusFilter)
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(limit)
      .populate('items.medicine', 'name imageUrl brand')
      .populate('user', 'name email phone')
      .lean()

    res.json({
      success: true,
      orders,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    })
  } catch (err) {
    next(err)
  }
}

export const updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body

    const order = await Order.findById(req.params.id)
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found', code: 'NOT_FOUND' })
    }

    const allowed = VALID_TRANSITIONS[order.status] || []
    if (!allowed.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot transition from '${order.status}' to '${status}'`,
        code: 'INVALID_TRANSITION',
      })
    }

    order.status = status
    await order.save()

    res.json({ success: true, order })
  } catch (err) {
    next(err)
  }
}
