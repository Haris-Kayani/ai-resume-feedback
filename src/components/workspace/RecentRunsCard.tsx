import Card from '@/components/ui/Card'
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
    <Card className="p-4">
      <div className="text-sm font-semibold text-white mb-3">Recent Analyses</div>
      <div className="space-y-2">
        {runs.length === 0 ? (
          <div className="py-8 text-center text-sm text-white/40">
            Run your first analysis to see results here
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
    </Card>
  )
}

