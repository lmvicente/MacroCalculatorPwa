/**
 * A track with a fill. Used for the energy bar and inside every MacroCard.
 *
 * `fillClass` is passed in as a complete class string, never built up from
 * pieces. See the note in macros.ts for why that matters.
 */
export function ProgressBar({
  value,
  target,
  fillClass,
  height = 'h-1.5',
}: {
  value: number
  target: number
  fillClass: string
  height?: string
}) {
  // Guard against target 0 — a day before you've set any goal would
  // otherwise divide by zero and render width: NaN%.
  const pct = target > 0 ? (value / target) * 100 : 0

  return (
    <div className={`${height} overflow-hidden rounded-full bg-track`}>
      <div
        className={`h-full rounded-full transition-[width] duration-300 ${fillClass}`}
        // Clamped at 100 so 200g of protein doesn't render a bar
        // twice as wide as its container.
        style={{ width: `${Math.min(100, Math.max(0, pct))}%` }}
      />
    </div>
  )
}