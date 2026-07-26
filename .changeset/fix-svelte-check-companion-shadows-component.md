---
"@rsvelte/svelte-check": patch
---

fix(svelte-check): stop a same-name `Foo.svelte.ts` / `.js` companion from hiding `./Foo.svelte`'s component module. TypeScript resolves a relative `./Foo.svelte` by appending extensions in the importer's own directory, so a sibling companion always wins over the overlay's `Foo.svelte.tsx` shadow (`rootDirs` is only a fallback and `paths` never applies to relative specifiers). The component's default export and its `<script module>` named exports therefore vanished — a companion or barrel importing them reported `has no default export`, `declares 'X' locally, but it is not exported` and `Circular definition of import alias`. The overlay now emits a `companion-augment.d.ts` that augments the module TypeScript actually picked with the shadow's default and module-context exports, so both halves resolve. Importing the companion's own named exports through `./Foo.svelte.js` is unchanged.
