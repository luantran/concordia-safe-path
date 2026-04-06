// provides app-wide color scheme that respects the user's dark_mode preference
// falls back to the OS setting when no preference is saved

import { createContext, useContext, useState, useEffect } from 'react'
import { UserContext } from './UserContext'

const ThemeContext = createContext()

export function ThemeProvider({ children }) {
    const userCtx = useContext(UserContext)
    const profile = userCtx?.profile

    // null = follow system, 'dark' | 'light' = user override
    const [override, setOverride] = useState(null)

    // seed from profile once it loads
    useEffect(() => {
        if (profile?.dark_mode === true) setOverride('dark')
        else if (profile?.dark_mode === false) setOverride('light')
    }, [profile?.dark_mode])

    const colorScheme = override ?? 'light'

    // call this from preferences toggle for instant feedback
    const setDarkMode = (enabled) => {
        setOverride(enabled ? 'dark' : 'light')
    }

    return (
        <ThemeContext.Provider value={{ colorScheme, setDarkMode }}>
            {children}
        </ThemeContext.Provider>
    )
}

export function useTheme() {
    const ctx = useContext(ThemeContext)
    if (!ctx) throw new Error('useTheme must be used inside ThemeProvider')
    return ctx
}