import Medicine from '../models/Medicine.js'
import Order from '../models/Order.js'

/**
 * GET /api/pharmacist/dashboard
 * Aggregated KPI stats for the pharmacist home screen.
 */
export const getPharmacistDashboard = async (req, res, next) => {
  try {
    const todayStart = new Date()
    todayStart.setUTCHours(0, 0, 0, 0)

    const [
      pendingOrders,
      processingOrders,
      lowStockCount,
      todayDeliveries,
      totalMedicines,
    ] = await Promise.all([
      Order.countDocuments({ status: 'pending' }),
      Order.countDocuments({ status: 'processing' }),
      Medicine.countDocuments({ stock: { $lt: 10 }, isActive: true }),
      Order.countDocuments({ status: 'delivered', updatedAt: { $gte: todayStart } }),
      Medicine.countDocuments({ isActive: true }),
    ])

    res.json({
      success: true,
      stats: {
        pendingOrders,
        processingOrders,
        lowStockCount,
        todayDeliveries,
        totalMedicines,
      },
    })
  } catch (err) {
    next(err)
  }
}

/**
 * GET /api/pharmacist/inventory
 * Paginated medicine inventory with optional filters.
 */
export const getInventory = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1)
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20))

    if (parseInt(req.query.limit) > 100) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_LIMIT', message: 'limit cannot exceed 100' },
      })
    }

    const filter = {}
    if (req.query.category) filter.category = req.query.category
    if (req.query.lowStock === 'true') filter.stock = { $lt: 10 }
    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { brand: { $regex: req.query.search, $options: 'i' } },
      ]
    }

    const total = await Medicine.countDocuments(filter)
    const medicines = await Medicine.find(filter)
      .sort({ name: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean()

    res.json({
      success: true,
      total,
      page,
      pages: Math.ceil(total / limit),
      medicines,
    })
  } catch (err) {
    next(err)
  }
}

/**
 * PATCH /api/pharmacist/inventory/:id
 * Update stock level for a single medicine.
 */
export const patchInventoryStock = async (req, res, next) => {
  try {
    const { stock } = req.body

    if (stock === undefined || stock === null || !Number.isInteger(Number(stock)) || Number(stock) < 0) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_STOCK', message: 'stock must be a non-negative integer' },
      })
    }

    const medicine = await Medicine.findByIdAndUpdate(
      req.params.id,
      { stock: Number(stock) },
      { new: true, runValidators: true }
    ).select('_id name stock')

    if (!medicine) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Medicine not found' },
      })
    }

    res.json({ success: true, medicine })
  } catch (err) {
    next(err)
  }
}
