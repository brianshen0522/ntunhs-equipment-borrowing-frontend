"use client"

import { useEffect, useState } from "react"
import { useTheme } from "next-themes"
import { THEME_STORAGE_KEY } from "@/components/theme-provider"

export function useSynchronizedTheme() {
  const { resolvedTheme, setTheme, theme } = useTheme()
  const [currentTheme, setCurrentTheme] = useState<string | undefined>(undefined)
  const [mounted, setMounted] = useState(false)

  // Initialize theme on mount
  useEffect(() => {
    setMounted(true)

    // Get the stored theme from localStorage
    const storedTheme = localStorage.getItem(THEME_STORAGE_KEY)
    if (storedTheme) {
      setCurrentTheme(storedTheme)

      // Apply the theme to the HTML element directly for immediate effect
      document.documentElement.classList.remove("light", "dark")
      document.documentElement.classList.add(storedTheme)

      // Also set it in the theme context
      if (theme !== storedTheme) {
        setTheme(storedTheme)
      }
    }
  }, [setTheme, theme])

  // Update current theme when resolvedTheme changes
  useEffect(() => {
    if (resolvedTheme && mounted) {
      setCurrentTheme(resolvedTheme)
    }
  }, [resolvedTheme, mounted])

  // Function to toggle theme with proper storage and synchronization
  const toggleTheme = () => {
    const newTheme = currentTheme === "dark" ? "light" : "dark"

    // Apply theme change
    setTheme(newTheme)
    setCurrentTheme(newTheme)

    // Ensure theme is stored in localStorage with the correct key
    if (typeof window !== "undefined") {
      localStorage.setItem(THEME_STORAGE_KEY, newTheme)

      // Apply the theme to the HTML element directly for immediate effect
      document.documentElement.classList.remove("light", "dark")
      document.documentElement.classList.add(newTheme)
    }
  }

  return {
    currentTheme,
    toggleTheme,
    mounted,
  }
}
