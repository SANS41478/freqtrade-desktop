import { createContext, useContext, useEffect, useState, useCallback } from 'react'

export type Theme = 'dark' | 'light' | 'system'

interface ThemeContextValue {
  theme: Theme
  resolved: 'dark' | 'light'
  setTheme: (theme: Theme) => void
  toggle: () => void
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'dark',
  resolved: 'dark',
  setTheme: () => {},
  toggle: () => {},
})

const STORAGE_KEY = 'freqtrade-desktop-theme'

function getSystemTheme(): 'dark' | 'light' {
  if (typeof window === 'undefined') return 'dark'
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
}

function resolveTheme(theme: Theme): 'dark' | 'light' {
  if (theme === 'system') return getSystemTheme()
  return theme
}

function applyTheme(resolved: 'dark' | 'light') {
  const root = document.documentElement
  if (resolved === 'dark') {
    root.classList.add('dark')
  } else {
    root.classList.remove('dark')
  }
  // Store for instant apply on next load (before React hydrates)
  localStorage.setItem(STORAGE_KEY, resolved)
  // Also set color-scheme for native UI elements
  root.style.colorScheme = resolved
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window === 'undefined') return 'dark'
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'dark' || stored === 'light') return stored
    if (stored) {
      // It was stored as a resolved value - treat as explicit
      return stored as Theme
    }
    return 'system'
  })

  const resolved = resolveTheme(theme)

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t)
    localStorage.setItem(STORAGE_KEY, t)
    applyTheme(resolveTheme(t))
  }, [])

  const toggle = useCallback(() => {
    const next = resolved === 'dark' ? 'light' : 'dark'
    setTheme(next)
  }, [resolved, setTheme])

  // Apply on mount and when theme changes
  useEffect(() => {
    applyTheme(resolved)
  }, [resolved])

  // Listen for system theme changes when in "system" mode
  useEffect(() => {
    if (theme !== 'system') return
    const mq = window.matchMedia('(prefers-color-scheme: light)')
    const handler = () => {
      applyTheme(getSystemTheme())
      // Force re-render
      setThemeState('system')
    }
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [theme])

  return (
    <ThemeContext.Provider value={{ theme, resolved, setTheme, toggle }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
