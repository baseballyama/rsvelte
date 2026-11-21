---
'@rsvelte/cli': patch
---

`compile` and `compileModule` now report acorn's error for `await` or `yield` as an arrow function's parameter, such as `(await) => 1`.
