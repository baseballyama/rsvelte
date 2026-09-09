---
'@rsvelte/compiler': patch
---

client: a comment inside a `$props()` declaration no longer deletes the next statement

The `$props()` destructuring rewrite is routed per source *line*, and the line
that carries a block comment between `=` and `$props()` can hold a second
statement after the declaration's `;`. The whole-line rewrite replaced it, so
`let { a } = /* c */ $props(); console.log(a)` emitted no `console.log` — and
the same for an `onMount` registration or a `$state` declaration. The output
parses and runs, so only output equality could see it.

The routing guard now requires the declaration's `;` to be the line's last code
byte, which sends a line carrying a trailing statement to the statement-based
path instead.
