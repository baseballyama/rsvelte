---
"@rsvelte/fmt": patch
---

fix(fmt): preserve `{name}` shorthand attributes and drop the unsupported `oxfmt --stdin` flag (#679, #680)

Two formatter bugs that together blocked formatting most real `.svelte` files:

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
