import { ChartLine } from 'lucide-react'
import { UtilityPage } from './UtilityPage'

export function TrendsPage() {
  return (
    <UtilityPage title="Trends" eyebrow="Week & month" icon={<ChartLine />}>
      <p className="text-sm text-foreground-muted">
        Rollups land here once there's data worth rolling up.
      </p>
    </UtilityPage>
  )
}