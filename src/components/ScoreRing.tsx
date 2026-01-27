import { cn } from '@/lib/utils'

export default function ScoreRing({ score, label, className }: { score: number; label?: string; className?: string }) {
  const pct = Math.max(0, Math.min(100, score))
  const r = 34
  const c = 2 * Math.PI * r
  const dash = (pct / 100) * c
  const color = pct >= 80 ? '#3DDC97' : pct >= 60 ? '#FFCB6B' : '#FF6B6B'
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <svg width="84" height="84" viewBox="0 0 84 84">
        <circle cx="42" cy="42" r={r} stroke="#273357" strokeWidth="10" fill="none" />
        <circle
          cx="42"
          cy="42"
          r={r}
          stroke={color}
          strokeWidth="10"
          fill="none"
          strokeDasharray={`${dash} ${c}`}
          strokeLinecap="round"
          transform="rotate(-90 42 42)"
        />
        <text x="42" y="46" textAnchor="middle" fontSize="18" fill="#EAF0FF" fontWeight="600">
          {Math.round(pct)}
        </text>
      </svg>
      <div>
        <div className="text-sm font-semibold text-white">{label || 'ATS Score'}</div>
        <div className="text-xs text-[#A8B3CF]">0–100 overall</div>
      </div>
    </div>
  )
}

