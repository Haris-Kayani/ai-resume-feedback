import mongoose from 'mongoose';
const analysisRunSchema = new mongoose.Schema({
    userId: { type: String, required: true, index: true },
    resumeId: { type: String, required: true },
    jobDescriptionId: { type: String, required: true },
    overallScore: { type: Number, required: true },
    metrics: { type: Object, required: true },
    recommendations: { type: [Object], required: true },
    resumeTextSnapshot: { type: String, required: true },
    jdTextSnapshot: { type: String, required: true },
    createdAt: { type: Date, default: () => new Date() },
}, { versionKey: false });
analysisRunSchema.index({ userId: 1, createdAt: -1 });
export const AnalysisRun = mongoose.models.AnalysisRun ||
    mongoose.model('AnalysisRun', analysisRunSchema);
//# sourceMappingURL=AnalysisRun.js.map