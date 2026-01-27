import mongoose from 'mongoose';
const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String, required: true },
    createdAt: { type: Date, default: () => new Date() },
}, { versionKey: false });
export const User = mongoose.models.User ||
    mongoose.model('User', userSchema);
//# sourceMappingURL=User.js.map