# `2719-is-argument-specificity.svelte`

**Issue:** [#2719](https://github.com/baseballyama/rsvelte/issues/2719)

`:is(.a) > .b`. **Not a pruning bug** — both compilers agree which selectors are used and emit the same `css_unused_selector` warnings; only `css.code` differs. Upstream scopes a complex selector in two passes, walking its own relative selectors first (flipping `specificity.bumped`) and only then descending into `:is()` / `:where()` / `:has()` / `:not()` arguments, which inherit the bumped state. rsvelte scoped the arguments *during* the compound walk, in source order, reaching the argument before the later relative selector that should have consumed the bump. The argument must appear **before** the bumping selector for the two orders to differ at all
