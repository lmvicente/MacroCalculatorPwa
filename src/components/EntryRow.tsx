import { useEffect, useRef, useState, type PointerEvent } from 'react'
import { Pencil, Trash } from 'lucide-react'
import type { Entry } from '../lib/types'
import { MACROS, type MacroKey } from '../lib/macros'

const MACRO_WASH: Record<MacroKey, string> = {
  protein: 'bg-protein-fill/15',
  carbs: 'bg-carbs-fill/15',
  fat: 'bg-fat-fill/15',
  fiber: 'bg-fiber-fill/15',
}

const TILE = 56
const OPEN = TILE * 2
const SNAP = OPEN * 0.35
const AXIS = 10
const VELOCITY = 0.45
const PAD = 16
const MOTION = '220ms cubic-bezier(0.2, 0.8, 0.2, 1)'

export function EntryRow({
  entry,
  foodName,
  revealed,
  onReveal,
  onClose,
  onEdit,
  onDelete,
}: {
  entry: Entry
  foodName: string
  revealed: boolean
  onReveal: () => void
  onClose: () => void
  onEdit: () => void
  onDelete: () => void
}) {
  const [tx, setTx] = useState(revealed ? OPEN : 0)
  const [dragging, setDragging] = useState(false)

  const startX = useRef(0)
  const startY = useRef(0)
  const originTx = useRef(0)
  const lastX = useRef(0)
  const lastT = useRef(0)
  const velocity = useRef(0)
  const axis = useRef<'x' | 'y' | null>(null)
  const draggingRef = useRef(false)
  const suppressClick = useRef(false)
  const txRef = useRef(tx)
  txRef.current = tx

  const actionsLive = revealed || tx > 24

  useEffect(() => {
    if (dragging) return
    setTx(revealed ? OPEN : 0)
  }, [revealed, dragging])

  function onPointerDown(e: PointerEvent<HTMLDivElement>) {
    if (e.pointerType === 'mouse' && e.button !== 0) return
    if ((e.target as HTMLElement).closest('button')) return
    draggingRef.current = true
    axis.current = null
    suppressClick.current = false
    startX.current = e.clientX
    startY.current = e.clientY
    originTx.current = txRef.current
    lastX.current = e.clientX
    lastT.current = e.timeStamp
    velocity.current = 0
  }

  function onPointerMove(e: PointerEvent<HTMLDivElement>) {
    if (!draggingRef.current) return

    if (axis.current == null) {
      const absX = Math.abs(e.clientX - startX.current)
      const absY = Math.abs(e.clientY - startY.current)
      if (absX < AXIS && absY < AXIS) return
      axis.current = absX > absY ? 'x' : 'y'
      if (axis.current === 'x') {
        setDragging(true)
        try {
          e.currentTarget.setPointerCapture(e.pointerId)
        } catch {
          // Synthetic events can't capture.
        }
      }
    }

    if (axis.current !== 'x') return

    suppressClick.current = true
    const next = clamp(originTx.current - (e.clientX - startX.current), 0, OPEN)
    setTx(next)
    const dt = e.timeStamp - lastT.current
    if (dt > 0) velocity.current = (lastX.current - e.clientX) / dt
    lastX.current = e.clientX
    lastT.current = e.timeStamp
  }

  function onPointerUp() {
    if (!draggingRef.current) return
    draggingRef.current = false
    setDragging(false)

    if (axis.current !== 'x') {
      axis.current = null
      return
    }
    axis.current = null

    const shouldOpen =
      txRef.current > SNAP || (txRef.current > 24 && velocity.current > VELOCITY)

    if (shouldOpen) {
      setTx(OPEN)
      onReveal()
    } else {
      setTx(0)
      onClose()
    }
  }

  return (
    <div
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onClick={() => {
        if (suppressClick.current) {
          suppressClick.current = false
          return
        }
        if (txRef.current > 0) onClose()
      }}
      className="card relative overflow-hidden rounded-[1.35rem]"
    >
      <div
        className="relative z-10 flex min-w-0 items-center justify-between overflow-hidden py-3.5 pl-4"
        style={{
          paddingRight: PAD + tx,
          transition: dragging ? 'none' : `padding-right ${MOTION}`,
        }}
      >
        <div className="min-w-0 pr-3">
          <p className="truncate text-foreground">{foodName}</p>
          <div className="mt-1.5 flex flex-wrap gap-1">
            {MACROS.map((macro) => (
              <span
                key={macro.key}
                className={`rounded-full px-2 py-0.5 font-[family-name:var(--font-mono)] text-[10px] font-semibold ${macro.inkClass} ${MACRO_WASH[macro.key]}`}
              >
                {Math.round(entry[macro.key])} {macro.label.toLowerCase()}
              </span>
            ))}
          </div>
        </div>
        <p className="shrink-0 text-right">
          <span className="text-sm font-semibold tabular-nums text-foreground">
            {Math.round(entry.kcal)}
          </span>
          <span className="ml-1 font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.12em] text-foreground-muted">
            calories
          </span>
        </p>
      </div>

      <div
        aria-hidden={!actionsLive}
        className="absolute inset-y-0 right-0 z-0 flex"
        style={{
          width: OPEN,
          transform: `translate3d(${OPEN - tx}px, 0, 0)`,
          transition: dragging ? 'none' : `transform ${MOTION}`,
        }}
      >
        <button
          type="button"
          onClick={onEdit}
          aria-label="Edit entry"
          tabIndex={actionsLive ? 0 : -1}
          className="flex w-[56px] items-center justify-center bg-edit text-edit-foreground active:brightness-95"
        >
          <Pencil size={19} strokeWidth={2.4} />
        </button>
        <button
          type="button"
          onClick={onDelete}
          aria-label="Delete entry"
          tabIndex={actionsLive ? 0 : -1}
          className="flex w-[56px] items-center justify-center rounded-r-[1.35rem] bg-destructive text-destructive-foreground active:brightness-95"
        >
          <Trash size={19} strokeWidth={2.4} />
        </button>
      </div>
    </div>
  )
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n))
}
