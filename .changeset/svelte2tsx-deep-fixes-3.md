---
"@rsvelte/svelte2tsx": patch
---

Continue svelte2tsx output-parity burndown: widen JSDoc `/** @type */` props;
preserve element-opener comments (re-attached as leading attribute comments),
any leading block comment as a prop doc, and leading/trailing comments inside
expression tags; emit the leading export doc on `props … as { … }` type
entries; combine the SvelteKit `data: PageData` annotation with the prop
type-widener into one ignore block; emit the synthetic `children` prop on
`<svelte:component>` even with `let:` directives and drop the duplicate let-var
statement on named-slot elements; and stop treating a `$name` in a
`use:`/`transition:`/`in:`/`out:`/`animate:` directive name as a store
subscription.
