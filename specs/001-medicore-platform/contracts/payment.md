# API Contract: Payment

**Base path**: `/api/payment`  
**Auth**: patient (both endpoints)

---

## POST /api/payment/create-order

Creates a Razorpay order. Must be called **before** `POST /api/orders`.

The frontend uses the returned `razorpayOrderId` to open the Razorpay checkout modal, then passes `razorpayOrderId` to `POST /api/orders` and the payment IDs to `POST /api/payment/verify`.

### Request

```json
{
  "amount": 230,
  "currency": "INR",
  "items": [
    { "medicineId": "664abc...", "quantity": 2 }
  ]
}
```

| Field | Type | Required | Notes |
|---|---|---|---|
| `amount` | number | ✅ | Total in INR paise (e.g. `23000` for ₹230) — server re-calculates to prevent tampering |
| `currency` | string | ✅ | `"INR"` only |
| `items` | array | ✅ | Used for server-side price recalculation |

> **Security**: Server ignores the client-sent `amount` and calculates total from `items` to prevent price tampering.

### Response 201

```json
{
  "success": true,
  "razorpayOrderId": "order_Pxxxxxxxxxxxxxxxxxx",
  "amount": 23000,
  "currency": "INR",
  "keyId": "rzp_test_xxxxxxxxxx"
}
```

The frontend passes `keyId` directly to `new Razorpay({ key: keyId })`.

### Errors

| Status | Code | Reason |
|---|---|---|
| 400 | `INVALID_AMOUNT` | Computed amount ≤ 0 |
| 400 | `INSUFFICIENT_STOCK` | One or more items out of stock (pre-flight check) |
| 502 | `RAZORPAY_ERROR` | Razorpay API returned an error |

---

## POST /api/payment/verify

Verifies the Razorpay payment signature using HMAC-SHA256.  
On success: decrements stock atomically and updates the order `paymentStatus` to `paid`.

### Request

```json
{
  "razorpayOrderId": "order_Pxxxxxxxxxxxxxxxxxx",
  "razorpayPaymentId": "pay_Qxxxxxxxxxxxxxxxxxx",
  "razorpaySignature": "<hmac-sha256-hex>",
  "orderId": "664mongoid..."
}
```

| Field | Type | Required | Notes |
|---|---|---|---|
| `razorpayOrderId` | string | ✅ | From checkout modal success handler |
| `razorpayPaymentId` | string | ✅ | From checkout modal success handler |
| `razorpaySignature` | string | ✅ | From checkout modal success handler |
| `orderId` | ObjectId | ✅ | The MediCore internal order `_id` |

### Signature Verification Algorithm (server)

```js
const body = razorpayOrderId + '|' + razorpayPaymentId;
const expectedSignature = crypto
  .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
  .update(body)
  .digest('hex');
const isValid = expectedSignature === razorpaySignature;
```

### Response 200

```json
{
  "success": true,
  "order": {
    "_id": "...",
    "orderNumber": "MC-000001",
    "status": "processing",
    "paymentStatus": "paid",
    "razorpayPaymentId": "pay_Qxxx"
  }
}
```

Stock is decremented here (not at order creation).

### Errors

| Status | Code | Reason |
|---|---|---|
| 400 | `INVALID_SIGNATURE` | HMAC verification failed |
| 400 | `ALREADY_PAID` | Order already has `paymentStatus: "paid"` |
| 404 | `ORDER_NOT_FOUND` | `orderId` does not match an existing order |

---

## Payment Flow Diagram

```
Patient (browser)
  │
  ├─► POST /api/payment/create-order  ──►  Razorpay API (create order)
  │        ◄─── razorpayOrderId ────────────────────────────────────────
  │
  ├─► Razorpay checkout modal opens (razorpayOrderId + keyId)
  │        ◄─── user pays, modal returns { razorpayOrderId, razorpayPaymentId, razorpaySignature }
  │
  ├─► POST /api/orders               (with razorpayOrderId) ── creates MediCore order
  │        ◄─── orderId ────────────────────────────────
  │
  └─► POST /api/payment/verify       (with all 3 Razorpay IDs + orderId)
           ◄─── success: stock decremented, order.paymentStatus = "paid"
```
