import type { ReactNode } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { X } from 'lucide-react'
import { useDateParam } from '../lib/useDataParam'

//this is the nested routing 

export function Sheet({
    eyebrow, title, children}: {
    eyebrow: string,
    title: string,
    children: ReactNode //look this up?
    }) {

        const navigate = useNavigate()
        const location = useLocation()
        const date = useDateParam()

        function close() {
            if (location.key !== 'default') navigate(-1)
            else navigate(`/dat/${date}`, { replace: true})
        }

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-scrim backdrop-blur-[2px] md:absolute">
      {/* Tapping the scrim dismisses. Sibling button rather than a wrapper
          onClick, so clicks inside the panel don't need stopPropagation. */}
      <button aria-label="Close" onClick={close} className="absolute inset-0 cursor-default" />
 
      <div className="relative w-full rounded-t-[2rem] border-t border-border-strong bg-surface-raised px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-3 shadow-2xl">
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-track" />
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
            onClick={close}
            aria-label="Close"
            className="rounded-full border border-border p-2 text-foreground-subtle"
          >
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}