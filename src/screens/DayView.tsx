import { Outlet, useNavigate } from 'react-router'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { BottomNav } from '../components/BottomNav'
import { AppShell } from '../components/AppShell'
import { MacroGrid } from '../components/MacroGrid'
import { useDateParam } from '../lib/useDataParam'
import { addDays, friendlyDay, isoWeek, monthDay } from '../lib/dates'
import type { Entry, Food, Target } from '../lib/types'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../lib/db'

export function DayView() {
  const date = useDateParam()
  const navigate = useNavigate()

  // replace: true — arrowing through a week shouldn't leave seven entries in
  // the back stack. One tap of Back should get you out, not walk you backwards
  // through every day you looked at.
  const go = (n: number) => navigate(`/day/${addDays(date, n)}`, { replace: true })

  const dayEntries: Entry[] = useLiveQuery(
    () => db.entries.where('date').equals(date).sortBy('loggedAt'),
    [date],
    [],
  )

  const foodNames: Food[] = useLiveQuery(() => db.foods.toArray(), [], []) ?? []

  const allTargets: Target[] = useLiveQuery(() => db.targets.toArray(), [], []) ?? []
  const target = allTargets
    .filter((t) => t.effectiveFrom <= date)
    .sort((a, b) => a.effectiveFrom.localeCompare(b.effectiveFrom))
    .at(-1)

  const calTotal = Math.round(dayEntries.reduce((sum, e) => sum + e.kcal, 0))
  const proteinTotal = Math.round(dayEntries.reduce((sum, e) => sum + e.protein, 0))
  const fiberTotal = Math.round(dayEntries.reduce((sum, e) => sum + e.fiber, 0))
  const fatTotal = Math.round(dayEntries.reduce((sum, e) => sum + e.fat, 0))
  const carbTotal = Math.round(dayEntries.reduce((sum, e) => sum + e.carbs, 0))

  const calTarget = target?.kcal ?? 0

  return (
    <AppShell>
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-[26px] font-semibold tracking-[-0.025em] text-foreground">
            {friendlyDay(date)}
          </h1>
          <p className="mt-1 font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.16em] text-foreground-muted">
            {monthDay(date)} · Week {isoWeek(date)}
          </p>
        </div>
        <div className="card flex items-center gap-1 rounded-full p-1">
          <button onClick={() => go(-1)} aria-label="Previous day" className="rounded-full p-2 text-foreground-subtle">
            <ChevronLeft size={19} />
          </button>
          <button onClick={() => go(1)} aria-label="Next day" className="rounded-full p-2 text-foreground-subtle">
            <ChevronRight size={19} />
          </button>
        </div>
      </header>

      <CalorieHero kcal={calTotal} target={calTarget} />

      <div className="mt-3">
        <MacroGrid
          totals={{ protein: proteinTotal, carbs: carbTotal, fat: fatTotal, fiber: fiberTotal }}
          targets={{
            protein: target?.protein ?? 0,
            carbs: target?.carbs ?? 0,
            fat: target?.fat ?? 0,
            fiber: target?.fiber ?? 0,
          }}
        />
      </div>

      <section className="mt-6">
        <h2 className="mb-3 font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.14em] text-foreground-muted">
          Logged
        </h2>
        <div className="space-y-2">
          {dayEntries.map((e) => (
            <div key={e.id} className="card flex items-center justify-between rounded-[1.35rem] px-4 py-3.5">
              <div className="min-w-0 pr-3">
                <p className="truncate text-foreground">
                  {foodNames.find((f) => f.id === e.foodId)?.name ?? 'Entry #' + e.id}
                </p>
                <p className="mt-0.5 font-[family-name:var(--font-mono)] text-[11px] text-foreground-muted">
                  <span className="text-protein-ink">{Math.round(e.protein)}p</span>
                  {' · '}
                  <span className="text-carbs-ink">{Math.round(e.carbs)}c</span>
                  {' · '}
                  <span className="text-fat-ink">{Math.round(e.fat)}f</span>
                  {' · '}
                  <span className="text-fiber-ink">{Math.round(e.fiber)}fi</span>
                </p>
              </div>
              <p className="shrink-0 text-sm font-semibold tabular-nums text-foreground">
                {Math.round(e.kcal)}
              </p>
            </div>
          ))}

          {dayEntries.length === 0 && (
            <div className="card rounded-[1.35rem] px-4 py-8 text-center text-sm text-foreground-muted">
              Nothing logged yet.
            </div>
          )}
        </div>
      </section>

      <BottomNav />

      {/* Sheets render here, on top, with the day still visible behind. */}
      <Outlet />
    </AppShell>
  )
}

function CalorieHero({ kcal, target }: { kcal: number; target: number }) {
  const size = 120
  const r = 52
  const c = 2 * Math.PI * r
  const pct = target > 0 ? Math.min(1, kcal / target) : 0

  return (
    <div className="card flex items-center gap-5 rounded-[1.65rem] p-5">
      <svg width={size} height={size} viewBox="0 0 120 120" className="-rotate-90" aria-hidden="true">
        <circle cx="60" cy="60" r={r} fill="none" className="stroke-track" strokeWidth="10" />
        <circle
          cx="60"
          cy="60"
          r={r}
          fill="none"
          className="stroke-primary"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct)}
        />
      </svg>
      <div>
        <p className="font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.14em] text-foreground-muted">
          Calories
        </p>
        <p className="mt-1 font-[family-name:var(--font-display)] text-[40px] font-semibold leading-none tracking-[-0.04em] text-foreground">
          {kcal}
        </p>
        <p className="mt-2 text-sm text-foreground-muted">
          {target > 0 ? `of ${Math.round(target)}` : 'logged today'}
        </p>
      </div>
    </div>
  )
}
