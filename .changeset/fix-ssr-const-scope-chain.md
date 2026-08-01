---
"@rsvelte/compiler": patch
---

SSR constant folding now resolves a `{@const}` / `{let}` / `let:` binding through the render position's lexical scope chain instead of a flat "every template scope" union, matching upstream's `scope.evaluate`. Two sibling fragments declaring the same name (e.g. `{#if a}…{:else}{@const x = 1}…{/if}{#key k}{@const x = 2}…{/key}`) previously made each read ambiguous, so the branch emitted `$.escape(x)` where the official compiler inlines the literal; the nearest declaration now wins and an out-of-scope read stops resolving at all.
