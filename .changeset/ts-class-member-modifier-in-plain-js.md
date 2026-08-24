---
"@rsvelte/compiler": patch
---

Reject a TypeScript class-member modifier in a source parsed as plain JavaScript. OXC parses `private` / `public` / `protected` / `readonly` / `override` / `declare` / `abstract` / `accessor` on a class member in a non-TypeScript source and reports nothing, while acorn reads the modifier as the member's *name* and throws on the token after it. `compileModule` always parses with `typescript: false`, so `class K { private a = 1 }` in a `.svelte.ts` module compiled and copied the keyword straight into the emitted `.js`, which no JavaScript parser accepts; a plain `<script>` in a component reached the same parse and did the same. Both now raise `js_parse_error` at the offset official reports. A modifier keyword that is not a modifier is untouched — `private\n\ta = 1;` is two ordinary fields, `private = 1;` is a field named `private` — and `<script lang="ts">` keeps compiling all of them.
