import 'dotenv/config'
import express from 'express'
import helmet from 'helmet'
import morgan from 'morgan'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import rateLimit from 'express-rate-limit'

import connectDB from './config/db.js'
import errorHandler from './middleware/errorHandler.js'
import medicineRoutes from './routes/medicineRoutes.js'
import authRoutes from './routes/authRoutes.js'
import orderRoutes from './routes/orderRoutes.js'
import paymentRoutes from './routes/paymentRoutes.js'
import pharmacistRoutes from './routes/pharmacistRoutes.js'
import adminRoutes from './routes/adminRoutes.js'

const app = express()

// ─── Security & Logging ─────────────────────────────────────────────────────
app.use(helmet())
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'))
}

// ─── CORS ────────────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
)

// ─── Rate limiting (100 req/15 min per IP) ───────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' },
})
app.use('/api', limiter)

// ─── Body parsing ────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

// ─── Health check ────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ ok: true, env: process.env.NODE_ENV })
})

// ─── API Routes ──────────────────────────────────────────────────────────────
app.use('/api/medicines', medicineRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/payment', paymentRoutes)
app.use('/api/pharmacist', pharmacistRoutes)
app.use('/api/admin', adminRoutes)

// ─── 404 handler ─────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found', code: 'NOT_FOUND' })
})

// ─── Global error handler (must be last) ─────────────────────────────────────
app.use(errorHandler)

// ─── Start server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5001

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`MediCore API running on port ${PORT} [${process.env.NODE_ENV}]`)
  })
})

export default app
