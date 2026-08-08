---
"@rsvelte/compiler": patch
---

Match a `$effect(`'s closing paren lexically, so a `)` inside its body's comment does not truncate the deletion

`strip_effects_from_source` deletes from `$effect(` to its matching `)`, and
`find_matching_paren` counted every `)` byte. A `// ) c` inside the effect body closed the
count early, so the deletion stopped mid-body and the tail of the comment — `c` — was
emitted as a bare statement. The output no longer parses: `Unexpected token`,
`Unterminated regular expression` and `'import' is a reserved word` are all the same defect
landing at different arbitrary bytes.

The fix is on the shared helper rather than the caller, because all 18 call sites (11 in
the server transform, 7 in the client rune transforms) use the result to slice or delete a
source range. Only the `$effect` / `$effect.pre` / `$effect.root` sites are shown to be
reachable by a discriminating case; the other 15 are structurally exposed to the same input
but unmeasured.
