---
"@rsvelte/compiler": patch
"@rsvelte/svelte2tsx": patch
"@rsvelte/svelte-check": patch
---

fix(svelte2tsx): skip identifiers in a slot expression's computed object key. A
bare-identifier computed key (`{ [item]: 1 }`) was resolved through the
`{#each}`/`let:` scope like any other identifier, but official's
`resolveExpression` never substitutes a key position at all — it only
descends into a compound key expression (`{ [item + 1]: 1 }`), whose nested
identifiers resolve normally because the key slot there is not an
`Identifier` node.
