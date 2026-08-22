---
"@rsvelte/compiler": patch
---

Drop an exported `$props.id()` declarator instead of emitting it beside the hoisted one. `export const x = $props.id()` produced `const x` twice in the same scope — output no JS parser accepts. The official compiler drops the declarator however the declaration is reached, and `$$exports` reads the hoisted `const`.
