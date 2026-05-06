import Fuse from 'fuse.js'
import Medicine from '../models/Medicine.js'
import { findAlternates } from '../services/saltAlternateService.js'

// ─── Public handlers ──────────────────────────────────────────────────────────

/**
 * GET /api/medicines/search?q=&category=
 * Runs Fuse.js fuzzy search over all active medicines.
 */
export const searchMedicines = async (req, res, next) => {
  try {
    const { q = '', category } = req.query
    const filter = { isActive: true }
    if (category) filter.category = category

    const medicines = await Medicine.find(filter).lean()

    if (!q.trim()) {
      return res.json({ success: true, data: medicines.slice(0, 20) })
    }

    const fuse = new Fuse(medicines, {
      keys: ['name', 'brand', 'genericName', 'salts.name'],
      threshold: 0.25,      // stricter: must be a closer match
      minMatchCharLength: 3, // ignore single/double char noise
      distance: 200,         // allow match anywhere in the string
      includeScore: true,
    })

    const results = fuse
      .search(q.trim())
      .slice(0, 20)
      .map((r) => r.item)

    res.json({ success: true, data: results })
  } catch (err) {
    next(err)
  }
}

/**
 * GET /api/medicines/trending
 * Returns top-10 medicines sorted by salesCount descending.
 */
export const getTrending = async (req, res, next) => {
  try {
    const medicines = await Medicine.find({ isActive: true })
      .sort({ salesCount: -1 })
      .limit(10)
      .lean()
    res.json({ success: true, data: medicines })
  } catch (err) {
    next(err)
  }
}

/**
 * GET /api/medicines/categories
 * Returns sorted list of distinct category values across active medicines.
 */
export const getCategories = async (req, res, next) => {
  try {
    const categories = await Medicine.distinct('category', { isActive: true })
    res.json({ success: true, data: categories.sort() })
  } catch (err) {
    next(err)
  }
}

/**
 * GET /api/medicines/:slug
 * Fetches medicine by slug and appends up to 5 cheaper salt alternates.
 */
export const getMedicineBySlug = async (req, res, next) => {
  try {
    const medicine = await Medicine.findOne({
      slug: req.params.slug,
      isActive: true,
    }).lean()

    if (!medicine) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Medicine not found' },
      })
    }

    const alternates = await findAlternates(medicine)
    res.json({ success: true, data: { ...medicine, alternates } })
  } catch (err) {
    next(err)
  }
}

// ─── Pharmacist / Admin write handlers ───────────────────────────────────────

/**
 * POST /api/medicines
 */
export const createMedicine = async (req, res, next) => {
  try {
    const data = { ...req.body }
    if (req.file) {
      data.imageUrl = req.file.path
      data.imagePublicId = req.file.filename
    }
    const medicine = await Medicine.create(data)
    res.status(201).json({ success: true, data: medicine })
  } catch (err) {
    next(err)
  }
}

/**
 * PUT /api/medicines/:id
 */
export const updateMedicine = async (req, res, next) => {
  try {
    const updates = { ...req.body }
    if (req.file) {
      updates.imageUrl = req.file.path
      updates.imagePublicId = req.file.filename
    }
    const medicine = await Medicine.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    )
    if (!medicine) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Medicine not found' },
      })
    }
    res.json({ success: true, data: medicine })
  } catch (err) {
    next(err)
  }
}

/**
 * PATCH /api/medicines/:id/stock
 */
export const patchStock = async (req, res, next) => {
  try {
    const { stock } = req.body
    if (stock === undefined || stock < 0) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'stock must be a non-negative number' },
      })
    }
    const medicine = await Medicine.findByIdAndUpdate(
      req.params.id,
      { stock },
      { new: true }
    )
    if (!medicine) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Medicine not found' },
      })
    }
    res.json({ success: true, data: medicine })
  } catch (err) {
    next(err)
  }
}

/**
 * DELETE /api/medicines/:id — soft delete (admin only)
 */
export const softDeleteMedicine = async (req, res, next) => {
  try {
    const medicine = await Medicine.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    )
    if (!medicine) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Medicine not found' },
      })
    }
    res.json({ success: true, message: 'Medicine deactivated', data: medicine })
  } catch (err) {
    next(err)
  }
}
