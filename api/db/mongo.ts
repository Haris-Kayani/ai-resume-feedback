import mongoose from 'mongoose'

let isConnected = false

export async function connectMongo(): Promise<void> {
  if (isConnected) return

  // Backward compatibility: allow legacy MONGOURI but standardize on MONGODB_URI
  if (process.env.MONGOURI && !process.env.MONGODB_URI) {
    process.env.MONGODB_URI = process.env.MONGOURI
  }

  const uri = process.env.MONGODB_URI
  if (!uri) {
    throw new Error(
      'Missing MONGODB_URI environment variable. Please configure the database connection in your .env file.',
    )
  }

  await mongoose.connect(uri)
  isConnected = true
}

export async function disconnectMongo(): Promise<void> {
  if (!isConnected) return
  await mongoose.disconnect()
  isConnected = false
}

