import type { AnalysisRunListItem } from '@/stores/workspace'

function getScoreColor(score: number): string {
  if (score >= 80) return 'text-emerald-400'
  if (score >= 60) return 'text-amber-400'
  return 'text-rose-400'
}

export default function RecentRunsCard({
  runs,
  onOpen,
}: {
  runs: AnalysisRunListItem[]
  onOpen: (analysisRunId: string) => void
}) {
  return (
    <div>
      <div className="text-xs font-semibold uppercase tracking-wider text-white/80 mb-3">Recent Analyses</div>
      <div className="space-y-2">
        {runs.length === 0 ? (
          <div className="py-8 text-center">
            <svg className="w-12 h-12 mx-auto mb-3 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <div className="text-sm text-white/40">Run your first analysis to see results here</div>
          </div>
        ) : (
          runs.slice(0, 8).map((analysisRun) => (
            <button
              key={analysisRun.id}
              className="w-full text-left rounded-lg border border-white/10 px-3 py-2.5 hover:bg-white/5 transition-colors"
              onClick={() => onOpen(analysisRun.id)}
            >
              <div className="flex items-center justify-between">
                <div className={`text-lg font-semibold ${getScoreColor(analysisRun.overallScore)}`}>
                  {analysisRun.overallScore}
                </div>
                <div className="text-xs text-white/40">{new Date(analysisRun.createdAt).toLocaleDateString()}</div>
              </div>
              <div className="mt-1 text-xs text-white/50 truncate">
                Click to view details →
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  )
}

