import mongoose from 'mongoose';
const jobDescriptionSchema = new mongoose.Schema({
    userId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    contentRich: { type: String, required: true },
    contentPlain: { type: String, required: true },
    updatedAt: { type: Date, default: () => new Date() },
    createdAt: { type: Date, default: () => new Date() },
}, { versionKey: false });
jobDescriptionSchema.index({ userId: 1, updatedAt: -1 });
export const JobDescription = mongoose.models.JobDescription ||
    mongoose.model('JobDescription', jobDescriptionSchema);
//# sourceMappingURL=JobDescription.js.map