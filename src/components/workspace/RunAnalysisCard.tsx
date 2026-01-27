import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Spinner from '@/components/ui/Spinner'

export default function RunAnalysisCard({
  resumeLabel,
  jdLabel,
  canRun,
  running,
  error,
  onRun,
}: {
  resumeLabel: string
  jdLabel: string
  canRun: boolean
  running: boolean
  error: string | null
  onRun: () => void
}) {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-semibold">Run ATS Score</div>
          <div className="text-xs text-[#A8B3CF]">Extract text → score → recommendations</div>
        </div>
        <Button onClick={onRun} disabled={!canRun || running}>
          {running ? 'Running…' : 'Run'}
        </Button>
      </div>
      <div className="mt-3 text-sm text-[#A8B3CF]">
        Resume: <span className="text-white">{resumeLabel}</span>
        {' • '}JD: <span className="text-white">{jdLabel}</span>
      </div>
      {running ? <div className="mt-3"><Spinner label="Processing resume" /></div> : null}
      {error ? <div className="mt-3 text-sm text-rose-300">{error}</div> : null}
    </Card>
  )
}

