# API Contract: Authentication

**Base path**: `/api/auth`  
**Transport**: HTTP/S, JSON body, JWT stored in HTTP-only cookie  
**Auth cookie name**: `token` (HttpOnly, SameSite=Strict in dev / SameSite=None; Secure in prod)

---

## POST /api/auth/register

Registers a new patient account.

### Request

```json
{
  "name": "Rahul Sharma",
  "email": "rahul@example.com",
  "password": "MyPass@123",
  "phone": "+919876543210"
}
```

| Field | Type | Required | Notes |
|---|---|---|---|
| `name` | string | ✅ | 2–80 chars |
| `email` | string | ✅ | RFC-5321 valid, unique |
| `password` | string | ✅ | min 8 chars, at least 1 digit |
| `phone` | string | optional | E.164 format |

### Response 201

```json
{
  "success": true,
  "user": {
    "_id": "...",
    "name": "Rahul Sharma",
    "email": "rahul@example.com",
    "role": "patient"
  }
}
```

Sets `token` cookie (7d expiry).

### Errors

| Status | Code | Reason |
|---|---|---|
| 400 | `VALIDATION_ERROR` | Missing/invalid fields |
| 409 | `EMAIL_TAKEN` | Email already registered |

---

## POST /api/auth/login

### Request

```json
{
  "email": "rahul@example.com",
  "password": "MyPass@123"
}
```

### Response 200

```json
{
  "success": true,
  "user": {
    "_id": "...",
    "name": "Rahul Sharma",
    "email": "rahul@example.com",
    "role": "patient"
  }
}
```

Sets `token` cookie.

### Errors

| Status | Code | Reason |
|---|---|---|
| 400 | `VALIDATION_ERROR` | Missing fields |
| 401 | `INVALID_CREDENTIALS` | Wrong email or password |

---

## POST /api/auth/logout

**Auth**: required (any role)

### Response 200

```json
{ "success": true }
```

Clears `token` cookie.

---

## GET /api/auth/me

**Auth**: required (any role)

Returns the authenticated user's profile.

### Response 200

```json
{
  "success": true,
  "user": {
    "_id": "...",
    "name": "Rahul Sharma",
    "email": "rahul@example.com",
    "role": "patient",
    "phone": "+919876543210",
    "addresses": [
      {
        "_id": "...",
        "label": "Home",
        "line1": "42 MG Road",
        "city": "Bengaluru",
        "state": "Karnataka",
        "pincode": "560001",
        "isDefault": true
      }
    ]
  }
}
```

---

## POST /api/auth/addresses

**Auth**: required (patient)

Adds a delivery address to the user's profile.

### Request

```json
{
  "label": "Home",
  "line1": "42 MG Road",
  "line2": "Near Metro",
  "city": "Bengaluru",
  "state": "Karnataka",
  "pincode": "560001",
  "isDefault": true
}
```

### Response 201

```json
{
  "success": true,
  "address": { "_id": "...", "label": "Home", "isDefault": true, "..." }
}
```

### Errors

| Status | Code | Reason |
|---|---|---|
| 400 | `VALIDATION_ERROR` | Missing required address fields |
| 400 | `MAX_ADDRESSES` | User already has 5 addresses |
