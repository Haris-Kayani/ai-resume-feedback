import { spawn } from 'node:child_process'
import { performance } from 'node:perf_hooks'
import { MongoMemoryServer } from 'mongodb-memory-server'
import net from 'node:net'

function spawnLogged(cmd, args, env) {
  const child = spawn(cmd, args, { stdio: 'inherit', shell: process.platform === 'win32', env })
  child.on('error', (e) => console.error(e))
  return child
}

async function waitForHealthy(url, timeoutMs) {
  const start = Date.now()
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url)
      if (res.ok) return
    } catch {
    }
    await new Promise((r) => setTimeout(r, 750))
  }
  throw new Error(`Timed out waiting for ${url}`)
}

function percentile(arr, p) {
  if (arr.length === 0) return 0
  const sorted = [...arr].sort((a, b) => a - b)
  const idx = Math.min(sorted.length - 1, Math.max(0, Math.ceil((p / 100) * sorted.length) - 1))
  return sorted[idx]
}

async function httpJson(url, { method = 'GET', cookie = '', body } = {}) {
  const res = await fetch(url, {
    method,
    headers: {
      'content-type': 'application/json',
      ...(cookie ? { cookie } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  const text = await res.text()
  let json
  try {
    json = JSON.parse(text)
  } catch {
    json = { raw: text }
  }
  const setCookie = res.headers.get('set-cookie')
  const nextCookie = setCookie ? setCookie.split(';')[0] : cookie
  return { ok: res.ok, status: res.status, json, cookie: nextCookie }
}

async function httpUpload(url, cookie, file) {
  const form = new FormData()
  form.set('file', new Blob([file.buffer], { type: file.mimeType }), file.name)
  const res = await fetch(url, { method: 'POST', headers: cookie ? { cookie } : {}, body: form })
  const text = await res.text()
  const json = JSON.parse(text)
  return { ok: res.ok, status: res.status, json }
}

async function getFreePort() {
  const srv = net.createServer()
  await new Promise((resolve) => srv.listen(0, resolve))
  const addr = srv.address()
  const port = typeof addr === 'object' && addr ? addr.port : 3001
  await new Promise((resolve) => srv.close(resolve))
  return port
}

const requestedBaseURL = process.env.PERF_BASE_URL
const port = requestedBaseURL ? Number(new URL(requestedBaseURL).port || 3001) : await getFreePort()
const baseURL = requestedBaseURL || `http://localhost:${port}`
const healthURL = `${baseURL.replace(/\/$/, '')}/api/health`
const N = Number(process.env.PERF_REQUESTS || 30)
const C = Number(process.env.PERF_CONCURRENCY || 5)

let failed = false
let mongo
let server
try {
  mongo = await MongoMemoryServer.create()
  const uri = mongo.getUri()
  server = spawnLogged('npx', ['tsx', 'api/server.ts'], {
    ...process.env,
    NODE_ENV: 'production',
    PORT: String(port),
    MONGODB_URI: uri,
    JWT_SECRET: process.env.JWT_SECRET || 'perf_secret',
    CLIENT_ORIGIN: baseURL,
    DISABLE_RATE_LIMIT: '1',
  })
  await waitForHealthy(healthURL, 60_000)

  const email = `perf-${Date.now()}@example.com`
  const password = 'password123'

  const reg = await httpJson(`${baseURL}/api/auth/register`, { method: 'POST', body: { email, password } })
  if (!reg.ok) throw new Error(`Register failed: ${reg.status}`)
  let cookie = reg.cookie

  const fakePdf = Buffer.from('%PDF-1.4\n1 0 obj\n<<>>\nendobj\nstream\n(React Node MongoDB Docker TypeScript)\nendstream\ntrailer\n<<>>\n%%EOF')
  const up = await httpUpload(`${baseURL}/api/resumes/upload`, cookie, { name: 'resume.pdf', mimeType: 'application/pdf', buffer: fakePdf })
  if (!up.ok) throw new Error(`Upload failed: ${up.status}`)
  const resumeId = up.json.resume.id

  const jd = await httpJson(`${baseURL}/api/job-descriptions`, {
    method: 'POST',
    cookie,
    body: { title: 'Full Stack Engineer', contentRich: '<p>React Node MongoDB Docker</p>', contentPlain: 'React Node MongoDB Docker' },
  })
  if (!jd.ok) throw new Error(`JD create failed: ${jd.status}`)
  const jdId = jd.json.jobDescription.id

  const latencies = []
  let inflight = 0
  let idx = 0

  await new Promise((resolve, reject) => {
    const next = () => {
      if (idx >= N && inflight === 0) {
        resolve()
        return
      }
      while (inflight < C && idx < N) {
        idx++
        inflight++
        const t0 = performance.now()
        httpJson(`${baseURL}/api/analysis/run`, { method: 'POST', cookie, body: { resumeId, jobDescriptionId: jdId } })
          .then((r) => {
            const dt = performance.now() - t0
            latencies.push(dt)
            if (!r.ok) throw new Error(`analysis/run failed: ${r.status}`)
          })
          .then(() => {
            inflight--
            next()
          })
          .catch(reject)
      }
    }
    next()
  })

  console.log(JSON.stringify({ requests: N, concurrency: C, p50_ms: percentile(latencies, 50), p95_ms: percentile(latencies, 95), max_ms: percentile(latencies, 100) }, null, 2))
} catch (e) {
  failed = true
  console.error(e)
} finally {
  if (server && !server.killed) server.kill('SIGTERM')
  if (mongo) await mongo.stop().catch(() => {})
  if (failed) process.exit(1)
}
