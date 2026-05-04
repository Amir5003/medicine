# Data Model: MediCore Platform

**Branch**: `001-medicore-platform` | **Date**: 2026-05-04

---

## Entities

### 1. Medicine

**Purpose**: A sellable pharmaceutical product. The `saltFingerprint` field is the key to the alternate-matching algorithm.

#### Fields

| Field | Type | Required | Notes |
|---|---|---|---|
| `_id` | ObjectId | auto | MongoDB default |
| `name` | String | ✅ | Brand name, e.g. "Dolo 650" |
| `slug` | String | auto | Url-friendly, unique, lowercase. Auto-generated from `name` via `slugify` on create |
| `manufacturer` | String | ✅ | e.g. "Micro Labs" |
| `salts` | Array\<Salt\> | ✅ | Min 1 salt. See Salt sub-document below |
| `saltFingerprint` | String | auto | Computed by `pre('save')` hook. Indexed. See algorithm below |
| `category` | String (enum) | ✅ | `Pain Relief` \| `Antibiotics` \| `Vitamins & Supplements` \| `Digestive Health` \| `Heart & Blood Pressure` \| `Diabetes` \| `Skin Care` \| `Cold & Flu` \| `Eye Care` \| `Mental Health` |
| `form` | String (enum) | ✅ | `Tablet` \| `Capsule` \| `Syrup` \| `Injection` \| `Cream` \| `Drops` \| `Inhaler` \| `Patch` |
| `price` | Number | ✅ | MRP (Maximum Retail Price). Min 0 |
| `discountedPrice` | Number | ✅ | Actual selling price. Min 0. Must be ≤ price |
| `stock` | Number | ✅ | Units in stock. Min 0. Default 0 |
| `images` | Array\<String\> | ❌ | Cloudinary URLs. Max 5 |
| `isPrescriptionRequired` | Boolean | ❌ | Default `false`. `true` for Schedule H/H1 |
| `isGeneric` | Boolean | ❌ | Default `false` |
| `description` | String | ❌ | Product description |
| `sideEffects` | String | ❌ | Common side effects text |
| `rating` | Number | ❌ | 0–5. Default 4.0 |
| `reviewCount` | Number | ❌ | Default 0 |
| `isActive` | Boolean | ❌ | Default `true`. Soft-delete flag |
| `orderCount` | Number | ❌ | Default 0. Incremented on each order. Used for trending sort |
| `createdAt` | Date | auto | Mongoose timestamps |
| `updatedAt` | Date | auto | Mongoose timestamps |

#### Salt Sub-document

| Field | Type | Required | Notes |
|---|---|---|---|
| `saltName` | String | ✅ | Active ingredient, e.g. "Paracetamol" |
| `strength` | String | ✅ | Dose, e.g. "650mg" |

#### saltFingerprint Algorithm

```js
// Computed in Mongoose pre('save') hook:
medicine.saltFingerprint = medicine.salts
  .map(s =>
    `${s.saltName.toLowerCase().replace(/\s+/g, '_')}_${s.strength.toLowerCase().replace(/\s+/g, '')}`
  )
  .sort()
  .join('|');

// Examples:
// Single salt:    "paracetamol_650mg"
// Combination:    "amoxicillin_500mg|clavulanate_125mg"  (sorted alphabetically)
```

#### Indexes

```js
{ saltFingerprint: 1 }                          // alternate lookup
{ name: 'text', manufacturer: 'text', 'salts.saltName': 'text' }  // full-text search
{ category: 1, isActive: 1 }                    // category browse
{ slug: 1 }                                     // detail page lookup (unique)
{ orderCount: -1, isActive: 1 }                 // trending
```

#### Validation Rules

- `discountedPrice` MUST be ≤ `price` (enforced in controller, not Mongoose schema)
- `salts` array must have length ≥ 1
- `slug` must be unique — duplicate check in controller before create; Mongoose `unique: true` index as safety net

---

### 2. User

**Purpose**: A platform member. One of three roles drives which routes they can access.

#### Fields

| Field | Type | Required | Notes |
|---|---|---|---|
| `_id` | ObjectId | auto | |
| `name` | String | ✅ | |
| `email` | String | ✅ | Unique, lowercase, validated as email format |
| `phone` | String | ❌ | 10-digit Indian format (6–9 prefix) |
| `passwordHash` | String | ✅ | bcrypt hash (12 rounds). Never returned in responses |
| `role` | String (enum) | ❌ | `patient` \| `pharmacist` \| `admin`. Default `patient` |
| `addresses` | Array\<Address\> | ❌ | Max 5 recommended |
| `prescriptions` | Array\<String\> | ❌ | Cloudinary URLs of uploaded prescription images/PDFs |
| `isActive` | Boolean | ❌ | Default `true`. Admin can deactivate |
| `createdAt` | Date | auto | |
| `updatedAt` | Date | auto | |

#### Address Sub-document

| Field | Type | Notes |
|---|---|---|
| `label` | String | e.g. "Home", "Office". Default "Home" |
| `fullName` | String | Recipient name |
| `phone` | String | Delivery contact |
| `line1` | String | Street address |
| `line2` | String | Apartment / area (optional) |
| `city` | String | |
| `state` | String | |
| `pincode` | String | 6-digit Indian pincode |
| `isDefault` | Boolean | Only one address can be default. Default `false` |

#### Security Notes

- `passwordHash` is excluded from all query responses via `toJSON()` transform
- JWT token is never stored on the User document — it is stateless (signed with `JWT_SECRET`)
- `select('-passwordHash')` added to all `protect()` middleware queries

---

### 3. Order

**Purpose**: A completed or in-progress purchase. Captures point-in-time pricing and savings from alternate choices.

#### Fields

| Field | Type | Required | Notes |
|---|---|---|---|
| `_id` | ObjectId | auto | |
| `orderId` | String | auto | Format: `MED-XXXXXXXX` (8 random uppercase alphanumeric chars). Unique |
| `user` | ObjectId (ref: User) | ✅ | |
| `items` | Array\<OrderItem\> | ✅ | Min 1 item |
| `totalMRP` | Number | ✅ | Sum of `item.price × quantity` at MRP |
| `totalDiscount` | Number | ❌ | Sum of MRP discounts. Default 0 |
| `totalSavings` | Number | ❌ | Sum of `savingsAmount × quantity` for alternate-chosen items. Default 0 |
| `totalAmount` | Number | ✅ | Actual amount charged |
| `address` | AddressSnapshot | ✅ | Point-in-time copy of delivery address (not a ref) |
| `paymentStatus` | String (enum) | ❌ | `pending` \| `paid` \| `failed`. Default `pending` |
| `paymentId` | String | ❌ | Razorpay `razorpay_payment_id` on success |
| `razorpayOrderId` | String | ❌ | Razorpay `razorpay_order_id` from create-order |
| `status` | String (enum) | ❌ | `placed` → `confirmed` → `packed` → `dispatched` → `delivered` \| `cancelled`. Default `placed` |
| `prescriptionUploads` | Array\<String\> | ❌ | Cloudinary URLs. Required before payment if any item has `isPrescriptionRequired` |
| `requiresPrescription` | Boolean | ❌ | `true` if any item in cart has `isPrescriptionRequired: true`. Denormalized for fast checks |
| `createdAt` | Date | auto | |
| `updatedAt` | Date | auto | |

#### OrderItem Sub-document

| Field | Type | Notes |
|---|---|---|
| `medicine` | ObjectId (ref: Medicine) | Reference to medicine at time of order |
| `name` | String | Snapshot of medicine name |
| `price` | Number | Snapshot of `discountedPrice` at time of order |
| `quantity` | Number | Min 1 |
| `isAlternateChosen` | Boolean | `true` if patient chose this as a salt-equivalent alternate |
| `originalMedicineId` | ObjectId | If alternate chosen, points to the original medicine |
| `savingsAmount` | Number | `original.discountedPrice − this.price`. 0 if not alternate |

#### Order Status Transitions

```
placed → confirmed → packed → dispatched → delivered
  ↓          ↓         ↓          ↓            ↓
cancelled  cancelled  cancelled  cancelled   (terminal)
```

Only forward transitions are valid. A delivered order cannot be cancelled. Backend validates transitions in `pharmacistController.updateOrderStatus`.

#### AddressSnapshot

Same fields as Address sub-document above; embedded directly (not a reference) so delivery address is preserved even if user updates their address book later.

---

### 4. Salt (Admin Reference — not a Mongoose model)

The admin "salt database" in v1 is stored as a simple array in a `Salt` Mongoose model for reference purposes. It does not auto-generate fingerprints for medicines — pharmacists enter salt data per medicine directly.

| Field | Type | Notes |
|---|---|---|
| `saltName` | String | e.g. "Paracetamol" |
| `commonStrengths` | Array\<String\> | e.g. ["500mg", "650mg", "1g"] |
| `category` | String | Pharmacological class |
| `description` | String | Brief clinical notes |

---

## Entity Relationships

```
User ─────────────── Order (1:many)
                       │
                       ├── OrderItem.medicine ──► Medicine
                       └── OrderItem.originalMedicineId ──► Medicine

Medicine ──────────── (same saltFingerprint) ──► alternate Medicine[]
```

---

## State Transitions

### Cart (client-side Zustand)

```
empty → has_items → checkout_ready
                 ↓
         requires_prescription → prescription_uploaded → checkout_ready
```

### Order (server-side)

```
[placed] → [confirmed] → [packed] → [dispatched] → [delivered]
   ↓            ↓             ↓            ↓
[cancelled]  [cancelled]  [cancelled]  [cancelled]
```

---

## Validation Summary

| Entity | Rule | Enforced In |
|---|---|---|
| Medicine | `discountedPrice ≤ price` | Controller |
| Medicine | `salts.length ≥ 1` | Mongoose schema |
| Medicine | `slug` unique | Mongoose index + controller |
| Medicine | `stock ≥ 0` when adding to cart | Zustand store + API |
| Order | `stock ≥ qty` at placement | Order controller |
| Order | `prescriptionUploads.length ≥ 1` when `requiresPrescription` | Order controller |
| Order | Valid status transition | Pharmacist controller |
| User | `email` format + unique | Mongoose schema |
| User | `phone` Indian 10-digit | Mongoose schema |
| User | `passwordHash` min 8 chars (raw) | Auth controller |
