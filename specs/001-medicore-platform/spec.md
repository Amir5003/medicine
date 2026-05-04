# Feature Specification: MediCore — Medicine Delivery & Salt Alternate Platform

**Feature Branch**: `001-medicore-platform`
**Created**: 2026-05-04
**Status**: Draft

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Search, Compare & Choose a Safe Cheaper Alternative (Priority: P1)

A patient searches for a medicine by brand name (e.g. "Dolo 650") or by active ingredient (e.g. "Paracetamol"). They land on the medicine detail page, where a panel shows all medicines with the exact same salt composition and strength — ranked cheapest first — with a live badge showing how much money they save per unit. The patient can switch to a cheaper generic with a single tap and add it to their cart.

**Why this priority**: This is the core value proposition of MediCore. Without it, MediCore is just another medicine catalogue. Every other story depends on medicines being discoverable and comparisons being trustworthy.

**Independent Test**: Open the app without an account. Search "Paracetamol 650mg". Open a result's detail page. The Alternate Panel must appear showing ≥1 alternate (when seeded data is present), sorted cheapest first, each with a real-time savings badge. Add the cheapest alternate to the cart. Verify the cart shows the correct alternate name and savings amount.

**Acceptance Scenarios**:

1. **Given** a patient on the Home page with no account, **When** they type a brand name in the search bar, **Then** results appear within 1 second as medicine cards with name, price, manufacturer, and a "Save ₹X" badge if a cheaper salt-equivalent exists.
2. **Given** a patient viewing a medicine detail page, **When** the page loads, **Then** the Alternate Panel renders with up to 5 alternates that share the exact `saltFingerprint`, each tagged as cheaper / same price / more expensive.
3. **Given** an alternate shown in the panel, **When** its stock is 0, **Then** it MUST NOT appear in the list.
4. **Given** a cheaper alternate shown in the panel, **When** the patient taps "Add Alternate to Cart", **Then** the cart records `isAlternateChosen: true`, the `originalMedicineId`, and the correct `savingsAmount`.
5. **Given** a medicine with `isPrescriptionRequired: true`, **When** it appears in search results or detail page, **Then** it shows an "Rx Required" badge prominently.
6. **Given** search input that matches a salt name rather than a brand name, **When** the patient submits the query, **Then** results include all medicines containing that salt at any strength.

---

### User Story 2 — Guest Cart → Checkout → Pay (Priority: P2)

A patient (not logged in) browses, adds items to a cart, proceeds to checkout, enters their delivery address, and pays via Razorpay. If the cart contains a Prescription medicine, they must upload a prescription file before payment is enabled. The signup/login prompt appears only when the patient clicks "Pay Now" — not before. On successful payment an animated order confirmation is shown with a timeline.

**Why this priority**: This is the revenue-generating flow. It enforces the Guest First law and the Prescription Flag law simultaneously, and is independently demonstrable as "a working medicine shop".

**Independent Test**: Add two items (one Rx, one OTC) to the cart without logging in. Verify the cart shows a "Prescription required" notice. Proceed to checkout — app should NOT redirect to login yet. Enter an address. Click "Pay Now" — THEN a signup/login modal appears. After login/register, land back on checkout ready to pay. Upload a prescription. Complete payment with Razorpay test keys. Verify an order confirmation page with `orderId` = `MED-XXXXXXXX` and an animated timeline.

**Acceptance Scenarios**:

1. **Given** a guest with items in their cart, **When** they navigate to `/cart`, **Then** they see all cart items, total MRP, total discount, total savings from alternate choices, and a "Proceed to Checkout" button — with no login wall.
2. **Given** the cart contains a medicine where `isPrescriptionRequired: true`, **When** the patient is on the cart page, **Then** a prescription upload section is displayed and checkout is blocked until at least one file is uploaded.
3. **Given** a guest on the checkout page, **When** they click "Pay Now", **Then** a login/signup modal appears. After authenticating, the guest cart is merged into the user account and payment proceeds.
4. **Given** an authenticated patient with a complete address and (if needed) a prescription uploaded, **When** they initiate payment, **Then** a Razorpay payment window opens. On success, an order is created with `paymentStatus: "paid"` and they are redirected to `/order/:id`.
5. **Given** a successful order placement, **When** the order confirmation page loads, **Then** an animated confetti + order timeline is shown with the `orderId`, item list, total, and "Estimated delivery" status.
6. **Given** a patient viewing their order later at `/orders`, **When** the pharmacist updates the order status, **Then** the status tracker on the patient's side reflects the new state in real time on next load.

---

### User Story 3 — Pharmacist Manages Inventory & Fulfils Orders (Priority: P3)

A pharmacist logs in to their dashboard and can add new medicines (with images), edit existing ones, update stock levels, toggle a medicine active/inactive, and work through the orders queue — filtering by status and marking orders as confirmed → packed → dispatched → delivered.

**Why this priority**: Without accurate pharmacist-maintained inventory, the Stock Truth law cannot hold. This story keeps the catalogue trustworthy and enables order fulfilment.

**Independent Test**: Log in as a pharmacist. Go to `/pharmacist/inventory`. Add a new medicine with all required fields and one image. Verify it appears in the catalogue. Set its stock to 0 and verify it becomes un-addable to a patient's cart. Update stock back to 10. Go to `/pharmacist/orders`, filter for "placed" orders, mark one as "confirmed". Verify the patient's order detail page reflects the new status.

**Acceptance Scenarios**:

1. **Given** a logged-in pharmacist on the inventory page, **When** they submit the Add Medicine form with all required fields and at least one image, **Then** the medicine appears in the public catalogue with correct data and the `saltFingerprint` is auto-generated.
2. **Given** a pharmacist updates stock to 0 via the stock update control, **When** a patient views that medicine, **Then** the Add-to-Cart button is replaced by "Out of Stock" and the medicine does not appear in alternate panels.
3. **Given** a pharmacist on the orders queue page, **When** they filter by status "placed", **Then** only orders with that status are shown, with patient name, items, and prescription uploads visible.
4. **Given** a pharmacist selects an order and changes its status, **When** they confirm the update, **Then** the order's `status` field is updated and only valid forward transitions are allowed (placed → confirmed → packed → dispatched → delivered; cancelled is always available).

---

### User Story 4 — Admin Controls Platform: Users, Catalogue & Analytics (Priority: P4)

An admin logs in and gets a dashboard showing platform-wide analytics (total orders, total patient savings generated, top medicines). They can view all users, change a user's role (patient ↔ pharmacist), deactivate a medicine from the full catalogue, and manage the salt database (add new salts, view all).

**Why this priority**: Admin capabilities are important for platform health but the patient-facing flows hold higher business priority. Admin tools can be delivered after the core flows are working.

**Independent Test**: Log in as an admin. The analytics dashboard shows non-zero numbers after seed data is present. Navigate to Users, find a patient, promote to pharmacist — verify the user can now access `/pharmacist` routes. Navigate to Medicines, soft-delete a medicine — verify it disappears from patient search. Navigate to Salts, add a new salt entry.

**Acceptance Scenarios**:

1. **Given** a logged-in admin on the dashboard, **When** any orders exist, **Then** they see total orders, total platform savings generated (sum of `totalSavings` across all orders), and top 5 medicines by order volume.
2. **Given** an admin on the Users page, **When** they change a user's role to "pharmacist", **Then** that user's JWT-protected pharmacist routes become accessible and their patient routes remain accessible.
3. **Given** an admin deletes (soft-deactivates) a medicine, **When** a patient searches for it, **Then** it does not appear in results and cannot be added to cart.
4. **Given** an admin on the Salts page, **When** they add a new salt with name and common strengths, **Then** it is available for reference when creating medicines.

---

### Edge Cases

- What happens when two salts have the same name but different strengths (e.g., Paracetamol 500mg vs 650mg)? → They must have different `saltFingerprint` values and must never appear as alternates of each other.
- What if all alternates for a medicine are out of stock? → The Alternate Panel does not render (or renders with an "No available alternatives" message). Never show OOS alternates.
- What if a guest adds an item to cart, then the item goes out of stock before checkout? → At order placement, stock is re-validated server-side and the order is rejected with a clear error message.
- What if Razorpay payment fails? → The order remains at `paymentStatus: "pending"`. The patient is shown an error and can retry. Stock is not decremented on failed payment.
- What if a patient uploads a prescription that does not contain the required medicine? → The platform cannot validate prescription content — it simply requires that a file was uploaded. A note makes this clear to the patient.
- What if the same medicine appears multiple times in the same cart? → Quantity is incremented rather than creating a duplicate line item.

---

## Requirements *(mandatory)*

### Functional Requirements

**Medicine Discovery**

- **FR-001**: The system MUST provide a fuzzy search over medicine names and active salt names; results must be ranked by relevance.
- **FR-002**: The system MUST display a medicine detail page with brand name, manufacturer, active salts with strengths, form, category, price, discounted price, stock status, prescription requirement badge, images, description, and side effects.
- **FR-003**: The system MUST compute and persist a `saltFingerprint` for every medicine automatically on save, using the formula: `salts.map(s => normalize(saltName) + "_" + strength).sort().join("|")`.
- **FR-004**: The system MUST return up to 5 salt-equivalent alternate medicines for any given medicine — only those with matching `saltFingerprint`, `stock > 0`, and `isActive: true` — sorted by `discountedPrice` ascending.
- **FR-005**: For each alternate, the system MUST compute real-time savings as `original.discountedPrice − alternate.discountedPrice`; never use cached or estimated values.

**Cart & Checkout**

- **FR-006**: The system MUST allow unauthenticated users to add medicines to a cart, modify quantities, and remove items without requiring login.
- **FR-007**: The cart MUST persist in the browser (e.g., localStorage via Zustand) for guest users and be merged into the user's server-stored cart upon login.
- **FR-008**: A medicine with `stock <= 0` MUST NOT be addable to the cart; the action must be blocked in both the UI and the API.
- **FR-009**: When a cart contains at least one medicine where `isPrescriptionRequired: true`, the system MUST require a prescription file upload before checkout can be completed.
- **FR-010**: The signup/login prompt MUST appear only when the patient attempts to initiate payment — not on the search, detail, cart, or checkout summary pages.

**Orders & Payments**

- **FR-011**: On order placement the system MUST re-validate stock server-side and reject the order if any item's available stock is insufficient.
- **FR-012**: The system MUST integrate with Razorpay to create a payment order and verify the payment signature server-side before marking `paymentStatus: "paid"`.
- **FR-013**: Stock MUST be decremented only after a payment is successfully verified, never on order creation or on failed payment.
- **FR-014**: Every placed order MUST receive an auto-generated `orderId` in the format `MED-XXXXXXXX`.
- **FR-015**: The system MUST record `totalSavings` on each order as the sum of `savingsAmount × quantity` for all alternate-chosen items.

**Authentication & Roles**

- **FR-016**: JWT tokens MUST be stored in HTTP-only cookies; never in `localStorage` or `sessionStorage`.
- **FR-017**: The system MUST enforce role-based access: `patient`, `pharmacist`, and `admin` roles with appropriate route protection on both backend and frontend.

**Pharmacist**

- **FR-018**: A pharmacist MUST be able to add and edit medicines, including uploading up to 5 images per medicine via Cloudinary.
- **FR-019**: A pharmacist MUST be able to update stock independently of all other medicine fields.
- **FR-020**: A pharmacist MUST be able to update order status through valid forward transitions only.

**Admin**

- **FR-021**: An admin MUST be able to view platform-level analytics: total orders, total savings generated, and top medicines by volume.
- **FR-022**: An admin MUST be able to change any user's role.
- **FR-023**: An admin MUST be able to soft-delete (deactivate) a medicine, making it invisible to patients without erasing historical order data.

**UI / UX**

- **FR-024**: All pages MUST function and display correctly at 360 px viewport width.
- **FR-025**: Every Framer Motion animation MUST have a clear functional purpose (state transition, confirmation, or attention direction). The system MUST respect `prefers-reduced-motion`.
- **FR-026**: All asynchronous data-loading states MUST display skeleton loaders, not blank screens or spinners alone.

---

### Key Entities

- **Medicine**: A sellable product with a brand name, manufacturer, active salt composition, pricing, stock, prescription flag, and images. The `saltFingerprint` field is the key to the alternate matching algorithm.
- **Salt**: An active pharmaceutical ingredient (e.g., "Paracetamol 650mg"). Salts are embedded in Medicine documents; their normalized combination forms the `saltFingerprint`.
- **User**: A platform member with one of three roles (patient / pharmacist / admin), a list of delivery addresses, and uploaded prescription URLs.
- **Order**: A completed purchase linking a User to a list of medicine items, capturing savings from alternate choices, payment state, and fulfilment status.
- **Cart**: The pre-order collection of items. Guest carts live in the browser; authenticated carts are merged to the server.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A patient can go from a blank search to a paid order in under 3 minutes on a mobile device at 360 px viewport.
- **SC-002**: The Alternate Panel loads and displays correct savings figures within 1 second of the medicine detail page opening.
- **SC-003**: 100% of alternates shown in the panel share the exact `saltFingerprint` with the original medicine — zero false positives.
- **SC-004**: 0 out-of-stock medicines appear in alternate panels or are addable to cart under any code path.
- **SC-005**: A guest user can reach the checkout summary page (address + order review step) without a single redirect to login.
- **SC-006**: Razorpay payment signature verification passes on the server before any order is marked `paymentStatus: "paid"`.
- **SC-007**: Platform-wide `totalSavings` figure on the admin dashboard accurately equals the sum of all order `totalSavings` fields.
- **SC-008**: All 14+ patient-facing pages pass a manual 360 px mobile audit with no horizontal scroll.
- **SC-009**: The seed script populates ≥ 50 medicines across ≥ 10 categories with valid salt compositions and salt fingerprints within 30 seconds.
- **SC-010**: No JWT token is ever stored outside an HTTP-only cookie — auditable via browser DevTools.

---

## Assumptions

- Indian market context: currency is ₹ (INR), phone numbers follow the 10-digit Indian format (6–9 prefix), and Razorpay is the only payment gateway needed.
- The prescription validation is legal/documentation only — the platform does not verify prescription authenticity programmatically; a file upload is sufficient to unblock checkout.
- Seed data will include at least 10 medicines sharing salt fingerprints across 3–4 categories so the alternate panel can be demonstrated immediately after setup.
- "Pharmacist" in this system is a trusted operator role — there is no separate vendor/store concept in v1; one shared inventory serves all patients.
- Email verification on registration is out of scope for v1; any valid email format is accepted.
- Real-time order status push (WebSockets/SSE) is out of scope; patients refresh or reload to see status updates.
- Image storage uses Cloudinary; no local disk storage of files in production.
- The admin salt database is a reference store only in v1 — it does not automatically generate salt fingerprints for medicines; pharmacists enter salt data per medicine directly.
