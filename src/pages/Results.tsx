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
  const [tab, setTab] = useState<ResultsTab>('overview')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [run, setRun] = useState<Run | null>(null)
  const [compareId, setCompareId] = useState<string>('')
  const [diff, setDiff] = useState<DiffResult | null>(null)
  const [experimentName, setExperimentName] = useState('Experiment')
  const [abResult, setAbResult] = useState<AbComparison | null>(null)

  const compareOptions = useMemo(() => runs.filter((r) => r.id !== runId), [runs, runId])

  useEffect(() => {
    void refreshAll()
  }, [refreshAll])

  useEffect(() => {
    if (!runId) return
    void (async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await apiGet<{ success: true; run: Run }>(`/api/analysis/runs/${runId}`)
        setRun(res.run)
      } catch (e: unknown) {
        setError(getErrorMessage(e, 'Failed to load run'))
      } finally {
        setLoading(false)
      }
    })()
  }, [runId])

  async function loadDiff() {
    if (!runId || !compareId) return
    setLoading(true)
    setError(null)
    try {
      const res = await apiPost<{ success: true; diff: DiffResult }>('/api/diff', { baseRunId: runId, compareRunId: compareId })
      setDiff(res.diff)
    } catch (e: unknown) {
      setError(getErrorMessage(e, 'Failed to compute diff'))
    } finally {
      setLoading(false)
    }
  }

  async function runAb() {
    if (!runId || !compareId || !run) return
    setLoading(true)
    setError(null)
    try {
      const res = await apiPost<{ success: true; comparison: AbComparison }>('/api/experiments', {
        name: experimentName,
        jobDescriptionId: run.jobDescriptionId,
        runAId: runId,
        runBId: compareId,
      })
      setAbResult(res.comparison)
    } catch (e: unknown) {
      setError(getErrorMessage(e, 'Failed to run A/B'))
    } finally {
      setLoading(false)
    }
  }

  const recs = useMemo(() => {
    if (!run) return []
    const rank = { high: 0, med: 1, low: 2 } as const
    return [...run.recommendations].sort((a, b) => rank[a.priority] - rank[b.priority])
  }, [run])

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
              <ScoreRing score={run?.overallScore || 0} />
              <ResultsTabs tab={tab} onTab={setTab} />
            </div>
            {loading ? <div className="mt-3"><Spinner label="Loading" /></div> : null}
            {error ? <div className="mt-3 text-sm text-rose-300">{error}</div> : null}
          </Card>

          {tab === 'overview' ? <OverviewCard recommendations={recs} /> : null}
          {tab === 'breakdown' && run ? <BreakdownCard metrics={run.metrics} /> : null}
          {tab === 'diff' ? (
            <DiffCard
              compareId={compareId}
              onCompareId={setCompareId}
              compareOptions={compareOptions}
              loading={loading}
              diff={diff}
              onCompute={() => void loadDiff()}
            />
          ) : null}
          {tab === 'ab' ? (
            <AbTestCard
              experimentName={experimentName}
              onExperimentName={setExperimentName}
              compareId={compareId}
              onCompareId={setCompareId}
              compareOptions={compareOptions}
              loading={loading}
              abResult={abResult}
              onRun={() => void runAb()}
            />
          ) : null}
        </div>

        <div className="space-y-4">
          <RecommendationsCard recommendations={recs} />
        </div>
      </div>
    </div>
  )
}
