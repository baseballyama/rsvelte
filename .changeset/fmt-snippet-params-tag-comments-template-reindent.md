---
"@rsvelte/fmt": patch
---

fix(fmt): snippet param lists, open-tag comments, and template-literal re-indentation (#684, #685, #686)

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
