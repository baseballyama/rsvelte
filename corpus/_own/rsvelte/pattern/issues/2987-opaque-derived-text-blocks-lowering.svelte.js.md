# `2987-opaque-derived-text-blocks-lowering.svelte.js`

**Issue:** [#2987](https://github.com/baseballyama/rsvelte/issues/2987)

The same scan class as #2986 one pass over, and the opposite outcome: `$derived(` inside a string literal matched first, its unbalanced parens made `find_matching_paren` fail, and the loop `break`s — so the **real** `$derived(…)` below was never lowered and the emitted module referenced a global `$derived`, throwing at import. The output parses, so the parse oracle cannot see it; drop the `(` from the string and the same input already compiled correctly
