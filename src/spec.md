# Specification

## Summary
**Goal:** Remove all Docs-related UI and routing so users no longer see or access documentation from within the app.

**Planned changes:**
- Remove the “Docs” link from the primary header navigation and the mobile navigation drawer, keeping all other existing nav items unchanged.
- Remove the “Learn More” button/link from the landing page hero while keeping the primary CTA in the hero intact and functional.
- Remove the `/docs` route from the frontend router so the documentation page is no longer registered or rendered via in-app routes.

**User-visible outcome:** Users will no longer see “Docs” in navigation, will no longer see “Learn More” on the landing hero, and navigating to `/docs` will not open the in-app documentation page.
