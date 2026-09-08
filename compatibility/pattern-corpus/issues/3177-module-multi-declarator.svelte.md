# `3177-module-multi-declarator.svelte`

**Issue:** [#3177](https://github.com/baseballyama/rsvelte/issues/3177)

A `<script module>` whose every multi-declarator declaration pairs a rune with a plain neighbour — server output split each into one statement per declarator, where upstream keeps the declaration whole. The **first line carries no rune at all**, which is what shows the split is not the rune visitor's doing: upstream's asymmetry comes from an analyze-phase pass that only the instance body goes through. The instance script at the bottom is the control for exactly that — the same two shapes, where splitting IS correct and must not change. `compileModule` runs a different pass and was already right, so a `.svelte.js` file reproduces nothing
