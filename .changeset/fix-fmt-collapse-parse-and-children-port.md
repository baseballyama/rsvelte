---
"@rsvelte/fmt": patch
---

fix(formatter): honour prettier-ignore in collapse, and fix two pass-skipping bugs

Three correctness fixes, plus the children-port work that exposed the first two:

- **`collapse` never consulted `prettier-ignore`.** `indent`, `markup` and
  `expression` all did; collapse alone reformatted content the author had marked
  as off-limits. It stayed hidden because the port bailed on block-display
  children before reaching such content. Both collapse traversals needed the
  guard — adding it to one was not enough.
- **The collapse re-parse skipped whole files.** It re-parses its own output, but
  its `ParseOptions` omitted `skip_non_css_lang_style`, which the main parse
  sets. A `<style lang="sass">` block therefore failed that re-parse and the
  entire collapse post-pass — every hug, dangle and children-port pass — was
  silently skipped for the file. Three further `ParseOptions` sites in the
  `<pre>` sub-parse path had the same drift, including a missing
  plain-then-TypeScript retry; a `<pre>` containing a top-level plain `<script>`
  with TypeScript syntax reproduced that one.
- **Inline-level children broke a block body's spaces.** The oracle only converts
  a block body's inline spaces to newlines for block-display children:
  `<Icon /> {label}`, `<br /> {label}` and `<input /> <Icon />` all stay on one
  line. The fit test now measures display width rather than counting chars, so a
  full-width character is not costed at half a column.

The children port also reaches two node kinds it previously discarded:
block-display elements (as `Child::Block`, the variant `print_children` already
implemented but nothing ever emitted) and Components (as `Child::Other`, pushed
bare — prettier's `isInlineElement`/`isBlockElement` both require a
RegularElement, so a Component is neither, but hugging still applies to it since
only block elements suppress it). An element preceded by prose on its own line is
no longer rejected for not starting the line.
