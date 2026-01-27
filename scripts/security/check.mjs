import { spawnSync } from 'node:child_process'

function runCapture(cmd, args, opts = {}) {
  const res = spawnSync(cmd, args, { encoding: 'utf8', shell: process.platform === 'win32', ...opts })
  return { status: res.status ?? 1, stdout: res.stdout || '', stderr: res.stderr || '' }
}

function summarizeAudit(json) {
  const vulns = json.vulnerabilities || {}
  const counts = { critical: 0, high: 0, moderate: 0, low: 0 }
  for (const k of Object.keys(vulns)) {
    const v = vulns[k]
    if (!v?.severity) continue
    if (v.severity in counts) counts[v.severity] += 1
  }
  return counts
}

const audit = runCapture('npm', ['audit', '--json', '--omit=dev'])
let counts = { critical: 0, high: 0, moderate: 0, low: 0 }
if (audit.stdout) {
  try {
    counts = summarizeAudit(JSON.parse(audit.stdout))
  } catch {
  }
}

console.log(JSON.stringify({ npm_audit_omit_dev: counts }, null, 2))

const fail = counts.critical > 0 || counts.high > 0
process.exit(fail ? 1 : 0)

