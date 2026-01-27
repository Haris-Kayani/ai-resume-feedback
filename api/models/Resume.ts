import mongoose from 'mongoose'

export type ResumeFileType = 'pdf' | 'docx'

export type ResumeDoc = {
  userId: string
  displayName: string
  storedName: string
  fileType: ResumeFileType
  sizeBytes: number
  filePath: string
  extractedText?: string
  extractedAt?: Date
  createdAt: Date
}

const resumeSchema = new mongoose.Schema<ResumeDoc>(
  {
    userId: { type: String, required: true, index: true },
    displayName: { type: String, required: true },
    storedName: { type: String, required: true },
    fileType: { type: String, required: true },
    sizeBytes: { type: Number, required: true },
    filePath: { type: String, required: true },
    extractedText: { type: String, required: false },
    extractedAt: { type: Date, required: false },
    createdAt: { type: Date, default: () => new Date() },
  },
  { versionKey: false },
)

resumeSchema.index({ userId: 1, createdAt: -1 })

export const Resume =
  (mongoose.models.Resume as mongoose.Model<ResumeDoc>) ||
  mongoose.model<ResumeDoc>('Resume', resumeSchema)

