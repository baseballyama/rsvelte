---
"@rsvelte/compiler": patch
---

chore(esrap): bump `rsvelte_esrap` to 0.10.2 for a test-only change

No shipped behaviour changes. The only edit under `crates/rsvelte_esrap/src/` is inside
`#[cfg(test)] mod internal_tests`, which cannot appear in a published artifact: the golden
conformance test now fails instead of skipping when `submodules/svelte` is absent or
`ESRAP_ORACLE_DIR` has replaced the corpus its `EXACT_FLOOR` ratchet was calibrated on.

The bump exists only because `check-esrap-version-bump.mjs` keys on any path under
`src/`, and `rsvelte_core` pins `rsvelte_esrap` exactly, so the pin has to advance with it.
