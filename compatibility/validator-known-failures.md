# validator-known-failures.json — why entries are accepted

`crates/rsvelte_core/tests/validator.rs` asserts full upstream parity per
fixture — warning `code`/`message`/`start`/`end` and error `start`/`end` — instead
of only comparing diagnostic counts, mirroring what
`packages/svelte/tests/validator/test.ts` checks. The ratchet is shrink-only in
**both** directions: a new failure fails the run, and so does a listed entry that
already passes, so an entry that starts passing must be removed by the change
that made it pass.

"Not failing" is **two** states and the suite separates them: a listed entry that
ran and passed is stale (delete it), while a listed entry that names no runnable
fixture is *unmeasured* — the fixture was renamed, deleted or started being
skipped — and deleting it would bury whatever removed the fixture. Both are fatal;
only the first invites a re-baseline.

**If you are here because `test_validator` failed and you were not working on a
ratchet:** the list is empty, so a failure now means a *new* divergence — the
honest fix is the diagnostic, not the baseline. Re-run the suite and read the
fixture it names; never hand-edit a count to match.

## Current baseline: `validator-known-failures.json`, 0 entries — 0 divergences

All 332 runnable validator fixtures match upstream on code, message and position,
for both errors and warnings.

Partition of `validator-known-failures.json` by cluster: `0`

The three clusters this doc used to carry — error spans not populated (141),
warning span-only (30), warning content (1) — are all gone; there is no
population left to partition.

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

## What the previous baselines recorded

Kept because each item is a place where a ratchet entry was absorbing something
other than what it claimed — the failure mode to watch for if this file ever
grows again:

- `unknown-code` was listed under *warning span-only*, whose stated property is
  that code and message match. Under the ordered comparison the suite performs,
  they did not. The entry had been absorbing an ordering bug described as a span
  bug — and the promised span fix would not have cleared it.
- `a11y-anchor-in-svg-is-valid` appeared in no cluster's list at all, so the
  wrong-attribute bug behind it had no justification of any kind.
- `invalid-node-placement-5` and `module-script-reactive-declaration` were cited
  as examples of the *error-span* cluster **and** given wording bullets under the
  *content* cluster, while the counts summed to the baseline as if each entry
  were counted once. That is exactly what the partition line above now fails on.
- Of the 26 entries removed when the 198-entry baseline was re-measured, 3 —
  `a11y-alt-text`, `a11y-aria-role` and
  `a11y-no-noninteractive-element-to-interactive-role` — were named nowhere in
  the doc, so nothing recorded why they had been accepted.
