# P1 — incremental svelte-check cache can reuse stale generated code

Category: correctness / caching

Evidence: manifest identity is only integer-millisecond `mtime` plus file size (`crates/rsvelte_check/src/svelte_check/manifest.rs:12-14,49-54`), and matching stats skip reading/recompiling the source (`overlay.rs:575-629`). Same-size edits can preserve both values on coarse or deliberately restored timestamps.

Impact: check/watch can report types and warnings for old source after a real edit, including in CI caches and fast editor saves.

Remediation: include a fast content digest in each entry and bump the manifest/warnings schema; use metadata only as a prefilter, not proof of identity.

Acceptance: replacing a component with different same-length content while preserving mtime invalidates TSX, map, declarations, and warning cache.
