import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'

export default function AbTestCard({
  experimentName,
  onExperimentName,
  compareId,
  onCompareId,
  compareOptions,
  loading,
  abResult,
  onRun,
}: {
  experimentName: string
  onExperimentName: (v: string) => void
  compareId: string
  onCompareId: (id: string) => void
  compareOptions: Array<{ id: string; overallScore: number }>
  loading: boolean
  abResult: {
    scoreDelta: number
    a: { runId: string; overallScore: number; metrics: Record<string, number> }
    b: { runId: string; overallScore: number; metrics: Record<string, number> }
  } | null
  onRun: () => void
}) {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <div className="text-sm font-semibold">A/B test</div>
          <div className="text-xs text-[#A8B3CF]">Compare two runs against the same job description</div>
        </div>
        <div className="flex items-center gap-2">
          <input
            className="h-10 w-[160px] rounded-[10px] bg-[#111A2E] border border-[#273357] px-3 text-sm"
            value={experimentName}
            onChange={(e) => onExperimentName(e.target.value)}
          />
          <select
            className="h-10 rounded-[10px] bg-[#111A2E] border border-[#273357] px-3 text-sm"
            value={compareId}
            onChange={(e) => onCompareId(e.target.value)}
          >
            <option value="">Select variant run (B)</option>
            {compareOptions.map((r) => (
              <option key={r.id} value={r.id}>
                {r.id.slice(0, 8)}… • score {r.overallScore}
              </option>
            ))}
          </select>
          <Button onClick={onRun} disabled={!compareId || loading}>
            Run
          </Button>
        </div>
      </div>

      {abResult ? (
        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="rounded-lg border border-[#273357] bg-[#111A2E] p-3">
            <div className="text-xs text-[#A8B3CF]">Variant A</div>
            <div className="text-lg font-semibold">{abResult.a.overallScore}</div>
          </div>
          <div className="rounded-lg border border-[#273357] bg-[#111A2E] p-3">
            <div className="text-xs text-[#A8B3CF]">Variant B</div>
            <div className="text-lg font-semibold">{abResult.b.overallScore}</div>
          </div>
          <div className="md:col-span-2 text-sm text-[#A8B3CF]">
            Score delta (B − A): {abResult.scoreDelta >= 0 ? `+${abResult.scoreDelta}` : abResult.scoreDelta}
          </div>
        </div>
      ) : (
        <div className="mt-3 text-sm text-[#A8B3CF]">Pick a B run and run the comparison.</div>
      )}
    </Card>
  )
}
