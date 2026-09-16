import { Link, NavLink, useLocation, useParams } from 'react-router'
import { CalendarDays, ChartLine, Plus, Settings2, Target } from 'lucide-react'
import { isValidDateKey, todayKey } from '../lib/dates'

export function BottomNav() {
    const { pathname } = useLocation();
    const { date } = useParams<{ date: string }>()
    // On a day page, add to that day. Everywhere else, add to today.
    const addTo = `/day/${isValidDateKey(date) ? date : todayKey()}/add`

    // this is to set the items for the bottom navigation
    // "to" tells it where it is going, label is what the user sees, icon is also what the user sees, and
    // "match" is ...
    const left = [
        { to: `/day/${todayKey()}`, label: 'Today', icon: CalendarDays, match: '/day'},
        { to: '/trends', label: 'Trends', icon: ChartLine, match: '/trends' },
    ]
    const right = [
        { to: '/goals', label: 'Goals', icon: Target, match: '/goals' },
        { to: '/settings', label: 'Settings', icon: Settings2, match: '/settings'}
    ]

    return (
        
        <nav className="fixed inset-x-0 bottom-0 z-30 overflow-visible border-t border-border bg-surface-nav
        px-3 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3
        md:absolute md:inset-x-5 md:bottom-4 md:rounded-[1.65rem] md:border md:pb-3 md:shadow-[var(--shadow-card)]">
            <div className="flex items-center">
                {left.map((item) => (
                    <TabLink key={item.label} pathname={pathname} {...item} />
                ))}
                <Link
                    to={addTo}
                    aria-label="Add an entry"
                    className="z-10 -mt-7 mx-1 flex size-16 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[0_12px_28px_var(--primary-glow)]"
                >
                    <Plus size={28} />
                </Link>
                {right.map((item) => (
                    <TabLink key={item.label} pathname={pathname} {...item} />
                ))}
            </div>
        </nav>
    )
}

function TabLink({
    to,
    label,
    icon: Icon,
    match,
    pathname,
}: {
    to: string
    label: string
    icon: typeof CalendarDays
    match: string
    pathname: string
}) {
    // startsWith, not exact — /day/2026-08-11/add still lights up Today.
    const active = pathname.startsWith(match)
    return (
        <NavLink
            to={to}
            className={`flex min-w-0 flex-1 flex-col items-center gap-1 whitespace-nowrap rounded-xl py-1.5 text-[11px] font-semibold tracking-[0.08em] transition ${
                active ? 'text-primary-ink' : 'text-foreground-muted'
            }`}
        >
            <Icon size={21} strokeWidth={active ? 2.4 : 1.8} />
            {label}
        </NavLink>
    )
}