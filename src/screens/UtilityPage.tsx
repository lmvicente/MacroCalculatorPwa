import type { ReactNode } from 'react'
import { BottomNav } from '../components/BottomNav'

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
    <div className="mx-auto min-h-[100dvh] max-w-[560px] px-5 pb-28 pt-7 md:relative md:my-6 md:min-h-[820px] md:rounded-[2rem] md:border md:border-border md:bg-background">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.16em] text-foreground-muted">
            {eyebrow}
          </p>
          <h1 className="mt-2 font-[family-name:var(--font-display)] text-[36px] tracking-[-0.035em] text-foreground">
            {title}
          </h1>
        </div>
        <div className="flex size-11 items-center justify-center rounded-full bg-primary text-primary-foreground">
          {icon}
        </div>
      </div>
      <div className="mt-7">{children}</div>
      <BottomNav />
    </div>
  )
}