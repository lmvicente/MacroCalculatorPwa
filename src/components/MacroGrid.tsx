import { MacroCard } from './MacroCard'
import { MACROS, type MacroKey } from '../lib/macros'

export type MacroTotals = Record<MacroKey, number>

/** The 2x2 grid. Driven by MACROS, so adding a macro is a one-line change. */
export function MacroGrid({
  totals,
  targets,
}: {
  totals: MacroTotals
  targets: Partial<MacroTotals>
}) {
  return (
    <section className="grid grid-cols-2 gap-2.5">
      {MACROS.map((macro) => (
        <MacroCard
          key={macro.key}
          macro={macro}
          value={totals[macro.key] ?? 0}
          target={targets[macro.key] ?? 0}
        />
      ))}
    </section>
  )
}