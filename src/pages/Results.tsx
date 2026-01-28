import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Spinner from '@/components/ui/Spinner'
import ScoreRing from '@/components/ScoreRing'
import { apiGet, apiPost } from '@/utils/api'
import { useWorkspaceStore } from '@/stores/workspace'
import ResultsTabs, { type ResultsTab } from '@/components/results/ResultsTabs'
import OverviewCard from '@/components/results/OverviewCard'
import BreakdownCard from '@/components/results/BreakdownCard'
import DiffCard, { type DiffResult } from '@/components/results/DiffCard'
import AbTestCard from '@/components/results/AbTestCard'
import RecommendationsCard from '@/components/results/RecommendationsCard'

type Run = {
  id: string
  resumeId: string
  jobDescriptionId: string
  overallScore: number
  metrics: Record<string, number>
  recommendations: Array<{
    id: string
    title: string
    rationale: string
    priority: 'high' | 'med' | 'low'
    data?: { missingKeywords?: string[]; missingSkills?: string[] }
  }>
  resumeTextSnapshot: string
  jdTextSnapshot: string
  createdAt: string
}

type AbComparison = {
  scoreDelta: number
  a: { runId: string; overallScore: number; metrics: Record<string, number> }
  b: { runId: string; overallScore: number; metrics: Record<string, number> }
}

function getErrorMessage(err: unknown, fallback: string): string {
  if (typeof err === 'object' && err && 'message' in err && typeof (err as { message?: unknown }).message === 'string') {
    return (err as { message: string }).message
  }
  if (err instanceof Error) return err.message
  return fallback
}

export default function Results() {
  const { runId } = useParams()
  const nav = useNavigate()
  const { runs, refreshAll } = useWorkspaceStore()
  const [activeTab, setActiveTab] = useState<ResultsTab>('overview')
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [analysisRun, setAnalysisRun] = useState<Run | null>(null)
  const [compareRunId, setCompareRunId] = useState<string>('')
  const [diffResult, setDiffResult] = useState<DiffResult | null>(null)
  const [experimentName, setExperimentName] = useState('Experiment')
  const [abTestResult, setAbTestResult] = useState<AbComparison | null>(null)

  const compareOptions = useMemo(() => runs.filter((analysisRunItem) => analysisRunItem.id !== runId), [runs, runId])

  useEffect(() => {
    void refreshAll()
  }, [refreshAll])

  useEffect(() => {
    if (!runId) return
    void (async () => {
      setIsLoading(true)
      setErrorMessage(null)
      try {
        const res = await apiGet<{ success: true; run: Run }>(`/api/analysis/runs/${runId}`)
        setAnalysisRun(res.run)
      } catch (e: unknown) {
        setErrorMessage(getErrorMessage(e, 'Failed to load run'))
      } finally {
        setIsLoading(false)
      }
    })()
  }, [runId])

  async function loadDiff() {
    if (!runId || !compareRunId) return
    setIsLoading(true)
    setErrorMessage(null)
    try {
      const res = await apiPost<{ success: true; diff: DiffResult }>('/api/diff', { baseRunId: runId, compareRunId: compareRunId })
      setDiffResult(res.diff)
    } catch (e: unknown) {
      setErrorMessage(getErrorMessage(e, 'Failed to compute diff'))
    } finally {
      setIsLoading(false)
    }
  }

  async function runAbTest() {
    if (!runId || !compareRunId || !analysisRun) return
    setIsLoading(true)
    setErrorMessage(null)
    try {
      const res = await apiPost<{ success: true; comparison: AbComparison }>('/api/experiments', {
        name: experimentName,
        jobDescriptionId: analysisRun.jobDescriptionId,
        runAId: runId,
        runBId: compareRunId,
      })
      setAbTestResult(res.comparison)
    } catch (e: unknown) {
      setErrorMessage(getErrorMessage(e, 'Failed to run A/B'))
    } finally {
      setIsLoading(false)
    }
  }

  const sortedRecommendations = useMemo(() => {
    if (!analysisRun) return []
    const rank = { high: 0, med: 1, low: 2 } as const
    return [...analysisRun.recommendations].sort((a, b) => rank[a.priority] - rank[b.priority])
  }, [analysisRun])

  return (
    <div className="min-h-screen bg-[#0B1220] text-white">
      <div className="border-b border-[#273357]">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold">Results</div>
            <div className="text-xs text-[#A8B3CF]">Run {runId}</div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={() => nav('/app')}>Back</Button>
            <Button variant="secondary" onClick={() => void refreshAll()}>Refresh</Button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-6 grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
        <div className="space-y-4">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <ScoreRing score={analysisRun?.overallScore || 0} />
              <ResultsTabs activeTab={activeTab} onTabChange={setActiveTab} />
            </div>
            {isLoading ? <div className="mt-3"><Spinner label="Loading" /></div> : null}
            {errorMessage ? <div className="mt-3 text-sm text-rose-300">{errorMessage}</div> : null}
          </Card>

          {activeTab === 'overview' ? <OverviewCard recommendations={sortedRecommendations} /> : null}
          {activeTab === 'breakdown' && analysisRun ? <BreakdownCard metrics={analysisRun.metrics} /> : null}
          {activeTab === 'diff' ? (
            <DiffCard
              compareRunId={compareRunId}
              onCompareRunIdChange={setCompareRunId}
              compareOptions={compareOptions}
              isLoading={isLoading}
              diffResult={diffResult}
              onComputeDiff={() => void loadDiff()}
            />
          ) : null}
          {activeTab === 'ab' ? (
            <AbTestCard
              experimentName={experimentName}
              onExperimentNameChange={setExperimentName}
              compareRunId={compareRunId}
              onCompareRunIdChange={setCompareRunId}
              compareOptions={compareOptions}
              isLoading={isLoading}
              abTestResult={abTestResult}
              onRunExperiment={() => void runAbTest()}
            />
          ) : null}
        </div>

        <div className="space-y-4">
          <RecommendationsCard recommendations={sortedRecommendations} />
        </div>
      </div>
    </div>
  )
}
