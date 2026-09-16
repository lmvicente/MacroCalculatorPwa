import { useState } from 'react'
import { useNavigate } from 'react-router'
import { Sheet } from '../components/Sheet'
import { useDateParam } from '../lib/useDataParam'
import { addWaterLog, db } from '../lib/db'
import { useLiveQuery } from 'dexie-react-hooks'

const QUICK = [8, 12, 16, 24]

const inputClass =
  'rounded-2xl border border-border bg-surface-2 px-4 py-3 text-foreground outline-none placeholder:text-foreground-muted focus:border-border-strong'

const labelClass =
  'mb-1.5 block font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.14em] text-foreground-muted'

export function WaterSheet() {
  const navigate = useNavigate()
  const date = useDateParam()
  const [amount, setAmount] = useState('')
  const [saving, setSaving] = useState(false)

  const logs = useLiveQuery(
    () => db.waterLogs.where('date').equals(date).sortBy('loggedAt'),
    [date],
    [],
  )

  const total = logs.reduce((sum, log) => sum + log.ounces, 0)
  const ounces = Number(amount)
  const canSave = ounces > 0 && Number.isFinite(ounces)

  async function handleSave() {
    if (!canSave) return
    setSaving(true)
    try {
      await addWaterLog(date, ounces)
      navigate(`/day/${date}`, { replace: true })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Sheet eyebrow="Water" title="How much did you drink?">
      <div className="space-y-4 pb-2">
        <p className="rounded-2xl bg-water-fill/15 px-4 py-3 text-sm text-water-ink">
          {formatOz(total)} fl oz logged today
        </p>

        <div>
          <label className={labelClass} htmlFor="water-oz">
            Amount
          </label>
          <div className="flex gap-2">
            <input
              id="water-oz"
              autoFocus
              className={`${inputClass} min-w-0 flex-1`}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              inputMode="decimal"
              placeholder="8"
            />
            <span className={`${inputClass} flex w-20 shrink-0 items-center justify-center text-sm text-foreground-muted`}>
              fl oz
            </span>
          </div>
        </div>

        <div className="flex gap-2">
          {QUICK.map((oz) => (
            <button
              key={oz}
              type="button"
              onClick={() => setAmount(String(oz))}
              className={`flex-1 rounded-2xl py-2.5 text-sm font-semibold transition ${
                amount === String(oz)
                  ? 'bg-water-fill text-white'
                  : 'bg-surface-2 text-foreground-muted'
              }`}
            >
              {oz}
            </button>
          ))}
        </div>

        <button
          onClick={handleSave}
          disabled={!canSave || saving}
          className="w-full rounded-2xl bg-primary py-4 font-semibold text-primary-foreground active:scale-[0.99] disabled:opacity-40"
        >
          {saving ? 'Saving…' : 'Add water'}
        </button>
      </div>
    </Sheet>
  )
}

function formatOz(n: number) {
  return Number.isInteger(n) ? String(n) : n.toFixed(1)
}
