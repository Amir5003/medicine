<!--
SYNC IMPACT REPORT
==================
Version change: 1.0.0 → 1.1.0
Amendment: Tech Stack — State layer replaced: Redux Toolkit + RTK Query → Zustand
Reason: Zustand is lighter, requires no boilerplate, fits MediCore's focused slice
  needs (cart, auth, UI state) without the overhead of Redux. Server-side data
  fetching handled via TanStack Query (React Query) co-located in feature hooks.
Modified sections:
  - Tech Stack table: State row updated
  - Project Structure: app/ (Redux store) removed; features/ renamed to stores/
Templates requiring updates:
  ✅ constitution.md (this file)
  ✅ tasks-template.md — path conventions updated (stores/ instead of app/+features/)
  ✅ plan-template.md — no structural change needed; already uses generic paths
Follow-up TODOs: None
-->

# MediCore Constitution

## Core Principles

### I. Salt Integrity (NON-NEGOTIABLE)

Alternate medicines MUST be shown only when the `saltFingerprint` matches exactly —
same active salt names AND same strength for every ingredient. Partial matches are
forbidden. The fingerprint is computed as:
`salts.map(s => normalize(s.saltName) + "_" + s.strength).sort().join("|")`

No alternate may be shown if its stock is 0 or `isActive` is false.

### II. Savings Honesty

Savings displayed to the user MUST always equal the real-time price difference:
`savings = original.discountedPrice − alternate.discountedPrice`.
Estimated, cached, or manually entered savings figures are forbidden.
"No savings" must be shown honestly — never hide a zero or negative.

### III. Guest First

A user MUST be able to complete the full flow — search → browse → add to cart →
reach the checkout summary — without any account. The signup/login prompt
appears ONLY at the payment step. Guest cart MUST persist in localStorage and
be merged into the user's cart upon login.

### IV. Stock Truth

An out-of-stock medicine (`stock <= 0`) MUST NOT be addable to the cart under
any condition. The Add-to-Cart button MUST be disabled/replaced with an
"Out of Stock" indicator. All alternate suggestions must also pass this check.

### V. Prescription Flag

Any medicine where `isPrescriptionRequired: true` (Schedule H / H1) MUST block
the checkout button and require a prescription file upload before the order
can be submitted. A clear badge MUST be shown on the medicine card and detail page.

### VI. Mobile First

All UI is designed and tested at 360 px viewport width first, then scaled up.
No horizontal scroll permitted on mobile. Touch targets MUST be ≥ 44 px.
Every page and component MUST be audited at 360 px before marking complete.

### VII. Animation Purpose

Every Framer Motion animation MUST serve a functional role — communicating state
change, directing attention, or confirming an action. Purely decorative animations
that block interaction or delay perceived performance are forbidden. Animations MAY
be skipped via `prefers-reduced-motion`.

## Tech Stack (Non-Negotiable)

| Layer | Technology | Notes |
|---|---|---|
| Frontend | React 18 + Vite | HMR, modern React features |
| Styling | Tailwind CSS + Framer Motion | Utility-first + purposeful animation |
| State | Zustand + TanStack Query | Lightweight global stores + server-state cache |
| Backend | Node.js + Express.js | REST API, ESM modules |
| Database | MongoDB + Mongoose | saltFingerprint index required |
| Auth | JWT in HTTP-only cookies | Never localStorage for tokens |
| File Uploads | Multer + Cloudinary | Prescriptions and medicine images |
| Payments | Razorpay | India — UPI, cards, wallets |
| Search | MongoDB Atlas Search or Fuse.js | Fuzzy match on name + salt |

Changing any item in the Tech Stack column requires a constitution amendment and
MUST NOT be done mid-feature.

## Project Structure

```
medicore/
├── client/                          # React Frontend (Vite)
│   └── src/
│       ├── stores/                  # Zustand stores: useCartStore, useAuthStore, useUIStore
│       ├── pages/                   # Route-level page components
│       ├── components/
│       │   ├── ui/                  # Buttons, Badges, Cards (atomic)
│       │   ├── medicine/            # MedicineCard, AlternatePanel, SavingsBadge
│       │   ├── cart/                # CartDrawer, CartItem
│       │   └── layout/              # Navbar, Footer, Layout wrapper
│       ├── hooks/                   # Custom React hooks + TanStack Query hooks
│       └── utils/                   # formatPrice, saltFingerprint helpers
├── server/                          # Express Backend
│   ├── models/                      # Mongoose models
│   ├── routes/                      # Express routers
│   ├── controllers/                 # Route handler functions
│   ├── middleware/                  # auth, role, error, upload
│   ├── services/                    # saltAlternateService, paymentService
│   ├── seed/                        # DB seed scripts
│   └── config/                      # db.js, cloudinary.js
└── shared/                          # Shared enums: roles, order statuses
```

All `spec`, `plan`, and `task` artefacts live under `specs/` at the project root.

## Development Workflow

1. **Spec first** — Every feature starts with `/speckit.specify`. No code before
   the spec is approved.
2. **Plan second** — Run `/speckit.plan` to produce `plan.md`, `data-model.md`,
   and API contracts before writing any implementation tasks.
3. **Tasks third** — Run `/speckit.tasks` to generate the ordered task list in
   `tasks.md`. Tasks drive implementation; ad-hoc coding outside tasks is
   discouraged.
4. **Constitution check** — Every `plan.md` MUST have a Constitution Check section
   that explicitly validates the 7 Laws against the planned feature.
5. **Mobile-first review** — No page task may be marked complete without a 360 px
   viewport check.
6. **Law violations are blockers** — Any PR or task that violates a Law MUST be
   blocked until corrected. There are no exceptions in this build phase.

## Governance

This constitution supersedes all other design decisions. Any amendment requires:
1. A clear statement of which Law or section is changing and why.
2. An updated version number following semantic versioning (MAJOR for Law
   removals/redefinitions, MINOR for additions, PATCH for clarifications).
3. The `Last Amended` date updated to the change date.
4. Propagation of changes to dependent templates (`plan-template.md`,
   `spec-template.md`, `tasks-template.md`) in the same commit.

All spec work, PRs and task reviews must verify compliance with the 7 Laws before
approval. Refer to `specs/` for all active feature artefacts.

**Version**: 1.1.0 | **Ratified**: 2026-05-04 | **Last Amended**: 2026-05-04
