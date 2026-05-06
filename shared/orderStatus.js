/**
 * Order status enum shared between server and client.
 * Status transitions (forward-only):
 *   pending → processing → shipped → delivered
 *   pending | processing → cancelled
 */
export const ORDER_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
}

/** Valid forward transitions for a given status */
export const VALID_TRANSITIONS = {
  pending: ['processing', 'cancelled'],
  processing: ['shipped', 'cancelled'],
  shipped: ['delivered'],
  delivered: [],
  cancelled: [],
}

export default ORDER_STATUS
