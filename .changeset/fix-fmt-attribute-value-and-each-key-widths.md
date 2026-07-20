---
"@rsvelte/fmt": patch
---

fix(formatter): correct attribute-value and each-key break widths

Five width/layout divergences from prettier-plugin-svelte, each found by the
formatter-parity corpus (baseline 74 → 55 known failures, 0 regressions across
12,657 components):

- **Nested attribute-value interiors were over-narrowed.** A multi-line shallow
  attribute value was re-formatted at the print width minus the full `name={`
  prefix, but that prefix only shifts the first line — deeply nested interiors
  broke earlier than the oracle. The prefix-narrowed pass is now adopted only
  when it actually changes the first line.
- **Expression-bodied arrow directive values never broke.** The overflow width
  for `on:keypress={(e) => cond && fn(e)}` was computed as
  `prefix - indent_width`, which equals the arrow's own one-line length, so the
  break was never triggered. It now uses the minimal-break width.
- **An interpolation starting at or past the print width stayed inline.** A
  trailing `{cond ? a : b}` in a long `class="…"` is now broken when its
  expression is breakable; atoms are unaffected.
- **Interpolation-led multi-line string values were re-indented.** Newlines that
  all sit between interpolations (`viewBox="{a}\n {b}\n {c}"`) are literal HTML
  and are now emitted verbatim.
- **A broken `{#each … (key)}` method chain landed at the wrong column.** Such a
  key is now reindented to the block depth, sharing the each-iterable path's
  method-chain gate so expanded-call-argument keys keep their own form.
