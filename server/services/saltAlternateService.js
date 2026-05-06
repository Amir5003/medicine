import Medicine from '../models/Medicine.js'

/**
 * Find up to `limit` cheaper salt-equivalent medicines for a given medicine.
 * Results are sorted cheapest-first and include a computed savingsPercent
 * relative to the original medicine's discountedPrice.
 *
 * @param {object} medicine - Lean Medicine document (must have saltFingerprint + discountedPrice)
 * @param {number} limit
 * @returns {Promise<Array>}
 */
export const findAlternates = async (medicine, limit = 5) => {
  if (!medicine.saltFingerprint) return []

  const alternates = await Medicine.find({
    saltFingerprint: medicine.saltFingerprint,
    _id: { $ne: medicine._id },
    stock: { $gt: 0 },
    isActive: true,
  })
    .sort({ discountedPrice: 1 })
    .limit(limit)
    .lean()

  return alternates.map((alt) => ({
    ...alt,
    savingsPercent:
      medicine.discountedPrice > 0
        ? Math.round(
            ((medicine.discountedPrice - alt.discountedPrice) /
              medicine.discountedPrice) *
              100
          )
        : 0,
  }))
}
