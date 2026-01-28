import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Spinner from '@/components/ui/Spinner'

export default function RunAnalysisCard({
  resumeLabel,
  jobDescriptionLabel,
  canRunAnalysis,
  isRunning,
  errorMessage,
  onRunAnalysis,
}: {
  resumeLabel: string
  jobDescriptionLabel: string
  canRunAnalysis: boolean
  isRunning: boolean
  errorMessage: string | null
  onRunAnalysis: () => void
}) {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-semibold">Run ATS Score</div>
          <div className="text-xs text-[#A8B3CF]">Extract text → score → recommendations</div>
        </div>
        <Button onClick={onRunAnalysis} disabled={!canRunAnalysis || isRunning}>
          {isRunning ? 'Running…' : 'Run'}
        </Button>
      </div>
      <div className="mt-3 text-sm text-[#A8B3CF]">
        Resume: <span className="text-white">{resumeLabel}</span>
        {' • '}JD: <span className="text-white">{jobDescriptionLabel}</span>
      </div>
      {isRunning ? <div className="mt-3"><Spinner label="Processing resume" /></div> : null}
      {errorMessage ? <div className="mt-3 text-sm text-rose-300">{errorMessage}</div> : null}
    </Card>
  )
}

