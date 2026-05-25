---
"@rsvelte/compiler": patch
---

Bump target Svelte to **5.53.8** and partially port upstream commit `0206a2019` "fix: clean up externally-added DOM nodes in {@html} on re-render":

- **Client**: `$.html(...)` calls now thread a new `is_controlled` flag between the thunk and the existing `is_svg` / `is_mathml` flags. rsvelte emits `void 0` for it because the fragment-side analysis that sets `metadata.is_controlled = true` (when `{@html ...}` is the only child of an element) isn't ported yet.

Thirteen fixtures exercising the `is_controlled` short-circuit (skipping the wrapper anchor + using the parent node directly) are skipped in the compatibility report and documented in `tests/compatibility_report.rs`. Tracked as a follow-up port.
