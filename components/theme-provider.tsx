"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import type { ThemeProviderProps } from "next-themes"

// Use a consistent storage key across the application
export const THEME_STORAGE_KEY = "equipment-borrowing-theme"

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  // Force theme reapplication on client side
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    // Get the stored theme from localStorage
    const storedTheme = localStorage.getItem(THEME_STORAGE_KEY)

    // Apply the theme to the HTML element directly for immediate effect
    if (storedTheme) {
      document.documentElement.classList.remove("light", "dark")
      document.documentElement.classList.add(storedTheme)
    }

    setMounted(true)
  }, [])

  return (
    <NextThemesProvider {...props} storageKey={THEME_STORAGE_KEY} forcedTheme={!mounted ? undefined : null}>
      {children}
    </NextThemesProvider>
  )
}
