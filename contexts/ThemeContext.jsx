import { createContext, useContext } from 'react'
import { useColorScheme } from 'react-native'
import { useUser } from '../hooks/useUser'
import { Colors } from '../constants/Colors'

const ThemeContext = createContext()

export function ThemeProvider({ children }) {
    const { profile } = useUser()
    const systemScheme = useColorScheme()

    // profile.dark_mode overrides OS setting once user has set a preference
    const colorScheme = profile?.preferences_completed
        ? (profile?.dark_mode ? 'dark' : 'light')
        : systemScheme

    const theme = Colors[colorScheme] ?? Colors.light
    console.log('ThemeContext:', profile?.dark_mode, profile?.preferences_completed, colorScheme)
    return (
        <ThemeContext.Provider value={{ colorScheme, theme }}>
            {children}
        </ThemeContext.Provider>
    )
}

export function useTheme() {
    const context = useContext(ThemeContext)
    if (!context) throw new Error('useTheme must be used within a ThemeProvider')
    return context
}