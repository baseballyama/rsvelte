# `3315-parenthesised-rune-module-script.svelte`

**Issue:** [#3315](https://github.com/baseballyama/rsvelte/issues/3315)

The same parentheses in a component's `<script module>`, which is neither the instance script nor `compileModule` — it reaches the module class-field lowering by its own route, so the two files above leave it unmeasured
