---
'@rsvelte/compiler': patch
---

Keep a module `$inspect(…)`'s hole across the reprint, and lower it on the server in dev

Two halves, both `.svelte.(js|ts)`-only.

`compileModule` prints its body by re-parsing the transformed text, and a re-parse
drops an `EmptyStatement` — so the `;;` written for a removed `$inspect(…)`
survived only while nothing sent the module down that path. Reading a `$derived`
from an exported function does send it there, and then **every** hole in the file
vanished at once, not just the one near the read. The hole now travels as a
sentinel that re-parses as a statement and is expanded when the program is
printed. It carries its own `;`: the position test that classifies the *next*
call reads a bare identifier as an operand slot, so without one the second hole
in a file came out as `undefined`.

The server half is separate: `transform_server_module` ran the shared module
transform with `dev: false` unconditionally, so a module never got the dev
lowering (`console.log('$inspect(', args, ')')` / `(fn)('init', args)`) and the
logging the rune exists for was dropped.

Grid — the file that reproduces it, with seven tails varying what an exported
function reads: **2 of 7 passing → 7 of 7**. `return d` (a `$derived`) is the
diverging tail and `return a` (a `$state`) is the negative control that never
moved, which is what names the reprint rather than the read. Consecutive holes
are their own axis: five in one module, 5/5 on both targets, with the
second-hole-becomes-`undefined` failure reproduced and fixed separately.

Where official cannot be matched, it is not: in the five **value** slots upstream
emits text no JS parser accepts (10 of 10 cells under an acorn oracle), so those
keep the `undefined` this release already documents elsewhere. The three
**statement** slots are byte-identical to official on both targets.

`$effect` / `$effect.pre` / `$effect.root` are still removed outright.
