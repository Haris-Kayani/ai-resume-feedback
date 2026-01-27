import mongoose from 'mongoose'

export type ExperimentDoc = {
  userId: string
  jobDescriptionId: string
  name: string
  createdAt: Date
}

const experimentSchema = new mongoose.Schema<ExperimentDoc>(
  {
    userId: { type: String, required: true, index: true },
    jobDescriptionId: { type: String, required: true },
    name: { type: String, required: true },
    createdAt: { type: Date, default: () => new Date() },
  },
  { versionKey: false },
)

experimentSchema.index({ userId: 1, createdAt: -1 })

export const Experiment =
  (mongoose.models.Experiment as mongoose.Model<ExperimentDoc>) ||
  mongoose.model<ExperimentDoc>('Experiment', experimentSchema)

