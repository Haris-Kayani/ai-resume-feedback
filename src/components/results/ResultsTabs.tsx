import Button from '@/components/ui/Button'

export type ResultsTab = 'overview' | 'breakdown' | 'diff' | 'ab'

export default function ResultsTabs({ activeTab, onTabChange }: { activeTab: ResultsTab; onTabChange: (tab: ResultsTab) => void }) {
  return (
    <div className="flex items-center gap-2">
      <Button variant={activeTab === 'overview' ? 'primary' : 'secondary'} onClick={() => onTabChange('overview')}>
        Overview
      </Button>
      <Button variant={activeTab === 'breakdown' ? 'primary' : 'secondary'} onClick={() => onTabChange('breakdown')}>
        Breakdown
      </Button>
      <Button variant={activeTab === 'diff' ? 'primary' : 'secondary'} onClick={() => onTabChange('diff')}>
        Diff
      </Button>
      <Button variant={activeTab === 'ab' ? 'primary' : 'secondary'} onClick={() => onTabChange('ab')}>
        A/B
      </Button>
    </div>
  )
}

