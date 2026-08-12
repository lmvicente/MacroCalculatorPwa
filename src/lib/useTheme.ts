import { useEffect, useState } from 'react'
import { applyTheme, getStoredTheme, watchSystemTheme, type Theme } from './theme'

export function useTheme() {
    const [theme, setThemeState] = useState<Theme>(getStoredTheme)

    useEffect(() => watchSystemTheme(), [])

    function setTheme(next: Theme) {
        applyTheme(next)
        setThemeState(next)
    }

    return { theme, setTheme }
}