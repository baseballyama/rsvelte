---
"@rsvelte/compiler": patch
---

client: a block comment opening the instance-script slice is indented once, not twice

When a block comment's host TypeScript construct is erased, the slice reaching
`normalize_js_with_oxc_lead` is the comment alone, and esrap prints such a slice
with a leading newline. The guard that stops the re-indent loop double-indenting
a leading block comment tested `code.starts_with("/*")`, so the newline made it
miss and every continuation line gained a tab: `\t\t * @typedef {Object} Props`
where official prints `\t * @typedef {Object} Props`.

Measured over the corpus, both arms, four targets: 38 of 135,560 units move,
across 19 files, on `client` and `client-dev` only. Of the 98 lines that differ
between the arms, 98 now equal official's and none went the other way; 12 units
become byte-identical to official where none were before.

No gate observes the class — `ast_equiv_batch` runs with `CommentPolicy::Ignore`
and the normalized comparison runs both sides through oxfmt, which re-aligns a
JSDoc body — so the guard is a unit test rather than a `pattern-corpus` repro,
which would pin nothing.
