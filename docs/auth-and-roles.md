# Auth & Role-Based Access — MediCore

## Overview

MediCore uses **JWT auth via HTTP-only cookies** on the server, with **Zustand** holding the current user in the client. On every page load, the app hydrates auth state by calling `GET /api/auth/me` (via `useMe`).

---

## Roles

| Role | Value | Who is it |
|---|---|---|
| `patient` | `ROLES.PATIENT` | Default — self-registers via the sign-up form |
| `pharmacist` | `ROLES.PHARMACIST` | Registers with a pharmacist invite code, or promoted by admin |
| `admin` | `ROLES.ADMIN` | Created via `npm run seed` or direct DB — no self-signup |

---

## How Auth Works

### Login / Register

Click **Login** in the Navbar → `AuthModal` opens.

- **Login tab**: `POST /api/auth/login` — sets an HTTP-only cookie (`token`) valid for 7 days.
- **Register tab**: `POST /api/auth/register` — role defaults to `patient`.
  - To register as a pharmacist: click *"Registering as a pharmacist? Enter invite code →"* and enter the code set in `server/.env` (`PHARMACIST_INVITE_CODE`).

### Session Persistence

Auth state is stored in **Zustand** (`useAuthStore`) in memory only (no localStorage). On page refresh:

1. `Layout.jsx` calls `useMe()` which hits `GET /api/auth/me`.
2. If the cookie is valid, the server returns the user object.
3. `useMe` calls `setUser(user)` to repopulate the Zustand store.
4. The `Navbar` re-renders with the correct user context.

### Logout

Click the user avatar in the Navbar → dropdown → **Sign Out**.

- Calls `POST /api/auth/logout` — server clears the cookie.
- Client clears Zustand store (`clearUser()`).
- TanStack Query cache is wiped.
- User is redirected to `/`.

---

## Role-Based Navigation

The Navbar avatar dropdown shows **different links per role**:

### Patient
```
My Orders  →  /orders
Profile    →  /profile
Sign Out
```

### Pharmacist
```
Dashboard     →  /pharmacist
Inventory     →  /pharmacist/inventory
Orders Queue  →  /pharmacist/orders
Sign Out
```

### Admin
```
Dashboard  →  /admin
Users      →  /admin/users
Medicines  →  /admin/medicines
Salts      →  /admin/salts
Sign Out
```

> Admin also has access to all pharmacist routes (bypasses any role guard).

---

## Route Guards

Defined in `client/src/main.jsx`:

| Component | Behaviour |
|---|---|
| `<RequireAuth>` | Redirects unauthenticated users to `/` and opens the login modal |
| `<RequireRole role="pharmacist">` | Requires `pharmacist` or `admin` role; others redirect to `/` |
| `<RequireRole role="admin">` | Requires `admin` role only; others redirect to `/` |

### Protected routes at a glance

| Path | Guard |
|---|---|
| `/order-success/:id` | RequireAuth |
| `/orders` | RequireAuth |
| `/orders/:id` | RequireAuth |
| `/profile` | RequireAuth |
| `/pharmacist` | RequireRole: pharmacist |
| `/pharmacist/inventory` | RequireRole: pharmacist |
| `/pharmacist/orders` | RequireRole: pharmacist |
| `/admin` | RequireRole: admin |
| `/admin/users` | RequireRole: admin |
| `/admin/medicines` | RequireRole: admin |
| `/admin/salts` | RequireRole: admin |

---

## Pharmacist Onboarding

Two paths to get a pharmacist account:

### Option A — Invite code (self-service)
1. Share the value of `PHARMACIST_INVITE_CODE` from `server/.env` with the pharmacist.
2. They register via the UI → toggle "Enter invite code" → enter the code.
3. Account is created immediately with `role: pharmacist`.

To change the code: update `PHARMACIST_INVITE_CODE` in `server/.env` and restart the server.

### Option B — Admin promotes
1. Pharmacist registers normally → gets `patient` role.
2. Admin logs in → `/admin/users` → find the user → change role to `pharmacist`.

---

## Admin Account Setup

Admin accounts cannot be self-registered. To create one:

**Via seed script** (wipes DB and seeds demo data):
```bash
cd server
npm run seed
# Creates: admin@medicore.in / Admin@123
#          pharmacist@medicore.in / Pharma@123
#          patient@medicore.in / Patient@123
```

**Via MongoDB (promote an existing user)**:
```js
db.users.updateOne({ email: "you@example.com" }, { $set: { role: "admin" } })
```

---

## Key Files

| File | Purpose |
|---|---|
| `server/controllers/authController.js` | register, login, logout, me, addAddress |
| `server/middleware/auth.js` | `protect` — verifies JWT cookie, attaches `req.user` |
| `server/middleware/role.js` | `authorize(...roles)` — checks req.user.role |
| `client/src/hooks/useAuth.js` | `useMe`, `useLogin`, `useRegister`, `useLogout` mutations |
| `client/src/stores/useAuthStore.js` | Zustand store: `user`, `setUser`, `clearUser` |
| `client/src/components/auth/AuthModal.jsx` | Login / Register modal |
| `client/src/components/auth/UserMenu.jsx` | Logged-in user dropdown with logout + role links |
| `client/src/components/layout/Layout.jsx` | Calls `useMe()` on mount to hydrate auth on refresh |
| `client/src/main.jsx` | `RequireAuth`, `RequireRole` route guards |
