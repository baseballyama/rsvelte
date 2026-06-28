---
"@rsvelte/svelte2tsx": patch
---

fix(svelte2tsx): drive corpus output-parity to zero (254 → 0)

The compat corpus added 26 awesome-svelte projects, reintroducing 254 svelte2tsx TSX output-parity divergences from the official tool. Port the remaining official `svelte2tsx` behaviors so every component is once again byte-identical (after oxfmt normalization), shrinking `compat/corpus/svelte2tsx-known-failures.json` to empty. Every fix mirrors the official algorithm (no per-file special-casing):

- Renamed reserved-word exports (`export { x as class }`): widen via `__sveltets_2_any` on a JSDoc `@type`/boolean-literal default, take the leading JSDoc from the export statement (`getDoc(target) || decl.doc`), and overwrite the local-keyed prop in place for the `export let X` + `export { X as reserved }` collision.
- Props/interface-member JSDoc preserved on the `$$Props` `ensureRightProps` branch, the `dontAddTypeDef` value path, and block comments separated by a `//` line comment.
- Event maps collected in source order (no alphabetical sort); `$$Events` typing injection gated on an actual `$$Events` interface; `canHaveAnyProp` split from `usesPropsOrRestProps`; forwarded DOM events surface as `mapElementEvent`.
- Store auto-subscriptions detect `...$store` spreads, skip `$`-prefixed function params (scope shadowing) and `$names` inside comments, and emit in the correct order.
- `@component` doc dedent via `dedent-js` semantics; module-only `$$render` emits `__sveltets_createSlot` before the `async () => {` wrapper; import-type stripping keeps a trailing line comment in place.
- Component children with their own `let:` destructure the child's own `$$slot_def`; named-slot `let:` bindings resolve the right slot key (last-wins component-level scope); `svelte:self` resolves through `__sveltets_1_componentType()`; destructured each/`let:` slot values use the official `((pattern) => name)(unwrapArr(coll))` form; slot-prop value normalization to `"__svelte_ts_string"`.

Verified byte-identical across all 11,490 corpus components (0 regressions); the 137 svelte2tsx unit tests and the 253-fixture suite pass.
