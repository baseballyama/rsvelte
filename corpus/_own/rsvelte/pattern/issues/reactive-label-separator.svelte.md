# `reactive-label-separator.svelte`

**Issue:** corpus residue

A legacy reactive statement's label is `$`, and the `:` need not be glued to it — `$ : f(n)`, `$\t: f(n)` and `$/*c*/: f(n)` are all reactive statements, and 10 corpus components spell one that way. Upstream wraps the non-assignment form with `prependLeft(start, ';() => {')` and never touches the label; rsvelte overwrote a fixed two-byte `$:`, which produced `$::`, `$: :` and — for the comment form — `$:*c*/:`. The tight spelling and the assignment path (whose `let ` overwrite reproduces upstream's own two-byte quirk, `let : doubled`) are the controls.
