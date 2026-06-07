# @rsvelte/fmt

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
