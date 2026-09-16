import type { ReactNode } from 'react'
import { BottomNav } from '../components/BottomNav'
import { AppShell } from '../components/AppShell'

/** Shared chrome for Trends / Goals / Settings. */
export function UtilityPage({
  title,
  eyebrow,
  icon,
  children,
}: {
  title: string
  eyebrow: string
  icon: ReactNode
  children?: ReactNode
}) {
  return (
    <AppShell>
      <div className="flex items-start justify-between pt-1">
        <div>
          <p className="font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.16em] text-foreground-muted">
            {eyebrow}
          </p>
          <h1 className="mt-2 font-[family-name:var(--font-display)] text-[36px] font-semibold tracking-[-0.035em] text-foreground">
            {title}
          </h1>
        </div>
        <div className="flex size-11 items-center justify-center rounded-full bg-primary text-primary-foreground">
          {icon}
        </div>
      </div>
      <div className="card mt-7 rounded-[1.65rem] p-5">{children}</div>
      <BottomNav />
    </AppShell>
  )
}