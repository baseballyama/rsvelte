---
"@rsvelte/fmt": patch
---

fix(fmt): honour every depth-0 boundary in an attribute value. `reindent_attr_with_raw_text` split a multi-line attribute value at the *first* brace-depth-0 tab-led newline and emitted everything after it verbatim, so a value holding two independently wrapping interpolations separated by raw text left the second expression's continuation lines stranded at column 0. The scan now collects every depth-0 newline and re-indents each expression run, matching the oracle's model: a line that begins at depth 0 is literal attribute text (verbatim), a line that begins inside `{…}` is formatter output (gains the attribute indent). Two adjacent divergences fall out of the same model — a regular attribute now keeps the author's inter-interpolation whitespace (only a directive's `fill` text reflows it to the attribute column), and an attribute rendering with no `name=` separator (`{@attach x != null && …}`) is no longer split on a JS operator.
