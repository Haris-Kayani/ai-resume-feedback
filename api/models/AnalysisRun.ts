import mongoose from 'mongoose'

export type AnalysisMetricKey =
  | 'keyword_coverage'
  | 'skills_match'
  | 'role_alignment'
  | 'formatting_risk'
  | 'tenure_clarity'

export type Recommendation = {
  id: string
  title: string
  rationale: string
  priority: 'high' | 'med' | 'low'
  data?: Record<string, unknown>
}

export type AnalysisRunDoc = {
  userId: string
  resumeId: string
  jobDescriptionId: string
  overallScore: number
  metrics: Record<AnalysisMetricKey, number>
  recommendations: Recommendation[]
  resumeTextSnapshot: string
  jdTextSnapshot: string
  createdAt: Date
}

const analysisRunSchema = new mongoose.Schema<AnalysisRunDoc>(
  {
    userId: { type: String, required: true, index: true },
    resumeId: { type: String, required: true },
    jobDescriptionId: { type: String, required: true },
    overallScore: { type: Number, required: true },
    metrics: { type: Object, required: true },
    recommendations: { type: [Object], required: true },
    resumeTextSnapshot: { type: String, required: true },
    jdTextSnapshot: { type: String, required: true },
    createdAt: { type: Date, default: () => new Date() },
  },
  { versionKey: false },
)

analysisRunSchema.index({ userId: 1, createdAt: -1 })

export const AnalysisRun =
  (mongoose.models.AnalysisRun as mongoose.Model<AnalysisRunDoc>) ||
  mongoose.model<AnalysisRunDoc>('AnalysisRun', analysisRunSchema)
