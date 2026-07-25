---
"@rsvelte/compiler": patch
---

fix(parse): keep the assignment target when it carries a TS assertion

`count!++`, `count! += 1` and `[count!] = …` model their target as an
`AssignmentTarget` / `SimpleAssignmentTarget` TS-wrapper variant in oxc, which
the ESTree conversion had no arm for — the whole target was emitted as `null`,
so any consumer of `parse()` lost the write. A plain `=` LHS now unwraps the
assertion and every other target position keeps the wrapper, matching
`svelte/compiler`. The TS stripper also skipped `UpdateExpression.argument`,
which leaked an invalid `count!++` into generated JS and left the write
non-reactive; it now lowers to the same `$.update(count)` as `count++`.
