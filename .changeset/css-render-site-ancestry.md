---
"@rsvelte/compiler": patch
"@rsvelte/lint": patch
"@rsvelte/svelte-check": patch
---

CSS pruning now models `{@render}` call sites. A `{#snippet}`-declared element's
real DOM ancestors are the union of the ancestors of every site that renders the
snippet, not its lexical parent chain, so rules such as `.foo > .a { … }` whose
`.a` only ever appears in a snippet rendered under a different ancestor are
marked unused like the official compiler does. Previously the structural ancestor
check bailed out entirely whenever the component contained a snippet.
