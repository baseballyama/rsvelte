# @rsvelte/oxlint-plugin

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
