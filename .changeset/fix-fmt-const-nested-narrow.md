---
"@rsvelte/fmt": patch
---

fix(fmt): don't over-break deeply-nested `{@const}` continuation lines

`format_const_declaration` narrowed the whole declaration body by `lead + 2` to
account for the `{@const ` vs `const ` affix delta. That `+2` is only correct for
the FIRST line (rendered `{@const …}`); continuation lines (ternary branches, call
arguments, …) are re-indented to `lead` with no `{@const` prefix, so the extra `−2`
over-constrained them and broke a call/ternary one column too early where the
oracle keeps it inline. The body is now formatted at `full − lead` (correct for
continuation lines) and, only when the single-line result's real `{@const …}` tag
overflows, re-formatted at the tighter `full − lead − 2` — so single-line `{@const}`
output is unchanged while nested multi-line bodies wrap where prettier does.
