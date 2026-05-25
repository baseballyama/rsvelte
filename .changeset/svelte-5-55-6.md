---
"@rsvelte/compiler": patch
---

Bump target Svelte to **5.55.6**. Four compiler-side upstream commits (`e00944ffd` SSR member-expression compile, `89b6a939f` `Promise.all` save during SSR, `4c96b469f` `@debug` awaited variables, `69b4c9f56` skip block comments in `read_value`). Eleven new fixtures hit the same async-batching follow-up tracked since 5.54.1 (plus one additional `<svelte:component this={state.x.Y}>` gap exposed by `dynamic-component-member`); all skipped.
