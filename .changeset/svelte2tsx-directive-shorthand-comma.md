---
"@rsvelte/svelte2tsx": patch
"@rsvelte/svelte-check": patch
---

fix(svelte2tsx): no double comma when a `class:`/`style:` directive precedes a shorthand attribute. Regression from the #750 fix: moving `class:`/`style:` directives out of the `createElement` props object into a suffix statement left their expression chunk emitted *after* a following shorthand attribute (`{onclick}`) but pointing at an *earlier* source position, violating the ascending-order requirement of the segmented overwrite. In debug builds this panicked; in release it emitted `{ "class":\`c\`,, }` — invalid TSX ("Property assignment expected") that trips the program-wide `--tsgo` suppression. The overlay now bakes such out-of-order expression chunks into literal text so the props object stays well-formed; the common in-order case keeps its per-character source mapping.
