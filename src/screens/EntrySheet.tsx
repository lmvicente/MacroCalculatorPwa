import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router'
import { Barcode, Camera, ChevronLeft, Plus, Search, X } from 'lucide-react'
import { FoodLoggerLayout } from '../components/FoodLoggerLayout'
import { useDateParam } from '../lib/useDataParam'
import type { Entry, Food, Macros, Unit } from '../lib/types'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../lib/db'
import { toBaseUnits, UNITS_BY_FAMILY } from '../lib/units'
import {
  cleanBarcode,
  fetchFoodByBarcode,
  type ImportedFood,
} from '../lib/openFoodFacts'

const inputClass =
  'rounded-2xl border border-border bg-surface-2 px-4 py-3 text-foreground outline-none placeholder:text-foreground-muted focus:border-border-strong'

const labelClass =
  'mb-1.5 block font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.14em] text-foreground-muted'

export function EntrySheet() {
  const navigate = useNavigate()
  const date = useDateParam()
  const { entryId } = useParams<{ entryId: string }>()
  const [searchParams] = useSearchParams()
  const editingId = entryId != null && Number.isFinite(Number(entryId)) ? Number(entryId) : null

  const [query, setQuery] = useState('')
  const [picked, setPicked] = useState<Food | null>(null)
  const [amount, setAmount] = useState('')
  const [unit, setUnit] = useState<Unit>('g')
  const [barcodeMode, setBarcodeMode] = useState(false)
  const [barcode, setBarcode] = useState('')
  const [scanning, setScanning] = useState(false)
  const [lookupState, setLookupState] = useState<'idle' | 'loading'>('idle')
  const [lookupError, setLookupError] = useState('')
  const [servingLabel, setServingLabel] = useState('')
  const [saving, setSaving] = useState(false)
  const hydrated = useRef<number | null>(null)

  const existing = useLiveQuery(async () => {
    if (editingId == null) return null
    const entry = await db.entries.get(editingId)
    if (!entry) return { missing: true as const }
    const food = (await db.foods.get(entry.foodId)) ?? null
    return { missing: false as const, entry, food }
  }, [editingId])

  useEffect(() => {
    if (existing?.missing) navigate(`/day/${date}`, { replace: true })
  }, [existing, date, navigate])

  useEffect(() => {
    if (!existing || existing.missing || !existing.food || existing.entry.id == null) return
    if (hydrated.current === existing.entry.id) return
    hydrated.current = existing.entry.id
    setPicked(existing.food)
    setAmount(String(existing.entry.amount))
    setUnit(existing.entry.unit)
  }, [existing])

  const matches: Food[] = useLiveQuery(
    async () => {
      if (query.trim()) {
        return db.foods.where('name').startsWithIgnoreCase(query.trim()).limit(8).toArray()
      }
      return db.foods.orderBy('lastUsedAt').reverse().limit(6).toArray()
    },
    [query],
    [],
  )

  useEffect(() => {
    const foodId = Number(searchParams.get('food'))
    if (editingId != null || !Number.isFinite(foodId) || hydrated.current === foodId) return
    hydrated.current = foodId
    void db.foods.get(foodId).then((food) => {
      if (food) choose(food)
    })
  }, [editingId, searchParams])

  const units: Unit[] = picked ? UNITS_BY_FAMILY[picked.unitFamily] : []
  const servingInBase = picked && Number(amount) > 0 ? toBaseUnits(Number(amount), unit) : 0
  const preview: Macros | null = picked && servingInBase > 0
    ? {
        kcal: picked.kcal * servingInBase,
        protein: picked.protein * servingInBase,
        carbs: picked.carbs * servingInBase,
        fat: picked.fat * servingInBase,
        fiber: picked.fiber * servingInBase,
      }
    : null

  function choose(food: Food, defaults?: Pick<ImportedFood, 'defaultAmount' | 'defaultUnit' | 'servingLabel'>) {
    setPicked(food)
    const nextUnit = defaults?.defaultUnit ?? UNITS_BY_FAMILY[food.unitFamily][0]
    setUnit(nextUnit)
    setAmount(defaults ? String(defaults.defaultAmount) : '')
    setServingLabel(defaults?.servingLabel ?? food.countLabel ?? '')
    setBarcodeMode(false)
    setScanning(false)
  }

  function clear() {
    setQuery('')
    setPicked(null)
    setAmount('')
    setServingLabel('')
  }

  async function lookupBarcode(value = barcode) {
    const cleaned = cleanBarcode(value)
    setBarcode(cleaned)
    setLookupError('')
    setLookupState('loading')
    setScanning(false)
    try {
      const saved = await db.foods.where('barcode').equals(cleaned).first()
      if (saved) {
        choose(saved)
        return
      }
      const imported = await fetchFoodByBarcode(cleaned)
      choose({ ...imported.food, lastUsedAt: Date.now() }, imported)
    } catch (error) {
      setLookupError(error instanceof Error ? error.message : 'Could not look up that barcode.')
    } finally {
      setLookupState('idle')
    }
  }

  async function handleSave() {
    const foodAmount = Number(amount)
    if (!picked || !(foodAmount > 0) || saving) return
    setSaving(true)

    try {
      await db.transaction('rw', db.entries, db.foods, async () => {
        let foodId = picked.id
        if (foodId == null) foodId = await db.foods.add({ ...picked, lastUsedAt: Date.now() })
        if (foodId == null) throw new Error('Could not save food')

        const base = toBaseUnits(foodAmount, unit)
        const macroTotal: Macros = {
          kcal: picked.kcal * base,
          protein: picked.protein * base,
          carbs: picked.carbs * base,
          fat: picked.fat * base,
          fiber: picked.fiber * base,
        }
        const entry: Entry = {
          ...macroTotal,
          date,
          loggedAt: Date.now(),
          foodId,
          amount: foodAmount,
          unit,
        }

        if (editingId != null) await db.entries.update(editingId, entry)
        else await db.entries.add(entry)
        await db.foods.update(foodId, { lastUsedAt: Date.now() })
      })
      navigate(`/day/${date}`, { replace: true })
    } catch (error) {
      console.error('Failed to save entry', error)
      setSaving(false)
    }
  }

  const isEdit = editingId != null

  if (isEdit && existing === undefined) {
    return (
      <FoodLoggerLayout title="Edit entry">
        <p className="text-sm text-foreground-muted">Opening this entry…</p>
      </FoodLoggerLayout>
    )
  }

  if (picked) {
    return (
      <FoodLoggerLayout
        title={isEdit ? 'Edit entry' : 'Add food'}
        subtitle={picked.brand}
        footer={
          <button
            type="button"
            onClick={() => void handleSave()}
            disabled={!(Number(amount) > 0) || saving}
            className="min-h-12 w-full rounded-2xl bg-primary px-4 py-3 font-semibold text-primary-foreground active:opacity-90 disabled:opacity-40"
          >
            {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Add to today'}
          </button>
        }
      >
        <button
          type="button"
          onClick={clear}
          className="mb-5 flex min-h-11 items-center gap-1 text-sm font-medium text-foreground-muted active:text-foreground"
        >
          <ChevronLeft size={16} aria-hidden="true" />
          Choose a different food
        </button>

        <div className="card flex items-center gap-4 rounded-[1.4rem] p-4">
          {picked.imageUrl ? (
            <img src={picked.imageUrl} alt="" className="size-16 rounded-xl bg-surface-2 object-contain" />
          ) : (
            <div className="flex size-16 items-center justify-center rounded-xl bg-primary-wash text-primary-ink">
              <Barcode size={26} aria-hidden="true" />
            </div>
          )}
          <div className="min-w-0">
            <h2 className="font-semibold leading-snug text-foreground">{picked.name}</h2>
            {servingLabel && <p className="mt-1 text-xs text-foreground-muted">Serving: {servingLabel}</p>}
            {picked.dataSource === 'open-food-facts' && (
              <p className="mt-1 text-[11px] text-foreground-muted">From Open Food Facts · check the label</p>
            )}
          </div>
        </div>

        <div className="mt-6">
          <label htmlFor="food-amount" className={labelClass}>Amount eaten</label>
          <div className="flex gap-2">
            <input
              id="food-amount"
              autoFocus={!picked.dataSource}
              className={`${inputClass} min-h-12 min-w-0 flex-1 text-lg`}
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              inputMode="decimal"
              type="text"
              placeholder="Enter amount"
            />
            <label className="sr-only" htmlFor="food-unit">Unit</label>
            <select
              id="food-unit"
              className={`${inputClass} min-h-12 w-28 shrink-0`}
              value={unit}
              onChange={(event) => setUnit(event.target.value as Unit)}
            >
              {units.map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
          </div>
        </div>

        <MacroPreview macros={preview} />
      </FoodLoggerLayout>
    )
  }

  return (
    <FoodLoggerLayout title="Add food" subtitle="Search, scan, or enter nutrition">
      {barcodeMode ? (
        <div>
          <button
            type="button"
            onClick={() => {
              setBarcodeMode(false)
              setScanning(false)
              setLookupError('')
            }}
            className="mb-4 flex min-h-11 items-center gap-1 text-sm font-medium text-foreground-muted"
          >
            <ChevronLeft size={16} aria-hidden="true" />
            Back to saved foods
          </button>

          <form
            onSubmit={(event) => {
              event.preventDefault()
              void lookupBarcode()
            }}
            className="space-y-3"
          >
            <label htmlFor="barcode" className={labelClass}>Barcode number</label>
            <div className="flex gap-2">
              <input
                id="barcode"
                autoFocus
                className={`${inputClass} min-h-12 min-w-0 flex-1`}
                value={barcode}
                onChange={(event) => setBarcode(cleanBarcode(event.target.value))}
                inputMode="numeric"
                autoComplete="off"
                placeholder="e.g. 036632042842"
              />
              <button
                type="submit"
                disabled={lookupState === 'loading'}
                className="min-h-12 rounded-2xl bg-primary px-5 font-semibold text-primary-foreground disabled:opacity-50"
              >
                {lookupState === 'loading' ? 'Finding…' : 'Find'}
              </button>
            </div>
          </form>

          <button
            type="button"
            onClick={() => setScanning((value) => !value)}
            className="mt-3 flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl border border-border-strong bg-surface text-sm font-semibold text-foreground active:bg-hover"
          >
            {scanning ? <X size={19} aria-hidden="true" /> : <Camera size={19} aria-hidden="true" />}
            {scanning ? 'Close camera' : 'Scan with camera'}
          </button>

          {lookupError && (
            <p role="alert" className="mt-3 rounded-2xl bg-primary-wash px-4 py-3 text-sm text-primary-ink">
              {lookupError}
            </p>
          )}
          {scanning && <BarcodeScanner onDetected={(value) => void lookupBarcode(value)} />}
          <p className="mt-5 text-xs leading-relaxed text-foreground-muted">
            Product data comes from the community-maintained Open Food Facts database.
          </p>
        </div>
      ) : (
        <div>
          <label htmlFor="food-search" className={labelClass}>Find a saved food</label>
          <div className="relative">
            <Search size={18} aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-foreground-muted" />
            <input
              id="food-search"
              autoFocus
              className={`${inputClass} min-h-12 w-full pl-11`}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search foods"
            />
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setBarcodeMode(true)}
              className="flex min-h-16 items-center justify-center gap-2 rounded-2xl bg-primary-wash px-3 text-center text-sm font-semibold leading-tight text-primary-ink active:opacity-80"
            >
              <Barcode size={20} aria-hidden="true" className="shrink-0" />
              Scan barcode
            </button>
            <Link
              to={`/day/${date}/add/new`}
              className="flex min-h-16 items-center justify-center gap-2 rounded-2xl border border-border-strong bg-surface px-3 text-center text-sm font-semibold leading-tight text-foreground active:bg-hover"
            >
              <Plus size={20} aria-hidden="true" className="shrink-0" />
              Enter manually
            </Link>
          </div>

          <h2 className="mb-2 mt-6 text-xs font-semibold uppercase tracking-[0.12em] text-foreground-muted">
            {query.trim() ? 'Results' : 'Recently used'}
          </h2>
          <div className="space-y-2">
            {matches.map((food) => (
              <button
                type="button"
                key={food.id}
                onClick={() => choose(food)}
                className="card flex min-h-16 w-full items-center gap-3 rounded-2xl px-4 py-3 text-left active:bg-hover"
              >
                {food.imageUrl && <img src={food.imageUrl} alt="" className="size-10 rounded-lg object-contain" />}
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium text-foreground">{food.name}</span>
                  <span className="block truncate text-xs text-foreground-muted">
                    {food.brand || `${Math.round(food.kcal * 100)} kcal per 100 ${food.unitFamily === 'volume' ? 'ml' : 'g'}`}
                  </span>
                </span>
              </button>
            ))}
            {matches.length === 0 && (
              <p className="rounded-2xl border border-dashed border-border-strong px-4 py-6 text-center text-sm text-foreground-muted">
                {query.trim() ? 'No saved foods match.' : 'Your recently used foods will appear here.'}
              </p>
            )}
          </div>
        </div>
      )}
    </FoodLoggerLayout>
  )
}

function MacroPreview({ macros }: { macros: Macros | null }) {
  const items = macros
    ? [
        ['Calories', `${Math.round(macros.kcal)}`],
        ['Protein', `${formatMacro(macros.protein)}g`],
        ['Carbs', `${formatMacro(macros.carbs)}g`],
        ['Fat', `${formatMacro(macros.fat)}g`],
        ['Fiber', `${formatMacro(macros.fiber)}g`],
      ]
    : []

  return (
    <div className="mt-6">
      <p className={labelClass}>Nutrition for this amount</p>
      {macros ? (
        <div className="grid grid-cols-2 gap-2">
          {items.map(([label, value], index) => (
            <div key={label} className={`rounded-2xl bg-surface-2 px-4 py-3 ${index === 0 ? 'col-span-2' : ''}`}>
              <span className="block text-xs text-foreground-muted">{label}</span>
              <span className="mt-1 block text-xl font-semibold text-foreground">{value}</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl bg-surface-2 px-4 py-4 text-sm text-foreground-muted">
          Enter an amount to preview the totals.
        </div>
      )}
    </div>
  )
}

function formatMacro(value: number): string {
  return value < 10 && !Number.isInteger(value) ? value.toFixed(1) : String(Math.round(value))
}

type DetectorResult = { rawValue: string }
type Detector = { detect(source: CanvasImageSource): Promise<DetectorResult[]> }
type DetectorConstructor = new (options?: { formats?: string[] }) => Detector

function BarcodeScanner({ onDetected }: { onDetected: (barcode: string) => void }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const scannerSupported = Boolean(
    (window as unknown as { BarcodeDetector?: DetectorConstructor }).BarcodeDetector &&
    navigator.mediaDevices?.getUserMedia,
  )
  const [error, setError] = useState(
    scannerSupported ? '' : 'Camera scanning is not supported in this browser. Enter the barcode above instead.',
  )

  useEffect(() => {
    let active = true
    let frame = 0
    let stream: MediaStream | null = null
    const DetectorClass = (window as unknown as { BarcodeDetector?: DetectorConstructor }).BarcodeDetector

    if (!DetectorClass || !navigator.mediaDevices?.getUserMedia) return

    const detector = new DetectorClass()
    void navigator.mediaDevices
      .getUserMedia({ video: { facingMode: { ideal: 'environment' } }, audio: false })
      .then(async (nextStream) => {
        stream = nextStream
        if (!active || !videoRef.current) return
        videoRef.current.srcObject = nextStream
        await videoRef.current.play()

        const scan = async () => {
          if (!active || !videoRef.current) return
          try {
            const results = await detector.detect(videoRef.current)
            const value = results[0]?.rawValue
            if (value) {
              active = false
              onDetected(value)
              return
            }
          } catch {
            // A video frame may be unavailable while the camera starts.
          }
          frame = requestAnimationFrame(scan)
        }
        frame = requestAnimationFrame(scan)
      })
      .catch(() => setError('Camera access was unavailable. Check permission or enter the barcode above.'))

    return () => {
      active = false
      cancelAnimationFrame(frame)
      stream?.getTracks().forEach((track) => track.stop())
    }
  }, [onDetected])

  if (error) return <p role="status" className="mt-3 text-sm text-foreground-muted">{error}</p>

  return (
    <div className="relative mt-4 overflow-hidden rounded-[1.4rem] bg-black">
      <video ref={videoRef} muted playsInline aria-label="Barcode camera preview" className="aspect-[4/3] w-full object-cover" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-[18%] rounded-2xl border-2 border-white/90 shadow-[0_0_0_999px_rgba(0,0,0,0.35)]" />
      <p className="absolute inset-x-0 bottom-3 text-center text-xs font-medium text-white">Center the barcode in the frame</p>
    </div>
  )
}