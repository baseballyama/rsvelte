# `2721-functional-pseudo-compound.svelte`

**Issue:** [#2721](https://github.com/baseballyama/rsvelte/issues/2721)

`:is(.a):is(.b)` — a compound made only of functional pseudo-classes. Upstream skips the scoping modifier only for a **standalone** `:is()` / `:where()`, guarded by `relative_selector.selectors.length === 1`; rsvelte applied that skip whenever the compound was wholly functional, regardless of count, so the rule shipped with no `.svelte-<hash>` of its own and could match elements outside the component. **Two** `:is()` is the discriminating count — at one the guard holds and both compilers agree. Invisible to every warning-based check: the warning set is empty on both sides
