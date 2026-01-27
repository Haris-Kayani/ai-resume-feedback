export type ApiError = {
  message: string
  status: number
}

const API_URL = import.meta.env.VITE_API_URL || ''

async function parseJsonOrThrow<T>(res: Response): Promise<T> {
  const text = await res.text()
  const json: unknown = text ? JSON.parse(text) : {}
  const obj = (json && typeof json === 'object' ? (json as Record<string, unknown>) : {})
  if (!res.ok || obj.success === false) {
    const msg = typeof obj.error === 'string' ? obj.error : `Request failed (${res.status})`
    const err: ApiError = { message: msg, status: res.status }
    throw err
  }
  return obj as unknown as T
}

export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, { credentials: 'include' })
  return parseJsonOrThrow<T>(res)
}

export async function apiPost<T>(path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: body ? JSON.stringify(body) : undefined,
  })
  return parseJsonOrThrow<T>(res)
}

export async function apiPut<T>(path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: body ? JSON.stringify(body) : undefined,
  })
  return parseJsonOrThrow<T>(res)
}

export async function apiDelete<T>(path: string): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, { method: 'DELETE', credentials: 'include' })
  return parseJsonOrThrow<T>(res)
}

export async function apiUpload<T>(path: string, formData: FormData): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  })
  return parseJsonOrThrow<T>(res)
}
