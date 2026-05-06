import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/**
 * Cart store with localStorage persistence.
 * Guest cart survives page refreshes and is preserved when user logs in.
 */
export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],

      /**
       * Add a medicine to cart. If already present, increment quantity.
       * @param {object} medicine - Medicine document
       * @param {boolean} isAlternate - Whether this is a salt alternate choice
       * @param {string|null} originalMedicineId - The medicine that was replaced
       * @param {number|null} overrideSavings - Explicit savings in ₹ (e.g. originalPrice - alt.discountedPrice)
       */
      addItem: (medicine, isAlternate = false, originalMedicineId = null, overrideSavings = null) => {
        if (medicine.stock <= 0) return

        const existing = get().items.find((i) => i._id === medicine._id)

        if (existing) {
          set({
            items: get().items.map((i) =>
              i._id === medicine._id ? { ...i, quantity: i.quantity + 1 } : i
            ),
          })
        } else {
          const savingsAmount =
            overrideSavings !== null
              ? Math.max(0, overrideSavings)
              : isAlternate
              ? Math.max(0, (medicine.mrp || 0) - medicine.discountedPrice)
              : 0

          set({
            items: [
              ...get().items,
              {
                _id: medicine._id,
                name: medicine.name,
                brand: medicine.brand,
                imageUrl: medicine.imageUrl,
                mrp: medicine.mrp,
                discountedPrice: medicine.discountedPrice,
                requiresPrescription: medicine.requiresPrescription,
                stock: medicine.stock,
                quantity: 1,
                isAlternateChosen: isAlternate,
                originalMedicineId,
                savingsAmount,
              },
            ],
          })
        }
      },

      removeItem: (id) =>
        set({ items: get().items.filter((i) => i._id !== id) }),

      updateQty: (id, qty) => {
        if (qty < 1) return
        set({
          items: get().items.map((i) => (i._id === id ? { ...i, quantity: qty } : i)),
        })
      },

      clearCart: () => set({ items: [] }),

      totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

      totalAmount: () =>
        get().items.reduce((sum, i) => sum + i.discountedPrice * i.quantity, 0),

      totalSavings: () =>
        get().items.reduce((sum, i) => sum + i.savingsAmount * i.quantity, 0),
    }),
    { name: 'medicore-cart' }
  )
)

export default useCartStore
