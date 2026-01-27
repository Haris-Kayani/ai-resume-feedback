import mongoose from 'mongoose';
const resumeSchema = new mongoose.Schema({
    userId: { type: String, required: true, index: true },
    displayName: { type: String, required: true },
    storedName: { type: String, required: true },
    fileType: { type: String, required: true },
    sizeBytes: { type: Number, required: true },
    filePath: { type: String, required: true },
    extractedText: { type: String, required: false },
    extractedAt: { type: Date, required: false },
    createdAt: { type: Date, default: () => new Date() },
}, { versionKey: false });
resumeSchema.index({ userId: 1, createdAt: -1 });
export const Resume = mongoose.models.Resume ||
    mongoose.model('Resume', resumeSchema);
//# sourceMappingURL=Resume.js.map