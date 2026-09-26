---
"@rsvelte/compiler": patch
"@rsvelte/vite-plugin-svelte-native": patch
"@rsvelte/language-server": patch
---

fix(parser): `parse()` returns the same AST as `svelte/compiler` on every corpus component except five known shapes. Comments now attach where acorn attaches them. TypeScript literal types, computed signature keys, `#x in obj`, optional calls inside chains and regex flags all convert to the shapes acorn-typescript produces. Declaration tags carry acorn's `loc` and end at their last token. Top-level `<script>`/`<style>` attributes are read statically. CSS comments and hex escapes follow upstream's reader. Legacy empty `{#await}` branches, empty quoted style directives and whitespace before a trailing `<svelte:options>` match upstream.
