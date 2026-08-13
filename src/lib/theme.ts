export type Theme = 'light' | 'dark' | 'system'
const KEY = 'theme'


// gets the system theme
export function getStoredTheme(): Theme {
    const t = localStorage.getItem(KEY)
    return t === 'light' || t === 'dark' ? t : 'system'
}

export function prefersDark(): boolean {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
}

export function resolveTheme(theme: Theme): 'light' | 'dark' {
    return theme === 'system' ? (prefersDark() ? 'dark' : 'light') : theme
}

export function applyTheme(theme: Theme) {
    document.documentElement.classList.toggle('dark', resolveTheme(theme) === 'dark')
    localStorage.setItem(KEY, theme)
}


//reads the system theme after initial load
export function watchSystemTheme(): () => void {
    const mq = window.matchMedia(`(prefers-color-scheme: dark)`)
    const onChange = () => {
        if (getStoredTheme() === `system`) applyTheme(`system`)
    }
        mq.addEventListener('change', onChange)
        return () => mq.removeEventListener('change', onChange)
    }