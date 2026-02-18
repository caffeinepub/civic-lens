# Specification

## Summary
**Goal:** Remove the “Create Your Password” registration step from authenticated onboarding while keeping password verification only for users who already have a registered password.

**Planned changes:**
- Remove any onboarding modal/section and UI copy related to password creation/registration (e.g., “Create Your Password”, “Create Password”, and related descriptions).
- Update the post-sign-in flow to only show the password verification modal when a password is already registered and the session is not verified.
- Ensure users without a registered password are not blocked from authenticated areas/actions due to password registration requirements.
- Preserve current behavior where logout clears password verification state (e.g., sessionStorage).

**User-visible outcome:** After signing in with Internet Identity, users are no longer prompted to create a password; only users with an existing password may be asked to verify it before proceeding.
