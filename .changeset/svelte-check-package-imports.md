---
"@rsvelte/svelte-check": patch
---

fix(svelte-check): a `.svelte` component imported through package.json `imports` (SvelteKit 3's `#lib/*`, which replaces the `$lib` tsconfig alias and leaves the generated `paths` empty) now resolves to its shadow instead of reporting `TS2307: Cannot find module '#lib/components/Foo.svelte'`. The alias rewrite for `.svelte` importers read the leading `#` as a URL fragment and so never looked at the specifier, and the exact `paths` entries that let plain `.ts` importers reach a component came from tsconfig `paths` only; both now cover `"#<name>/*": "./<dir>/*"` patterns from the nearest package.json, including conditional targets resolved with TypeScript's `types` / `import` / `default` conditions.
