# @rsvelte/lint

## 0.10.20

## 0.10.19

### Patch Changes

- 762a8a5: Strip a leading UTF-8 BOM before linting, so a parse offset and the source text agree. The compiler's parser strips it (as upstream and as ESLint's `SourceCode` do) and therefore reports offsets relative to the stripped text, while the linter kept the unstripped source for its line table and its rule slices: every column on the BOM's line came out three short, and the JS-whitespace scan panicked slicing at byte 1, inside the BOM.
- 762a8a5: Apply `--fix` edits to the BOM-stripped source. The rules report offsets relative to the stripped text (as the parser and ESLint's `SourceCode` do) while the fixer spliced the unstripped source, so every edit in a BOM-prefixed file landed three bytes early — producing text such as `<scriptconstlet b = 2;`. The BOM is restored in the output, as `eslint --fix` does.

## 0.10.18

### Patch Changes

- fa88d36: Align `rsvelte-lint` with `eslint-plugin-svelte` on the axes no gate previously compared.

  - 21 rules defaulted to `warn` where upstream defaults to `error`. Severity decides the exit code in both tools, so `rsvelte-lint` exited 0 where `eslint` exits 1 on the same source. Three rule mode-gates likewise made rsvelte run a rule ESLint skips.
  - The human-readable and GitHub Actions diagnostic writers printed a zero-based column — `4:0` where ESLint prints `4:1`. SARIF and the machine format were already correct.
  - `--fix` resolved `eslint-disable` directives against the parser's line table while the report path used the reporting rule's own table, so a directive suppressed one line and the fixer rewrote another wherever U+2028/U+2029 make the two tables differ.
  - `prefer-class-directive`'s autofix trimmed with Unicode `White_Space` semantics while its report used JS semantics, so a `class` value padded with U+FEFF was reported identically to ESLint and rewritten differently.
  - The JSON API the wasm and NAPI bindings wrap reported every rule on the parser's line table, so the seven rules that upstream positions with `getLocFromIndex` came out on a different line and column there than from the CLI. All consumers now share one `LintDiagnostic::report_span`.
  - `prefer-destructured-store-props` now gates its rune-named-store skip on runes mode, `infinite-reactive-loop` no longer treats an inline function expression as a then-callback, `no-trailing-spaces` no longer counts a leading BOM as trailing whitespace (its autofix would have deleted the BOM), and lint parse errors now carry a line and column instead of a debug-formatted struct.

- 8d38523: `svelte/sort-attributes` now honours an `order` pattern that uses lookaround.

  The `order` option takes JS regexes, and Rust's `regex` crate implements no lookaround, so a pattern like `"/^(?=x-)x-a$/u"` failed to compile and its group was silently dropped — the rule then reported nothing for the attributes that group was meant to order. `regex` is still tried first and every default pattern compiles there, so the backtracking fallback is unreachable from the default path.

## 0.10.17

## 0.10.16

## 0.10.15

## 0.10.14

## 0.10.13

## 0.10.12

### Patch Changes

- 0a0b1d8: Preserve Oxlint-compatible globals and environment configuration across lint hosts.
- c8d1fa8: Recognize Unicode identifiers in `valid-each-key` references.
- 3b2e3b4: Add opt-in `svelte/no-undef` diagnostics for unresolved component-script references.

## 0.10.11

### Patch Changes

- 5c03a65: Correct member-use detection in `svelte/no-unused-props` around identifiers, comments, and strings.
- 10d8be8: Classify word boundaries in the `<script>` source-scan rules by character, not by byte

  `svelte_scan::is_ascii_ident_byte` answered "is this byte ASCII-alphanumeric, `_` or
  `$`", which makes **every non-ASCII character a word boundary** — so `foo` inside
  `naïvefoo` read as a standalone occurrence, and an identifier scan stopped at the
  first byte of an accented letter. Four rules shared it:
  `svelte/no-unused-props`, `svelte/require-event-prefix`,
  `svelte/require-event-dispatcher-types` and the `$$Slots` / `$$Events` declaration
  scan behind `svelte/experimental-require-slot-types` /
  `svelte/experimental-require-strict-events`.

  Observable effects, all fixed:

  - `interface $$Eventsé {}` satisfied the `$$Events` requirement, and a mention of
    `éinterface $$Events` (inside a string) counted as a declaration.
  - `import { écreateEventDispatcher } from 'svelte'` was treated as importing
    `createEventDispatcher`, so a call to the unrelated function was reported; the
    reverse, `import { createEventDispatcher as créer }`, truncated the alias to `cr`
    and the real untyped call went unreported.
  - A type member named `ïnput: () => void` was invisible to `require-event-prefix`,
    and `interface Propsé` was accepted as the body of `Props`.
  - `no-unused-props` reported `'gr'` instead of `'grëeting'`, and a whole-object
    declaration whose variable name contains a non-ASCII letter
    (`const prôps: Props = $props()`) **panicked** on a mid-character string slice.

  Boundaries are now decided with `rsvelte_core::compiler::utils::is_js_ident_continue`
  — ECMA-262 `IdentifierPartChar` — so accented letters, CJK and the zero-width
  joiners are identifier glue while non-ASCII spaces (U+00A0, U+2000–U+200A, U+2028,
  U+2029, U+202F, U+205F, U+3000, U+FEFF) remain boundaries. ASCII input is
  unaffected: the two predicates agree on every ASCII byte. The CSS scanner
  (`scss_selector.rs`) keeps its own `>= 0x80` test — that is CSS Syntax Level 3 §4.2,
  a different specification.

- fec26ec: Stop `svelte/no-unused-vars` reporting a binding whose only use is next to a non-ASCII space

  The rule's textual fallback — the one that keeps a name alive when Phase 2 records
  no reference for it (JSDoc `@type`, TypeScript type positions, generics) — decided
  word boundaries with a byte test that counted every byte `>= 0x80` as an identifier
  byte. A non-breaking space next to the name therefore read as identifier glue, the
  occurrence was discarded, and the binding was reported unused although it was used
  (here with a literal U+00A0 between `{` and `Foo`):

  ```svelte
  <script>
    import { Foo } from './x';
    /** @type {<NBSP>Foo} */
    let v = null;
  </script>
  ```

  The boundary test now asks whether the neighbouring _character_ is an ECMA-262
  `IdentifierPart` (`oxc_syntax::identifier::is_identifier_part`, the same rule the
  compiler's classifiers use), so non-ASCII spaces (U+00A0, U+2000–U+200A, U+2028,
  U+2029, U+202F, U+205F, U+3000, U+FEFF) are boundaries while accented letters, CJK
  and the zero-width joiners stay glue. ASCII input is unaffected: the two predicates
  agree on every ASCII byte.

## 0.10.10

### Patch Changes

- 9c22cc3: Build the Linux binaries against glibc 2.35 instead of whatever `ubuntu-latest` happens to provide. The release matrix ran on the hosted `ubuntu-latest` image, which moved to Ubuntu 24.04 (glibc 2.39), so every published `linux-x64-gnu` / `linux-arm64-gnu` artifact refused to start on Ubuntu 22.04 LTS and other distributions on an older glibc — `libc.so.6: version 'GLIBC_2.39' not found`. The Linux legs are now pinned to `ubuntu-22.04`, and each one asserts the requirement by reading the artifact it just built, so a future image bump fails the release instead of shipping.

## 0.10.9

## 0.10.8

## 0.10.7

### Patch Changes

- 826db79: fix(lint): lint `.svelte.js` and `.svelte.ts` files, which the CLI silently skipped
- 8c78bf4: fix(lint): walk `no-unused-props` usage scans by characters, not bytes

  `member_chains` stepped its whitespace cursor one **byte** at a time, gated on
  `(byte as char).is_whitespace()`. The UTF-8 continuation bytes `0x85` and `0xA0`
  cast to `U+0085` NEL and `U+00A0` NBSP, both of which are whitespace, so any
  character ending in one of them — `々` (E3 80 85), and a large slice of the CJK
  and Cyrillic blocks through `0xA0` — let the cursor step into the middle of
  itself. The next line sliced the source at that offset and panicked.

  The `...` spread lookbehind on that same line was a second, independent panic:
  `&source[p - 3..p]` slices three bytes back from a cursor that is already on a
  boundary, which still lands inside any preceding 4-byte character (`𝕏foo.bar`
  panicked on the _start_ index even with the cursor bug fixed). It is now an
  `ends_with`, which is boundary-safe by construction.

  The four forward whitespace loops in `parse_member_chain` had the same byte
  cursor. Those could not panic — a continuation byte never sits at a boundary a
  forward scan can reach — but they failed to skip genuine Unicode whitespace, so
  `props.\u{3000}foo` and `props\u{a0}['foo']` read as unused. Both now walk
  characters.

  Reachable from the public `no_unused_props::diagnostics_typed` (and
  `rsvelte_lint_types::lint_component_types`), which need a type backend; the
  syntactic path used by the `rsvelte-lint` CLI does not reach this code.

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
