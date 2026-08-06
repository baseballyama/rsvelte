# @rsvelte/lint

## 0.10.6

## 0.10.5

### Patch Changes

- 0279808: Client source maps no longer anchor the instance script at the byte immediately
  after `<script>`. That byte is the newline ending the `<script>` line, so every
  segment derived from the script chunk resolved to a column past the end of that
  line and broke downstream consumers resolving a frame. The chunk is now anchored
  at the script's first non-whitespace byte, which cuts out-of-range client
  segments by 46% across the official sourcemap samples. Generated code is
  unchanged — the offset only feeds the map.
- 67067b0: CSS pruning now models `{@render}` call sites. A `{#snippet}`-declared element's
  real DOM ancestors are the union of the ancestors of every site that renders the
  snippet, not its lexical parent chain, so rules such as `.foo > .a { … }` whose
  `.a` only ever appears in a snippet rendered under a different ancestor are
  marked unused like the official compiler does. Previously the structural ancestor
  check bailed out entirely whenever the component contained a snippet.
- f016d18: Add `svelte/no-unused-vars`, a Svelte-aware unused-variable rule for component
  scripts. ESLint core's `no-unused-vars` and oxlint both stop at the `.svelte`
  boundary, so top-level `<script>` bindings went unchecked unless a project kept
  a Svelte-aware ESLint around. The rule reads the compiler's Phase-2 scope tree,
  so template reads, `$store` auto-subscriptions and `bind:` targets all count as
  uses. It is deliberately conservative: only top-level module/instance-script
  declarations are judged, and props (`export let`, `$props()` destructuring,
  `$$props`/`$$restProps`/`$$slots`), exported declarations, reactive `$:`
  declarations, reassigned/mutated bindings, and names that occur anywhere else
  in the source (covering TypeScript type positions the scope tree does not
  record) are never reported.

## 0.10.4

## 0.10.3

## 0.10.2

## 0.10.1

## 0.10.0

## 0.9.8

## 0.9.7

## 0.9.6

## 0.9.5

## 0.9.4

### Patch Changes

- 28e6867: fix(lint): treat lone CR as a line break in diagnostic line/column computation

  `LineIndex` only split lines on `\n`, so a lone `\r` (old Mac-style line
  ending) with no following `\n` was not counted as a line break. Diagnostic
  line/column positions after such a `\r` were therefore off, unlike ESLint's
  text model, which treats `\r`, `\n`, and `\r\n` all as line terminators.

- 79d589d: feat(lint): make `svelte/no-target-blank` fixable

  `--fix` now adds the missing `rel` tokens instead of only reporting. When the
  element has no `rel`, one is inserted right after `target`; an existing static
  `rel` is extended with only the tokens it lacks, preserving its value and
  quoting style. `allowReferrer` narrows the required set to `noopener`, and a
  dynamic `rel={...}` is still reported without a fix.

  Svelte 5 has no `security-anchor-rel-noreferrer` compiler warning, so this rule
  is the only place the repair can live. Upstream eslint-plugin-svelte does not
  offer the fix; diagnostics are unchanged, so output parity is unaffected.

## 0.9.3

### Patch Changes

- a3d0c7c: feat(lint): expose fix data alongside the validator wrap

## 0.9.2

## 0.9.1

### Patch Changes

- 690a885: fix(lint): stop the postinstall binary swap breaking pnpm's `.bin` shim (#1723)

  `postinstall` used to copy the platform-native `rsvelte-lint` binary over
  `bin/rsvelte-lint` (the file `package.json`'s `bin` field points at), so the
  package manager's `.bin/rsvelte-lint` entry would run the native binary
  directly with no Node startup cost.

  pnpm's `.bin` entry is a generated shell shim, not a symlink, and it decides
  its interpreter by reading the _target file's shebang at shim-generation
  time_ — before `postinstall` has necessarily run. If that read sees this
  file's original `#!/usr/bin/env node` shebang, pnpm bakes `exec node
".../bin/rsvelte-lint" "$@"` into the shim permanently. `postinstall`'s later
  swap to a native Mach-O/ELF binary then makes that baked-in Node try to parse
  binary bytes as JS: `SyntaxError: Invalid or unexpected token` on `pnpm exec
rsvelte-lint`.

  `bin/rsvelte-lint` is now always the Node launcher (never mutated at install
  time); it resolves and execs the platform-native binary itself, forwarding
  argv/stdio and the exit code/signal. This is correct under every package
  manager's `.bin` mechanism — symlink (npm, yarn classic) or generated shim
  (pnpm) — at the cost of one Node cold start per invocation, the same
  trade-off already accepted whenever `postinstall` didn't run (`--ignore-scripts`,
  gated build scripts, Windows).

## 0.9.0

## 0.8.2

## 0.8.1

### Patch Changes

- a44b469: fix(compiler): add a stable `@rsvelte/compiler/wasm` subpath and fix package metadata

  The published package now exposes the WebAssembly binary under a stable
  `@rsvelte/compiler/wasm` export. Previously the only way to reach the `.wasm`
  bytes (e.g. to drive `initSync` on Node) was a deep import that hard-coded the
  internal build crate's filename, so consumers broke whenever that name changed
  (`rsvelte_core_bg.wasm` → `rsvelte_lint_bg.wasm`). Import from
  `@rsvelte/compiler/wasm` instead — it stays stable across releases.

  Existing crate-named deep imports keep working (an `exports` passthrough
  preserves them), and the default `import ... from '@rsvelte/compiler'` is
  unchanged.

  Also corrects the package `description`, which had been the linter crate's text
  rather than the compiler's.

- 386f732: fix(wasm): enable reference-types in wasm-opt

  Newer rustc/LLVM can emit a second wasm table (a reference-types externref table
  alongside the funcref indirect-call table) for `wasm32-unknown-unknown`, which
  `wasm-opt`'s default MVP feature set rejects with "Only 1 table definition allowed
  in MVP". Whether the extra table appears depends on the rustc version CI resolves
  that day, not on anything in this repo, so the wasm build could break without any
  change here.

  Passing `--enable-reference-types` lets wasm-opt parse and optimize it. The
  `rsvelte_fmt_wasm` artifact shrinks ~1% as a result; `rsvelte_lint`'s is byte-identical.

## 0.8.0
