"use client"

import { useEffect } from "react"
import { useTheme } from "next-themes"
import { THEME_STORAGE_KEY } from "@/components/theme-provider"

export function useThemePersistence() {
  const { theme, setTheme } = useTheme()

  // Apply stored theme on component mount
  useEffect(() => {
    const storedTheme = localStorage.getItem(THEME_STORAGE_KEY)
    if (storedTheme && theme !== storedTheme) {
      setTheme(storedTheme)
    }
  }, [setTheme, theme])

  // Function to save theme preference
  const saveThemePreference = (newTheme: string) => {
    setTheme(newTheme)
    localStorage.setItem(THEME_STORAGE_KEY, newTheme)
  }

  return { theme, saveThemePreference }
}
