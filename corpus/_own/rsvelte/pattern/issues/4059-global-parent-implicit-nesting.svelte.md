# `4059-global-parent-implicit-nesting.svelte`

**Issue:** [#4059](https://github.com/baseballyama/rsvelte/issues/4059)

A nested rule that writes no explicit `&` under a fully-global parent prelude. Upstream's `get_relative_selectors` unshifts a `nesting_selector`, and the `NestingSelector` case short-circuits on `complex_selector.children.every(is_global)` — so that implicit `&` matches every element and `apply_combinator`'s parents loop scopes every ancestor of a match. rsvelte scoped only the child's own subject, so the `<svg>` wrapper carrying no selector of its own lost its scope class while its `<path>` children kept theirs: the CSS text was byte-identical and only the template diverged, which the CSS fixture suite cannot see. Four cells: a two-selector fully-global prelude, a one-selector one with a two-deep child, a **partially** global prelude (`:global(.y) .wrapper`) where the short-circuit must NOT fire, and a flat rule that must keep scoping only what it matches.
