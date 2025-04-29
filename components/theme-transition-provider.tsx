"use client"

import type React from "react"

import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

export function ThemeTransitionProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [mounted, setMounted] = useState(false)
  const { resolvedTheme } = useTheme()
  const [transitioning, setTransitioning] = useState(false)

  // Handle initial mount
  useEffect(() => {
    setMounted(true)
  }, [])

  // Handle theme transitions
  useEffect(() => {
    if (!mounted) return

    // Add transition class to body when theme changes
    setTransitioning(true)

    // Remove transition class after transition completes
    const timer = setTimeout(() => {
      setTransitioning(false)
    }, 300) // Match this with the CSS transition duration

    return () => clearTimeout(timer)
  }, [resolvedTheme, mounted])

  // Add transition class to body
  useEffect(() => {
    if (transitioning) {
      document.documentElement.classList.add("theme-transition")
    } else {
      document.documentElement.classList.remove("theme-transition")
    }
  }, [transitioning])

  return <>{children}</>
}
