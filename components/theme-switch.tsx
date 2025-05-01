"use client"

import { useState } from "react"
import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useSynchronizedTheme } from "@/hooks/use-synchronized-theme"
import { applyThemeTransition } from "@/lib/utils/theme-transition"

export function ThemeSwitch() {
  const { currentTheme, toggleTheme, mounted } = useSynchronizedTheme()
  const [isAnimating, setIsAnimating] = useState(false)

  const handleToggle = () => {
    // Apply transition before toggling theme
    applyThemeTransition(document.documentElement)
    setIsAnimating(true)

    // Delay the actual theme toggle to allow for animation
    setTimeout(() => {
      toggleTheme()
      // Reset animation state after theme change
      setTimeout(() => setIsAnimating(false), 600)
    }, 300)
  }

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="opacity-0">
        <Sun className="h-5 w-5" />
      </Button>
    )
  }

  const isDark = currentTheme === "dark"

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleToggle}
      disabled={isAnimating}
      aria-label={`Switch to ${isDark ? "light" : "dark"} theme`}
      title={`Switch to ${isDark ? "light" : "dark"} theme`}
      className="relative w-10 h-10 rounded-full overflow-hidden"
    >
      {/* Animated background that simulates day/night transition */}
      <div
        className={`absolute inset-0 rounded-full transition-all duration-700 ease-in-out ${
          isAnimating ? "scale-150 opacity-80" : "scale-100 opacity-0"
        } ${isDark ? "bg-amber-300" : "bg-indigo-900"}`}
      />

      {/* Sun/Moon container with rotation */}
      <div
        className={`relative z-10 w-full h-full flex items-center justify-center transition-transform duration-700 ${
          isAnimating ? "rotate-[360deg]" : ""
        }`}
      >
        {/* Sun icon with simple animation */}
        <div
          className={`absolute transition-all duration-500 ${
            isDark ? "opacity-100 scale-100" : "opacity-0 scale-0 rotate-90"
          }`}
        >
          <Sun className="h-5 w-5 text-amber-500" />
        </div>

        {/* Moon icon with simple animation */}
        <div
          className={`absolute transition-all duration-500 ${
            !isDark ? "opacity-100 scale-100" : "opacity-0 scale-0 -rotate-90"
          }`}
        >
          <Moon className="h-5 w-5 text-indigo-200" />
        </div>
      </div>

      {/* Ripple effect on click */}
      <div
        className={`absolute inset-0 bg-current rounded-full opacity-0 scale-0 transition-all duration-700 ${
          isAnimating ? "scale-150 opacity-20" : ""
        }`}
      />
    </Button>
  )
}
