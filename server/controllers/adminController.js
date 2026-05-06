import User from '../models/User.js'
import Medicine from '../models/Medicine.js'
import Order from '../models/Order.js'
import Salt from '../models/Salt.js'
import { ROLES } from '../../shared/roles.js'

// ─── Dashboard ────────────────────────────────────────────────────────────────

/**
 * GET /api/admin/dashboard
 * Platform-wide analytics aggregated in parallel.
 */
export const getDashboard = async (req, res, next) => {
  try {
    const todayStart = new Date()
    todayStart.setUTCHours(0, 0, 0, 0)

    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const [
      totalUsers,
      totalMedicines,
      totalOrders,
      revenueTodayResult,
      revenueLast30Result,
      pendingOrders,
      lowStockMedicines,
      totalSalts,
    ] = await Promise.all([
      User.countDocuments(),
      Medicine.countDocuments({ isActive: true }),
      Order.countDocuments(),
      Order.aggregate([
        { $match: { paymentStatus: 'paid', createdAt: { $gte: todayStart } } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } },
      ]),
      Order.aggregate([
        { $match: { paymentStatus: 'paid', createdAt: { $gte: thirtyDaysAgo } } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } },
      ]),
      Order.countDocuments({ status: 'pending' }),
      Medicine.countDocuments({ stock: { $lt: 10 }, isActive: true }),
      Salt.countDocuments(),
    ])

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalMedicines,
        totalOrders,
        revenueToday: revenueTodayResult[0]?.total ?? 0,
        revenueLast30Days: revenueLast30Result[0]?.total ?? 0,
        pendingOrders,
        lowStockMedicines,
        totalSalts,
      },
    })
  } catch (err) {
    next(err)
  }
}

// ─── Users ────────────────────────────────────────────────────────────────────

/**
 * GET /api/admin/users
 */
export const getUsers = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1)
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20))

    const filter = {}
    if (req.query.role && Object.values(ROLES).includes(req.query.role)) {
      filter.role = req.query.role
    }
    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } },
      ]
    }

    const total = await User.countDocuments(filter)
    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean()

    res.json({ success: true, total, page, pages: Math.ceil(total / limit), users })
  } catch (err) {
    next(err)
  }
}

/**
 * PATCH /api/admin/users/:id/role
 */
export const changeUserRole = async (req, res, next) => {
  try {
    const { role } = req.body

    if (!role || !Object.values(ROLES).includes(role)) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_ROLE', message: `role must be one of: ${Object.values(ROLES).join(', ')}` },
      })
    }

    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        error: { code: 'SELF_DEMOTION', message: 'You cannot change your own role' },
      })
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select('-password')

    if (!user) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'User not found' },
      })
    }

    res.json({ success: true, user })
  } catch (err) {
    next(err)
  }
}

// ─── Salts ────────────────────────────────────────────────────────────────────

/**
 * GET /api/admin/salts
 */
export const getSalts = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1)
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20))

    const filter = {}
    if (req.query.search) {
      filter.name = { $regex: req.query.search, $options: 'i' }
    }

    const total = await Salt.countDocuments(filter)
    const salts = await Salt.find(filter)
      .sort({ name: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean()

    // Compute medicineCount per salt (count medicines whose salts.name matches)
    const saltNames = salts.map((s) => s.name)
    const counts = await Medicine.aggregate([
      { $unwind: '$salts' },
      { $match: { 'salts.name': { $in: saltNames } } },
      { $group: { _id: '$salts.name', count: { $sum: 1 } } },
    ])
    const countMap = Object.fromEntries(counts.map((c) => [c._id, c.count]))

    const saltsWithCount = salts.map((s) => ({ ...s, medicineCount: countMap[s.name] ?? 0 }))

    res.json({ success: true, total, page, pages: Math.ceil(total / limit), salts: saltsWithCount })
  } catch (err) {
    next(err)
  }
}

/**
 * POST /api/admin/salts
 */
export const createSalt = async (req, res, next) => {
  try {
    const { name, description } = req.body

    if (!name?.trim()) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'name is required' },
      })
    }

    const normalized = name.toLowerCase().trim().replace(/\s+/g, ' ')
    const exists = await Salt.findOne({ normalizedName: normalized })
    if (exists) {
      return res.status(409).json({
        success: false,
        error: { code: 'DUPLICATE_SALT', message: 'A salt with this name already exists' },
      })
    }

    const salt = await Salt.create({ name: name.trim(), description })
    res.status(201).json({ success: true, salt })
  } catch (err) {
    next(err)
  }
}

/**
 * PUT /api/admin/salts/:id
 */
export const updateSalt = async (req, res, next) => {
  try {
    const { name, description } = req.body
    const updates = {}
    if (name) updates.name = name.trim()
    if (description !== undefined) updates.description = description

    const salt = await Salt.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true })
    if (!salt) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Salt not found' },
      })
    }

    res.json({ success: true, salt })
  } catch (err) {
    next(err)
  }
}

/**
 * DELETE /api/admin/salts/:id
 * Blocked if any medicine references this salt by name.
 */
export const deleteSalt = async (req, res, next) => {
  try {
    const salt = await Salt.findById(req.params.id)
    if (!salt) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Salt not found' },
      })
    }

    const refCount = await Medicine.countDocuments({ 'salts.name': salt.name, isActive: true })
    if (refCount > 0) {
      return res.status(409).json({
        success: false,
        error: { code: 'SALT_IN_USE', message: `Salt is referenced by ${refCount} active medicine(s)` },
      })
    }

    await salt.deleteOne()
    res.json({ success: true, message: 'Salt deleted' })
  } catch (err) {
    next(err)
  }
}

// ─── Medicines (admin list, includes inactive) ────────────────────────────────

/**
 * GET /api/admin/medicines
 * Returns paginated medicines including inactive ones.
 */
export const getMedicines = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1)
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20))

    const filter = {}
    if (req.query.isActive !== undefined && req.query.isActive !== '') {
      filter.isActive = req.query.isActive === 'true'
    }
    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { brand: { $regex: req.query.search, $options: 'i' } },
      ]
    }

    const total = await Medicine.countDocuments(filter)
    const medicines = await Medicine.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean()

    res.json({ success: true, total, page, pages: Math.ceil(total / limit), data: medicines })
  } catch (err) {
    next(err)
  }
}

// ─── Orders ────────────────────────────────────────────────────────────────────

/**
 * GET /api/admin/orders
 * All orders across all users with filters.
 */
export const getAllOrders = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1)
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20))

    const filter = {}
    if (req.query.status) filter.status = req.query.status
    if (req.query.userId) filter.user = req.query.userId
    if (req.query.from || req.query.to) {
      filter.createdAt = {}
      if (req.query.from) filter.createdAt.$gte = new Date(req.query.from)
      if (req.query.to) filter.createdAt.$lte = new Date(req.query.to)
    }

    const total = await Order.countDocuments(filter)
    const orders = await Order.find(filter)
      .populate('user', 'name email')
      .populate('items.medicine', 'name imageUrl brand')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean()

    res.json({ success: true, total, page, pages: Math.ceil(total / limit), orders })
  } catch (err) {
    next(err)
  }
}
