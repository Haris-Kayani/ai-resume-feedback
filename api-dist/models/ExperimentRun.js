import mongoose from 'mongoose';
const experimentRunSchema = new mongoose.Schema({
    experimentId: { type: String, required: true, index: true },
    runAId: { type: String, required: true },
    runBId: { type: String, required: true },
    comparison: { type: Object, required: true },
    createdAt: { type: Date, default: () => new Date() },
}, { versionKey: false });
experimentRunSchema.index({ experimentId: 1, createdAt: -1 });
export const ExperimentRun = mongoose.models.ExperimentRun ||
    mongoose.model('ExperimentRun', experimentRunSchema);
//# sourceMappingURL=ExperimentRun.js.map