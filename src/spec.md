# Specification

## Summary
**Goal:** Make complaint photo uploads persist in the backend and render reliably across the app (before/after photos) after refresh and navigation.

**Planned changes:**
- Add in-canister photo storage APIs in the Motoko backend to save image bytes + content type and retrieve them later via a persistent photo identifier.
- Update citizen complaint creation to upload/store the “before” photo first, then create the complaint referencing the returned persistent photo identifier; show a clear English error and abort complaint creation if photo storage fails.
- Update frontend photo rendering to fetch/render images from backend-stored photo data (instead of assuming photo identifiers are browser blob/object URLs), with non-crashing fallback UI and English error messaging when a photo can’t be loaded.
- Add support for officials to upload/persist an “after” photo when resolving a complaint, store its identifier on the complaint, and handle any required conditional backend migration if needed.

**User-visible outcome:** Users can upload before/after complaint photos and see them displayed correctly on dashboards and complaint detail pages even after a full refresh or navigating away and back; failures show clear English errors without breaking the UI.
