import { ProgressBar } from './ProgressBar'
import type { MacroMeta } from '../lib/macros'

/** One tile in the 2x2 grid on the day view. */
export function MacroCard({
  macro,
  value,
  target,
}: {
  macro: MacroMeta
  value: number
  target: number
}) {
  const pct = target > 0 ? Math.round((value / target) * 100) : 0

  return (
    <div className="rounded-[1.2rem] border border-border bg-surface p-3.5">
      <div className="flex items-center justify-between">
        <span className="font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.12em] text-foreground-muted">
          {macro.label}
        </span>
        <span className={`font-[family-name:var(--font-mono)] text-[11px] ${macro.inkClass}`}>
          {target > 0 ? `${pct}%` : '—'}
        </span>
      </div>

      <div className="mt-2 flex items-baseline gap-1">
        <span className="text-xl font-semibold tracking-[-0.04em] text-foreground">
          {Math.round(value)}
        </span>
        {/* No target set for this day yet — show the number, hide the goal. */}
        {target > 0 && <span className="text-xs text-foreground-muted">/{Math.round(target)}g</span>}
      </div>

      <div className="mt-3">
        <ProgressBar value={value} target={target} fillClass={macro.fillClass} />
      </div>
    </div>
  )
}