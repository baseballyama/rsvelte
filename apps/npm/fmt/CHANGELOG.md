# @rsvelte/fmt

## 0.4.0

### Minor Changes

- 0938afd: fmt: honor `prettier-plugin-svelte` / oxfmt markup options (#1057)

  `rsvelte-fmt` previously read the project `.oxfmtrc` but only applied the scalar
  JS options to embedded `<script>` blocks — markup-level and sort options were
  silently ignored. The Svelte formatter now honors them so `.svelte` output stays
  compatible with `oxfmt` + `prettier-plugin-svelte` under the same config:

  - **`singleAttributePerLine`** — break every attribute onto its own line when an
    element has more than one.
  - **`bracketSameLine`** — keep a wrapped open tag's `>` / `/>` on the last
    attribute's line (the replacement for the removed `svelteBracketNewLine`).
  - **`sortImports`** — sort imports inside embedded `<script>` (accepts `true` or
    the full oxfmt object form).
  - **`svelte.allowShorthand`** — set `false` to expand `name={name}` /
    `class:x={x}` / `style:x={x}` / `bind:x={x}` to the full form.
  - **`svelte.indentScriptAndStyle`** — set `false` to keep `<script>` / `<style>`
    bodies flush instead of indented one level.
  - **`svelte.sortOrder`** — print the top-level sections in any permutation of
    `options`/`scripts`/`markup`/`styles`, or `none` to keep source order.

  `sortTailwindcss` remains unsupported (its ordering depends on the project's
  Tailwind stylesheet); `rsvelte-fmt` now prints a warning when it is set instead
  of silently dropping it.

## 0.3.20

### Patch Changes

- ba5916c: fmt: format `.json` / `.jsonc` / `.json5` in-process via `oxc_formatter_json`
  instead of delegating them to an `oxfmt` subprocess. It's the same engine `oxfmt`
  uses for JSON, so the output is byte-identical (verified 243/243 on a real-world
  corpus) while skipping the per-invocation `oxfmt` startup — a standalone JSON
  file now formats instantly on save, like `.ts`/`.js`/`.svelte` already do.

  `package.json` keeps going to `oxfmt`: it additionally runs through
  `sortPackageJson` (a key-ordering pass that lives in oxfmt, not oxc), so
  formatting it natively would diverge. Files matched by an `.oxfmtrc` override, or
  any JSON when the base `printWidth` exceeds the native max (320), also fall back
  to `oxfmt`, as do parse errors — so coverage never regresses. The native JSON
  path is gated by the same `--no-native-js` escape hatch.

## 0.3.19

### Patch Changes

- ebe80fa: fmt: ship the CLI as a native-direct binary, dropping the Node launcher from the
  hot path. A `postinstall` step now copies the platform-native `rsvelte-fmt`
  binary over the package's `bin/rsvelte-fmt`, so the package manager's
  `.bin/rsvelte-fmt` runs the binary directly — no per-invocation Node cold start
  (~200ms measured). The consumer's `oxfmt` launcher + Node interpreter, which the
  JS launcher used to pass via `--oxfmt-bin` / `RSVELTE_FMT_NODE`, are written to a
  `rsvelte-fmt.runtime.json` sidecar at install time and read by the binary.

  The JS launcher is kept as a fallback for when `postinstall` doesn't run
  (`--ignore-scripts`, package managers that gate build scripts, or Windows, which
  stays on the launcher) — same behavior as before, just slower. Output is
  unchanged (same formatter engine); this is purely a distribution/startup change.

  Consumers that gate install scripts (e.g. pnpm's `onlyBuiltDependencies`) should
  allow `@rsvelte/fmt` to get the native-direct speedup; otherwise the fallback
  launcher is used.

- 2e87e1c: fmt: format `.ts`/`.js` files in-process via `oxc_formatter` instead of
  delegating them to an `oxfmt` subprocess. It's the same engine `oxfmt` uses for
  these files, so the output is byte-identical (verified 1496/1496 on a real-world
  corpus), while skipping the per-invocation `oxfmt` Node startup. CSS / Markdown /
  YAML / JSON stay delegated to `oxfmt` (those are a separate, prettier-based
  engine).

  `.oxfmtrc` `overrides` are now parsed and resolved per file, so each file is
  formatted at the same options `oxfmt` would apply. An override `printWidth`
  larger than `oxc_formatter` can represent (320) — e.g. a "never wrap" `1000` — is
  delegated to `oxfmt` (which honors it) to stay byte-identical. Files `oxc` can't
  parse fall back to `oxfmt`, so coverage never regresses, and `--no-native-js` is
  an escape hatch.

- b1b9f02: fmt: format inline `<style>` blocks through a warm oxfmt daemon (POSIX) instead
  of spawning `oxfmt` per block. Spawning paid a Node cold start (~370ms measured)
  every time a changed `<style>` block was re-formatted — the dominant cost of
  format-on-save once `.svelte`/`.ts`/`.js` moved in-process. A long-lived daemon
  (`daemon.mjs`, shipped in the package) keeps oxfmt loaded; the binary connects
  over a Unix socket and gets each block back in ~ms (~370ms → ~5ms warm).

  The daemon is deliberately "dumb": the Rust side resolves the per-block oxfmt
  options (base `.oxfmtrc` + the block's print width) and sends them inline, so the
  daemon never reads config files or applies `overrides` — its output is
  byte-identical to the spawn path (verified 555/555 on a real-world `.svelte`
  corpus, daemon vs spawn). Any failure (no Node, no bundle, connect/spawn/protocol
  error) falls back to spawning `oxfmt`, so correctness never depends on it; Windows
  stays on the spawn path. `RSVELTE_FMT_NO_DAEMON=1` forces the spawn path.

  The daemon is version-keyed by oxfmt fingerprint + protocol version (an oxfmt
  upgrade starts a fresh one), idle-exits after 60s, and handles concurrent
  invocations (e.g. `pnpm -r`) on one instance. Directory delegation stays a single
  `oxfmt` invocation — oxfmt already parallelizes its own directory walk there, so
  routing it per-file through the daemon would be slower, not faster.

## 0.3.18

### Patch Changes

- b72a96d: fmt: narrow a wrapped `class:NAME={EXPR}` directive value by its `class:NAME=`
  prefix, like `style:` / `on:` / `use:` already do (#795). When the open tag
  wraps and the directive's full line overflows the print width, its value now
  breaks at the right operator instead of staying flat past the margin.
- b72a96d: fmt: don't insert a blank line between a comment and the `<style>` / `<script>`
  it leads. The section-reorder pass treated a markup gap that ended with a
  comment glued to the next section (e.g. `</div>\n<!-- … -->\n<style>`) as one
  markup unit, then joined it to the section with a blank line — pushing the
  comment away from the tag it documents. The trailing comment run is now split
  off and attached to the section as its leading comment, so the blank line falls
  before the comment (matching prettier-plugin-svelte / oxfmt). UTF-8 safe for
  multi-byte markup text.

## 0.3.17

### Patch Changes

- b6a2ea7: fmt: fix inline `<style>` blocks being mangled in the file (`--write` / `--check`)
  path. The batched style pipeline records each raw `<style>` body and emits a
  single-line placeholder during the format pass, then formats every body in one
  `oxfmt` call and splices the results back. The splice was a plain string
  replace, so the in-process formatter's re-indentation never reached the
  multi-line CSS: every line after the first stayed at column 0 and `oxfmt`'s
  trailing newline leaked in as a blank line before `</style>`. On a real corpus
  this diverged ~33% of components from the `--stdin` path (which re-indents
  correctly). The splice now re-indents with the same routine the single-file /
  stdin path uses, so both paths are byte-identical.

  The batch also formatted every `<style>` body at the base print width, so a
  column-sensitive long selector or value wrapped differently from `oxfmt` (which
  narrows by the block's indentation). Bodies are now grouped by their rendered
  width — one `oxfmt` call per distinct width — so wrapping matches the stdin path
  while still batching (nearly every block shares one width). The `<style>` cache
  key now includes the width so the same body at two indentations can't collide.

## 0.3.16

### Patch Changes

- 88da008: fmt: treat `<textarea>` as a verbatim whitespace-sensitive element, matching oxfmt 0.56

  oxfmt 0.56 formats `<textarea>` content as verbatim raw text (like the browser, where a textarea's text is literal). rsvelte-fmt now matches: the open tag's `>` always hugs the last attribute (never breaks onto its own line, which would inject a newline into the content), and the interior text is preserved unchanged rather than re-indented (tabs → spaces). This is paired with bumping the `oxfmt` oracle dependency to ^0.56.0.

## 0.3.15

### Patch Changes

- 40b683f: Fix the collapse/markup layout path hardcoding 2-space indentation: the Doc-IR
  print unit and the space-count→indent-level conversion now honor the configured
  `indentWidth`/`indentStyle` (4-space, tabs, etc.) instead of assuming 2 spaces.
  Previously, fill-wrapped prose and hugged inline elements were re-indented at the
  wrong column for any non-default indent setting. Byte-identical for the default
  2-space config (0 corpus regressions); adds 4-space and tab regression tests.
- 5e2fafb: Drive the formatter-parity corpus (rsvelte-fmt vs the `oxfmt(svelte:true)` =
  prettier-plugin-svelte oracle) from 295 known failures down to a small residual,
  with no regressions. Completes large parts of the prettier-plugin-svelte HTML
  child-layout port onto the Doc IR (open-tag `dedent(softline)`, pure-text prose
  word-fill via `Doc::Fill`, wrappable self-closing components, prose-fill
  component bodies, re-hugging inline elements whose open tag already wrapped,
  `blockElements` alignment) and improves embedded-JS formatting (`{@render}`/
  `{@html}` object-arg wrapping, declaration-tag formatting, `{#each}`/`{#if}`
  block-header wrapping, `<script>`/`<style>` open-tag attribute wrapping) via
  correct width/column accounting. Also fixes several correctness bugs: preserve
  TypeScript `as` casts in spread attributes, keep leading comments in function
  bindings, and keep inline self-closing components in prose runs. Genuine
  prettier-plugin-svelte/oxfmt oracle bugs (which corrupt source) and out-of-scope
  inputs are excluded from the parity oracle and documented in
  `docs/fmt-oracle-bugs.md` for upstream filing.
- 96b92fb: Formatter-parity corpus reaches 0 known failures (from 295): every in-scope
  component across sveltejs/svelte + svelte.dev + bits-ui/flowbite/melt/shadcn now
  formats byte-identically to the `oxfmt(svelte:true)` oracle, with 23 principled
  documented exclusions (oracle bugs that corrupt source, oxc/prettier engine
  divergences, invalid input, migrate, and one oxfmt cross-platform
  non-determinism case). See `docs/fmt-oracle-bugs.md` + `docs/corpus-fmt-remaining-work.md`.
- df144a3: Formatter-parity: byte-parity for nested inline `<span>` highlighting inside
  `<pre><code>` (`code-viewer`), via the `<pre>` verbatim re-indent subsystem
  (text-only span collapse + sibling-span pack/unpack/overflow-split). `<pre>`
  content is whitespace-verbatim, so it is handled by string-level re-indentation
  by design (the documented exception to the Doc-IR element-layout rule); a faithful
  Doc-IR `printPre` refactor remains tracked in `docs/corpus-fmt-remaining-work.md`.
  Known-failures: 2 → 1.

## 0.3.14

### Patch Changes

- f06709c: Improve Svelte-structure formatting parity with prettier-plugin-svelte: strip
  quotes around single-mustache attribute values (`attr="{expr}"` → `attr={expr}`),
  reorder top-level sections into canonical order (`svelteSortOrder`: options →
  module script → instance script → markup → styles), and trim child boundary
  whitespace for components and block elements while keeping an edge space for
  inline/custom elements. Verified by the new full-corpus formatter-parity gate
  (`scripts/compat-corpus` fmt track).
- eea9a5a: Fix a regression where a `{@const}` tag carrying a TypeScript type annotation
  (`{@const name: Type = value}`, e.g. an exhaustiveness check
  `{@const _: never = column}`) failed with `script parse failed`. The collapse
  path was formatting the tag body as a bare expression (`(name: Type = value);`),
  which is not valid; it is now formatted as the TS variable declaration it
  actually is (`const name: Type = value;`) using the same TS-aware parse path as
  `<script lang="ts">`, so the type annotation is parsed and preserved.

## 0.3.13

### Patch Changes

- 359c84d: perf(fmt): hand inline `<style>` blocks to oxfmt as a directory, not N explicit paths (#707)

  On a cold run (cache miss — first run, or CI without a persisted cache) the batched inline-`<style>` pass staged every extracted CSS body into a temp dir and invoked `oxfmt s0.css s1.css … sN.css` with one explicit path per block. A multi-hundred-entry argv defeats oxfmt's parallel directory walk (and at scale risks `ARG_MAX`), making the cold path slower than it needs to be.

  `rsvelte-fmt` now passes the staging directory itself (`oxfmt <dir>`) and reads the results back by their known `s{i}` names. The staging dir holds only our files and is cleared before each batch, so the walk formats exactly the set we read back. Output is byte-identical — same `oxfmt`, same forced `-c` config — and warm runs are unchanged (still served from the `<style>` cache). The two oxfmt subprocesses (non-`.svelte` delegation and the CSS batch) already overlap via `rayon::join`.

## 0.3.12

### Patch Changes

- d5db8ae: fix(fmt): reach byte-for-byte parity with the `oxfmt(svelte: true)` oracle across the entire svelte.dev corpus (1103/1103). Markup-layout fixes: fill fragment-level inline prose runs (pure text and one-line inline elements) that overflow; hug a block's single inline-element body (`{#each …}<span>…</span>{/each}`); wrap an overflowing content mustache inside `<pre>`/`<textarea>`; member-chain-break a hugged element's overflowing trailing mustache; glue a hugged inline child to a wrapped open tag's last attribute; format `<pre>`/`<textarea>` block content (space-indented bodies + embedded JS, element-direct whitespace kept as tabs) and hug pure-text components. Correctness fixes: preserve raw entities in attribute values (no longer decode `&quot;` → `"`, which corrupted the markup); make the collapse re-parse best-effort instead of fatal; fall back to the TypeScript parser for a `<script>` without `lang="ts"` that uses TS-only syntax.
- d5db8ae: test(fmt): add the svelte.dev formatter parity corpus. A new test suite formats every `.svelte` file and every ` ```svelte ` markdown code block from the `svelte.dev` repo (added as a submodule) and asserts byte-for-byte equality with an `oxfmt(svelte: true)` oracle — `prettier-plugin-svelte` for the Svelte structure plus the oxc engine for embedded JS/CSS, the same layering rsvelte-fmt uses — so diffs isolate rsvelte's Svelte-structure formatting. A third stage runs the `rsvelte-fmt` CLI on whole markdown files vs a direct-oxfmt oracle to guard `.md` delegation. Oracle outputs are precomputed by `pnpm run generate-fmt-corpus` (gitignored, CI-cached by svelte.dev SHA); the suites track progress against committed baselines (`tests/fmt_corpus_baseline.txt`, `tests/fmt_corpus_markdown_baseline.txt`) and fail only on new regressions. Initial: Stage 1+2 726/1148, Stage 3 638/638.

## 0.3.11

### Patch Changes

- 4ce4926: fix(fmt): locate the `<script>` opening-tag terminator with a quote-aware scan so a `>` inside an attribute value no longer corrupts body extraction. A `<script lang="ts" generics="T extends Record<string, unknown>">` has a literal `>` inside the `generics` attribute value; the naive `block.find('>')` in `body_span` matched that one first and started the body slice mid-attribute, so oxc parsed garbage and reported a spurious `Unexpected token` — leaving the whole file unformatted. `find_open_tag_end` now skips any `>` that appears inside single- or double-quoted attribute values, terminating the open tag at the real unquoted `>`. Closes #946.

## 0.3.10

### Patch Changes

- aff27c5: test(fmt): lock `<script>` long type-argument wrapping to oxfmt parity (#761). The `<script>`-body reflow divergence in #761 (e.g. a long `type … = Awaited<ReturnType<…>>;` kept on one line instead of breaking its outer type-argument list) was an `oxc_formatter` digest skew, already aligned across the workspace in #771. This adds a regression test pinning the now-matching output at the pinned rev so a future digest bump that regresses the wrapping is caught. Closes #761.

## 0.3.9

### Patch Changes

- b26d4f0: fix(fmt): wrap attribute-value expressions by their rendered column, not column 0. Attribute and directive values were formatted at column 0 with the full print width, so a value that fits at column 0 but overflows once the open tag wraps and the attribute renders at its nesting indent stayed inline — diverging from prettier-plugin-svelte, which narrows the value's print width by the attribute's nesting depth. The open-tag rewrite now threads the attribute depth (`depth + 1`) into every value formatter (`render_attribute` → `render_attribute_node` / directive / spread / sequence paths) via a new `format_attribute_value_expression`, so e.g. a long `config={{ … }}` object now breaks across lines (with the existing `render_multi_line` reindent owning the continuation columns) exactly like oxfmt. This is sub-case (a) of #795 (the depth-unaware wrap decision, ~69 of 110 divergent files). Sub-case (b) — the Svelte-5 function-binding `bind:value={getter, setter}` softline brace shape — is left for a follow-up: it needs reconciling oxc's sequence-continuation indent with prettier's, which is a separate change. Partially addresses #795.
- c547af9: fix(fmt): break the braces of a multi-line Svelte 5 function binding and drop its outer parens (#795 sub-case b). A function binding `bind:value={getter, setter}` parses as a top-level sequence expression, so it previously went through the generic mustache-sequence path that re-adds the outer parens (`bind:value={(getter, setter)}`, kept for `{(a, b)}` content — #799) and hugged the braces on one line. prettier-plugin-svelte instead prints a function binding _without_ the parens and, when the members don't fit on the attribute line (or a member is itself multi-line, e.g. a block-bodied setter), breaks the `{` / `}` onto their own lines with each member indented one level:

  ```svelte
  <TextInput
    bind:value={
      () => model.x ?? '',
      (value) => {
        model.x = value;
      }
    }
  />
  ```

  A new `format_function_binding` in `crate::expression` detects the top-level sequence on a `bind:` directive, formats each member individually (so no outer parens), and either keeps the binding inline (`bind:value={a, b}`) when it fits or emits the broken-brace shape, which the existing open-tag `render_multi_line` reindent then pushes out to the attribute column. Closes #795.

- cfc2fa6: fix(fmt): remove an unused `format_expression_source` import in `markup.rs`. The dead import had no effect on formatter output, but the CI build runs with `RUSTFLAGS=-Dwarnings`, which promotes the `unused import` warning to a hard compile error and broke the Clippy, Documentation, and Test jobs on `main`. Dropping the import restores a clean build.

## 0.3.8

### Patch Changes

- c9303b5: fix(fmt): place the `>` correctly when a wrapped element has whitespace-sensitive inline content. When an element's open tag wraps to the multi-line shape, `render_multi_line` always emitted the closing `>` on its own line at the outer indent. For an element whose children are whitespace-sensitive inline content (e.g. text directly touching the tag, `>x</button>`), moving the `>` to its own line injects significant whitespace before the text — so prettier-plugin-svelte instead keeps the open `>` glued to the last attribute (`}}>x`) and breaks the _closing_ tag's `>` onto its own line (`</button\n>`). rsvelte now mirrors that: `push_open_tag` reports whether it wrapped, and the open `>` hugs / close `>` breaks when the content is non-whitespace-adjacent to the tag. Block content (children on their own line, whitespace before/after) is unaffected. Closes #798.
- dcc2134: fix(fmt): keep the outer parentheses of a top-level sequence (comma) expression in a mustache, matching prettier-plugin-svelte. `oxc_formatter` intentionally re-adds the outer parens of a top-level `SequenceExpression` (its `NeedsParentheses` impl returns true for an `ExpressionStatement` parent), and prettier-plugin-svelte keeps them — but `format_expr_core` then unconditionally ran `strip_outer_parens`, peeling the parens oxc had just added. So `{((ref = cond ? a : undefined), '')}` was emitted as `{(ref = cond ? a : undefined), ''}`. The strip is now skipped when the parsed top-level expression is a `SequenceExpression`; every other expression keeps the existing redundant-paren strip (`{(a + 1)}` → `{a + 1}` is unchanged). Because the fix lives in the shared `format_expr_core`, it also covers sequences in attribute values, directives, and block headers. Closes #799.
- 9d936d8: fix(fmt): break a long `{#snippet}` parameter list across lines like a function signature. `{#snippet name(params)}` parameters were spliced one-at-a-time and each forced onto a single line (`Expand::Never` + max width), so a long destructured/typed parameter list never wrapped — unlike prettier-plugin-svelte, which prints the snippet header as a function signature and breaks it by print width. The whole header `name<…>(params)` is now formatted as one `function name<…>(params) {}` unit with normal width-driven breaking (narrowed by the markup depth and the `{#snippet ` prefix), then reindented to the snippet's depth. The other block headers (`{#each}` / `{#await}` / `{#if}` / `{#key}`) still stay single-line — only `{#snippet}`, whose `{/snippet}` delimiter makes a multi-line header safe, breaks. Closes #797.

## 0.3.7

### Patch Changes

- 553a26e: Keep a `<script>` body indented after a regex literal that contains quotes.

  The body is formatted at indent 0 then re-indented one level under `<script>`. The re-indent scanner tracks string / comment / template context to avoid misreading a quote or `${` that sits inside one, but it doesn't lex regex literals — so quotes inside a regex (`/["']x/`) opened a string that never closed. The spuriously-open string then swallowed every following newline, and the rest of the body collapsed to column 0 (idempotent and still valid JS, so earlier break/idempotency checks didn't catch it; it surfaced as an `oxfmt` divergence). The scanner now treats a raw newline inside a string as a desync and recovers at the line boundary, so the body stays correctly indented.

  The attribute-value re-indent in `markup.rs` carried a byte-for-byte copy of the same scanner (with the same latent bug); it now shares the fixed `reindent` helper instead.

## 0.3.6

### Patch Changes

- 0a89cde: Wrap markup expressions by the column they render at, matching `prettier-plugin-svelte` (which `oxfmt` delegates `.svelte` to).

  Every JS expression was formatted at indent 0 and then spliced into the markup, so wrap decisions used the full print width regardless of nesting: a line that fit at column 0 silently overflowed once nested, and continuation lines stuck at column 0 instead of aligning to the nesting depth.
  - `<script>` bodies are narrowed by one indent level before formatting (the body is nested one level under `<script>`).
  - Content expressions (`{expr}`, `{@html}`, `{@render}`, `{@attach}`) thread the markup nesting depth through the walk, narrow the width by `depth × indentWidth`, and re-indent continuation lines to that depth.
  - Block-header expressions (`{#if}`, `{#each}`, `{:else if}`, `{#key}`, `{#await}`, snippet name) are forced onto a single line — `prettier-plugin-svelte` never breaks a block tag's expression regardless of width.

  On a 1,115-file Svelte corpus this brings `oxfmt`-divergent files from 180 to ~111, with zero idempotency breaks and zero `svelte` parse breaks. The remaining diffs are attribute-value wrapping, close-tag placement, and snippet-parameter expansion, tracked for follow-up.

## 0.3.5

### Patch Changes

- bde55be: chore(deps): align all workspace `oxc` / `oxc_formatter` / `oxc_formatter_core` git deps to a single newer revision (71e489a). The split renovate bumps (#675/#676) fail CI because they move only `oxc_formatter`, leaving the ~15 other workspace `oxc` crates on the old revision — producing a duplicate `oxc_allocator` and an `E0308` mismatch. Unifying every `oxc` dep to the same revision fixes that; verified compiler-safe (compatibility report passes) and formatter-safe (all fmt fixtures pass). Step toward oxfmt parity for `<script>` formatting (refs #761).

## 0.3.4

### Patch Changes

- 63d31a2: Decide open-tag attribute wrapping by visual (East Asian) width, matching `oxfmt` / prettier.

  `visual_width` counted bare `chars()`, so CJK-heavy tags were under-measured: fullwidth text (Japanese, fullwidth punctuation, …) is two display columns each but counted as one, so a tag that exceeded `printWidth` on screen stayed on a single line instead of wrapping. Width is now measured with `unicode-width`, so an attribute list whose visual width crosses `printWidth` wraps one-per-line as `oxfmt` does.

  On a 1,115-file Svelte corpus this brings oxfmt-divergent files from 208 to 179. (The remaining attribute diffs are expression wrapping _inside_ attribute values, which is `oxc_formatter`-driven and tracked in #761.)

## 0.3.3

### Patch Changes

- f680806: Keep `{:else if}` branches at the same indent as the opening `{#if}`, matching `oxfmt` / prettier-plugin-svelte.

  svelte desugars `{:else if}` into an `elseif` `IfBlock` nested inside the alternate fragment. Both the whitespace re-indent pass (`indent.rs`) and the open-tag pass (`markup.rs`) recursed into that nested block, adding one extra indent level per chained branch — so `{:else if}` / `{:else}` bodies (and their wrapped attributes) drifted one level deeper than `oxfmt` on every chain. They now follow the chain at the opening `{#if}`'s depth. A plain `{:else}` whose body merely starts with an `{#if}` is unaffected (it still nests one level deeper).

  On a 1,115-file Svelte corpus this brings oxfmt-divergent files from 264 to 208.

## 0.3.2

### Patch Changes

- 9de2073: Match `oxfmt` / prettier-plugin-svelte for `<style>` indentation and blank lines, so `rsvelte-fmt` output round-trips through `oxfmt --check`.
  - **`<style>` re-indentation**: the formatted CSS body is now re-indented one level under the `<style>` tag and placed on its own lines, instead of being glued onto the open tag (`<style>.foo {`). The body is dedented before formatting so repeated runs stay idempotent (multi-line comments / strings no longer accumulate indentation).
  - **Blank lines**: a single blank line is now preserved between markup siblings and where markup abuts the root `<script>` / `<style>` (the conventional blank line after `</script>`). Runs of blank lines collapse to one, and leading/trailing blanks just inside an element are removed.

  On a 1,115-file Svelte corpus this cut the files that differ from `oxfmt` from 1,095 to 270 (the remainder is `<script>`/markup divergence tracked separately), with zero parse failures and full idempotency.

## 0.3.1

### Patch Changes

- 193e184: fix(release): sync the Rust crate version into `crates/rsvelte_fmt/Cargo.toml` (and `Cargo.lock`) during the release, so `rsvelte-fmt --version` matches the published `@rsvelte/fmt` package instead of reporting a stale `0.1.0`. `sync-version.mjs` previously only mirrored `@rsvelte/compiler` → `rsvelte_core`; it now also mirrors `@rsvelte/fmt` → `rsvelte_fmt` (#745)

## 0.3.0

### Minor Changes

- 151fe49: Respect `.gitignore`, `.prettierignore`, and `.oxfmtrc` `ignorePatterns` when discovering `.svelte` files, matching `oxfmt` (which already honors them for the non-`.svelte` files it walks).

  Previously the in-process Svelte walker only skipped a hardcoded set of directories (`node_modules`, `target`, `dist`, `build`, hidden dirs), so `.svelte` files excluded by these ignore sources — e.g. test fixtures listed in `.oxfmtrc` `ignorePatterns` — were still reformatted. The walker now uses the `ignore` crate with the same gitignore semantics as `oxfmt`, and `OxfmtConfig` parses `ignorePatterns`, so `rsvelte-fmt .` and `oxfmt .` skip exactly the same `.svelte` files.

## 0.2.1

### Patch Changes

- 12dc81e: perf(fmt): hand inline `<style>` blocks to oxfmt as a directory, not N explicit paths (#707)

  On a cold run (cache miss — first run, or CI without a persisted cache) the batched inline-`<style>` pass staged every extracted CSS body into a temp dir and invoked `oxfmt s0.css s1.css … sN.css` with one explicit path per block. A multi-hundred-entry argv defeats oxfmt's parallel directory walk (and at scale risks `ARG_MAX`), making the cold path slower than it needs to be.

  `rsvelte-fmt` now passes the staging directory itself (`oxfmt <dir>`) and reads the results back by their known `s{i}` names. The staging dir holds only our files and is cleared before each batch, so the walk formats exactly the set we read back. Output is byte-identical — same `oxfmt`, same forced `-c` config — and warm runs are unchanged (still served from the `<style>` cache). The two oxfmt subprocesses (non-`.svelte` delegation and the CSS batch) already overlap via `rayon::join`.

## 0.2.0

### Minor Changes

- 3194b85: perf(fmt): cache formatted inline `<style>` blocks to skip the oxfmt round-trip (#703)

  Inline `<style>` CSS is delegated to `oxfmt` (for byte-identical output parity with standalone `.css`), which means staging the body and a subprocess round-trip — the dominant cost when formatting a real `.svelte` tree. Most `<style>` bodies are already canonical on a re-run, so this work was repeated every invocation.

  `rsvelte-fmt` now keeps an on-disk content-addressed cache of formatted `<style>` results, keyed by the oxfmt version (binary fingerprint), the resolved `.oxfmtrc`, and the exact body. Unchanged blocks are served from cache and skip `oxfmt` entirely; only cache misses reach the batched oxfmt call. Cache hits are byte-identical to a fresh format, so output is unchanged.

  On a warm cache the inline-`<style>` overhead effectively disappears (in a local 343-block check, the run dropped from ~0.37s to ~0.17s; on larger real corpora the saved oxfmt round-trip is proportionally bigger). Cold runs add only the cost of writing cache entries.

  The cache is on by default. Disable it with `--no-style-cache` or `RSVELTE_FMT_NO_CACHE`; relocate it with `RSVELTE_FMT_CACHE_DIR` (defaults to the platform cache dir, e.g. `~/.cache/rsvelte-fmt`).

### Patch Changes

- 4ffd1de: fix(fmt): don't re-indent multi-line template-literal interiors in attribute values (#698)

  A multi-line template literal passed as an **attribute value** (e.g. `text={` … `}`) had its interior lines re-indented to the markup nesting level on every format pass. Because template-literal whitespace is part of the runtime string, this both **mutated the string value** and was **non-idempotent** — every pass added another indent level so the formatter never reached a fixed point. This was a residual of the #692 multi-line attribute re-indentation fix.

  `reindent_continuation` in `rsvelte_formatter`'s open-tag rewriter now uses a template-literal-aware scanner (mirroring the `reindent_body` scanner added for #686): it tracks template-literal / `${ … }` nesting plus string and comment context, and leaves lines that begin inside template-literal quasi text verbatim. Code inside `${ … }` substitutions is still re-indented as ordinary code.

## 0.1.5

### Patch Changes

- 0f599e1: fix(fmt): re-indent multi-line attribute expressions to the markup nesting level (#692)

  A multi-line expression inside an element attribute (a multi-line arrow handler, a `bind:` getter/setter pair, …) was not re-indented to its position in the markup tree: the delegated expression formatter emits at column 0, so continuation lines collapsed toward column 0–2 instead of aligning under the attribute. The output was valid and idempotent, but visually broken — and a large share of the structural churn when adopting rsvelte on a real component tree.

  Two changes in `rsvelte_formatter`'s open-tag rewriter:
  - A multi-line attribute value now forces the multi-line tag layout (each attribute on its own line). Previously a short-by-char-count value with embedded newlines was treated as fitting on one line.
  - In the multi-line layout, every continuation line of an attribute value is re-indented to the attribute column, so a multi-line `onclick={() => { … }}` / `bind:expanded={getter, setter}` aligns under the attribute and its closing `}}` sits at the attribute indent.

- 0f599e1: fix(fmt): honor `.oxfmtrc` in inline `<script>`/`<style>` and cover the full oxfmt file set on directories (#693, #694)

  Two formatter fixes for using `rsvelte-fmt` as a drop-in project formatter:
  - **#693 — inline blocks now respect the project `.oxfmtrc`.** Standalone files delegated to `oxfmt` already discovered the config, but inline `<script>` blocks (formatted in-process by `oxc_formatter`) and inline `<style>` blocks (staged in a temp dir, out of reach of oxfmt's own cwd discovery) were formatted with defaults — so e.g. `singleQuote: true` was ignored and every string in a component flipped to double quotes. `rsvelte-fmt` now resolves `.oxfmtrc.json` / `.oxfmtrc.jsonc` (upward from the working directory, or via a new `--config`/`-c` flag) and applies it to inline blocks: `singleQuote`, `semi`, `printWidth`, `tabWidth`, `useTabs`, `trailingComma`, `quoteProps`, `arrowParens`, `bracketSpacing`, `bracketSameLine`, and `endOfLine` now match standalone files. Explicit `--print-width` / `--tab-width` / `--use-tabs` flags still win.
  - **#694 — directories now cover the full oxfmt-supported set.** The walker hard-coded 9 extensions, silently skipping `.md` / `.yaml` / `.toml` / `.html` (and anything else oxfmt supports), so `rsvelte-fmt .` formatted strictly fewer files than `oxfmt .`. Directory inputs are now delegated whole to a single `oxfmt` invocation (with a `!**/*.svelte` exclude so the in-process Svelte pass keeps those, and `--no-error-on-unmatched-pattern` so a Svelte-only tree is a clean no-op). Coverage now matches `oxfmt .` and is `.gitignore`-aware, while the two passes still run in parallel.

## 0.1.4

### Patch Changes

- 31feab0: perf(fmt): batch all `<style>` blocks into a single `oxfmt` call (~23× faster on style-heavy trees)

  Formatting a tree of `.svelte` files spawned `oxfmt` once per `<style>` block. Because the consumer's `oxfmt` is a Node launcher, every spawn paid a fresh Node cold start (~26ms measured), which dominated wall-clock — on a 200-file corpus, style delegation was 99.8% of the runtime (8.1s, vs 9ms for the pure-Svelte formatting).

  `rsvelte-fmt` now formats every file in parallel with a _collecting_ style callback that records each `<style>` body and returns a placeholder, runs **one** batched `oxfmt` invocation over all of them (the same "many paths, one process" path already used for non-`.svelte` files), and substitutes the results back. The `rsvelte_formatter` library is unchanged — this is entirely in the CLI.

  Measured 23× faster (8.1s → 0.35s) on a 200-file `<style>`-heavy corpus, with byte-identical output. The single-file stdin path is unchanged.

## 0.1.3

### Patch Changes

- cd6a6bc: fix(fmt): snippet param lists, open-tag comments, and template-literal re-indentation (#684, #685, #686)

  Three formatter bugs found via a real-monorepo corpus pass:
  - **`{#snippet}` parameter lists (#684):** snippet parameters are ordinary
    (TS) function parameters, but they were routed through the destructuring
    pattern path (`let <pattern> = …`). Optional params (`x?: T`) errored
    (`Optional declaration is not allowed here`, exit 2), default values
    (`x: T = v`) errored (`Cannot assign to this expression`, exit 2), and a
    typed default (`items: string[] = []`) silently leaked the internal
    `__rsvelte_fmt_rhs__` sentinel into the output (exit 0, invalid Svelte).
    Snippet params now format through a real function parameter list
    (`function f(<param>) {}`), so optional markers, type annotations, and
    default values all round-trip.
  - **Open-tag comments dropped (#685):** a `//` line comment (or `/* … */`)
    placed between attributes inside an element's start tag was silently
    deleted, because the open-tag rewrite rebuilt the tag from the attribute
    list alone. Comments in the open tag are now collected and interleaved
    with the attributes in source order; a line comment forces the multi-line
    tag shape (it can't share a line with the closing `>`).
  - **Template-literal re-indentation (#686):** re-embedding the formatted
    `<script>` re-indented every line — including the interior of multi-line
    template literals, whose whitespace is part of the string value. That both
    mutated the embedded string and made formatting non-idempotent (each pass
    added another indent level). The re-embed step now skips lines that begin
    inside template-literal quasi text, so the string value is preserved and
    formatting is a fixed point.

## 0.1.2

### Patch Changes

- 3d87277: fix(fmt): preserve `{name}` shorthand attributes, parse template expressions as TypeScript, and drop the unsupported `oxfmt --stdin` flag (#679, #680, #682)

  Three formatter bugs that together blocked formatting most real `.svelte` files:
  - **Shorthand attribute corruption (#679):** a `{name}` shorthand attribute's
    `ExpressionTag` spans only the identifier (matching upstream `start: id.start,
end: id.end`), with no surrounding braces. The formatter unconditionally
    sliced one byte off each end of the span, so `{width}` was silently rewritten
    to `width={idt}` and the 1-char `{x}` to `x={}` — undefined-identifier
    references emitted with exit 0. Brace-stripping now only happens when braces
    are actually present at the span boundaries, so `{name}` round-trips verbatim.
  - **`oxfmt --stdin` rejected (#680):** inline `<style>` blocks were delegated to
    `oxfmt --stdin --stdin-filepath inline.css`, but oxfmt 0.49.0+ has no
    `--stdin` flag and exits non-zero (`--stdin is not expected in this context`),
    failing every file with a `<style>` block (exit 2). oxfmt reads stdin
    implicitly given `--stdin-filepath`, so the `--stdin` flag is dropped from both
    oxfmt invocations.
  - **Template expressions parsed as JS, not TS (#682):** mustache `{…}`,
    attribute, and directive expressions were always parsed as plain JavaScript,
    even in a `<script lang="ts">` component. TS-only syntax (`as` / `satisfies` /
    non-null `!` / `as const` / type-arg casts) errored with TS8016 (exit 2) and a
    generic call `fn<T>(a)` silently miscompiled to the comparison `fn < T > a`.
    Template source is now parsed in the same dialect as the `<script>` body. For
    directive values the parser narrows a cast down to its inner identifier (so
    `bind:value={value as string}` was collapsing to `bind:value`, dropping the
    cast), so directive values are now sliced from the brace source rather than
    the bare AST node.

## 0.1.1

### Patch Changes

- 6994f59: fix(fmt): preserve markup after a `<script>` block and stop the self-closing close-tag panic (#669)

  A self-closing / void element (`<span />`, `<path />`) after a leading
  `<script>` block was corrupted: the close-tag detector scanned backward for any
  `</` and matched the preceding `</script>`, emitting a bogus edit over the
  script-close plus the markup in between. One such element silently dropped the
  markup (exit 0); two or more siblings produced overlapping edits that panicked
  with a slice out-of-bounds.

  `find_close_tag_span` is now strict — the close tag must be the text immediately
  ending at the element (`<`, `/`, tag name, optional whitespace, `>`) — so
  self-closing/void elements yield no edit while genuine `</tag>` close tags still
  normalize. The Node CLI wrapper also now propagates native signal terminations
  (e.g. SIGABRT from a panic) as a non-zero exit instead of reporting exit 0.
