---
"@rsvelte/svelte2tsx": patch
"@rsvelte/svelte-check": patch
---

fix(svelte2tsx): lower static numeric DOM attribute values to bare numbers so `--tsgo` accepts the idiomatic string-literal form (`tabindex="-1"`, `colspan="2"`, `maxlength="5"`, …). `svelte/elements` types these attributes as `number | undefined | null` (no `string`), so emitting the value as a backtick string made tsgo reject every one with `Type 'string' is not assignable to type 'number'`, while official svelte-check accepted them. A single-`Text` value on a real element whose name is in svelte2tsx's `numberOnlyAttributes` set and which coerces to a number (`!isNaN`) is now emitted as a bare number (`"tabindex":-1,`) instead of `"tabindex":`-1``. Component props, non-listed attributes, and non-numeric values keep their string form. Mirrors upstream svelte2tsx's `needsNumberConversion` in `htmlxtojsx_v2/nodes/Attribute.ts`. Closes #939.
