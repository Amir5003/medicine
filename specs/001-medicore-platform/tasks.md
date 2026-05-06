---
description: "Task list for MediCore — Medicine Delivery & Salt Alternate Platform"
---

# Tasks: MediCore — Medicine Delivery & Salt Alternate Platform

**Branch**: `001-medicore-platform` | **Date**: 2026-05-04  
**Input**: `specs/001-medicore-platform/` (plan.md, spec.md, data-model.md, research.md, quickstart.md, contracts/)  
**Tests**: Not in scope — spec explicitly states "Testing: Not in scope for v1"

## Format: `[ID] [P?] [Story?] Description with file path`

- **[P]**: Can run in parallel (operates on different files, no incomplete task dependency)
- **[US1/US2/US3/US4]**: User story this task belongs to
- No story label on Setup, Foundational, and Polish phase tasks

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Monorepo scaffolding — get both `server/` and `client/` to a buildable baseline

- [x] T001 Create monorepo root structure: `server/`, `client/`, `shared/` folders and root `.gitignore`
- [x] T002 Initialize Vite + React 18 client in `client/` with Tailwind CSS 3 (`npm create vite@latest client -- --template react` then configure `tailwind.config.js` and `index.css` with custom tokens: teal `#0D9488`, mint, warm-white)
- [x] T003 [P] Create `shared/roles.js` exporting `ROLES = { PATIENT: 'patient', PHARMACIST: 'pharmacist', ADMIN: 'admin' }`
- [x] T004 [P] Create `shared/orderStatus.js` exporting `ORDER_STATUS` enum: `pending`, `processing`, `shipped`, `delivered`, `cancelled`
- [x] T005 [P] Create `server/.env.example` with all required keys: `NODE_ENV`, `PORT`, `MONGO_URI`, `JWT_SECRET`, `JWT_EXPIRE`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `CLIENT_URL`
- [x] T006 [P] Create `client/.env` and `client/.env.example` with `VITE_API_URL` and `VITE_RAZORPAY_KEY_ID`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core backend infrastructure and frontend skeleton that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Backend Core

- [x] T007 Create `server/index.js` — Express app init: `helmet`, `morgan`, `cors` (allow `CLIENT_URL`, `credentials: true`), `cookie-parser`, `express-rate-limit`, `express.json()`, global error handler mount; start listening on `PORT`; `mongoose.connect()` called from `config/db.js`
- [x] T008 [P] Create `server/config/db.js` — Mongoose `connect()` with Atlas URI from `process.env.MONGO_URI`; log success/failure
- [x] T009 [P] Create `server/config/cloudinary.js` — Cloudinary v2 SDK `config()` + `multer-storage-cloudinary` storage for medicine images (folder: `medicore/medicines`) and prescriptions (folder: `medicore/prescriptions`); export `uploadMedicineImage` and `uploadPrescription` multer middleware
- [x] T010 [P] Create `server/utils/token.js` — `generateToken(userId)` signs JWT; `sendTokenCookie(res, token)` sets HTTP-only cookie with `httpOnly: true`, `secure: NODE_ENV === 'production'`, `sameSite` conditional, 7-day maxAge
- [x] T011 [P] Create `server/middleware/auth.js` — `protect` middleware: reads `req.cookies.token`, verifies JWT, attaches `req.user` (populated from DB); returns 401 if missing or invalid
- [x] T012 [P] Create `server/middleware/role.js` — `authorize(...roles)` middleware factory: checks `req.user.role` against allowed roles; returns 403 if not authorized
- [x] T013 [P] Create `server/middleware/errorHandler.js` — global Express error handler: maps Mongoose validation errors, duplicate key errors, JWT errors, and generic errors to JSON responses with consistent `{ success: false, message, code }` shape
- [x] T014 [P] Create `server/middleware/validate.js` — `runValidation` middleware: calls `validationResult(req)` from `express-validator`, returns 400 with array of errors if any fail

### Backend Models

- [x] T015 Create `server/models/Medicine.js` — all fields per data-model.md: `name`, `slug` (auto from slugify), `brand`, `genericName`, `category`, `description`, `mrp`, `discountedPrice`, `stock`, `requiresPrescription`, `imageUrl`, `imagePublicId`, `salts` (array `{name, strength}`), `saltFingerprint` (pre-save hook: `salts.map(s => normalize(name)_strength).sort().join('|')`), `isActive` (default true), `salesCount`; indexes: `saltFingerprint`, `slug` (unique), `category`, `isActive`, `salesCount`
- [x] T016 [P] Create `server/models/User.js` — fields: `name`, `email` (unique), `password` (bcrypt pre-save hook), `role` (enum from `shared/roles.js`, default `patient`), `phone`, `addresses` (sub-doc array: `label`, `line1`, `line2`, `city`, `state`, `pincode`, `isDefault`); index: `email`
- [x] T017 [P] Create `server/models/Order.js` — fields: `orderNumber` (`MED-XXXXXXXX` auto-generated pre-save), `user` (ref User), `items` (OrderItem sub-doc array: `medicine` ref, `quantity`, `priceAtPurchase`, `isAlternateChosen`, `originalMedicineId`, `savingsAmount`), `address` (embedded snapshot), `totalAmount`, `totalSavings`, `paymentStatus` (pending/paid/failed), `razorpayOrderId`, `razorpayPaymentId`, `prescriptionUrl`, `status` (enum from `shared/orderStatus.js`, default `pending`); index: `user`, `status`, `createdAt`

### Frontend Skeleton

- [x] T018 Create `client/src/utils/api.js` — axios instance with `baseURL: import.meta.env.VITE_API_URL`, `withCredentials: true`; add response interceptor that extracts `data` and a request interceptor placeholder
- [x] T019 [P] Create `client/src/utils/formatPrice.js` — `formatPrice(amount)` returns `₹${amount.toLocaleString('en-IN')}`
- [x] T020 Create `client/src/stores/useAuthStore.js` — Zustand store: `user` (null), `setUser`, `clearUser`; exported `useAuthStore` hook; no persist (auth state is set from TanStack Query `useMe`)
- [x] T021 Create `client/src/stores/useCartStore.js` — Zustand store with `persist` middleware (key `medicore-cart`, localStorage): `items` array, `addItem(medicine, isAlternate)` (increments qty if duplicate), `removeItem(id)`, `updateQty(id, qty)`, `clearCart()`, computed `totalItems`, `totalAmount`, `totalSavings`; blocks add if `medicine.stock <= 0`
- [x] T022 [P] Create `client/src/stores/useUIStore.js` — Zustand store: `cartDrawerOpen`, `loginModalOpen`, `toggleCartDrawer()`, `openLoginModal()`, `closeLoginModal()`
- [x] T023 [P] Create `client/src/components/ui/Button.jsx` — variants: `primary` (teal), `secondary` (outlined), `ghost`; sizes: `sm`, `md`, `lg`; `loading` prop shows spinner; `disabled` state handled
- [x] T024 [P] Create `client/src/components/ui/Badge.jsx` — variants: `rx` (red, "Rx"), `savings` (green, "Save ₹X"), `category` (teal, filled), `status` (maps order status to color)
- [x] T025 [P] Create `client/src/components/ui/Card.jsx` — base card with shadow, border-radius, optional hover lift
- [x] T026 [P] Create `client/src/components/ui/Skeleton.jsx` — animated pulse skeleton: `SkeletonLine`, `SkeletonCard`, `SkeletonPanel` variants using Tailwind `animate-pulse`
- [x] T027 [P] Create `client/src/components/ui/Modal.jsx` — overlay + centered content; closes on backdrop click; `isOpen`, `onClose`, `children` props; Framer Motion `AnimatePresence` fade
- [x] T028 Create `client/src/components/layout/Navbar.jsx` — logo, search bar (navigates to `/search?q=`), cart icon with `useCartStore` item count badge, auth state from `useAuthStore` (shows "Login" or user name), cart icon opens `CartDrawer`
- [x] T029 [P] Create `client/src/components/layout/Footer.jsx` — simple footer with brand name, tagline, links
- [x] T030 Create `client/src/components/layout/Layout.jsx` — `<Navbar />` + `<Outlet />` + `<Footer />` + `<CartDrawer />` + `<Toaster />`
- [x] T031 Create `client/src/main.jsx` — `createBrowserRouter` with all routes: `/` (Home), `/search` (SearchResults), `/medicine/:slug` (MedicineDetail), `/cart`, `/checkout`, `/order-success/:id`, `/orders`, `/orders/:id`, `/profile`, `/pharmacist/*`, `/admin/*`; wrap with `QueryClientProvider`, `<App />` renders `<RouterProvider>`

**Checkpoint**: Foundation ready — both `npm run dev` in `client/` and `node server/index.js` should start without errors

---

## Phase 3: User Story 1 — Search, Compare & Choose (Priority: P1) 🎯 MVP

**Goal**: Patient can search for medicines, view a detail page with an Alternate Panel showing cheaper salt-equivalent medicines, and add the best alternate to their cart.

**Independent Test**: Open the app without an account. Search "Paracetamol". Open a medicine detail page. The Alternate Panel must show ≥1 alternate sorted cheapest first, each with a savings badge. Click "Add Alternate to Cart" — cart shows `isAlternateChosen: true` and correct savings.

### Implementation for User Story 1

- [x] T032 [P] [US1] Create `client/src/utils/saltFingerprint.js` — `buildFingerprint(salts)` = `salts.map(s => normalizeStr(s.name)+'_'+s.strength).sort().join('|')` (mirrors server logic, for display/debug only)
- [x] T033 [US1] Create `server/services/saltAlternateService.js` — `findAlternates(medicine, limit=5)`: queries for `{ saltFingerprint: medicine.saltFingerprint, _id: { $ne: medicine._id }, stock: { $gt: 0 }, isActive: true }`, sorts by `discountedPrice asc`, limits to 5, maps each result to include computed `savingsPercent = Math.round((medicine.discountedPrice - alt.discountedPrice) / medicine.discountedPrice * 100)`
- [x] T034 [US1] Create `server/controllers/medicineController.js` — handlers: `searchMedicines` (load all active docs, run Fuse.js with keys `['name','brand','genericName','salts.name']`, return top 20), `getTrending` (sort by `salesCount` desc, limit 10), `getCategories` (distinct `category` from active docs), `getMedicineBySlug` (find by slug, call `findAlternates`, return medicine + alternates), `createMedicine` (pharmacist/admin), `updateMedicine`, `patchStock`, `softDeleteMedicine` (admin only sets `isActive: false`)
- [x] T035 [US1] Create `server/routes/medicineRoutes.js` — mount per `contracts/medicines.md`: `GET /search`, `GET /trending`, `GET /categories`, `GET /:slug` (public); `POST /` (protect + authorize pharmacist/admin), `PUT /:id`, `PATCH /:id/stock`, `DELETE /:id` (admin only)
- [x] T036 [P] [US1] Create `client/src/hooks/useMedicines.js` — TanStack Query hooks: `useSearchMedicines(q)` (enabled when `q.length > 0`), `useMedicineBySlug(slug)`, `useTrending()`, `useCategories()`; all call `api.get(...)`, staleTime 60s for trending/categories, 30s for search
- [x] T037 [P] [US1] Create `client/src/hooks/useAlternates.js` — `useAlternates(slug)`: TanStack Query fetches `/api/medicines/${slug}` and returns `data.alternates`; staleTime 30s; returns `{ alternates, isLoading, isError }`
- [x] T038 [P] [US1] Create `client/src/components/medicine/SavingsBadge.jsx` — green pill badge: `savings > 0` → "Save ₹{amount}", `savings === 0` → "Same Price", `savings < 0` → show nothing; uses `formatPrice`
- [x] T039 [P] [US1] Create `client/src/components/medicine/MedicineCard.jsx` — medicine card with: image (`imageUrl`), name, brand, `discountedPrice`, `mrp` (strikethrough if different), `SavingsBadge`, Rx badge if `requiresPrescription`, out-of-stock overlay if `stock === 0`, "Add to Cart" button that calls `useCartStore.addItem`
- [x] T040 [US1] Create `client/src/components/medicine/AlternatePanel.jsx` — panel showing up to 5 alternates; each row: image thumbnail, name, brand, price, `SavingsBadge`, "Add Alternate" button; sorted cheapest first; hidden when `alternates.length === 0`; shows `SkeletonPanel` while loading; renders Framer Motion slide-in animation
- [x] T041 [US1] Create `client/src/pages/Home.jsx` — hero section with search bar (auto-focus, submits to `/search?q=`), Trending section using `useTrending()` with `SkeletonCard` loader, category filter chips using `useCategories()`; mobile-first layout (360 px)
- [x] T042 [US1] Create `client/src/pages/SearchResults.jsx` — reads `?q=` from URL, calls `useSearchMedicines(q)`, renders `MedicineCard` grid with `SkeletonCard` while loading; empty state message when no results; category filter chips
- [x] T043 [US1] Create `client/src/pages/MedicineDetail.jsx` — fetches medicine via `useMedicineBySlug(slug)`; full detail: image, name, brand, salts list, price, prescription badge, description, stock count; renders `AlternatePanel`; "Add to Cart" button with stock guard; `SkeletonPanel` while loading

**Checkpoint**: US1 complete — search → detail → alternate panel → add to cart works end-to-end without login

---

## Phase 4: User Story 2 — Guest Cart → Checkout → Pay (Priority: P2)

**Goal**: Guest user can build a cart, proceed to checkout, authenticate only at payment, upload prescription if needed, pay via Razorpay, and see an animated order confirmation.

**Independent Test**: Add one OTC + one Rx medicine to cart as guest. On cart page: Rx warning + prescription upload block is shown. Proceed to checkout WITHOUT login redirect. Click "Pay Now" → login modal appears. After login, prescription upload completes, Razorpay test modal opens, payment succeeds → `OrderSuccess` page with animated timeline and `MED-XXXXXXXX` orderNumber.

### Implementation for User Story 2

- [x] T044 [US2] Create `server/controllers/authController.js` — `register` (hash pass, create user, sendTokenCookie), `login` (bcrypt compare, sendTokenCookie), `logout` (clear cookie), `me` (return `req.user` populated), `addAddress` (push to user.addresses, set isDefault logic)
- [x] T045 [US2] Create `server/routes/authRoutes.js` — mount per `contracts/auth.md`: `POST /register`, `POST /login`, `POST /logout`, `GET /me` (protect), `POST /addresses` (protect)
- [x] T046 [US2] Create `server/services/paymentService.js` — `razorpayCreateOrder({ items })`: recalculates total from DB prices (prevents tampering), calls `razorpay.orders.create`; `verifySignature({ razorpayOrderId, razorpayPaymentId, razorpaySignature })`: HMAC-SHA256 with `RAZORPAY_KEY_SECRET`; returns `{ isValid: boolean }`
- [x] T047 [US2] Create `server/controllers/paymentController.js` — `createPaymentOrder` (protect, call `paymentService.razorpayCreateOrder`, pre-flight stock check), `verifyPayment` (protect, call `paymentService.verifySignature`, on success: decrement stock atomically with `$inc`, update order `paymentStatus: 'paid'`)
- [x] T048 [US2] Create `server/routes/paymentRoutes.js` — `POST /create-order` (protect), `POST /verify` (protect)
- [x] T049 [US2] Create `server/controllers/orderController.js` — `placeOrder` (protect, re-validate stock for all items, create order with pending paymentStatus), `getMyOrders` (protect, paginated, patient sees own orders), `getOrderById` (protect, patient sees own / pharmacist+admin see all), `uploadPrescription` (protect, multer uploadPrescription, save URL to order), `getOrderQueue` (protect + authorize pharmacist/admin, filter pending+processing), `updateOrderStatus` (protect + authorize pharmacist/admin, validate transition via `ORDER_STATUS` enum sequence, reject invalid transitions)
- [x] T050 [US2] Create `server/routes/orderRoutes.js` — mount per `contracts/orders.md`: `POST /` (protect), `GET /` (protect), `GET /queue` (protect+authorize), `GET /:id` (protect), `POST /:id/prescription` (protect + upload middleware), `PATCH /:id/status` (protect+authorize)
- [x] T051 [P] [US2] Create `client/src/hooks/useAuth.js` — TanStack Query mutations: `useRegister`, `useLogin`, `useLogout`; query `useMe` (fetches `/api/auth/me`, syncs result to `useAuthStore.setUser`); useMe runs `refetchOnWindowFocus: false`
- [x] T052 [P] [US2] Create `client/src/hooks/useOrders.js` — TanStack Query: `usePlaceOrder` mutation, `useMyOrders(page)`, `useOrderById(id)`, `useUploadPrescription` mutation, `useUpdateOrderStatus` mutation (pharmacist)
- [x] T053 [P] [US2] Create `client/src/components/cart/CartItem.jsx` — row: image, name, brand, qty stepper (`+`/`-`, disable minus at 1), remove icon, price × qty, savings label if `isAlternateChosen: true` showing "Alternate chosen — Save ₹X"
- [x] T054 [US2] Create `client/src/components/cart/CartDrawer.jsx` — slide-in drawer from right (Framer Motion): `CartItem` list, prescription warning banner if any Rx item present, subtotal / savings summary row, "View Cart" CTA, "Checkout" CTA
- [x] T055 [US2] Create `client/src/pages/Cart.jsx` — full cart page: `CartItem` list (desktop), prescription upload section (shown + blocks proceed when Rx present), total MRP / total discount / total savings breakdown, "Proceed to Checkout" button (no auth check here per FR-010), empty cart illustration
- [x] T056 [US2] Create `client/src/pages/Checkout.jsx` — address selector (existing addresses + "Add new address" form), order review (items + totals), "Pay Now" button; **if guest**: clicks "Pay Now" → `openLoginModal()` then after login cart is merged and page re-loads; **if authenticated**: calls `createPaymentOrder`, opens Razorpay checkout SDK, on modal success calls `verifyPayment` then navigates to `/order-success/:orderId`
- [x] T057 [US2] Create `client/src/pages/OrderSuccess.jsx` — animated confetti burst + order timeline with Framer Motion stagger: status chips (placed ✓, processing, shipped, delivered), orderNumber (`MED-XXXXXXXX`), items list, total amount, "My Orders" link; respects `useReducedMotion`
- [x] T058 [US2] Create `client/src/pages/MyOrders.jsx` — `useMyOrders(page)` paginated list, each row: orderNumber, date, status badge, total, item count, "View" link; `SkeletonCard` while loading; empty state
- [x] T059 [US2] Create `client/src/pages/OrderDetail.jsx` — `useOrderById(id)` full detail: items with images, address, prescription URL (if present), payment status, status tracker timeline (Framer Motion step animation), `SkeletonPanel` while loading
- [x] T060 [US2] Create `client/src/pages/Profile.jsx` — user info read-only (name, email, role), address list with default badge, "Add Address" form (inline, validates pincode), delete address action; `useMe` for data + `useAddAddress` mutation

**Checkpoint**: US2 complete — full guest → cart → checkout → Razorpay pay → order confirmation flow works end-to-end

---

## Phase 5: User Story 3 — Pharmacist Manages Inventory & Fulfils Orders (Priority: P3)

**Goal**: Pharmacist can manage the medicine catalogue (add/edit/stock), view their dashboard KPIs, and work through the orders queue with status updates.

**Independent Test**: Login as pharmacist → `/pharmacist/inventory` → add new medicine with image → it appears in patient search → set stock to 0 → verify OOS in patient cart → restore stock → go to orders queue → mark a `pending` order as `processing` → verify patient order detail updates.

### Implementation for User Story 3

- [x] T061 [US3] Create `server/controllers/pharmacistController.js` — `getInventory` (paginated, supports `?category`, `?lowStock`, `?search` per contracts/pharmacist.md), `patchInventoryStock` (update stock by ID), `getPharmacistDashboard` (aggregated stats: pendingOrders, processingOrders, lowStockCount, todayDeliveries, totalMedicines)
- [x] T062 [US3] Create `server/routes/pharmacistRoutes.js` — all endpoints authorized to `pharmacist` and `admin` roles; mounts: `GET /inventory`, `PATCH /inventory/:id`, `GET /dashboard`, `GET /orders` and `PATCH /orders/:id/status` (delegated to orderController handlers)
- [x] T063 [US3] Create `client/src/pages/pharmacist/PharmacistDashboard.jsx` — KPI stat cards (pendingOrders, lowStockCount, todayDeliveries), quick-link buttons to Inventory and OrdersQueue; `SkeletonCard` loading state; route protected (`role === 'pharmacist' || 'admin'`)
- [x] T064 [US3] Create `client/src/pages/pharmacist/Inventory.jsx` — sortable/filterable table (category dropdown, low-stock toggle, name search), inline stock update input per row, "Add Medicine" button opens full form modal with: all required fields, salts composer (add salt name + strength rows), Cloudinary image upload (up to 5 images via `uploadMedicineImage` middleware), submit calls `POST /api/medicines`; "Edit" opens same form pre-filled, submit calls `PUT /api/medicines/:id`
- [x] T065 [US3] Create `client/src/pages/pharmacist/OrdersQueue.jsx` — tab bar (Pending / Processing / All), order rows: patient name, items with images, prescription URL thumbnail (click to open), status dropdown limited to valid transitions only (per `ORDER_STATUS` forward-only sequence), confirm button calls `PATCH /api/orders/:id/status`; pagination

**Checkpoint**: US3 complete — pharmacist inventory management and order fulfilment work end-to-end

---

## Phase 6: User Story 4 — Admin Controls Platform (Priority: P4)

**Goal**: Admin sees platform-wide analytics, can change user roles, soft-delete medicines, and manage the salt catalogue.

**Independent Test**: Login as admin → dashboard shows non-zero stats from seed data → promote a patient to pharmacist → verify they gain pharmacist access → soft-delete a medicine → verify it disappears from patient search → add new salt via Salts page.

### Implementation for User Story 4

- [x] T066 [US4] Create `server/controllers/adminController.js` — `getDashboard` (aggregate: total users, medicines, orders; revenueToday; revenueLast30Days; pendingOrders; lowStockMedicines; totalSalts — in-memory Salt collection or distinct from Medicine salts), `getUsers` (paginated, search, role filter), `changeUserRole` (validate role enum, block self-demotion, update and return user), `getSalts` (paginated, search), `createSalt` (validate unique normalized name), `updateSalt`, `deleteSalt` (check no Medicine references it), `getAllOrders` (paginated, all users, status/userId/date range filters)
- [x] T067 [US4] Create `server/routes/adminRoutes.js` — all routes authorized to `admin` only: `GET /dashboard`, `GET /users`, `PATCH /users/:id/role`, `GET /salts`, `POST /salts`, `PUT /salts/:id`, `DELETE /salts/:id`, `GET /orders`; also mount `PATCH /medicines/:id` → `softDeleteMedicine` from medicineController
- [x] T068 [US4] Create `client/src/pages/admin/AdminDashboard.jsx` — analytics grid: total orders, total savings generated, revenue today, platform users, top-5 medicines by order volume (bar or list); `SkeletonCard` loading; route protected (`role === 'admin'`)
- [x] T069 [US4] Create `client/src/pages/admin/AdminUsers.jsx` — searchable user table with columns: name, email, role badge, joined date; role change Select (shows current, options: patient/pharmacist/admin); disabled for own account; calls `PATCH /api/admin/users/:id/role`; `SkeletonCard` loading
- [x] T070 [US4] Create `client/src/pages/admin/AdminMedicines.jsx` — full medicine table with active/inactive filter; "Deactivate" button calls `DELETE /api/medicines/:id` (soft delete); reactivate toggle calls `PUT /api/medicines/:id` with `isActive: true`; search and category filter
- [x] T071 [US4] Create `client/src/pages/admin/AdminSalts.jsx` — salt table: name, description, medicine count; "Add Salt" inline form; "Delete" button disabled if `medicineCount > 0` with tooltip "Salt is in use"; calls CRUD endpoints per `contracts/admin.md`

**Checkpoint**: US4 complete — admin can manage users, medicines, and salts with full role-based access control

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Wire everything together, ensure mobile-first compliance, animations, and seed verification

- [x] T072 Mount all API route groups in `server/index.js`: import and mount `authRoutes` at `/api/auth`, `medicineRoutes` at `/api/medicines`, `orderRoutes` at `/api/orders`, `paymentRoutes` at `/api/payment`, `pharmacistRoutes` at `/api/pharmacist`, `adminRoutes` at `/api/admin`; confirm `GET /api/health` returns `{ ok: true }` at startup
- [x] T073 Wire all frontend routes in `client/src/main.jsx` or a dedicated `router.jsx`: add role-guard wrappers `<RequireAuth>` (redirect to login modal if no user) and `<RequireRole role="pharmacist">` / `<RequireRole role="admin">` (redirect to `/` if wrong role); attach to pharmacist and admin page trees
- [x] T074 [P] Audit Framer Motion animations across all components: `CartDrawer` slide-in, `AlternatePanel` slide-in, `MedicineCard` hover lift, `OrderSuccess` confetti stagger, `Modal` fade — add `useReducedMotion` check in each; skip animation when `shouldReduceMotion` is `true` (FR-025)
- [x] T075 [P] Mobile audit at 360 px: open each of the 15 patient-facing pages in DevTools at 360 px, fix any horizontal overflow, truncate long medicine names with `truncate` class, ensure all buttons are ≥ 44 px tap targets, verify Alternate Panel scrolls correctly on small screens (FR-024)
- [x] T076 [P] Verify `Skeleton` loaders are present on every async data page: `Home` (trending), `SearchResults`, `MedicineDetail`, `Cart` (if loading from merge), `MyOrders`, `OrderDetail`, `PharmacistDashboard`, `Inventory`, `AdminDashboard` — add missing skeletons (FR-026)
- [x] T077 Run `npm run seed` from `server/` — verify 50+ medicines seeded, ≥3 medicines per category share a `saltFingerprint`, `GET /api/medicines/search?q=Paracetamol` returns results, Alternate Panel on Dolo 650 detail shows Calpol 650 and others (SC-009)
- [x] T078 [P] Final integration smoke test via `quickstart.md` steps: start server + client, complete the full patient flow (search → detail → alternate add → cart → checkout → Razorpay test payment → confirmation) and verify `SC-001` through `SC-010` pass

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 1 (Setup)
    └── Phase 2 (Foundational) ← BLOCKS all user stories
            ├── Phase 3 (US1 — P1) 🎯 MVP
            ├── Phase 4 (US2 — P2) ← depends on Phase 3 for medicine data
            ├── Phase 5 (US3 — P3) ← depends on Phase 3 medicine model
            └── Phase 6 (US4 — P4) ← depends on all models being ready
                    └── Phase 7 (Polish) ← depends on all phases complete
```

### User Story Dependencies

| Story | Depends On | Can start when… |
|---|---|---|
| US1 (P1) | Phase 2 complete | T007–T031 done |
| US2 (P2) | Phase 2 + US1 medicine routes | T031 + T035 done (auth/orders need medicines) |
| US3 (P3) | Phase 2 + US1 Medicine model | T017 done (Medicine model) |
| US4 (P4) | Phase 2 + all models | T015–T017 done |

### Critical Sequence Within US2

```
T044 (authController) → T045 (authRoutes)
T046 (paymentService) → T047 (paymentController) → T048 (paymentRoutes)
T049 (orderController) — depends on T015 (Medicine) + T017 (Order) models
T055 (Cart page) → T056 (Checkout) → T057 (OrderSuccess)
```

### Within Each Phase: Recommended Execution Order

- Backend models (T015–T017) first — services and controllers import them
- Services (T033, T046) before controllers that call them (T034, T047)
- Controllers (T034, T044, etc.) before routes (T035, T045, etc.)
- All [P] tasks within a backend phase can run in parallel (they touch different files)
- Frontend pages last within each US phase (after hooks that feed them are ready)

---

## Parallel Opportunities

### Phase 2 (Foundational)

All of these can run in parallel:
- T008 (`db.js`) + T009 (`cloudinary.js`) + T010 (`token.js`) + T011 (`auth.js`) + T012 (`role.js`) + T013 (`errorHandler.js`) + T014 (`validate.js`)
- T016 (`User.js`) + T017 (`Order.js`) can run while T015 (`Medicine.js`) is in progress
- T019 (`formatPrice.js`) + T020 (`useAuthStore`) + T022 (`useUIStore`) + T023–T027 (UI components) + T029 (`Footer.jsx`) can all run in parallel

### Phase 3 (US1)

T032, T036, T037, T038, T039 all touch different files — all [P], run in parallel after T033/T034/T035 backend is live

### Phase 4 (US2)

T051, T052, T053 are [P] — frontend hooks and components; run while backend (T044–T050) is being built

### Phase 7 (Polish)

T074, T075, T076 are all [P] — audit tasks on different concerns; run simultaneously

---

## Implementation Strategy

### MVP Scope (Phase 1 + 2 + 3 = US1 only)

Deliver a working search → detail → alternate panel → add to cart experience. This is the **core value proposition** of MediCore. It can be demoed to stakeholders before checkout/payment is built.

### Incremental Delivery

1. **MVP** (T001–T043): Full search/compare/cart experience — no login, no payment
2. **v0.2** (+ T044–T060): Full payment + order flow; guest → auth → pay
3. **v0.3** (+ T061–T065): Pharmacist back-office
4. **v1.0** (+ T066–T078): Admin panel + polish + 360 px audit
