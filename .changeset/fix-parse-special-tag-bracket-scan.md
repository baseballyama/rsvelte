---
"@rsvelte/compiler": patch
---

fix(parse): scan `{@html/@render/@const/@debug}` bodies with find_matching_bracket

The `{@html}`, `{@render}`, `{@const}` and `{@debug}` special tags each carried
their own bespoke brace-depth loop to locate the closing `}`. Those loops
handled some JavaScript lexical contexts but not all — none skipped comments or
regex literals, and `{@debug}` skipped nothing at all — so a `}` inside a
comment or regex (and, for `{@debug}`, a string) terminated the tag early and
mis-parsed the rest of the template. All four now route through the shared
`find_matching_bracket`, which skips strings, template literals, comments, and
regex literals exactly like upstream's `read_expression`. This brings several
cases into line with the official compiler:

- `{@html x /* } */ + y}` — brace in a block comment
- `{@render foo(/}/g)}` — brace in a regex literal
- `{@const re = /}/}` — brace in a regex literal
- `{@debug foo /* } */}` — brace in a block comment

The `{@const}` sequence-expression guard (`{@const a = b, c = d}` is rejected,
`{@const a = (b, c)}` is allowed) is now derived from the parsed initializer's
node type, mirroring upstream's `init.type === 'SequenceExpression'` check,
instead of a top-level comma byte-scan. This stops a comma inside a regex,
string, or comment (e.g. `{@const x = /a,b/.test(y)}`) from being mistaken for a
sequence separator and wrongly rejected.

No change to the output of any existing fixture; the parser now additionally
accepts the inputs the official compiler accepts. Net ~160 fewer lines in
`state/tag.rs`.
