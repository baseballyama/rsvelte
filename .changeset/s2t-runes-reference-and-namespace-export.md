---
"@rsvelte/svelte2tsx": patch
---

Two svelte2tsx projections. Runes mode is now entered on a *reference* to `$state` / `$derived` / `$effect`, matching upstream's membership test over the `$`-prefixed globals set, instead of only on a rune *call* — so `{$state}`, `void $derived` and `{#each $effect as …}` no longer type the component as a legacy class component. And the instance-script export walk mirrors upstream's: `export namespace` / `export enum` / `export import` keep the `export` keyword upstream never strips, an `export` nested in a `namespace` / `declare module` / `declare global` body is lifted into the component's prop and export surface, and an export with no initializer is a required prop regardless of `let` / `const` / `var`.
