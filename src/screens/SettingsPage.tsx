import { Settings2 } from 'lucide-react'
import { UtilityPage } from './UtilityPage'
import { useTheme } from '../lib/useTheme'
import type { Theme } from '../lib/theme'

const OPTIONS: { value: Theme; label: string }[] = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'system', label: 'System' },
]

export function SettingsPage() {
  const { theme, setTheme } = useTheme()

  return (
    <UtilityPage title="Settings" eyebrow="Your data, yours" icon={<Settings2 />}>
      <p className="font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.14em] text-foreground-muted">
        Appearance
      </p>
      <div className="mt-3 flex gap-1 rounded-2xl border border-border bg-surface-2 p-1">
        {OPTIONS.map((o) => (
          <button
            key={o.value}
            onClick={() => setTheme(o.value)}
            className={`flex-1 rounded-xl py-2.5 text-sm font-semibold transition ${
              theme === o.value
                ? 'bg-primary text-primary-foreground'
                : 'text-foreground-muted'
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>

      {/* PORT FROM FIGMA: storage callout, export, import, install instructions */}
    </UtilityPage>
  )
}