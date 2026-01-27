import { spawn } from 'node:child_process'
import { MongoMemoryServer } from 'mongodb-memory-server'
import net from 'node:net'

async function waitForHealthy(url, timeoutMs) {
  const start = Date.now()
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url)
      if (res.ok) return
    } catch {
    }
    await new Promise((r) => setTimeout(r, 500))
  }
  throw new Error(`Timed out waiting for ${url}`)
}

function spawnLogged(cmd, args, env) {
  const child = spawn(cmd, args, { stdio: 'inherit', shell: process.platform === 'win32', env })
  child.on('error', (e) => {
    console.error(e)
  })
  return child
}

async function getFreePort() {
  const srv = net.createServer()
  await new Promise((resolve) => srv.listen(0, resolve))
  const addr = srv.address()
  const port = typeof addr === 'object' && addr ? addr.port : 3001
  await new Promise((resolve) => srv.close(resolve))
  return port
}

const requestedBaseURL = process.env.E2E_BASE_URL
const port = requestedBaseURL ? Number(new URL(requestedBaseURL).port || 3001) : await getFreePort()
const baseURL = requestedBaseURL || `http://localhost:${port}`
const healthURL = `${baseURL.replace(/\/$/, '')}/api/health`

let mongo
let server
let failed = false

try {
  mongo = await MongoMemoryServer.create()
  const uri = mongo.getUri()

  if (process.env.E2E_SKIP_BUILD !== '1') {
    const build = spawnLogged('npm', ['run', 'build'], { ...process.env })
    const buildCode = await new Promise((resolve) => build.on('close', resolve))
    if (buildCode !== 0) throw new Error('Build failed')
  }

  server = spawnLogged('npx', ['tsx', 'api/server.ts'], {
    ...process.env,
    NODE_ENV: 'production',
    PORT: String(port),
    MONGODB_URI: uri,
    JWT_SECRET: process.env.JWT_SECRET || 'e2e_secret',
    CLIENT_ORIGIN: baseURL,
    DISABLE_RATE_LIMIT: '1',
  })

  await waitForHealthy(healthURL, 60_000)
  const extraProjects = (process.env.PLAYWRIGHT_PROJECTS || '').split(',').map((s) => s.trim()).filter(Boolean)
  const projectArgs = extraProjects.flatMap((p) => ['--project', p])
  const workers = process.env.PLAYWRIGHT_WORKERS || '2'
  const pw = spawnLogged('npx', ['playwright', 'test', '--workers', workers, ...projectArgs], { ...process.env, E2E_BASE_URL: baseURL })
  const code = await new Promise((resolve) => pw.on('close', resolve))
  if (code !== 0) failed = true
} catch (e) {
  failed = true
  console.error(e)
} finally {
  if (server && !server.killed) {
    server.kill('SIGTERM')
  }
  if (mongo) {
    await mongo.stop().catch(() => {})
  }
  if (failed) process.exit(1)
}
