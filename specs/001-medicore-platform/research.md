# Research: MediCore Platform

**Branch**: `001-medicore-platform` | **Date**: 2026-05-04

All technical unknowns resolved from the spec, constitution, and established MERN/React ecosystem best practices. No external research queries were needed.

---

## Decision Log

### D-001: State Management — Zustand + TanStack Query

**Decision**: Use **Zustand 4** for client-only global state (cart, auth session, UI toggles) and **TanStack Query v5** (React Query) for all server-state: fetching, caching, and invalidating API data.

**Rationale**:
- Zustand requires zero boilerplate (no actions/reducers/selectors ceremony), no Provider wrapping, and integrates with `localStorage` via `persist` middleware — critical for the guest cart persistence requirement.
- TanStack Query handles loading/error/stale states, request deduplication, and cache invalidation automatically — replacing what RTK Query would have done, but with a smaller bundle and better DX.
- Both libraries are framework-agnostic and have no peer dependency conflicts with Vite/React 18.

**Alternatives considered**:
- Redux Toolkit + RTK Query — rejected: more boilerplate, heavier bundle, worse fit for a focused cart/auth state.
- React Context + useReducer — rejected: context re-render cascades on every cart update; no built-in server-state caching.
- Jotai — considered; Zustand preferred for its simpler object-based API for cart operations.

---

### D-002: Fuzzy Search — Fuse.js (client side) + MongoDB text index (server side)

**Decision**: Use **Fuse.js** on the server to do fuzzy matching over the results of a MongoDB find (all active medicines), returning ranked results. Additionally maintain a MongoDB text index on `name`, `manufacturer`, and `salts.saltName` as a fallback for large catalogues.

**Rationale**:
- For a v1 catalogue of 50–500 medicines, loading all into Fuse.js on each search request is fast (< 50 ms) and requires no Atlas Search tier upgrade.
- Fuse.js gives weighted, threshold-based ranking that raw MongoDB `$text` search lacks.
- Migration path: when catalogue grows > 5 000 medicines, swap to MongoDB Atlas Search ($search) in `medicineController.js` without changing the API contract.

**Alternatives considered**:
- MongoDB Atlas Search — rejected for v1: requires Atlas M10+ tier; over-engineered for a 50-item seed catalogue.
- ElasticSearch — rejected: adds a separate managed service and operational cost.

---

### D-003: Salt Fingerprint Algorithm

**Decision**: Compute fingerprint as:
```js
salts
  .map(s => `${s.saltName.toLowerCase().replace(/\s+/g, '_')}_${s.strength.toLowerCase().replace(/\s+/g, '')}`)
  .sort()
  .join('|')
```
Store as `saltFingerprint` on the Medicine document. Index it. Re-compute on every `save` via a Mongoose `pre('save')` hook.

**Rationale**: Sorting the array makes multi-salt medicines (e.g., combination drugs) match regardless of input order. Lowercasing and removing whitespace prevents false negatives from formatting differences.

**Alternatives considered**:
- Hashing the fingerprint string — rejected: a readable string (`paracetamol_650mg`) is far easier to debug and query manually.
- Storing salts as a Set in a separate collection — rejected: unnecessary join for a v1 catalogue size.

---

### D-004: Payment Flow — Razorpay Two-Step (Order Init → Signature Verify)

**Decision**: Standard Razorpay integration:
1. Frontend calls `POST /api/payment/create-order` → backend creates a Razorpay order, returns `razorpayOrderId` + `amount`.
2. Frontend opens Razorpay checkout SDK with those values.
3. On success, Razorpay SDK returns `paymentId`, `orderId`, `signature` to the frontend.
4. Frontend calls `POST /api/payment/verify` → backend verifies HMAC-SHA256 signature using `razorpay_order_id + "|" + razorpay_payment_id` and the key secret.
5. Only on successful verification does the backend create the MediCore Order and decrement stock.

**Rationale**: Signature verification on the server prevents tampering. Stock decrement after verified payment prevents phantom orders.

**Alternatives considered**:
- Webhook-only flow — more robust in production but adds complexity; v1 uses the sync verify approach; webhook can be added in v2.

---

### D-005: JWT Storage — HTTP-only Cookies Only

**Decision**: JWT stored exclusively in HTTP-only, Secure, SameSite=Strict cookies. Never `localStorage`.

**Rationale**: Prevents XSS theft of tokens. Aligns with Law XVI (FR-016) and the constitution "Auth" row. `SameSite=Lax` used in development (no HTTPS), `SameSite=None; Secure` in production (cross-origin Vercel → Railway).

---

### D-006: Guest Cart Persistence — Zustand + localStorage via persist middleware

**Decision**: `useCartStore` uses Zustand's `persist` middleware with `localStorage` as the storage engine. On login, the Zustand cart contents are sent to the backend to merge with any server-stored pending cart, then the Zustand store is replaced with the merged result.

**Rationale**: Fulfils the Guest First law (III) with zero backend calls during guest browsing. Merge logic is a simple union by `medicineId` (take the higher quantity).

---

### D-007: Image Upload — Multer + Cloudinary (multer-storage-cloudinary)

**Decision**: Use `multer-storage-cloudinary` (v4 with `--legacy-peer-deps`) to stream files directly from the multipart request to Cloudinary without touching the server disk. Separate storage configs for `medicore/medicines` (images) and `medicore/prescriptions` (files).

**Rationale**: Stateless server — no disk I/O, no cleanup needed. Prescription PDFs and medicine images go to different Cloudinary folders for access control clarity.

---

### D-008: Frontend Routing — React Router DOM v6

**Decision**: Use React Router v6 with `createBrowserRouter` + `RouterProvider`. Role-based protected routes implemented as layout-route wrappers (`<ProtectedRoute role="pharmacist" />`).

**Rationale**: Standard choice for React SPA; v6 has built-in nested route layouts that match the `/pharmacist/*` and `/admin/*` sub-route structure.

---

### D-009: UI Theme Implementation

**Decision**:
- Tailwind CSS custom config adds `primary` (teal `#0D9488`), `mint` (`#d1fae5`), `warm-white` (`#fafaf9`) tokens.
- Fonts loaded via `@fontsource` npm packages: `@fontsource/plus-jakarta-sans` (body) + `Cabinet Grotesk` via CDN `@font-face` (no npm package available).
- All Framer Motion variants co-located in a `client/src/utils/motionVariants.js` file for reuse across pages.

---

## Resolved Unknowns

All items from Technical Context were resolved without NEEDS CLARIFICATION:
- Node.js version: 20 LTS (current LTS at time of planning)
- Testing: out of scope per spec
- Performance targets: derived from spec SC-001 and SC-002
- Razorpay keys: environment variables (not in code — see quickstart.md)
- Cloudinary credentials: environment variables
