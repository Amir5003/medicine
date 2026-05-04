# Implementation Plan: MediCore — Medicine Delivery & Salt Alternate Platform

**Branch**: `001-medicore-platform` | **Date**: 2026-05-04 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `specs/001-medicore-platform/spec.md`

## Summary

MediCore is a full-stack MERN medicine delivery platform. The defining capability is the **Salt Alternate Algorithm**: when a patient views any medicine, the platform queries for all medicines sharing the exact same `saltFingerprint` (active ingredient name + strength, normalized and sorted), shows them ranked cheapest-first with a live savings badge, and lets the patient swap to a generic with one tap. The full patient flow — search → detail → compare → cart → checkout → pay — is available without an account; signup is deferred to the moment of payment only.

Technical approach: Express REST API with MongoDB (Mongoose) on the backend; React 18 + Vite with Zustand stores and TanStack Query (React Query) on the frontend; Razorpay for payments; Multer + Cloudinary for prescription and medicine image uploads; Fuse.js for fuzzy client-side search over the medicine catalogue.

## Technical Context

**Language/Version**: Node.js 20 LTS (ESM, `"type": "module"`) — backend; JavaScript/JSX (React 18) — frontend  
**Primary Dependencies**:
- Backend: Express 4, Mongoose 8, bcryptjs, jsonwebtoken, cookie-parser, multer, cloudinary, razorpay, fuse.js, helmet, express-rate-limit, morgan, slugify, express-validator
- Frontend: React 18, Vite 5, Tailwind CSS 3, Framer Motion 11, Zustand 4, TanStack Query v5 (@tanstack/react-query), React Router DOM 6, axios, react-hot-toast
- Shared: no build step needed — plain JS constants imported by both sides

**Storage**: MongoDB Atlas (cloud) via Mongoose ODM; Cloudinary for binary files (images, PDFs); browser localStorage for guest cart (Zustand `persist` middleware)  
**Testing**: Not in scope for v1 — no test tasks (spec does not request tests)  
**Target Platform**: Web browser (Chrome, Safari, Firefox, Edge) — desktop + mobile 360 px+; deployed to Vercel (frontend) + Railway or Render (backend) + MongoDB Atlas  
**Project Type**: Full-stack web application (MERN monorepo)  
**Performance Goals**: Medicine search response < 1 s; Alternate Panel load < 1 s after medicine detail page opens; Razorpay checkout window opens < 2 s  
**Constraints**: JWT MUST be stored in HTTP-only cookies only; OOS medicines blocked at both API and UI layers; all UI functional at 360 px; `prefers-reduced-motion` respected for all Framer Motion animations  
**Scale/Scope**: ~1 000 concurrent users for v1; 50+ seeded medicines across 10+ categories; 15 patient-facing pages + 3 pharmacist pages + 4 admin pages

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Verify each of MediCore's 7 Laws against this feature's planned behaviour:

| Law | Relevant? | Compliant? | Notes |
|---|---|---|---|
| I. Salt Integrity — alternates only on exact saltFingerprint match | Yes | ✅ Pass | `saltFingerprint` index on Medicine model; query filters by exact match and `stock > 0 && isActive: true` |
| II. Savings Honesty — savings = real-time price diff only | Yes | ✅ Pass | `savings = original.discountedPrice − alternate.discountedPrice` computed at query time in `saltAlternateService`; never stored or cached |
| III. Guest First — full flow without login, signup at payment only | Yes | ✅ Pass | Zustand cart with `persist` middleware for guests; login modal fires only on "Pay Now" click; no auth guard on `/`, `/search`, `/medicine/:slug`, `/cart`, `/checkout` |
| IV. Stock Truth — OOS medicine cannot be added to cart | Yes | ✅ Pass | `addToCart` in Zustand store checks `stock > 0`; API order endpoint re-validates stock; alternates query filters `stock > 0` |
| V. Prescription Flag — block checkout without upload for Rx meds | Yes | ✅ Pass | `isPrescriptionRequired` flag surfaced on medicine card/detail; cart page blocks "Proceed" and shows upload UI when any cart item has this flag; API rejects orderif `requiresPrescription && !prescriptionUploads.length` |
| VI. Mobile First — design & test at 360 px first | Yes | ✅ Pass | All Tailwind responsive classes applied mobile-first (`sm:`, `md:`, `lg:` breakpoints); every page component audited at 360 px before task sign-off |
| VII. Animation Purpose — every animation has a functional reason | Yes | ✅ Pass | 9 animation mappings defined in spec; all serve state-change communication or confirm user action; `prefers-reduced-motion` handled via Framer Motion's `useReducedMotion` hook |

**GATE RESULT**: ✅ PASS — all 7 laws satisfied in the planned design

## Project Structure

### Documentation (this feature)

```text
specs/001-medicore-platform/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output — API endpoint contracts
│   ├── medicines.md
│   ├── auth.md
│   ├── orders.md
│   ├── payment.md
│   ├── pharmacist.md
│   └── admin.md
└── tasks.md             # Phase 2 output (/speckit.tasks — NOT created here)
```

### Source Code (repository root)

```text
client/
└── src/
    ├── stores/                    # Zustand stores
    │   ├── useCartStore.js        # Cart state + localStorage persist
    │   ├── useAuthStore.js        # Current user, login/logout actions
    │   └── useUIStore.js          # Drawer open/close, modal state
    ├── pages/
    │   ├── Home.jsx
    │   ├── SearchResults.jsx
    │   ├── MedicineDetail.jsx
    │   ├── Cart.jsx
    │   ├── Checkout.jsx
    │   ├── OrderSuccess.jsx
    │   ├── MyOrders.jsx
    │   ├── OrderDetail.jsx
    │   ├── Profile.jsx
    │   ├── pharmacist/
    │   │   ├── PharmacistDashboard.jsx
    │   │   ├── Inventory.jsx
    │   │   └── OrdersQueue.jsx
    │   └── admin/
    │       ├── AdminDashboard.jsx
    │       ├── AdminMedicines.jsx
    │       ├── AdminUsers.jsx
    │       └── AdminSalts.jsx
    ├── components/
    │   ├── ui/
    │   │   ├── Button.jsx
    │   │   ├── Badge.jsx
    │   │   ├── Card.jsx
    │   │   ├── Skeleton.jsx
    │   │   └── Modal.jsx
    │   ├── medicine/
    │   │   ├── MedicineCard.jsx
    │   │   ├── AlternatePanel.jsx
    │   │   └── SavingsBadge.jsx
    │   ├── cart/
    │   │   ├── CartDrawer.jsx
    │   │   └── CartItem.jsx
    │   └── layout/
    │       ├── Navbar.jsx
    │       ├── Footer.jsx
    │       └── Layout.jsx
    ├── hooks/
    │   ├── useMedicines.js        # TanStack Query — search, detail, trending
    │   ├── useAlternates.js       # TanStack Query — /api/medicines/:id/alternates
    │   ├── useOrders.js           # TanStack Query — order CRUD
    │   └── useAuth.js             # TanStack Query + useAuthStore mutations
    └── utils/
        ├── formatPrice.js         # ₹ formatter
        ├── saltFingerprint.js     # Client-side fingerprint helper (for display only)
        └── api.js                 # axios instance with base URL + cookie credentials

server/
├── index.js                       # Express entry point
├── config/
│   ├── db.js                      # Mongoose connect
│   └── cloudinary.js              # Cloudinary + Multer storage setup
├── models/
│   ├── Medicine.js
│   ├── User.js
│   └── Order.js
├── routes/
│   ├── authRoutes.js
│   ├── medicineRoutes.js
│   ├── orderRoutes.js
│   ├── paymentRoutes.js
│   ├── pharmacistRoutes.js
│   └── adminRoutes.js
├── controllers/
│   ├── authController.js
│   ├── medicineController.js
│   ├── orderController.js
│   ├── paymentController.js
│   ├── pharmacistController.js
│   └── adminController.js
├── middleware/
│   ├── auth.js                    # protect() — verify JWT cookie
│   ├── role.js                    # authorize(...roles)
│   ├── errorHandler.js
│   └── validate.js                # express-validator wrapper
├── services/
│   ├── saltAlternateService.js    # findAlternates() — core algorithm
│   └── paymentService.js          # Razorpay createOrder + verifySignature
├── utils/
│   └── token.js                   # generateToken, sendTokenCookie
└── seed/
    └── seedMedicines.js           # 50+ medicines, 10 categories, valid fingerprints

shared/
├── roles.js                       # ROLES = { PATIENT, PHARMACIST, ADMIN }
└── orderStatus.js                 # ORDER_STATUS enum
```

**Structure Decision**: MERN monorepo. `client/` uses Zustand for client state and TanStack Query for all API calls. `server/` is a plain Express REST API. No tRPC, no GraphQL — REST only for simplicity.

## Complexity Tracking

> No constitution violations — no complexity justification required.
