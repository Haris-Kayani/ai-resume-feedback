import Card from '@/components/ui/Card'

export default function BreakdownCard({ metrics }: { metrics: Record<string, number> }) {
  return (
    <Card className="p-4">
      <div className="text-sm font-semibold">Score breakdown</div>
      <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
        {Object.entries(metrics).map(([k, v]) => (
          <div key={k} className="rounded-lg border border-[#273357] bg-[#111A2E] px-3 py-2">
            <div className="text-xs text-[#A8B3CF]">{k.replace(/_/g, ' ')}</div>
            <div className="text-lg font-semibold">{Math.round(v)}</div>
          </div>
        ))}
      </div>
    </Card>
  )
}

