/**
 * Utility functions for theme transitions
 */

// Apply theme transition to an element
export function applyThemeTransition(element: HTMLElement, duration = 300) {
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
