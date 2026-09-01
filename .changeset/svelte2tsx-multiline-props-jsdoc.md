---
'@rsvelte/svelte2tsx': patch
'@rsvelte/compiler': patch
'@rsvelte/svelte-check': patch
---

A multi-line `/** @type {{ … }} */` on a `$props()` destructure is emitted verbatim.

Upstream gates the `@type` → `@typedef … $$ComponentProps` rewrite on
`/\/\*\*[^@]*?@type\s*{\s*{.*}\s*}\s*\*\//` (`ExportedNames.ts:269`), and that regex
has no `s` flag: the inner object must close on the line it opens, and the first `@`
in the block must be the `@type`. Everything else falls to an else arm that keeps
`$props.comment = comment` and emits the comment itself. rsvelte tested only whether
the extracted type text started with `{`, which is true for both shapes, so it
rewrote the blocks upstream copies — and rebuilt the comment from the type text,
which loses a multi-line block's own layout.

JS's `.` excludes `\n`, `\r`, U+2028 and U+2029 while Rust's excludes only `\n`, so
the transcribed condition spells that exclusion out.
