# @rsvelte/fmt

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
