import mongoose from 'mongoose';
let isConnected = false;
export async function connectMongo() {
    if (isConnected)
        return;
    const uri = process.env.MONGODB_URI;
    
    if (!uri)
        throw new Error('Missing MONGODB_URI');
    await mongoose.connect(uri);
    isConnected = true;
}
export async function disconnectMongo() {
    if (!isConnected)
        return;
    await mongoose.disconnect();
    isConnected = false;
}
//# sourceMappingURL=mongo.js.map