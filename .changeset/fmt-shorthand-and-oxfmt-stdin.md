---
"@rsvelte/fmt": patch
---

fix(fmt): preserve `{name}` shorthand attributes, parse template expressions as TypeScript, and drop the unsupported `oxfmt --stdin` flag (#679, #680, #682)

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
