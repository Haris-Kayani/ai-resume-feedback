import mongoose from 'mongoose'

export type ExperimentRunDoc = {
  experimentId: string
  runAId: string
  runBId: string
  comparison: Record<string, unknown>
  createdAt: Date
}

const experimentRunSchema = new mongoose.Schema<ExperimentRunDoc>(
  {
    experimentId: { type: String, required: true, index: true },
    runAId: { type: String, required: true },
    runBId: { type: String, required: true },
    comparison: { type: Object, required: true },
    createdAt: { type: Date, default: () => new Date() },
  },
  { versionKey: false },
)

experimentRunSchema.index({ experimentId: 1, createdAt: -1 })

export const ExperimentRun =
  (mongoose.models.ExperimentRun as mongoose.Model<ExperimentRunDoc>) ||
  mongoose.model<ExperimentRunDoc>('ExperimentRun', experimentRunSchema)

