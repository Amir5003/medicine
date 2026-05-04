# API Contract: Medicines

**Base path**: `/api/medicines`  
**Public endpoints**: no authentication required  
**Protected endpoints**: pharmacist or admin role

---

## GET /api/medicines/search

Fuzzy search over active medicines. Powered by Fuse.js on the server.

### Query Parameters

| Param | Type | Required | Notes |
|---|---|---|---|
| `q` | string | ✅ | 1–200 chars, min 1 non-space char |
| `limit` | number | optional | default 20, max 50 |

### Response 200

```json
{
  "success": true,
  "count": 3,
  "results": [
    {
      "_id": "...",
      "name": "Dolo 650",
      "slug": "dolo-650",
      "brand": "Micro Labs",
      "category": "Analgesics",
      "mrp": 30,
      "discountedPrice": 28,
      "imageUrl": "https://res.cloudinary.com/...",
      "requiresPrescription": false,
      "inStock": true,
      "salts": [
        { "name": "Paracetamol", "strength": "650mg" }
      ]
    }
  ]
}
```

### Errors

| Status | Code | Reason |
|---|---|---|
| 400 | `MISSING_QUERY` | `q` param absent or empty |

---

## GET /api/medicines/trending

Returns top 10 medicines sorted by `salesCount` desc. No auth required.

### Response 200

```json
{
  "success": true,
  "count": 10,
  "results": [ /* same shape as search result item */ ]
}
```

---

## GET /api/medicines/categories

Returns unique category list for filter chips.

### Response 200

```json
{
  "success": true,
  "categories": [
    "Analgesics",
    "Antibiotics",
    "Antacids",
    "Vitamins",
    "Antidiabetics",
    "Cardiovascular",
    "Dermatology",
    "Respiratory",
    "ENT",
    "Multivitamins"
  ]
}
```

---

## GET /api/medicines/:slug

Returns full detail for a single medicine including the alternate panel.

### Response 200

```json
{
  "success": true,
  "medicine": {
    "_id": "...",
    "name": "Dolo 650",
    "slug": "dolo-650",
    "brand": "Micro Labs",
    "genericName": "Paracetamol 650mg Tablet",
    "category": "Analgesics",
    "description": "Used for fever and mild pain relief.",
    "mrp": 30,
    "discountedPrice": 28,
    "stock": 145,
    "requiresPrescription": false,
    "imageUrl": "https://res.cloudinary.com/...",
    "salts": [{ "name": "Paracetamol", "strength": "650mg" }],
    "saltFingerprint": "paracetamol_650mg",
    "inStock": true
  },
  "alternates": [
    {
      "_id": "...",
      "name": "Calpol 650",
      "brand": "GSK",
      "mrp": 35,
      "discountedPrice": 30,
      "slug": "calpol-650",
      "imageUrl": "...",
      "savingsPercent": 7,
      "inStock": true
    }
  ]
}
```

`alternates` are medicines sharing the same `saltFingerprint`, excluding out-of-stock, sorted by `discountedPrice` asc.

### Errors

| Status | Code | Reason |
|---|---|---|
| 404 | `NOT_FOUND` | No active medicine with this slug |

---

## POST /api/medicines

**Auth**: pharmacist or admin

Creates a new medicine listing.

### Request (multipart/form-data)

| Field | Type | Required |
|---|---|---|
| `name` | string | ✅ |
| `brand` | string | ✅ |
| `genericName` | string | ✅ |
| `category` | string | ✅ |
| `description` | string | ✅ |
| `mrp` | number | ✅ |
| `discountedPrice` | number | ✅ |
| `stock` | number | ✅ |
| `requiresPrescription` | boolean | ✅ |
| `salts` | JSON string array `[{name,strength}]` | ✅ |
| `image` | file (jpg/png/webp, ≤5MB) | optional |

### Response 201

```json
{
  "success": true,
  "medicine": { "_id": "...", "slug": "...", "saltFingerprint": "...", "..." }
}
```

### Errors

| Status | Code | Reason |
|---|---|---|
| 400 | `VALIDATION_ERROR` | Missing or invalid fields |
| 400 | `INVALID_DISCOUNT` | `discountedPrice > mrp` |
| 403 | `FORBIDDEN` | Requester is not pharmacist/admin |

---

## PUT /api/medicines/:id

**Auth**: pharmacist or admin

Full update of a medicine. Same body shape as POST.

### Response 200

```json
{ "success": true, "medicine": { "..." } }
```

---

## PATCH /api/medicines/:id/stock

**Auth**: pharmacist or admin

Adjusts stock level only.

### Request

```json
{ "stock": 200 }
```

### Response 200

```json
{ "success": true, "stock": 200 }
```

---

## DELETE /api/medicines/:id

**Auth**: admin only

Soft-deletes a medicine (sets `isActive: false`). Does not remove from DB.

### Response 200

```json
{ "success": true, "message": "Medicine deactivated" }
```
