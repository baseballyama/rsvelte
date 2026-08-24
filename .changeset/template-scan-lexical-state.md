---
'@rsvelte/compiler': patch
---

Give the template-region scans the lexical state their `}` test needs

`<div {...{ t: "}" }}></div>`, `{#each [/}/.source] as n}` and `{'a\⏎b'.length}`
were all rejected. The official compiler accepts all three.

They are three hosts of one class — where a template expression is judged to
**end** — and each reaches a different scan, which is why they shipped together
and why fixing one says nothing about the others:

* The spread and shorthand attribute readers found their closing `}` with a bare
  depth counter (the comment above it said "Fast byte-level brace scanning"), so
  a `}` inside a string, regex, template literal or comment ended the attribute
  and the rest reached the JS parser as a truncated slice. Both now use
  `find_matching_bracket`, which has been comment- and string-aware since #2253.
* The `{#each}` and `{#await}` head scans had arms for strings, and the `{#each}`
  one for comments, but **neither had a regex arm** — and the `{#await}` scan had
  no comment arm at all. Telling `/re/` from a division needs the previous
  significant code byte, so both scans now record one and consult
  `slash_starts_regex_at`, the predicate #3647 added for the client store scan.
* `find_string_end` bounded a `'` / `"` search at the first `\n`. A **line
  continuation** is a backslash-escaped newline that the string legitimately
  crosses, so the bound is now the first *unescaped* newline — which is the
  parity rule `find_unescaped_char` already implements, not a new one.

All three are over-rejections, so their population is documents the official
compiler accepts and rsvelte did not. No comparison of accepted programs can see
that, and the collected corpus is at zero because published code compiles.

Grid — 18 expression shapes × 12 hosts × 2 targets: **92 of 432 cells diverging
→ 34**, and every one of the 34 is the same two shapes it was before the fix —
`line-comment-brace` 17 and `block-comment-brace` 17, all `js-mismatch` rather
than a rejection, which is #3603's comment-placement class. By shape the fix
accounts for the whole difference: the 32 line-continuation cells, the 18 regex
cells and the 8 string/template cells all go to 0. The comment shapes being
*unmoved* rather than absent is the per-shape control — it says the change
touched the cells it was aimed at and no others.

The controls are the other direction of each scan, and they move in neither: a
`/` that is division (including one after a postfix `++`, where a naive
"what precedes it" test says regex), `'a\'b'` and `'\\'` — the second being the
shape that broke a sibling scanner, since the backslash is itself escaped — and
`` `a\⏎b` ``, the template literal that was already right, which is what
identifies the real newline rather than the backslash as the cause.
