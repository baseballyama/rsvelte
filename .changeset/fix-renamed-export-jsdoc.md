---
"@rsvelte/compiler": patch
---

fix(svelte2tsx): carry renamed-export JSDoc onto the prop

`getDoc(target)` in official svelte2tsx resolves a prop's `/** @type {...} */`
from the `let x` declaration first, then — when none is there — from the
`export { x as y }` statement itself (`exportExpr`). rsvelte only captured the
doc on the `let` declaration, so the common shape

```svelte
let _class = null;
/** @type {string | false | null} */
export { _class as class };
```

dropped the type from the generated `render({...})` destructure, losing the
prop's declared type in the language server. The export-specifier handler now
falls back to the export statement's leading JSDoc, mirroring official's
`getDoc`.
