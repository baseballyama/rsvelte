---
"@rsvelte/compiler": patch
---

Dev-mode client output now emits named `function get()` / `function set($$value)`
accessors for legacy `bind:` directives on elements inside an `{#each}` block,
matching the official compiler. Upstream's `BindDirective` visitor picks the
named-function shape whenever `dev` is set (so `$inspect(...)` stack traces name
the accessor), and only falls back to `() => …` / `($$value) => …` arrows in
prod; rsvelte's each-block-aware accessor builder always produced the prod
arrows, so 47 corpus files diverged in dev mode.
