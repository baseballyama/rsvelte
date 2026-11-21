---
'@rsvelte/cli': patch
---

`svelte/no-dom-manipulating`, `svelte/require-store-reactive-access` and the rules that skip components now tell a component from an HTML element as Svelte does: `<Foo-bar>` is an HTML element, and `<Ärger>` and `<Foo.>` are components.
