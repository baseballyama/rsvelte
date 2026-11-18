# `legacy-prop-initializer-jsdoc.svelte`

**Issue:** corpus residue

A JSDoc comment between a legacy `export let` assignment and its simple arrow-function initializer stays attached when the initializer becomes the final argument of `$.prop(...)`. The prop-declaration scanner uses comment-free text for semantic decisions, but generation must retain the source trivia.
