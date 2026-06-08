---
"@rsvelte/svelte2tsx": patch
"@rsvelte/svelte-check": patch
---

fix(svelte2tsx): keep the props object well-formed when a `class:`/`style:` directive precedes another attribute. Regression from the #750 fix: moving `class:`/`style:` directives out of the `createElement` props object into a suffix statement left their expression chunk emitted *after* a following attribute but pointing at an *earlier* source position, violating the ascending-order requirement of the segmented overwrite. This corrupted the props object two ways: a following **shorthand attribute** (`{onclick}`) produced a double comma `{ "class":\`c\`,, }` — invalid TSX "Property assignment expected" (#779) — and a following **`{expression}`-valued attribute** (`onclick={() => f()}`) dropped its value `{ "onclick":, }` — invalid TSX "Expression expected" (#781). Both trip the program-wide `--tsgo` suppression. The overlay now bakes such out-of-order expression chunks into literal text so the props object stays well-formed; the common in-order case keeps its per-character source mapping.
