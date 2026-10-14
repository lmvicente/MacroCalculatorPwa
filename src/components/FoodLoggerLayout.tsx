import type { ReactNode } from 'react'
import { ArrowLeft } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router'
import { useDateParam } from '../lib/useDataParam'

export function FoodLoggerLayout({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string
  subtitle?: string
  children: ReactNode
  footer?: ReactNode
}) {
  const navigate = useNavigate()
  const location = useLocation()
  const date = useDateParam()

  function close() {
    if (location.key !== 'default') navigate(-1)
    else navigate(`/day/${date}`, { replace: true })
  }

  return (
    <section className="fixed inset-0 z-50 flex flex-col bg-background md:absolute">
      <header className="flex shrink-0 items-center gap-3 border-b border-border bg-surface/95 px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))] backdrop-blur">
        <button
          type="button"
          onClick={close}
          aria-label="Back"
          className="flex size-11 shrink-0 items-center justify-center rounded-full text-foreground-subtle active:bg-hover"
        >
          <ArrowLeft size={21} aria-hidden="true" />
        </button>
        <div className="min-w-0">
          <h1 className="truncate font-[family-name:var(--font-display)] text-xl font-semibold tracking-[-0.02em] text-foreground">
            {title}
          </h1>
          {subtitle && <p className="truncate text-xs text-foreground-muted">{subtitle}</p>}
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">{children}</div>

      {footer && (
        <footer className="shrink-0 border-t border-border bg-surface/95 px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur">
          {footer}
        </footer>
      )}
    </section>
  )
}
