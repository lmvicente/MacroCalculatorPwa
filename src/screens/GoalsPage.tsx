import { Target } from 'lucide-react'
import { UtilityPage } from './UtilityPage'

export function GoalsPage() {
  return (
    <UtilityPage title="Goals" eyebrow="Your targets" icon={<Target />}>
      {/* PORT FROM FIGMA: current targets list, start-date picker,
          End button, previous-plans history */}
      <p className="text-sm text-foreground-muted">Targets go here.</p>
    </UtilityPage>
  )
}