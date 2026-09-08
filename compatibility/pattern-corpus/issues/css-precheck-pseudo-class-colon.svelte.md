# `css-precheck-pseudo-class-colon.svelte`

**Issue:** corpus residue

Unpreprocessed indented Sass both compilers reject: upstream reports where its recursive CSS parse first fails (the empty pseudo-class name), where a raw-text "first colon in the block" guess lands on `:global`. The **position** is the comparison.
