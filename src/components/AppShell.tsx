import type { ReactNode } from 'react'

/** Shared phone chrome. A partial wash lives at the top; cards sit on a solid page. */
export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative mx-auto flex min-h-[100dvh] max-w-[560px] flex-col overflow-hidden bg-background md:my-6 md:min-h-[820px] md:rounded-[2rem] md:border md:border-border md:shadow-2xl">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[42%] bg-gradient-to-b from-gradient-from to-transparent"
      />
      <div className="relative z-10 flex min-h-[100dvh] flex-1 flex-col px-5 pb-36 pt-6 md:min-h-[820px]">
        {children}
      </div>
    </div>
  )
}
