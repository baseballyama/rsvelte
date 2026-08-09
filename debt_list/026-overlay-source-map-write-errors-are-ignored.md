# P2 — overlay source-map persistence errors are ignored

Category: correctness / I/O reliability

Evidence: TSX and declaration writes propagate errors, but the adjacent map write discards its result (`crates/rsvelte_check/src/svelte_check/overlay.rs:678-690`). Cache validity does not require a map, and a skip best-effort reads whatever old map remains (`:617-628`).

Impact: disk-full, permission, or partial-write failures can leave a stale map paired with new TSX, causing later incremental diagnostics to be mapped to wrong Svelte positions without surfacing the original error.

Remediation: write TSX/map/declarations atomically as one cache transaction; on any failure remove/invalidate the entry and return `OverlayError`.

Acceptance: forced map-write failure cannot produce a cache hit and is reported; the next run recompiles and maps diagnostics correctly.
