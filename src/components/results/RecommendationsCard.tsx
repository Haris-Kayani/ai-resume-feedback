import Card from '@/components/ui/Card'

export default function RecommendationsCard({
  recommendations,
}: {
  recommendations: Array<{ id: string; title: string; rationale: string; priority: 'high' | 'med' | 'low' }>
}) {
  return (
    <Card className="p-4">
      <div className="text-sm font-semibold">Recommendations</div>
      <div className="mt-3 space-y-2">
        {recommendations.map((r) => (
          <div key={r.id} className="rounded-lg border border-[#273357] bg-[#111A2E] px-3 py-2">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium">{r.title}</div>
              <div className="text-xs text-[#A8B3CF]">{r.priority.toUpperCase()}</div>
            </div>
            <div className="mt-1 text-sm text-[#A8B3CF]">{r.rationale}</div>
          </div>
        ))}
        {recommendations.length === 0 ? <div className="text-sm text-[#A8B3CF]">No recommendations.</div> : null}
      </div>
    </Card>
  )
}

