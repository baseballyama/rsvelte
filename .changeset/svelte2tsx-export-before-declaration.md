---
'@rsvelte/svelte2tsx': patch
'@rsvelte/compiler': patch
'@rsvelte/svelte-check': patch
---

An `export { x as y }` written above `let x` is a value export, as upstream has it.

Upstream fills `possibleExports` during one in-order walk, so a named export
specifier seen before its declaration finds nothing and keeps `isLet: false` —
which makes it a value export rather than a prop (`ExportedNames.ts:634`). rsvelte
collects the same map in a pre-pass over the whole program body, so it answered the
same question the same way in either order.

The exported name is not the axis: `export { x as class }` and `export { x as b }`
behave identically, and a plain `export { x }` above its declaration was wrong too.
