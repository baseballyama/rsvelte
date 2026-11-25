---
'@rsvelte/cli': patch
---

Report an `await` in a class static block or a TypeScript namespace where svelte does when the assignment target around it also fails. `class A { static { (await x) = 1; } }` now fails at the `await`.
