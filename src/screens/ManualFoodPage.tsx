import { useState } from 'react'
import { useNavigate } from 'react-router'
import { FoodLoggerLayout } from '../components/FoodLoggerLayout'
import { db } from '../lib/db'
import type { Entry, Food, Macros, Unit } from '../lib/types'
import { FAMILY_OF, toBaseUnits, UNITS_BY_FAMILY } from '../lib/units'
import { useDateParam } from '../lib/useDataParam'

const inputClass =
  'rounded-2xl border border-border bg-surface-2 px-4 py-3 text-foreground outline-none placeholder:text-foreground-muted focus:border-border-strong'
const labelClass =
  'mb-1.5 block text-xs font-medium text-foreground-muted'

export function ManualFoodPage() {
  const navigate = useNavigate()
  const date = useDateParam()
  const [name, setName] = useState('')
  const [brand, setBrand] = useState('')
  const [servingAmount, setServingAmount] = useState('1')
  const [servingUnit, setServingUnit] = useState<Unit>('each')
  const [countLabel, setCountLabel] = useState('')
  const [kcal, setKcal] = useState('')
  const [protein, setProtein] = useState('')
  const [carbs, setCarbs] = useState('')
  const [fat, setFat] = useState('')
  const [fiber, setFiber] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const fields = [
    { id: 'kcal', label: 'Calories', value: kcal, set: setKcal, placeholder: '165' },
    { id: 'protein', label: 'Protein', value: protein, set: setProtein, placeholder: '31' },
    { id: 'carbs', label: 'Carbs', value: carbs, set: setCarbs, placeholder: '0' },
    { id: 'fat', label: 'Fat', value: fat, set: setFat, placeholder: '3.6' },
    { id: 'fiber', label: 'Fiber', value: fiber, set: setFiber, placeholder: '0' },
  ]
  const canSave = Boolean(name.trim() && Number(servingAmount) > 0 && kcal.trim() && !saving)

  async function handleSave() {
    const amount = Number(servingAmount)
    const totals: Macros = {
      kcal: Number(kcal),
      protein: Number(protein || 0),
      carbs: Number(carbs || 0),
      fat: Number(fat || 0),
      fiber: Number(fiber || 0),
    }
    const validMacros = Object.values(totals).every((value) => Number.isFinite(value) && value >= 0)
    if (!name.trim() || !(amount > 0) || !validMacros) {
      setError('Add a name, serving size, and valid nutrition values.')
      return
    }

    setSaving(true)
    setError('')
    try {
      await db.transaction('rw', db.foods, db.entries, async () => {
        const baseAmount = toBaseUnits(amount, servingUnit)
        const food: Food = {
          kcal: totals.kcal / baseAmount,
          protein: totals.protein / baseAmount,
          carbs: totals.carbs / baseAmount,
          fat: totals.fat / baseAmount,
          fiber: totals.fiber / baseAmount,
          name: name.trim(),
          brand: brand.trim() || undefined,
          countLabel: countLabel.trim() || undefined,
          unitFamily: FAMILY_OF[servingUnit],
          lastUsedAt: Date.now(),
        }
        const foodId = await db.foods.add(food)
        const entry: Entry = {
          ...totals,
          date,
          loggedAt: Date.now(),
          foodId,
          amount,
          unit: servingUnit,
        }
        await db.entries.add(entry)
      })
      navigate(`/day/${date}`, { replace: true })
    } catch (saveError) {
      console.error('Failed to save food', saveError)
      setError('Could not save this food. Try again.')
      setSaving(false)
    }
  }

  return (
    <FoodLoggerLayout
      title="Enter nutrition"
      subtitle="Values for one label serving"
      footer={
        <button
          type="button"
          onClick={() => void handleSave()}
          disabled={!canSave}
          className="min-h-12 w-full rounded-2xl bg-primary px-4 py-3 font-semibold text-primary-foreground active:opacity-90 disabled:opacity-40"
        >
          {saving ? 'Saving…' : 'Save & add serving'}
        </button>
      }
    >
      <div className="space-y-6">
        <section className="space-y-4">
          <h2 className="font-semibold text-foreground">Food</h2>
          <div>
            <label htmlFor="food-name" className={labelClass}>Name</label>
            <input
              id="food-name"
              autoFocus
              className={`${inputClass} min-h-12 w-full`}
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Chicken thigh"
            />
          </div>
          <div>
            <label htmlFor="food-brand" className={labelClass}>
              Brand <span className="font-normal">optional</span>
            </label>
            <input
              id="food-brand"
              className={`${inputClass} min-h-12 w-full`}
              value={brand}
              onChange={(event) => setBrand(event.target.value)}
              placeholder="Kirkland"
            />
          </div>
        </section>

        <section className="space-y-4 rounded-[1.4rem] border border-border bg-surface p-4">
          <div>
            <h2 className="font-semibold text-foreground">Serving on the label</h2>
            <p className="mt-1 text-xs text-foreground-muted">The nutrition below should match this amount.</p>
          </div>
          <div>
            <label htmlFor="serving-amount" className={labelClass}>Serving size</label>
            <div className="flex gap-2">
              <input
                id="serving-amount"
                className={`${inputClass} min-h-12 min-w-0 flex-1`}
                value={servingAmount}
                onChange={(event) => setServingAmount(event.target.value)}
                inputMode="decimal"
                placeholder="1"
              />
              <label htmlFor="serving-unit" className="sr-only">Serving unit</label>
              <select
                id="serving-unit"
                className={`${inputClass} min-h-12 w-28 shrink-0`}
                value={servingUnit}
                onChange={(event) => setServingUnit(event.target.value as Unit)}
              >
                {Object.values(UNITS_BY_FAMILY).flat().map((option) => (
                  <option key={option} value={option}>{option === 'each' ? 'item(s)' : option}</option>
                ))}
              </select>
            </div>
          </div>
          {servingUnit === 'each' && (
            <div>
              <label htmlFor="count-label" className={labelClass}>
                Item name <span className="font-normal">optional</span>
              </label>
              <input
                id="count-label"
                className={`${inputClass} min-h-12 w-full`}
                value={countLabel}
                onChange={(event) => setCountLabel(event.target.value)}
                placeholder="bottle, slice, bar…"
              />
            </div>
          )}
        </section>

        <section>
          <div className="mb-3">
            <h2 className="font-semibold text-foreground">Nutrition per serving</h2>
            <p className="mt-1 text-xs text-foreground-muted">Blank nutrients will be saved as 0.</p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {fields.map((field) => (
              <div key={field.id} className={field.id === 'kcal' ? 'col-span-2' : ''}>
                <label htmlFor={field.id} className={labelClass}>
                  {field.label} {field.id !== 'kcal' && <span className="font-normal">(g)</span>}
                </label>
                <input
                  id={field.id}
                  className={`${inputClass} min-h-12 w-full text-lg`}
                  value={field.value}
                  onChange={(event) => field.set(event.target.value)}
                  inputMode="decimal"
                  placeholder={field.placeholder}
                />
              </div>
            ))}
          </div>
        </section>

        {error && (
          <p role="alert" className="rounded-2xl bg-primary-wash px-4 py-3 text-sm text-primary-ink">
            {error}
          </p>
        )}
      </div>
    </FoodLoggerLayout>
  )
}
