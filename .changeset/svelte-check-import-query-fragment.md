---
"@rsvelte/svelte-check": patch
---

fix(svelte-check): a `.svelte` specifier carrying a query or fragment (`$lib/Foo.svelte?raw`, `#lib/Foo.svelte?raw`, `Foo.svelte#frag`) is no longer rewritten to the component's shadow. TypeScript resolves the whole string, so official svelte-check types `?raw` through Vite's ambient `*?raw` module (a `string`) and reports a fragment as unresolvable; rsvelte-check typed both as the component.
