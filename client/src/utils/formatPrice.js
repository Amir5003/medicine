/**
 * Format a price in Indian Rupees.
 * @param {number} amount
 * @returns {string} e.g. "₹1,234"
 */
export const formatPrice = (amount) =>
  `₹${Number(amount).toLocaleString('en-IN')}`

export default formatPrice
