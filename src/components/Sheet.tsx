import { useCallback, useEffect, useRef, useState, type PointerEvent, type ReactNode } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { X } from 'lucide-react'
import { useDateParam } from '../lib/useDataParam'

const EXIT_MS = 220
const DISMISS_PX = 96
const DISMISS_VELOCITY = 0.55

export function Sheet({
    eyebrow, title, children}: {
    eyebrow: string,
    title: string,
    children: ReactNode
    }) {

        const navigate = useNavigate()
        const location = useLocation()
        const date = useDateParam()

        const [open, setOpen] = useState(false)
        const [dragging, setDragging] = useState(false)
        const [translateY, setTranslateY] = useState(0)

        const startY = useRef(0)
        const lastY = useRef(0)
        const lastT = useRef(0)
        const velocity = useRef(0)
        const yRef = useRef(0)
        const draggingRef = useRef(false)
        const closingRef = useRef(false)

        useEffect(() => {
            let inner = 0
            const outer = requestAnimationFrame(() => {
                inner = requestAnimationFrame(() => setOpen(true))
            })
            return () => {
                cancelAnimationFrame(outer)
                cancelAnimationFrame(inner)
            }
        }, [])

        const close = useCallback(() => {
            if (location.key !== 'default') navigate(-1)
            else navigate(`/day/${date}`, { replace: true})
        }, [date, location.key, navigate])

        function dismiss() {
            if (closingRef.current) return
            closingRef.current = true
            draggingRef.current = false
            setDragging(false)
            setOpen(false)
            window.setTimeout(close, EXIT_MS)
        }

        function onPointerDown(e: PointerEvent<HTMLDivElement>) {
            if (closingRef.current) return
            if (e.pointerType === 'mouse' && e.button !== 0) return
            if ((e.target as HTMLElement).closest('button')) return
            draggingRef.current = true
            setDragging(true)
            startY.current = e.clientY
            lastY.current = e.clientY
            lastT.current = e.timeStamp
            velocity.current = 0
            try {
                e.currentTarget.setPointerCapture(e.pointerId)
            } catch {
                // Synthetic events (and some older browsers) can't capture.
            }
        }

        function onPointerMove(e: PointerEvent<HTMLDivElement>) {
            if (!draggingRef.current) return
            const dy = Math.max(0, e.clientY - startY.current)
            yRef.current = dy
            setTranslateY(dy)
            const dt = e.timeStamp - lastT.current
            if (dt > 0) velocity.current = (e.clientY - lastY.current) / dt
            lastY.current = e.clientY
            lastT.current = e.timeStamp
        }

        function onPointerUp() {
            if (!draggingRef.current) return
            draggingRef.current = false
            setDragging(false)
            if (yRef.current > DISMISS_PX || (yRef.current > 48 && velocity.current > DISMISS_VELOCITY)) {
                dismiss()
                return
            }
            yRef.current = 0
            setTranslateY(0)
        }

  const motion = dragging ? 'none' : `transform ${EXIT_MS}ms ease-out, opacity ${EXIT_MS}ms ease-out`
  const scrimOpacity = open ? Math.max(0, 1 - translateY / 360) : 0

  return (
    <div className="fixed inset-0 z-50 flex items-end md:absolute">
      {/* Tapping the scrim dismisses. Sibling button rather than a wrapper
          onClick, so clicks inside the panel don't need stopPropagation. */}
      <button
        aria-label="Close"
        onClick={dismiss}
        className="absolute inset-0 cursor-default bg-scrim backdrop-blur-[2px]"
        style={{ opacity: scrimOpacity, transition: dragging ? 'none' : `opacity ${EXIT_MS}ms ease-out` }}
      />
 
      <div
        className="relative w-full rounded-t-[2rem] border-t border-border-strong bg-surface-raised px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-1 shadow-2xl"
        style={{
          transform: open ? `translateY(${translateY}px)` : 'translateY(100%)',
          transition: motion,
        }}
      >
        <div
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          className="touch-none select-none"
        >
          <div
            aria-label="Drag down to close"
            className="flex h-7 cursor-grab items-center justify-center active:cursor-grabbing"
          >
            <div className="h-1 w-10 rounded-full bg-track" />
          </div>
          <div className="mb-5 flex items-start justify-between">
            <div>
              <p className="font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.16em] text-foreground-muted">
                {eyebrow}
              </p>
              <h2 className="mt-1 font-[family-name:var(--font-display)] text-[27px] tracking-[-0.03em] text-foreground">
                {title}
              </h2>
            </div>
            <button
              onClick={dismiss}
              aria-label="Close"
              className="rounded-full border border-border p-2 text-foreground-subtle"
            >
              <X size={18} />
            </button>
          </div>
        </div>
        {children}
      </div>
    </div>
  )
}
