# Specification

## Summary
**Goal:** Restrict the app’s authentication UI to only two visible sign-in choices—“Continue with Google” and “Continue with Apple”—while keeping the existing Internet Identity login flow behind the scenes.

**Planned changes:**
- Update the logged-out header/auth UI to show exactly two buttons: “Continue with Google” and “Continue with Apple”, removing any generic “Login/Sign in” entry points and any other provider options.
- Wire both buttons to initiate the existing Internet Identity-based login flow (no changes to the underlying authentication mechanism).
- Update landing page unauthenticated CTAs to replace generic wording (e.g., “Get Started”) with a clear prompt to sign in using Google or Apple.
- Ensure the landing page can trigger the same Google/Apple sign-in choice UI used in the header for consistent behavior and wording.

**User-visible outcome:** Logged-out users will only see “Continue with Google” and “Continue with Apple” as sign-in options (in the header and via landing page CTAs), and clicking either will log them in using the existing flow; logged-in users will continue to see logout as they do today.
