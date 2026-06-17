---
"@rsvelte/svelte2tsx": patch
---

svelte2tsx output-parity corpus burn-down (124 → 11 known failures): hoist
`$$ComponentProps` when a `typeof` references an import (not a local);
preserve trailing TS postfixes (`as T` / `satisfies T` / `!`) on component
bind props, spreads (parenthesised) and use/transition/animate directive
params; wrap empty-valued `data-*` attributes in `__sveltets_2_empty` on the
`createElement` path; gate interface / `$$ComponentProps` hoisting and
emission on the upstream `HoistableInterfaces` rules (no over-hoisting when
the props interface is absent/imported, no synthetic `Record<string, never>`
alias); support the `$props<TypeArg>()` type-argument form; place the
`@component` documentation block adjacent to the component declaration; stop
treating TS keywords as hoist-blocking value deps; insert the auto
`$$ComponentProps` typedef before leading comments rather than into them; and
keep instance-referencing top-level `{#snippet}` blocks inside
`function $$render()`; fully enumerate deeply-nested destructured `export`
props (recurse into `rest`); fix the `__sveltets_createSlot` props-object
spacing; and preserve block-comment interior indentation. Remaining
divergences (one genuine upstream `svelte2tsx` crash, shared-parser HTML edge
cases, and a few low-ROI individual diffs) are documented in
`docs/svelte2tsx-corpus-remaining.md`.
