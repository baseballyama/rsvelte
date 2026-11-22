---
'@rsvelte/cli': patch
---

A string statement in a component script no longer becomes a directive in the compiled output. Before, `let { x } = $props(); "use strict";` could print `"use strict";` first in the component function, where it turned on strict mode. It now prints in parentheses, as Svelte does. The compiler also reads an optional property's `?:` in a template type annotation, as in `{#each items as item: { a?: string }}` or `{@const first: { a?: string } = row[0]}`, and an arrow type in a snippet's type parameters, as in `{#snippet s<T extends () => void>(x: T)}`.
