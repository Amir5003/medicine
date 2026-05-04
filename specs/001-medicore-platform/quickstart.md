# Quickstart: MediCore Development Setup

**Branch**: `001-medicore-platform` | **Date**: 2026-05-04

---

## Prerequisites

| Tool | Version | Check |
|---|---|---|
| Node.js | 20 LTS | `node -v` |
| npm | 10+ | `npm -v` |
| Git | any | `git --version` |
| MongoDB Atlas account | — | atlas.mongodb.com |
| Cloudinary account | — | cloudinary.com |
| Razorpay account (test mode) | — | dashboard.razorpay.com |

---

## 1. Clone & Install

```bash
# Clone
git clone <repo-url> medicore
cd medicore

# Install server dependencies
cd server
npm install

# Install client dependencies  
cd ../client
npm install
```

---

## 2. Environment Variables

### Server — `server/.env`

Create `server/.env` (copy from `server/.env.example`):

```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/medicore?retryWrites=true&w=majority
JWT_SECRET=<random-32-char-string>
JWT_EXPIRE=7d
CLOUDINARY_CLOUD_NAME=<your-cloud-name>
CLOUDINARY_API_KEY=<your-api-key>
CLOUDINARY_API_SECRET=<your-api-secret>
RAZORPAY_KEY_ID=<rzp_test_...>
RAZORPAY_KEY_SECRET=<your-key-secret>
CLIENT_URL=http://localhost:5173
```

### Client — `client/.env`

```env
VITE_API_URL=http://localhost:5000/api
VITE_RAZORPAY_KEY_ID=<rzp_test_... same as server>
```

> **Never commit `.env` files.** Both are in `.gitignore`.

---

## 3. Database Setup

### Create Atlas Cluster

1. Create a free M0 cluster at [mongodb.com/atlas](https://mongodb.com/atlas)
2. Add a database user with read/write access
3. Add your IP to the Network Access allowlist (or `0.0.0.0/0` for dev)
4. Copy the connection string to `server/.env` as `MONGO_URI`

### Seed the Database

```bash
cd server
npm run seed
```

This runs `server/seed/seedMedicines.js` and inserts 50+ medicines across 10 categories with valid salt compositions, fingerprints, and at least 3 sharing a `saltFingerprint` per category to demonstrate the Alternate Panel.

---

## 4. Run Locally

```bash
# Terminal 1 — backend (port 5000)
cd server
npm run dev

# Terminal 2 — frontend (port 5173)
cd client
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## 5. Create Test Users

After seeding, create users via the API or the UI registration form:

| Role | How to create |
|---|---|
| `patient` | Register via the UI — default role |
| `pharmacist` | Register via UI then run: `db.users.updateOne({email:"..."}, {$set:{role:"pharmacist"}})` in Atlas UI or MongoDB Compass |
| `admin` | Same as above with `role: "admin"` |

---

## 6. Test the Salt Alternate Flow

1. Open the app at `http://localhost:5173`
2. Search "Paracetamol" or "Dolo"
3. Click any result → Medicine Detail page
4. The **Alternate Panel** should appear with ≥1 result showing a savings badge
5. Click **Add Alternate** → item goes into cart with `isAlternateChosen: true`

---

## 7. Test Payments (Razorpay Test Mode)

Razorpay test card: `4111 1111 1111 1111` | Expiry: any future date | CVV: any 3 digits

Test UPI: `success@razorpay`

---

## 8. Production Deployment

| Service | Platform | Notes |
|---|---|---|
| Frontend | Vercel | Connect GitHub repo, set `VITE_API_URL` env var to production backend URL |
| Backend | Railway or Render | Set all `server/.env` vars as environment variables in the dashboard |
| Database | MongoDB Atlas M0 | Upgrade to M10+ for Atlas Search if catalogue grows |
| Files | Cloudinary | Unlimited transformations on free tier for the first 25 GB storage |

### Vercel Frontend Config

Set `VITE_API_URL=https://<your-railway-app>.railway.app/api` in Vercel environment variables.

In `server/config/cloudinary.js` and JWT cookie settings, `NODE_ENV=production` must be set — this enables `SameSite=None; Secure` on cookies for the cross-origin Vercel → Railway request.

---

## 9. Useful npm Scripts

| Location | Script | What it does |
|---|---|---|
| `server/` | `npm run dev` | nodemon watch + restart |
| `server/` | `npm start` | production start |
| `server/` | `npm run seed` | seed 50+ medicines |
| `client/` | `npm run dev` | Vite HMR dev server |
| `client/` | `npm run build` | production build to `client/dist/` |
| `client/` | `npm run preview` | preview production build locally |
