---
"@rsvelte/compiler": patch
"@rsvelte/svelte2tsx": patch
"@rsvelte/svelte-check": patch
---

fix(svelte2tsx): mirror official whitespace/gap accounting for `<style>` and
`<svelte:boundary>`. Blanking a `<style>` tag also swallowed the whitespace that
followed it, so a top-level `<style>…</style>\n` lost its trailing newline
(`async () => {};` instead of `async () => {\n};`); upstream `handleStyleTag`
removes exactly the node range. And `<svelte:boundary>` was lowered with the
literal-name start transformation, whereas upstream `Element.ts` only
special-cases `svelte:options` / `head` / `window` / `body` / `fragment` and
lets everything else keep the tag name as a source range — one more kept range,
so the props object gets two spaces of gap instead of one. Because the Svelte-4
AST conversion drops a whitespace-only first/last `Text` child of a boundary,
`computeStartTagEnd` also lands on the first real child (folding the `\n\t`
before it into the opener) and a content-bearing first/last `Text` has its data
trimmed before being blanked.
