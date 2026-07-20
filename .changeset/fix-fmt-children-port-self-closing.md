---
"@rsvelte/fmt": patch
---

fix(formatter): keep self-closing tags self-closed and widen the children port

`build_element_doc` had no self-closing branch, so every empty element it printed
came out as `<path …></path>`. A corruption guard caught the rewrite and threw the
port's whole layout away, which is why SVG-bearing elements silently fell back to
the compact string path instead of prettier's hug/dangle form. prettier's
`isSelfClosingTag` branch is now ported (including its `dedent(line)` trailer, so
`/>` keeps its leading space when flat), and `didSelfClose` is read from the text
rather than approximated, so `<div />` and `<div></div>` stay distinct.

Alongside it, the children-port gate accepts three more shapes — element-only
child runs, flow-block children, and whitespace-separated flow-block children —
and `{#if}` / `{#each}` / `{#key}` bodies are built as Docs instead of being
carried verbatim, which retires the "body already fits" freeze heuristic that
previously stood in for real layout.

Two independent printer bugs surfaced and were fixed on the way:

- `fits` returned false whenever a `Doc::BreakParent` reached it via the rest
  stack, vetoing a following sibling's group even though the enclosing group was
  already broken. prettier's `fits` has no such case; `propagate_breaks` now
  consumes the sentinel.
- `with_pre_content` restored its thread-local by hand, so a panic inside the
  re-entrant `<pre>` format left the flag set. Since callers run `format` under
  `catch_unwind` on rayon workers, that silently suppressed the port for every
  later file on the same worker. It is an RAII guard now, with a regression test.
