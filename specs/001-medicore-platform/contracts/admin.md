# API Contract: Admin

**Base path**: `/api/admin`  
**Auth**: admin role required for all endpoints

---

## GET /api/admin/dashboard

Returns platform-wide metrics for the admin overview.

### Response 200

```json
{
  "success": true,
  "stats": {
    "totalUsers": 324,
    "totalMedicines": 87,
    "totalOrders": 1240,
    "revenueToday": 4520,
    "revenueLast30Days": 98340,
    "pendingOrders": 12,
    "lowStockMedicines": 4,
    "totalSalts": 34
  }
}
```

---

## GET /api/admin/users

Returns paginated user list.

### Query Parameters

| Param | Default | Notes |
|---|---|---|
| `page` | 1 | |
| `limit` | 20 | max 100 |
| `role` | — | filter: `patient`, `pharmacist`, `admin` |
| `search` | — | partial name or email match |

### Response 200

```json
{
  "success": true,
  "total": 324,
  "page": 1,
  "pages": 17,
  "users": [
    {
      "_id": "...",
      "name": "Rahul Sharma",
      "email": "rahul@example.com",
      "role": "patient",
      "createdAt": "2026-05-01T08:00:00Z"
    }
  ]
}
```

---

## PATCH /api/admin/users/:id/role

Promotes or demotes a user's role.

### Request

```json
{ "role": "pharmacist" }
```

Valid values: `"patient"`, `"pharmacist"`, `"admin"`

### Response 200

```json
{
  "success": true,
  "user": { "_id": "...", "name": "Meera Nair", "role": "pharmacist" }
}
```

### Errors

| Status | Code | Reason |
|---|---|---|
| 400 | `INVALID_ROLE` | Role value not in allowed enum |
| 400 | `SELF_DEMOTION` | Admin cannot change their own role |
| 404 | `NOT_FOUND` | User not found |

---

## GET /api/admin/salts

Returns paginated salt catalogue.

### Query Parameters

| Param | Default | Notes |
|---|---|---|
| `page` | 1 | |
| `limit` | 20 | |
| `search` | — | partial name match |

### Response 200

```json
{
  "success": true,
  "total": 34,
  "salts": [
    {
      "_id": "...",
      "name": "Paracetamol",
      "normalizedName": "paracetamol",
      "description": "Analgesic and antipyretic",
      "medicineCount": 12
    }
  ]
}
```

---

## POST /api/admin/salts

Creates a new salt reference.

### Request

```json
{
  "name": "Ibuprofen",
  "description": "NSAID analgesic and anti-inflammatory"
}
```

### Response 201

```json
{
  "success": true,
  "salt": { "_id": "...", "name": "Ibuprofen", "normalizedName": "ibuprofen" }
}
```

### Errors

| Status | Code | Reason |
|---|---|---|
| 400 | `VALIDATION_ERROR` | Missing `name` |
| 409 | `DUPLICATE_SALT` | Salt with same normalized name already exists |

---

## PUT /api/admin/salts/:id

Updates a salt's metadata.

### Request

```json
{
  "name": "Ibuprofen",
  "description": "Updated description"
}
```

### Response 200

```json
{ "success": true, "salt": { "..." } }
```

---

## DELETE /api/admin/salts/:id

Removes a salt from the catalogue. Only allowed if no medicine references this salt.

### Response 200

```json
{ "success": true, "message": "Salt deleted" }
```

### Errors

| Status | Code | Reason |
|---|---|---|
| 409 | `SALT_IN_USE` | Salt is referenced by ≥1 active medicines |

---

## GET /api/admin/orders

Returns all orders across all users with full filtering.

### Query Parameters

| Param | Default | Notes |
|---|---|---|
| `page` | 1 | |
| `limit` | 20 | |
| `status` | — | order status filter |
| `userId` | — | filter orders for a specific user |
| `from` | — | ISO date string, filter by `createdAt ≥ from` |
| `to` | — | ISO date string, filter by `createdAt ≤ to` |

### Response 200

```json
{
  "success": true,
  "total": 1240,
  "page": 1,
  "pages": 62,
  "orders": [ /* same shape as GET /api/orders/:id */ ]
}
```
