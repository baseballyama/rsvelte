# `3090-dev-assign-primitive-rhs.svelte`

**Issue:** [#3090](https://github.com/baseballyama/rsvelte/issues/3090)

dev-mode `$.assign` wrapped a member assignment whose right-hand side upstream evaluates as primitive: a call into the `globals` table (`String`, `Math.round`, `Number`, `BigInt`), a `global_constants` member (`Math.PI`), or a function expression. rsvelte approximates `is_primitive` by node shape in three places and none of them had these cases; the file keeps `[t]` / `{ t }` / `new Date()` alongside, which both sides do wrap
