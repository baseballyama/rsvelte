---
"@rsvelte/fmt": patch
---

fix(fmt): don't re-indent multi-line template-literal interiors in attribute values (#698)

A multi-line template literal passed as an **attribute value** (e.g. `text={` … `}`) had its interior lines re-indented to the markup nesting level on every format pass. Because template-literal whitespace is part of the runtime string, this both **mutated the string value** and was **non-idempotent** — every pass added another indent level so the formatter never reached a fixed point. This was a residual of the #692 multi-line attribute re-indentation fix.

`reindent_continuation` in `rsvelte_formatter`'s open-tag rewriter now uses a template-literal-aware scanner (mirroring the `reindent_body` scanner added for #686): it tracks template-literal / `${ … }` nesting plus string and comment context, and leaves lines that begin inside template-literal quasi text verbatim. Code inside `${ … }` substitutions is still re-indented as ordinary code.
