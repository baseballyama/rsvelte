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

The boundaries now come from one oxc parse of the script. A script that does not
parse at that point keeps the scanner, so nothing that worked stops working.
