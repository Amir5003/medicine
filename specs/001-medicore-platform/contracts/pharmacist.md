# API Contract: Pharmacist

**Base path**: `/api/pharmacist`  
**Auth**: `pharmacist` or `admin` role required for all endpoints

---

## GET /api/pharmacist/dashboard

Returns aggregated KPI stats for the pharmacist home screen.

### Response 200

```json
{
  "success": true,
  "stats": {
    "pendingOrders": 7,
    "processingOrders": 3,
    "lowStockCount": 4,
    "todayDeliveries": 5,
    "totalMedicines": 87
  }
}
```

- `pendingOrders` — orders with `status: "pending"`
- `processingOrders` — orders with `status: "processing"`
- `lowStockCount` — medicines with `stock < 10 && isActive: true`
- `todayDeliveries` — orders moved to `status: "delivered"` today (UTC day boundary)
- `totalMedicines` — count of all active medicines (`isActive: true`)

---

## GET /api/pharmacist/inventory

Returns paginated medicine inventory list with stock levels.

### Query Parameters

| Param | Type | Default | Notes |
|---|---|---|---|
| `page` | number | 1 | |
| `limit` | number | 20 | max 100 |
| `category` | string | — | exact match filter |
| `lowStock` | boolean | false | if `true`, return only medicines where `stock < 10` |
| `search` | string | — | partial case-insensitive name or brand match |

### Response 200

```json
{
  "success": true,
  "total": 87,
  "page": 1,
  "pages": 5,
  "medicines": [
    {
      "_id": "664abc...",
      "name": "Dolo 650",
      "brand": "Micro Labs",
      "category": "Analgesics",
      "mrp": 30,
      "discountedPrice": 28,
      "stock": 5,
      "isActive": true,
      "requiresPrescription": false,
      "salesCount": 230,
      "imageUrl": "https://res.cloudinary.com/..."
    }
  ]
}
```

### Errors

| Status | Code | Reason |
|---|---|---|
| 400 | `INVALID_LIMIT` | `limit` exceeds 100 |

---

## PATCH /api/pharmacist/inventory/:id

Updates the stock level for a single medicine. Only the `stock` field is changed — all other medicine fields are untouched (satisfies FR-019).

### Request

```json
{ "stock": 150 }
```

| Field | Type | Required | Notes |
|---|---|---|---|
| `stock` | number | ✅ | Must be ≥ 0 (integer) |

### Response 200

```json
{
  "success": true,
  "medicine": {
    "_id": "664abc...",
    "name": "Dolo 650",
    "stock": 150
  }
}
```

### Errors

| Status | Code | Reason |
|---|---|---|
| 400 | `INVALID_STOCK` | `stock` is negative, non-integer, or missing |
| 404 | `NOT_FOUND` | Medicine with this ID does not exist |

---

## GET /api/pharmacist/orders

Returns orders awaiting pharmacist action. Delegates to the same handler as `GET /api/orders/queue`.

Equivalent to `GET /api/orders/queue` — see [orders.md](./orders.md#get-apiordersqueue) for full specification.

**Default filter**: `status: pending,processing` (comma-separated)

### Query Parameters

| Param | Default | Notes |
|---|---|---|
| `page` | 1 | |
| `limit` | 20 | max 100 |
| `status` | `pending,processing` | comma-separated values from ORDER_STATUS enum |

### Response 200

```json
{
  "success": true,
  "total": 12,
  "page": 1,
  "pages": 1,
  "orders": [
    {
      "_id": "...",
      "orderNumber": "MED-00000001",
      "status": "pending",
      "paymentStatus": "paid",
      "totalAmount": 230,
      "createdAt": "2026-05-04T10:00:00Z",
      "user": { "name": "Rahul Sharma", "email": "rahul@example.com" },
      "items": [
        {
          "medicine": { "_id": "...", "name": "Dolo 650", "imageUrl": "..." },
          "quantity": 2,
          "priceAtPurchase": 28,
          "isAlternateChosen": false
        }
      ],
      "prescriptionUrl": null,
      "address": { "line1": "...", "city": "Bengaluru", "pincode": "560001" }
    }
  ]
}
```

---

## PATCH /api/pharmacist/orders/:id/status

Updates an order's fulfilment status. Delegates to the same handler as `PATCH /api/orders/:id/status`.

See [orders.md](./orders.md#patch-apiordersidstatus) for full specification including valid status transitions.

**Valid forward transitions** (FR-020 — forward-only):

```
pending → processing → shipped → delivered
pending → cancelled
processing → cancelled
```

### Request

```json
{
  "status": "processing",
  "note": "Prescription verified, packing now"
}
```

| Field | Type | Required | Notes |
|---|---|---|---|
| `status` | string | ✅ | Must be a valid forward transition from current status |
| `note` | string | optional | Internal note, not shown to patient |

### Response 200

```json
{
  "success": true,
  "order": {
    "_id": "...",
    "orderNumber": "MED-00000001",
    "status": "processing"
  }
}
```

### Errors

| Status | Code | Reason |
|---|---|---|
| 400 | `INVALID_TRANSITION` | Requested status is not a valid forward step (e.g. `delivered → pending`) |
| 404 | `NOT_FOUND` | Order not found |
