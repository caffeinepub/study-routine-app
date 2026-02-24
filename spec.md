# Specification

## Summary
**Goal:** Fix the Dashboard page so all sections render correctly and are visible after production deployment.

**Planned changes:**
- Audit and fix `frontend/src/index.css` and `frontend/tailwind.config.js` to ensure OKLCH-based CSS custom property color tokens and Tailwind utility classes do not cause dashboard sections to be hidden, invisible, or improperly styled.
- Fix the Dashboard page so today's study target section (chapter checkboxes + progress bar) is fully visible when a target exists.
- Fix the Dashboard page so the "create a target" prompt is visible when no target exists for today.
- Ensure all three main dashboard sections render correctly in both light and dark modes.

**User-visible outcome:** The Dashboard page loads and displays all sections correctly in production, with no blank or invisible areas in either light or dark mode.
