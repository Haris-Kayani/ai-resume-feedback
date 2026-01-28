/**
 * This is a API server
 */

import express, { type NextFunction, type Request, type Response } from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import multer from 'multer'
import { fileURLToPath } from 'url'
import authRoutes from './routes/auth.js'
import resumesRoutes from './routes/resumes.ts'
import jobDescriptionRoutes from './routes/jobDescriptions.ts'
import analysisRoutes from './routes/analysis.ts'
import diffRoutes from './routes/diff.ts'
import experimentsRoutes from './routes/experiments.ts'

// load env
dotenv.config()

const app: express.Application = express()

const allowedOrigins = (process.env.CLIENT_ORIGIN || 'http://localhost:5173,http://localhost:3001')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) {
        cb(null, true)
        return
      }
      cb(null, allowedOrigins.includes(origin))
    },
    credentials: true,
  }),
)
app.use(helmet())
const isProduction = process.env.NODE_ENV === 'production'
const disableRateLimit = process.env.DISABLE_RATE_LIMIT === '1'

if (!disableRateLimit || isProduction) {
  app.use(
    rateLimit({
      windowMs: 60_000,
      limit: 120,
      standardHeaders: 'draft-7',
      legacyHeaders: false,
    }),
  )
}
app.use(cookieParser())
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

/**
 * API Routes
 */
app.use('/api/auth', authRoutes)
app.use('/api/resumes', resumesRoutes)
app.use('/api/job-descriptions', jobDescriptionRoutes)
app.use('/api/analysis', analysisRoutes)
app.use('/api/diff', diffRoutes)
app.use('/api/experiments', experimentsRoutes)

/**
 * health
 */
app.use(
  '/api/health',
  (req: Request, res: Response): void => {
    res.status(200).json({
      success: true,
      message: 'ok',
    })
  },
)

if (process.env.NODE_ENV === 'production') {
  const distPath = fileURLToPath(new URL('../dist', import.meta.url))
  app.use(express.static(distPath))
  app.get('*', (req: Request, res: Response) => {
    res.sendFile(fileURLToPath(new URL('../dist/index.html', import.meta.url)))
  })
}

/**

 */
app.use((error: Error, req: Request, res: Response, _next: NextFunction) => {
  void _next
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      res.status(413).json({ success: false, error: 'File too large' })
      return
    }
    res.status(400).json({ success: false, error: 'Invalid upload' })
    return
  }

  if (error.message === 'Unsupported file type') {
    res.status(400).json({ success: false, error: 'Unsupported file type' })
    return
  }

  res.status(500).json({
    success: false,
    error: 'Server internal error',
  })
})

/**
 * 404 handler
 */
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'API not found',
  })
})

export default app
