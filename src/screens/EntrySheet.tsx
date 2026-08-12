import { Sheet } from '../components/Sheet'

export function EntrySheet() {
  return (
    <Sheet eyebrow="New entry" title="What did you have?">
      {/* PORT FROM FIGMA: search input, recent-foods list, amount + unit */}
      <div className="pb-2 text-sm text-foreground-muted">Search + amount go here.</div>
    </Sheet>
  )
}