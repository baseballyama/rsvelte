---
'@rsvelte/cli': patch
---

`compile` and `compileModule` now name and place the identifier, as acorn does, when a `var` declares again a name a function declared, such as `function a() {} var { a } = {}`.
