---
"@rsvelte/compiler": patch
---

Take the client instance script's statement boundaries from the parser.

The pipeline decided where a statement ended by scanning characters: balanced
depths, a trailing comma, a list of operators a statement cannot end on, a
brace-less control header, and a lookahead for a continuation token on the next
line. Each is an approximation, and the operator list is a list — a line ending
in `-` or `/` was not on it, so `$: v = a -⏎ b;` split into two statements and
`b` stopped being a dependency.

The boundaries now come from a parse of the script — the program Phase 1 already
holds where that text is a verbatim region of it, and a fresh parse otherwise. A
script that does not parse at that point keeps the scanner, so nothing that
worked stops working, and the per-line depth scan no longer runs when a parser
answered.
