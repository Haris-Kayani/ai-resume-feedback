import Button from '@/components/ui/Button'

export type ResultsTab = 'overview' | 'breakdown' | 'diff' | 'ab'

export default function ResultsTabs({ tab, onTab }: { tab: ResultsTab; onTab: (t: ResultsTab) => void }) {
  return (
    <div className="flex items-center gap-2">
      <Button variant={tab === 'overview' ? 'primary' : 'secondary'} onClick={() => onTab('overview')}>
        Overview
      </Button>
      <Button variant={tab === 'breakdown' ? 'primary' : 'secondary'} onClick={() => onTab('breakdown')}>
        Breakdown
      </Button>
      <Button variant={tab === 'diff' ? 'primary' : 'secondary'} onClick={() => onTab('diff')}>
        Diff
      </Button>
      <Button variant={tab === 'ab' ? 'primary' : 'secondary'} onClick={() => onTab('ab')}>
        A/B
      </Button>
    </div>
  )
}

