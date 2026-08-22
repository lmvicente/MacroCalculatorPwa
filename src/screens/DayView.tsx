import { Link, Outlet, useNavigate } from 'react-router'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { BottomNav } from '../components/BottomNav'
import { useDateParam } from '../lib/useDataParam'
import { addDays, friendlyDay, isoWeek, monthDay } from '../lib/dates'
import type { Entry } from '../lib/types'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../lib/db'

export function DayView() {
  const date = useDateParam()
  const navigate = useNavigate()

  // replace: true — arrowing through a week shouldn't leave seven entries in
  // the back stack. One tap of Back should get you out, not walk you backwards
  // through every day you looked at.
  const go = (n: number) => navigate(`/day/${addDays(date, n)}`, { replace: true })

  //select all the records in the dexiedb
  //orderedd by entry time
  const dayEntries: Entry[] = useLiveQuery(() => db.entries.where('date').equals(date).toArray(), [date], [])

  //get the entries calories and add it up
  //claude adjust it to a one-liner .. clearly i need to work on js lol
  const calTotal = Math.round(dayEntries.reduce((sum, e) => sum + e.kcal, 0))

  //my initial idea
  const proteinTotal = () => {
    let total = 0;
    for (let i =0; i < dayEntries.length; i++) {
      total += dayEntries[i].protein
    }
    return Math.round(total);
  } //its a function

  const fiberTotal = Math.round(dayEntries.reduce((sum, e) => sum + e.fiber, 0))
  const fatTotal = Math.round(dayEntries.reduce((sum, e) => sum + e.fat, 0))
  const carbTotal = Math.round(dayEntries.reduce((sum, e) => sum + e.carbs, 0))

  return (
    <div className="mx-auto min-h-[100dvh] max-w-[560px] px-5 pb-28 pt-6 md:relative md:my-6 md:min-h-[820px] md:overflow-hidden md:rounded-[2rem] md:border md:border-border md:bg-background md:shadow-2xl">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="font-[family-name:var(--font-display)] text-[26px] font-semibold tracking-[-0.025em] text-foreground">
          {friendlyDay(date)}
        </h1>
        <div className="flex items-center gap-1 rounded-full border border-border bg-hover p-1">
          <button onClick={() => go(-1)} aria-label="Previous day" className="rounded-full p-2 text-foreground-subtle">
            <ChevronLeft size={19} />
          </button>
          <button onClick={() => go(1)} aria-label="Next day" className="rounded-full p-2 text-foreground-subtle">
            <ChevronRight size={19} />
          </button>
        </div>
      </header>

      <p className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.16em] text-foreground-muted">
        {monthDay(date)} &middot; Week {isoWeek(date)}
      </p>

    {/* Entries table — macro columns center-aligned, headers + values */}
    <div className="mt-8 overflow-hidden rounded-[1.65rem] border border-border bg-surface">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left">
            <th className="px-4 py-3 font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.12em] text-foreground-muted">
              Food
            </th>
            <th className="px-3 py-3 text-center font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.12em] text-foreground-muted">
              Cal
            </th>
            <th className="px-3 py-3 text-center font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.12em] text-protein-ink">
              Protein
            </th>
            <th className="px-2 py-3 text-center font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.12em] text-carbs-ink">
              Carbs
            </th>
            <th className="px-2 py-3 text-center font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.12em] text-fat-ink">
              Fat
            </th>
            <th className="px-3 py-3 text-center font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.12em] text-fiber-ink">
              Fiber
            </th>
          </tr>
        </thead>
        <tbody>
          {dayEntries.map((e) => (
            <tr key={e.id} className="border-b border-border last:border-b-0">
              <td className="px-4 py-3 text-foreground">
                {/* PORT FROM FIGMA / YOU WRITE: food name via e.foodId, or store it inline */}
                Entry #{e.id}
              </td>
              <td className="px-2 py-3 text-center text-foreground">{Math.round(e.kcal)}</td>
              <td className="px-2 py-3 text-center text-foreground-subtle">{Math.round(e.protein)}</td>
              <td className="px-2 py-3 text-center text-foreground-subtle">{Math.round(e.carbs)}</td>
              <td className="px-2 py-3 text-center text-foreground-subtle">{Math.round(e.fat)}</td>
              <td className="px-4 py-3 text-center text-foreground-subtle">{Math.round(e.fiber)}</td>
            </tr>
          ))}

          {dayEntries.length === 0 && (
            <tr>
              <td colSpan={6} className="px-4 py-6 text-center text-foreground-muted">
                Nothing logged yet.
              </td>
            </tr>
          )}
        </tbody>

        {dayEntries.length > 0 && (
          <tfoot>
            <tr className="border-t border-border-strong bg-surface-2 font-semibold">
              <td className="px-4 py-3 text-foreground">Total</td>
              {/* YOU WRITE: sum each column across dayEntries — reduce() over the array */}
              <td className="px-2 py-3 text-center text-foreground">{calTotal}</td>
              <td className="px-2 py-3 text-center text-protein-ink">{proteinTotal()}</td> 
              <td className="px-2 py-3 text-center text-carbs-ink">{carbTotal}</td>
              <td className="px-2 py-3 text-center text-fat-ink">{fatTotal}</td>
              <td className="px-4 py-3 text-center text-fiber-ink">{fiberTotal}</td>
            </tr>
          </tfoot>
        )}
      </table>
    </div>

      <Link
        to={`/day/${date}/add`}
        aria-label="Add an entry"
        className="fixed bottom-[4.9rem] right-5 z-40 flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[0_12px_28px_rgba(147,176,20,0.28)] md:absolute md:bottom-7 md:right-7"
      >
        <Plus size={27} />
      </Link>

      <BottomNav />

      {/* Sheets render here, on top, with the day still visible behind. */}
      <Outlet />
    </div>
  )
}