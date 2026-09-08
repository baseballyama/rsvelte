# `3471-global-call-fold-value.svelte`

**Issue:** [#3471](https://github.com/baseballyama/rsvelte/issues/3471)

The folded VALUE, not just whether it folds. JS `Math.round` is half-**up** (`Math.round(-0.5)` is `-0`), and the client's own table used Rust's `f64::round` (half away from zero), so it inlined `-1` while the server inlined `0` from the same source — output that parses and renders the wrong text on one port only. `Math.trunc` / `Math.imul` / `Number.isInteger` / `String` pin the arms the old table had no entry for at all
