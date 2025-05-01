/**
 * Utility functions for theme transitions
 */

// Apply theme transition to an element
export function applyThemeTransition(element: HTMLElement, duration = 700) {
  // Add transition class
  element.classList.add("theme-transition")

  // Remove transition class after duration
  setTimeout(() => {
    element.classList.remove("theme-transition")
  }, duration)
}

// Disable theme transitions temporarily (useful for initial load)
export function disableThemeTransitions() {
  document.documentElement.classList.add("no-theme-transition")

  // Re-enable transitions after a short delay
  setTimeout(() => {
    document.documentElement.classList.remove("no-theme-transition")
  }, 50)
}

// Enable theme transitions
export function enableThemeTransitions() {
  document.documentElement.classList.remove("no-theme-transition")
}

// Apply page-wide theme transition effect
export function applyPageThemeTransition(isDark: boolean) {
  // Create overlay element for page-wide transition
  const overlay = document.createElement("div")
  overlay.className = "fixed inset-0 z-[9999] pointer-events-none"
  overlay.style.backgroundColor = isDark ? "#ffffff" : "#000000"
  overlay.style.opacity = "0"
  overlay.style.transition = "opacity 700ms ease-in-out"

  // Add to DOM
  document.body.appendChild(overlay)

  // Trigger animation
  setTimeout(() => {
    overlay.style.opacity = "0.15"

    // Remove after animation completes
    setTimeout(() => {
      document.body.removeChild(overlay)
    }, 700)
  }, 10)
}
