"use client"

import type React from "react"

import { useEffect } from "react"
import { useTheme } from "next-themes"
import { disableThemeTransitions, applyThemeTransition } from "@/lib/utils/theme-transition"

export function ThemeTransitionProvider({ children }: { children: React.ReactNode }) {
  const { theme, resolvedTheme } = useTheme()

  useEffect(() => {
    // Disable transitions on initial load
    disableThemeTransitions()
  }, [])

  useEffect(() => {
    // Apply transition when theme changes
    if (resolvedTheme) {
      applyThemeTransition(document.documentElement)
    }
  }, [theme, resolvedTheme])

  return <>{children}</>
}
