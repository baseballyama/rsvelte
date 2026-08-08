---
"@rsvelte/compiler": patch
---

Find an `import` statement's terminator lexically, so a `;` inside a comment does not truncate the specifier list

`extract_imports` accumulated a multi-line `import` until a line "closed" it, and both the
close test (`trimmed.contains(';')`) and `import_statement_end` read raw bytes. A `// ; c`
line inside the specifier list closed the import after the previous specifier, terminated it
with the comment's own `;`, and routed the rest of the statement — starting mid-comment —
into the component body, so the output stopped being JavaScript.

The two tests are now one lexical scan, which is what kept them from disagreeing: comments,
template literals and regex literals are opaque, and the open-block-comment state already
carried by `ScanState` is consulted, so a `;` on the continuation line of a `/* … */` is text
too. All four `contains(';')` sites are replaced — `extract_imports` and
`extract_imports_with_projection` are two copies of the same loop, and fixing one would have
left the other live depending on whether source projection is on.
