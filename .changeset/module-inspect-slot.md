---
'@rsvelte/compiler': patch
---

Keep a module `$inspect(…)`'s slot, and lower it on the server in dev

A `.svelte.(js|ts)` module's non-dev `$inspect(…)` was removed by a text loop
that assumed the call was the whole statement: it ate the leading whitespace,
a trailing `;` and the newline, so in any operand slot the FOLLOWING statement
was spliced onto the assignment. The result parsed nowhere, the module printer
fell back to raw source, and everything after the splice shipped untransformed.
Upstream replaces the expression with `b.empty`, which prints as `;` — so
`const t = $inspect(a)` becomes `const t = ;;` and `[$inspect(a)]` becomes
`[;]`, at every depth.

The server half is separate: `transform_server_module` ran the shared module
transform with `dev: false` unconditionally, so a module never got the dev
lowering (`console.log('$inspect(', args, ')')` /
`(fn)('init', args)`) and the logging the rune exists for was dropped.

`$effect` / `$effect.pre` / `$effect.root` are still removed outright.
