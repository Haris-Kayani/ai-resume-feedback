import Card from '@/components/ui/Card'

type RecData = {
  missingKeywords?: string[]
  missingSkills?: string[]
}

export default function OverviewCard({
  recommendations,
}: {
  recommendations: Array<{ id: string; title: string; rationale: string; priority: 'high' | 'med' | 'low'; data?: RecData }>
}) {
  return (
    <Card className="p-4">
      <div className="text-sm font-semibold">What to fix first</div>
      <div className="mt-3 space-y-2">
        {recommendations.slice(0, 5).map((recommendation) => (
          <div key={recommendation.id} className="rounded-lg border border-[#273357] bg-[#111A2E] px-3 py-2">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium">{recommendation.title}</div>
              <div className="text-xs text-[#A8B3CF]">{recommendation.priority.toUpperCase()}</div>
            </div>
            <div className="mt-1 text-sm text-[#A8B3CF]">{recommendation.rationale}</div>
            {recommendation.data?.missingKeywords?.length ? (
              <div className="mt-2 text-xs text-[#A8B3CF]">Missing keywords: {recommendation.data.missingKeywords.join(', ')}</div>
            ) : null}
            {recommendation.data?.missingSkills?.length ? (
              <div className="mt-2 text-xs text-[#A8B3CF]">Missing skills: {recommendation.data.missingSkills.join(', ')}</div>
            ) : null}
          </div>
        ))}
        {recommendations.length === 0 ? <div className="text-sm text-[#A8B3CF]">No recommendations generated.</div> : null}
      </div>
    </Card>
  )
}
