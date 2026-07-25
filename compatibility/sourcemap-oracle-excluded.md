# sourcemap-oracle-excluded.json — why each anchor is excluded

The source-map gate (`crates/rsvelte_core/tests/sourcemaps_gate.rs`) ports the
`client:` / `server:` / `css:` assertions from
`submodules/svelte/packages/svelte/tests/sourcemaps/samples/*/_config.js` and
runs them against rsvelte's map.

Before an anchor is held against rsvelte it is run against the **official
compiler's own map** for the same sample — the `client.js.map` / `server.js.map`
fixtures that `scripts/fixtures/generate-fixtures.mjs` produces by calling
`submodules/svelte`'s `compile()`. If the assertion already fails there, the
expectation cannot be reproduced under this harness and the anchor is listed
here instead of being counted against rsvelte.

This happens for one structural reason: the upstream runner
(`tests/sourcemaps/test.ts`) drives `compile_directory`, which sets
`outputFilename` / `cssOutputFilename` and applies the sample's `preprocess`
chain. The fixture generator does neither — it compiles the *raw* `input.svelte`
with `{ dev: false, generate, filename: 'input.svelte' }`. Anchors that describe
preprocessed text therefore have no counterpart in the fixture. (Samples whose
`_config.js` is preprocessor-driven are not ported at all; see the `ANCHORS`
doc comment in the test. Only anchors that survive the raw-input compile are
listed here.)

The gate warns when an excluded anchor starts passing on the oracle — that means
the harness changed and the exclusion should be removed.

## Excluded anchors

(none)
