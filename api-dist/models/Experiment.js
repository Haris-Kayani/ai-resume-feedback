import mongoose from 'mongoose';
const experimentSchema = new mongoose.Schema({
    userId: { type: String, required: true, index: true },
    jobDescriptionId: { type: String, required: true },
    name: { type: String, required: true },
    createdAt: { type: Date, default: () => new Date() },
}, { versionKey: false });
experimentSchema.index({ userId: 1, createdAt: -1 });
export const Experiment = mongoose.models.Experiment ||
    mongoose.model('Experiment', experimentSchema);
//# sourceMappingURL=Experiment.js.map