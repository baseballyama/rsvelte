# validator-known-failures.json — why entries are accepted

`crates/rsvelte_core/tests/validator.rs` asserts full upstream parity per fixture —
warning `code`/`message`/`start`/`end` and error `start`/`end` — instead of only
comparing diagnostic counts, mirroring what
`packages/svelte/tests/validator/test.ts` checks. The ratchet may only shrink;
every listed fixture would be a real divergence from the last confirmed test run,
not a placeholder.

## Current baseline: `validator-known-failures.json`, 0 entries — 0 divergences

All 332 runnable validator fixtures match upstream on code, message and position,
for both errors and warnings. Keep the list empty: a new entry means a
regression, and the honest fix is the diagnostic, not the baseline.

Three structural notes, so the empty state is not accidentally undone:

- **Diagnostics carry their own span.** The constructors in
  `2_analyze/errors.rs` / `2_analyze/warnings.rs` build a span-less diagnostic and
  each raising site attaches the range with `AnalysisError::at(start, end)` /
  `AnalysisWarning::at(start, end)`. Take the node upstream passes to its `e.*` /
  `w.*` constructor — frequently a sibling attribute or a child, not the node the
  enclosing visitor is looking at. `regular_element.rs` still back-fills a11y
  warnings with the element's span, but only as the fallback for the warnings
  upstream really does attribute to the element.

- **Emission order is asserted.** The gate zips actual against expected, so two
  diagnostics on one fixture must be emitted in upstream's order. This is why
  `unknown_code` / `legacy_code` are emitted from the per-node loop in
  `visitors/shared/fragment.rs` rather than up front.

- **The harness passes no `filename`.** Upstream's `test.ts` passes only
  `generate` plus the sample's own options, so `svelte_self_deprecated` must see
  the unset-filename sentinel and report `Self` / `Self.svelte`. Module-ness
  therefore cannot be inferred from a `.svelte.(js|ts)` filename here;
  `compile_module` sets `CompileOptions::is_module_source` instead, mirroring
  upstream's separate `analyze_module` entry point.
