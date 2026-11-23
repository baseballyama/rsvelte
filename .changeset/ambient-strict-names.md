---
'@rsvelte/cli': patch
---

`compile` refuses `eval` and `arguments` as the name of an ambient declaration or parameter, and a `declare` variable's value that svelte refuses, with acorn's message and position.
