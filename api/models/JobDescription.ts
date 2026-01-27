import mongoose from 'mongoose'

export type JobDescriptionDoc = {
  userId: string
  title: string
  contentRich: string
  contentPlain: string
  updatedAt: Date
  createdAt: Date
}

const jobDescriptionSchema = new mongoose.Schema<JobDescriptionDoc>(
  {
    userId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    contentRich: { type: String, required: true },
    contentPlain: { type: String, required: true },
    updatedAt: { type: Date, default: () => new Date() },
    createdAt: { type: Date, default: () => new Date() },
  },
  { versionKey: false },
)

jobDescriptionSchema.index({ userId: 1, updatedAt: -1 })

export const JobDescription =
  (mongoose.models.JobDescription as mongoose.Model<JobDescriptionDoc>) ||
  mongoose.model<JobDescriptionDoc>('JobDescription', jobDescriptionSchema)

