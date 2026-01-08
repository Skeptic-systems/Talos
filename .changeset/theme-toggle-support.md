---
"apimanager": minor
---

Add light/dark theme toggle with localStorage persistence

- Implement ThemeProvider context for managing theme state across the app
- Add ThemeToggle component with sun/moon icons in navbar and auth pages
- Default theme is dark mode, preference stored in localStorage as 'talos-theme'
- Update all pages and components with light/dark mode color variants
- Add inline script to prevent flash of wrong theme on page load
