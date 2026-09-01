# @rsvelte/oxlint-plugin

## 0.2.4

### Patch Changes

- Updated dependencies [ea32346]
- Updated dependencies [45cc137]
- Updated dependencies [304cc52]
- Updated dependencies [304cc52]
- Updated dependencies [95ed5a8]
- Updated dependencies [f9a6a3f]
- Updated dependencies [2d186c8]
- Updated dependencies [38da4ad]
- Updated dependencies [09639f6]
- Updated dependencies [8d3ea2f]
- Updated dependencies [327bd0b]
- Updated dependencies [793e169]
- Updated dependencies [ea32346]
- Updated dependencies [304cc52]
- Updated dependencies [207eac1]
- Updated dependencies [ea32346]
- Updated dependencies [ea32346]
- Updated dependencies [dc44b77]
- Updated dependencies [1e08f2d]
- Updated dependencies [ea32346]
- Updated dependencies [c87d35a]
- Updated dependencies [ea32346]
- Updated dependencies [304cc52]
- Updated dependencies [0697e6c]
- Updated dependencies [7f03d5b]
- Updated dependencies [304cc52]
- Updated dependencies [05f1120]
- Updated dependencies [846473c]
- Updated dependencies [a653fd4]
- Updated dependencies [846473c]
- Updated dependencies [52d747a]
- Updated dependencies [6637db9]
- Updated dependencies [4b8acf8]
- Updated dependencies [81fb994]
- Updated dependencies [32677e2]
- Updated dependencies [64ac925]
- Updated dependencies [846473c]
- Updated dependencies [ea32346]
- Updated dependencies [ea32346]
- Updated dependencies [a2df07f]
- Updated dependencies [9ce6bf9]
- Updated dependencies [ea32346]
- Updated dependencies [846473c]
- Updated dependencies [846473c]
- Updated dependencies [846473c]
- Updated dependencies [d4b35d4]
- Updated dependencies [ea32346]
- Updated dependencies [846473c]
- Updated dependencies [846473c]
- Updated dependencies [729abce]
- Updated dependencies [846473c]
- Updated dependencies [846473c]
- Updated dependencies [43daf9c]
- Updated dependencies [2152f06]
- Updated dependencies [356a946]
- Updated dependencies [9b6d56c]
- Updated dependencies [b8989dd]
- Updated dependencies [5621c24]
- Updated dependencies [846473c]
- Updated dependencies [ea32346]
- Updated dependencies [1aeb321]
- Updated dependencies [846473c]
- Updated dependencies [ea32346]
- Updated dependencies [ea32346]
- Updated dependencies [ea32346]
- Updated dependencies [43d2fcb]
- Updated dependencies [ea32346]
- Updated dependencies [19832fe]
- Updated dependencies [e991f6e]
- Updated dependencies [846473c]
- Updated dependencies [304cc52]
- Updated dependencies [67e0d18]
- Updated dependencies [25f16ad]
- Updated dependencies [30ebc15]
- Updated dependencies [6271cc2]
- Updated dependencies [cbcf2db]
- Updated dependencies [846473c]
- Updated dependencies [0644013]
- Updated dependencies [ea32346]
- Updated dependencies [dc44b77]
- Updated dependencies [4b058e3]
- Updated dependencies [ea32346]
- Updated dependencies [65e81d6]
- Updated dependencies [dc2c0ca]
- Updated dependencies [c87d35a]
- Updated dependencies [ea32346]
- Updated dependencies [846473c]
- Updated dependencies [ea32346]
- Updated dependencies [ea32346]
- Updated dependencies [30fa300]
- Updated dependencies [c18d32c]
- Updated dependencies [846473c]
- Updated dependencies [6adc487]
- Updated dependencies [846473c]
- Updated dependencies [f42d483]
- Updated dependencies [846473c]
- Updated dependencies [3d955fd]
- Updated dependencies [9782ae8]
- Updated dependencies [ea32346]
- Updated dependencies [ea32346]
- Updated dependencies [64fcc4b]
- Updated dependencies [6094cc9]
- Updated dependencies [9a99c49]
- Updated dependencies [ebe8b1f]
- Updated dependencies [304cc52]
- Updated dependencies [982721d]
- Updated dependencies [ea32346]
- Updated dependencies [ea32346]
- Updated dependencies [c90c619]
- Updated dependencies [ca05f8b]
- Updated dependencies [304cc52]
- Updated dependencies [1d1ba92]
- Updated dependencies [40f1aed]
- Updated dependencies [457601d]
- Updated dependencies [ea32346]
- Updated dependencies [e3fc003]
- Updated dependencies [b94bf08]
- Updated dependencies [e04241b]
- Updated dependencies [6b1e245]
- Updated dependencies [52f933e]
- Updated dependencies [304cc52]
- Updated dependencies [958a818]
- Updated dependencies [ea32346]
- Updated dependencies [ea32346]
- Updated dependencies [1ba3f37]
- Updated dependencies [ea32346]
- Updated dependencies [1b5aaf6]
- Updated dependencies [17c5509]
  - @rsvelte/compiler@0.11.0

## 0.2.3

### Patch Changes

- Updated dependencies [1301373]
- Updated dependencies [ec20fc8]
- Updated dependencies [b0eb890]
  - @rsvelte/compiler@0.10.0

## 0.2.2

### Patch Changes

- f5880b3: fix(oxlint-plugin): report each diagnostic exactly once for dual-script components in multi-file runs

  A `.svelte` component with both a `<script module>` and a `<script>` block is
  visited by oxlint once per block. The plugin's per-rule de-dup tracked "the
  last file seen" in a closure shared across the whole oxlint invocation
  (`createOnce` runs its visitor once for the entire run, not per file), so an
  interleaved visit to a different file between the two blocks reset the de-dup
  state and caused markup diagnostics (e.g. `svelte(require-each-key)`,
  `svelte(no-at-html-tags)`) to be reported twice when linting multiple files in
  one `oxlint` invocation.

  De-dup state is now keyed by filename, in a cache separate from the
  expensive-lint result cache (which stays keyed by file content, to still
  share one lint run across a file's ~160 rule visitors). An earlier version of
  this fix keyed de-dup state off that content-keyed cache directly, which
  introduced a worse regression: two distinct files with byte-identical content
  would share the same "already reported" state, and the second file's
  diagnostics would silently disappear instead of duplicating. Keeping the two
  caches independent also means the content cache's eviction can no longer
  resurrect the original duplicate-report bug, since de-dup state no longer
  lives on the evicted object.

  The per-filename entry also tracks the content it was last built from and
  resets when that content changes, so a long-lived plugin host (oxlint's
  LSP/watch mode) relinting the same file after an edit can't reuse stale
  de-dup state from the previous lint pass and drop a diagnostic that
  reappears at the same location.

- Updated dependencies [62b47e6]
- Updated dependencies [bb96376]
  - @rsvelte/compiler@0.9.1

## 0.2.1

### Patch Changes

- Updated dependencies [64cb25d]
- Updated dependencies [deadab5]
- Updated dependencies [a10913c]
- Updated dependencies [1508778]
- Updated dependencies [46cf5fe]
- Updated dependencies [97178b7]
- Updated dependencies [020be59]
- Updated dependencies [065ce6f]
- Updated dependencies [97178b7]
- Updated dependencies [97178b7]
- Updated dependencies [d7353f8]
  - @rsvelte/compiler@0.9.0

## 0.2.0

### Minor Changes

- cc81ec5: feat(oxlint-plugin): run rsvelte's Svelte diagnostics as oxlint rules

  New package `@rsvelte/oxlint-plugin` — an oxlint JS plugin that folds rsvelte's
  Svelte diagnostics (the native eslint-plugin-svelte rule ports plus the
  compiler / validator / a11y warning wrap) into oxlint's single pass and report,
  under the `svelte/` namespace. Add `"jsPlugins": ["@rsvelte/oxlint-plugin"]` (and
  `extends` the bundled `recommended.json`) to `.oxlintrc.json` and Svelte issues
  show up alongside oxlint's JS/TS rules. Requires oxlint ≥ 1.64.

  The engine is native-first with a wasm fallback: the plugin loads the prebuilt
  `rsvelte_lint.node` (NAPI) from the per-platform `@rsvelte/lint-<triple>`
  packages when available, and falls back to the `@rsvelte/compiler` wasm engine
  otherwise — both return byte-identical diagnostics. `RSVELTE_OXLINT_ENGINE=native|wasm`
  forces one engine. The `@rsvelte/lint-<triple>` packages now ship the
  `rsvelte_lint.node` addon alongside the `rsvelte-lint` CLI (via a new
  `rsvelte_lint` `napi` cargo feature).

  Script-block diagnostics map to accurate positions; markup/style diagnostics are
  surfaced at the top of the `<script>` block with their real location in the
  message (an oxlint alpha `.svelte` limitation). Scriptless components are not
  visited by oxlint and so are not linted — see the package README.

  To back it, `@rsvelte/compiler` (and the native addon) gain a `lint_rules()`
  export returning the full catalog of diagnostic ids the linter can emit (native
  rule ids + the compiler/validator/a11y warning codes), so the plugin registers
  its rule set and generates its recommended config directly from the engine. The
  existing `lint()` export is unchanged.

### Patch Changes

- Updated dependencies [cc81ec5]
- Updated dependencies [54509fe]
- Updated dependencies [4ea4b44]
- Updated dependencies [6665d53]
- Updated dependencies [fa0e9ff]
- Updated dependencies [fa0e9ff]
- Updated dependencies [add48ed]
- Updated dependencies [fa0e9ff]
- Updated dependencies [fa0e9ff]
- Updated dependencies [87f178e]
- Updated dependencies [fa0e9ff]
- Updated dependencies [fa0e9ff]
- Updated dependencies [a3dae82]
- Updated dependencies [fa0e9ff]
- Updated dependencies [fa0e9ff]
- Updated dependencies [685a96e]
- Updated dependencies [fd4572e]
  - @rsvelte/compiler@0.8.0
