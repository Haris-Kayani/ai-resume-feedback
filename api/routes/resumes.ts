import { Router, type Request, type Response } from 'express'
import multer from 'multer'
import fs from 'fs'
import fsp from 'fs/promises'
import path from 'path'
import sanitizeFilename from 'sanitize-filename'
import { nanoid } from 'nanoid'
import { fileTypeFromFile } from 'file-type'
import { requireAuth } from '../middleware/auth.js'
import { Resume } from '../models/Resume.js'
import { getEnvNumber } from '../utils/http.js'

const router = Router()

function getUploadRoot(): string {
  return process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads')
}

function ensureDir(p: string): void {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true })
}

const maxSizeMb = getEnvNumber('MAX_FILE_SIZE_MB', 5)
const maxFileSizeBytes = Math.max(1, Math.floor(maxSizeMb * 1024 * 1024))

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const userId = (req as Request).userId
    const root = getUploadRoot()
    const dir = path.join(root, userId || 'anonymous')
    ensureDir(dir)
    cb(null, dir)
  },
  filename: (req, file, cb) => {
    const safe = sanitizeFilename(file.originalname) || 'resume'
    const ext = path.extname(safe).toLowerCase()
    cb(null, `${nanoid()}${ext}`)
  },
})

const upload = multer({
  storage,
  limits: { fileSize: maxFileSizeBytes },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase()
    const ok = ext === '.pdf' || ext === '.docx'
    if (!ok) {
      cb(new Error('Unsupported file type'))
      return
    }
    cb(null, true)
  },
})

router.get('/', requireAuth, async (req: Request, res: Response) => {
  const items = await Resume.find({ userId: req.userId }).sort({ createdAt: -1 }).lean()
  res.json({ success: true, resumes: items.map((r) => ({
    id: r._id.toString(),
    displayName: r.displayName,
    fileType: r.fileType,
    sizeBytes: r.sizeBytes,
    createdAt: r.createdAt,
    extractedAt: r.extractedAt,
  })) })
})

router.post('/upload', requireAuth, upload.single('file'), async (req: Request, res: Response) => {
  const file = req.file
  if (!file) {
    res.status(400).json({ success: false, error: 'Missing file' })
    return
  }

  const detected = await fileTypeFromFile(file.path)
  const ext = path.extname(file.originalname).toLowerCase().replace('.', '')
  const allowed = new Set(['pdf', 'docx'])
  const detectedOk = detected?.ext ? allowed.has(detected.ext) : false
  const extOk = allowed.has(ext)

  if (!extOk || (detected && !detectedOk)) {
    await fsp.unlink(file.path).catch(() => {})
    res.status(400).json({ success: false, error: 'Invalid file content' })
    return
  }

  const fileType = (detected?.ext || ext) as 'pdf' | 'docx'
  const resume = await Resume.create({
    userId: req.userId,
    displayName: sanitizeFilename(file.originalname),
    storedName: file.filename,
    fileType,
    sizeBytes: file.size,
    filePath: file.path,
  })

  res.json({
    success: true,
    resume: {
      id: resume._id.toString(),
      displayName: resume.displayName,
      fileType: resume.fileType,
      sizeBytes: resume.sizeBytes,
      createdAt: resume.createdAt,
    },
  })
})

router.delete('/:id', requireAuth, async (req: Request, res: Response) => {
  const resume = await Resume.findOne({ _id: req.params.id, userId: req.userId })
  if (!resume) {
    res.status(404).json({ success: false, error: 'Not found' })
    return
  }

  await fsp.unlink(resume.filePath).catch(() => {})
  await resume.deleteOne()
  res.json({ success: true })
})

export default router
