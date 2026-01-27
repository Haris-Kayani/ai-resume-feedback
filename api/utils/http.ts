export function getEnvNumber(name: string, fallback: number): number {
  const raw = process.env[name]
  if (!raw) return fallback
  const parsed = Number(raw)
  return Number.isFinite(parsed) ? parsed : fallback
}

export function getBaseUrl(req: { protocol: string; get: (n: string) => string | undefined }): string {
  const host = req.get('host') || 'localhost'
  return `${req.protocol}://${host}`
}

