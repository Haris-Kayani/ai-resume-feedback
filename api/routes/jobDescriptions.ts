import { Router, type Request, type Response } from 'express'
import { z } from 'zod'
import sanitizeHtml from 'sanitize-html'
import { requireAuth } from '../middleware/auth.js'
import { JobDescription } from '../models/JobDescription.js'

const router = Router()

const jdSchema = z.object({
  title: z.string().min(1).max(160),
  contentRich: z.string().min(1).max(200_000),
  contentPlain: z.string().min(1).max(200_000),
})

function sanitizeRich(input: string): string {
  return sanitizeHtml(input, {
    allowedTags: [
      'p',
      'br',
      'strong',
      'em',
      'u',
      'ul',
      'ol',
      'li',
      'h1',
      'h2',
      'h3',
      'a',
      'blockquote',
      'code',
      'pre',
    ],
    allowedAttributes: {
      a: ['href', 'target', 'rel'],
    },
    transformTags: {
      a: sanitizeHtml.simpleTransform('a', { rel: 'noreferrer noopener', target: '_blank' }),
    },
  })
}

router.get('/', requireAuth, async (req: Request, res: Response) => {
  const items = await JobDescription.find({ userId: req.userId }).sort({ updatedAt: -1 }).lean()
  res.json({
    success: true,
    jobDescriptions: items.map((jobDescriptionItem) => ({
      id: jobDescriptionItem._id.toString(),
      title: jobDescriptionItem.title,
      updatedAt: jobDescriptionItem.updatedAt,
      createdAt: jobDescriptionItem.createdAt,
    })),
  })
})

router.get('/:id', requireAuth, async (req: Request, res: Response) => {
  const item = await JobDescription.findOne({ _id: req.params.id, userId: req.userId }).lean()
  if (!item) {
    res.status(404).json({ success: false, error: 'Not found' })
    return
  }
  res.json({
    success: true,
    jobDescription: {
      id: item._id.toString(),
      title: item.title,
      contentRich: item.contentRich,
      contentPlain: item.contentPlain,
      updatedAt: item.updatedAt,
      createdAt: item.createdAt,
    },
  })
})

router.post('/', requireAuth, async (req: Request, res: Response) => {
  const parsed = jdSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ success: false, error: 'Invalid input' })
    return
  }

  const contentRich = sanitizeRich(parsed.data.contentRich)
  const contentPlain = parsed.data.contentPlain
  const item = await JobDescription.create({
    userId: req.userId,
    title: parsed.data.title,
    contentRich,
    contentPlain,
    updatedAt: new Date(),
  })

  res.json({ success: true, jobDescription: { id: item._id.toString() } })
})

router.put('/:id', requireAuth, async (req: Request, res: Response) => {
  const parsed = jdSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ success: false, error: 'Invalid input' })
    return
  }

  const updated = await JobDescription.findOneAndUpdate(
    { _id: req.params.id, userId: req.userId },
    {
      title: parsed.data.title,
      contentRich: sanitizeRich(parsed.data.contentRich),
      contentPlain: parsed.data.contentPlain,
      updatedAt: new Date(),
    },
    { new: true },
  )

  if (!updated) {
    res.status(404).json({ success: false, error: 'Not found' })
    return
  }

  res.json({ success: true, jobDescription: { id: updated._id.toString() } })
})

router.delete('/:id', requireAuth, async (req: Request, res: Response) => {
  const deleted = await JobDescription.findOneAndDelete({
    _id: req.params.id,
    userId: req.userId,
  })

  if (!deleted) {
    res.status(404).json({ success: false, error: 'Not found' })
    return
  }

  res.json({ success: true })
})

export default router

