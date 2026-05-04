# API Contract: Orders

**Base path**: `/api/orders`  
**Auth**: all endpoints require authentication

---

## POST /api/orders

**Auth**: patient

Places a new order. Only allowed when stock is available for all items. Stock is **not** decremented here — only after Razorpay payment is verified.

### Request

```json
{
  "items": [
    {
      "medicineId": "664abc123...",
      "quantity": 2,
      "isAlternateChosen": true
    }
  ],
  "addressId": "664def456...",
  "razorpayOrderId": "order_Pxxxxxxxxx"
}
```

| Field | Type | Required | Notes |
|---|---|---|---|
| `items` | array | ✅ | 1–20 items |
| `items[].medicineId` | ObjectId | ✅ | Must reference active medicine |
| `items[].quantity` | number | ✅ | 1–10 per item |
| `items[].isAlternateChosen` | boolean | optional | `true` if user picked a salt alternate |
| `addressId` | ObjectId | ✅ | Must belong to the authenticated user |
| `razorpayOrderId` | string | ✅ | Created by `POST /api/payment/create-order` |

### Response 201

```json
{
  "success": true,
  "order": {
    "_id": "...",
    "orderNumber": "MC-000001",
    "status": "pending",
    "totalAmount": 230,
    "items": [
      {
        "medicine": { "_id": "...", "name": "Calpol 650", "imageUrl": "..." },
        "quantity": 2,
        "priceAtPurchase": 60,
        "isAlternateChosen": true
      }
    ],
    "address": { "line1": "...", "city": "...", "pincode": "..." },
    "createdAt": "2026-05-04T10:00:00Z"
  }
}
```

### Errors

| Status | Code | Reason |
|---|---|---|
| 400 | `VALIDATION_ERROR` | Missing/invalid fields |
| 400 | `INSUFFICIENT_STOCK` | One or more items exceed available stock |
| 400 | `PRESCRIPTION_REQUIRED` | Cart contains a prescription-only medicine but no prescription uploaded |
| 404 | `ADDRESS_NOT_FOUND` | `addressId` not found for this user |

---

## GET /api/orders

**Auth**: patient

Returns paginated order history for the authenticated patient.

### Query Parameters

| Param | Type | Default | Notes |
|---|---|---|---|
| `page` | number | 1 | |
| `limit` | number | 10 | max 50 |
| `status` | string | — | filter by status enum |

### Response 200

```json
{
  "success": true,
  "total": 5,
  "page": 1,
  "pages": 1,
  "orders": [
    {
      "_id": "...",
      "orderNumber": "MC-000001",
      "status": "delivered",
      "totalAmount": 230,
      "createdAt": "2026-05-04T10:00:00Z",
      "itemCount": 2
    }
  ]
}
```

---

## GET /api/orders/:id

**Auth**: patient (own order) or pharmacist/admin

Returns full order detail.

### Response 200

```json
{
  "success": true,
  "order": {
    "_id": "...",
    "orderNumber": "MC-000001",
    "status": "processing",
    "totalAmount": 230,
    "items": [ /* array of OrderItems with populated medicine */ ],
    "address": { "..." },
    "prescriptionUrl": null,
    "paymentStatus": "paid",
    "razorpayOrderId": "order_Pxxx",
    "razorpayPaymentId": "pay_Pxxx",
    "createdAt": "..."
  }
}
```

### Errors

| Status | Code | Reason |
|---|---|---|
| 403 | `FORBIDDEN` | Patient trying to access another user's order |
| 404 | `NOT_FOUND` | Order not found |

---

## POST /api/orders/:id/prescription

**Auth**: patient (own order only)

Uploads a prescription image for a prescription-only order.

### Request (multipart/form-data)

| Field | Type | Notes |
|---|---|---|
| `prescription` | file | jpg/png/pdf ≤10MB |

### Response 200

```json
{
  "success": true,
  "prescriptionUrl": "https://res.cloudinary.com/..."
}
```

### Errors

| Status | Code | Reason |
|---|---|---|
| 400 | `NO_PRESCRIPTION_NEEDED` | Order has no prescription-required items |
| 400 | `ALREADY_UPLOADED` | Prescription already on file |
| 413 | `FILE_TOO_LARGE` | File exceeds 10MB |

---

## GET /api/orders/queue

**Auth**: pharmacist or admin

Returns all orders awaiting pharmacist action (status `pending` or `processing`), sorted by `createdAt` asc.

### Query Parameters

| Param | Default | Notes |
|---|---|---|
| `page` | 1 | |
| `limit` | 20 | max 100 |
| `status` | `pending,processing` | comma-separated filter |

### Response 200

```json
{
  "success": true,
  "total": 12,
  "orders": [ /* full order objects */ ]
}
```

---

## PATCH /api/orders/:id/status

**Auth**: pharmacist or admin

Updates the order status. Valid transitions:

```
pending → processing → shipped → delivered
pending → cancelled
processing → cancelled
```

### Request

```json
{
  "status": "processing",
  "note": "Prescription verified"
}
```

### Response 200

```json
{
  "success": true,
  "order": { "_id": "...", "status": "processing", "..." }
}
```

### Errors

| Status | Code | Reason |
|---|---|---|
| 400 | `INVALID_TRANSITION` | Status change not allowed (e.g. `delivered → pending`) |
| 404 | `NOT_FOUND` | Order not found |
