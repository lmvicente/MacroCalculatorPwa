import { NavLink, useLocation } from 'react-router'
import { CalendarDays, ChartLine, Settings2, Target } from 'lucide-react'
import { todayKey } from '../lib/dates'

export function BottomNav() {
    const { pathname } = useLocation();

    // this is to set the items for the bottom navigation
    // "to" tells it where it is going, label is what the user sees, icon is also what the user sees, and 
    // "match" is ... 
    const items = [
        { to: `/day/${todayKey()}`, label: 'Today', icon: CalendarDays, match: '/day'},
        { to: '/trends', label: 'Trends', icon: ChartLine, match: '/trends' },
        { to: '/goals', label: 'Goals', icon: Target, match: '/goals' },
        { to: '/settings', label: 'Settings', icon: Settings2, match: '/settings'}
    ]

    return (
        <nav className="fixed inset-x-0 bottom-0 z-30 borter-t borter-border bg-surface-nav/95 px-5 pb-[max(1rem, env(safe-area-inset-bottom))] pt-3 backdrop-blur-xl md:absoluate md:bottom-4 md:left-1/2 md:w-[390px] md:-translate-x-1/2 md:rounded-[1.65rem] md:border">
            <div className='mx-auto flex max-w-[430px] justify-between'>
                {items.map(({ to, label, icon: Icon, match }) => {
                // startsWith, not exact — /day/2026-08-11/add still lights up Today.
                const active = pathname.startsWith(match)
                return (
                    <NavLink
                    key={label}
                    to={to}
                    className={`flex min-w-16 flex-col items-center gap-1 rounded-xl py-1 text-[10px] font-semibold tracking-[0.08em] transition ${
                        active ? 'text-primary-ink' : 'text-foreground-muted'
                    }`}
                    >
                    <Icon size={19} strokeWidth={active ? 2.4 : 1.8} />
                    {label}
                    </NavLink>
                )
                })}
            </div>
        </nav>
    )
}