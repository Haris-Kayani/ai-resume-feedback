import { spawnSync } from 'node:child_process'

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

function run(cmd, args, opts = {}) {
  const res = spawnSync(cmd, args, { stdio: 'inherit', shell: process.platform === 'win32', ...opts })
  if (res.status !== 0) {
    const msg = res.error?.message || `Command failed: ${cmd} ${args.join(' ')}`
    throw new Error(msg)
  }
}

const baseURL = process.env.E2E_BASE_URL || 'http://localhost:3001'
const healthURL = `${baseURL.replace(/\/$/, '')}/api/health`

let failed = false
try {
  run('docker', ['compose', 'up', '-d', '--build'])
  await waitForHealthy(healthURL, 90_000)
  run('npx', ['playwright', 'test'], { env: { ...process.env, E2E_BASE_URL: baseURL } })
} catch (e) {
  failed = true
  console.error(e)
} finally {
  try {
    run('docker', ['compose', 'down', '-v'])
  } catch {
  }
  if (failed) process.exit(1)
}

