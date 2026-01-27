import type { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const token = req.cookies?.ats_token
  if (!token) {
    res.status(401).json({ success: false, error: 'Unauthorized' })
    return
  }

  const secret = process.env.JWT_SECRET
  if (!secret) {
    res.status(500).json({ success: false, error: 'Server misconfigured' })
    return
  }

  try {
    const payload = jwt.verify(token, secret) as { userId: string }
    req.userId = payload.userId
    next()
  } catch {
    res.status(401).json({ success: false, error: 'Unauthorized' })
  }
}

