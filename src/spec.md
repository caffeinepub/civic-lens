# Specification

## Summary
**Goal:** Remove the entire footer/bottom-of-website area from the app so no footer content or spacing appears on any page.

**Planned changes:**
- Remove (or stop rendering) the `<footer>` section in `frontend/src/components/layout/AppLayout.tsx`.
- Ensure no footer-related borders/lines, padding, or reserved bottom spacing remain beneath main content across all routes.

**User-visible outcome:** All pages end cleanly after their main content with no footer, footer line/border, icons/links, copyright text, or extra bottom spacing.
