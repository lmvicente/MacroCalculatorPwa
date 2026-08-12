import { useParams } from 'react-router'
import { Sheet } from '../components/Sheet'

export function FoodSheet() {
  const { foodId } = useParams<{ foodId: string }>()

  return (
    <Sheet eyebrow="Saved food" title="Food detail">
      {/* PORT FROM FIGMA: per-unit macro tiles, Edit macros, Done */}
      <div className="pb-2 text-sm text-foreground-muted">Macros for food #{foodId}.</div>
    </Sheet>
  )
}