# `3173-eager-runes-across-scripts.svelte`

**Issue:** [#3173](https://github.com/baseballyama/rsvelte/issues/3173)

The same two runes reached through all three of a component's entry points at once — `<script module>`, the instance script and a template expression. The module half is the one that was not lowered at all, leaving a reference to an undefined `$state.eager` global in the output, and the instance half beside it is the control: the same source line, already correct, must stay byte-identical
