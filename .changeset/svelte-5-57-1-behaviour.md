---
"@rsvelte/compiler": patch
"@rsvelte/vite-plugin-svelte-native": patch
---

fix(compiler): follow Svelte 5.57.1. `<input defaultValue>` / `defaultChecked` now deopt the SSR element to the spread path so the default is applied before `value` / `checked` (sveltejs/svelte#18733); an `{#each}` fallback resolves names in the enclosing scope instead of the loop's (sveltejs/svelte#18803); an object property is printed in the concise method form only when it carries `method` or a `get` / `set` kind, matching esrap 2.3.x — `{ click: function () {} }` is no longer rewritten to `{ click() {} }`; and a destructuring binding pattern reports its real `loc.*.column` again, upstream having dropped the `(pattern = 1)` prefix-blanking that shifted it (sveltejs/svelte#18738).
