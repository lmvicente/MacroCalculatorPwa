import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { ChevronLeft, Plus, Search } from 'lucide-react'
import { Sheet } from '../components/Sheet'
import { useDateParam } from '../lib/useDataParam'
import type { Entry, Food, Macros, Unit } from '../lib/types'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../lib/db'
import { toBaseUnits, UNITS_BY_FAMILY } from '../lib/units'

const inputClass =
  'rounded-2xl border border-border bg-surface-2 px-4 py-3 text-foreground outline-none placeholder:text-foreground-muted focus:border-border-strong'

const labelClass =
  'mb-1.5 block font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.14em] text-foreground-muted'

export function EntrySheet() {
  const navigate = useNavigate()
  const date = useDateParam()

  const [query, setQuery] = useState('')
  const [picked, setPicked] = useState<Food | null>(null)
  const [amount, setAmount] = useState('')
  const [unit, setUnit] = useState<Unit>('g')

  // Search: query `foods` by name, cap at 4. useLiveQuery, deps [query].
  // Return [] when query is blank so the list is empty on open.

  const matches: Food[] = useLiveQuery(
    () => db.foods.where('name').startsWithIgnoreCase(query).limit(4).toArray(), [query], [])

  // Which units the dropdown offers — derived from picked.unitFamily.
  // this means becase it default to g it should show everything in the mass unit family
  const units: Unit[] = picked ? UNITS_BY_FAMILY[picked.unitFamily] : [];

  // Live kcal readout, or null when there's no amount yet.
  const preview: number | null = picked && Number(amount) > 0 ? Math.round(picked.kcal * toBaseUnits(Number(amount), unit)) : null;

  function choose(_f: Food) {
    setPicked(_f);
    setUnit(UNITS_BY_FAMILY[_f.unitFamily][0])
  }

  function clear() {
    setQuery('')
    setPicked(null)
    setAmount('')
  }

  const handleSave = async () => {
    // amount -> number, guard > 0
    const foodId = picked?.id //define as const so that way no null issues in the transaction
    const foodAmount = Number(amount);
    if (!foodId || !(foodAmount > 0)) return

    const servingInBase = toBaseUnits(foodAmount, unit)

    const macroTotal : Macros = {
      kcal: picked.kcal * servingInBase,
      protein: picked.protein * servingInBase,
      carbs: picked.carbs * servingInBase,
      fat: picked.fat * servingInBase,
      fiber: picked.fiber * servingInBase
    }
    
    // toBaseUnits(amount, unit)
    // multiply each of the five macros by that

    // write the entry + bump the food's lastUsedAt, then navigate to the day

    const newEntry : Entry = {
      ...macroTotal,
      date: date,
      loggedAt: Date.now(),
      foodId: foodId,
      amount: Number(amount),
      unit: unit
    }


    db.transaction('rw', db.entries, db.foods, async () => {
      const id = await db.entries.add(newEntry);
      console.log('new entry added', id)
      await db.foods.update(foodId, {lastUsedAt: Date.now()})

    }).then(() => {

        //
        // Transaction Complete
        //
        console.log("Transaction committed");
        navigate(`/day/${date}`, { replace: true })
    }).catch(err => {

        //
        // Transaction Failed
        //
        console.error(err.stack);
    });
  }


  if (!picked) {
    return (
      <Sheet eyebrow="New entry" title="What did you have?">
        <div className="space-y-3 pb-2">
          <div className="relative">
            <Search
              size={17}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-foreground-muted"
            />
            <input
              autoFocus
              className={`${inputClass} w-full pl-11`}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search your foods"
            />
          </div>

          {matches?.map((f) => (
            <button
              key={f.id}
              onClick={() => choose(f)}
              className="flex w-full items-center justify-between rounded-2xl border border-border bg-surface px-4 py-3 text-left active:bg-hover"
            >
              <span>
                <span className="block text-foreground">{f.name}</span>
                {f.brand && (
                  <span className="block text-xs text-foreground-muted">{f.brand}</span>
                )}
              </span>
              <span className="font-[family-name:var(--font-mono)] text-[11px] text-foreground-muted">
                {/* a distinguishing number so two similar foods are tellable apart */}
              </span>
            </button>
          ))}

          {query.trim() && matches.length === 0 && (
            <p className="px-1 text-sm text-foreground-muted">
              Nothing saved by that name yet.
            </p>
          )}

          <Link
            to={`/day/${date}/add/new`}
            className="flex w-full items-center gap-3 rounded-2xl border border-dashed border-border-strong px-4 py-3 text-foreground-subtle active:bg-hover"
          >
            <Plus size={18} />
            Create a new food
          </Link>
        </div>
      </Sheet>
    )
  }

  return (
    <Sheet eyebrow="New entry" title={picked.name}>
      <div className="space-y-4 pb-2">
        <button
          onClick={clear}
          className="flex items-center gap-1 text-xs text-foreground-muted active:text-foreground"
        >
          <ChevronLeft size={14} />
          Pick a different food
        </button>

        <div>
          <label className={labelClass}>How much?</label>
          <div className="flex gap-2">
            <input
              autoFocus
              className={`${inputClass} min-w-0 flex-1`}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              inputMode="decimal"
              placeholder="45"
            />
            <select
              className={`${inputClass} w-24 shrink-0`}
              value={unit}
              onChange={(e) => setUnit(e.target.value as Unit)}
            >
              {units.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="rounded-2xl bg-primary-wash px-4 py-3 text-sm text-primary-ink">
          {preview === null ? 'Enter an amount to see the totals.' : `${preview} kcal`}
        </div>

        <button
          onClick={handleSave}
          className="w-full rounded-2xl bg-primary py-4 font-semibold text-primary-foreground active:scale-[0.99] disabled:opacity-40"
          disabled={!(Number(amount) > 0)}
        >
          Add entry
        </button>
      </div>
    </Sheet>
  )
}