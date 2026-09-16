import { useState } from 'react'
import { Link, Outlet, useNavigate } from 'react-router'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { BottomNav } from '../components/BottomNav'
import { AppShell } from '../components/AppShell'
import { MacroGrid } from '../components/MacroGrid'
import { EntryRow } from '../components/EntryRow'
import { useDateParam } from '../lib/useDataParam'
import { addDays, friendlyDay, isoWeek, monthDay } from '../lib/dates'
import type { Entry, Food } from '../lib/types'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, getTargetForDate } from '../lib/db'

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

  const target = useLiveQuery(() => getTargetForDate(date), [date])

  const calTotal = Math.round(dayEntries.reduce((sum, e) => sum + e.kcal, 0))
  const proteinTotal = Math.round(dayEntries.reduce((sum, e) => sum + e.protein, 0))
  const fiberTotal = Math.round(dayEntries.reduce((sum, e) => sum + e.fiber, 0))
  const fatTotal = Math.round(dayEntries.reduce((sum, e) => sum + e.fat, 0))
  const carbTotal = Math.round(dayEntries.reduce((sum, e) => sum + e.carbs, 0))

  const calTarget = target?.kcal ?? 0
  const [openId, setOpenId] = useState<number | null>(null)

  const waterLogs = useLiveQuery(
    () => db.waterLogs.where('date').equals(date).toArray(),
    [date],
    [],
  )
  const waterTotal = waterLogs.reduce((sum, log) => sum + log.ounces, 0)

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

      <div className="grid grid-cols-2 gap-2.5">
        <CalorieHero kcal={calTotal} target={calTarget} />
        <WaterHero
          ounces={waterTotal}
          target={target?.water ?? 0}
          to={`/day/${date}/water`}
        />
      </div>

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
            <EntryRow
              key={e.id}
              entry={e}
              foodName={foodNames.find((f) => f.id === e.foodId)?.name ?? 'Entry #' + e.id}
              revealed={openId === e.id}
              onReveal={() => {
                if (e.id != null) setOpenId(e.id)
              }}
              onClose={() => setOpenId((id) => (id === e.id ? null : id))}
              onEdit={() => {
                if (e.id == null) return
                navigate(`/day/${date}/entry/${e.id}`)
              }}
              onDelete={() => {
                if (e.id == null) return
                db.entries.delete(e.id).catch((err) => {
                  console.error('Failed to delete entry', err)
                })
                setOpenId((id) => (id === e.id ? null : id))
              }}
            />
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

function Ring({
  pct,
  strokeClass,
  size = 72,
}: {
  pct: number
  strokeClass: string
  size?: number
}) {
  const r = 26
  const c = 2 * Math.PI * r
  return (
    <svg width={size} height={size} viewBox="0 0 72 72" className="-rotate-90" aria-hidden="true">
      <circle cx="36" cy="36" r={r} fill="none" className="stroke-track" strokeWidth="8" />
      <circle
        cx="36"
        cy="36"
        r={r}
        fill="none"
        className={strokeClass}
        strokeWidth="8"
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={c * (1 - pct)}
      />
    </svg>
  )
}

function CalorieHero({ kcal, target }: { kcal: number; target: number }) {
  const pct = target > 0 ? Math.min(1, kcal / target) : 0

  return (
    <div className="card flex flex-col items-start rounded-[1.65rem] p-4">
      <Ring pct={pct} strokeClass="stroke-primary" />
      <p className="mt-3 font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.14em] text-foreground-muted">
        Calories
      </p>
      <p className="mt-1 font-[family-name:var(--font-display)] text-[32px] font-semibold leading-none tracking-[-0.04em] text-foreground">
        {kcal}
      </p>
      <p className="mt-2 text-sm text-foreground-muted">
        {target > 0 ? `of ${Math.round(target)}` : 'logged today'}
      </p>
    </div>
  )
}

function WaterHero({ ounces, target, to }: { ounces: number; target: number; to: string }) {
  const pct = target > 0 ? Math.min(1, ounces / target) : 0
  const shown = Number.isInteger(ounces) ? String(ounces) : ounces.toFixed(1)

  return (
    <Link
      to={to}
      className="card flex flex-col items-start rounded-[1.65rem] p-4 text-left active:bg-hover"
    >
      <Ring pct={pct} strokeClass="stroke-water-fill" />
      <p className="mt-3 font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.14em] text-water-ink">
        Water
      </p>
      <p className="mt-1 font-[family-name:var(--font-display)] text-[32px] font-semibold leading-none tracking-[-0.04em] text-foreground">
        {shown}
      </p>
      <p className="mt-2 text-sm text-foreground-muted">
        {target > 0 ? `of ${Math.round(target)} fl oz` : 'tap to log'}
      </p>
    </Link>
  )
}
