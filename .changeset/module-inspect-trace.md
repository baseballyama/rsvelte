---
'@rsvelte/compiler': patch
---

Lower `$inspect.trace(…)` in a `.svelte.(js|ts)` module

A module had no dev lowering for the rune, so `$inspect.trace()` reached the
client output and the module threw `ReferenceError: $inspect is not defined` on
import — the one cell of this rune's family that shipped code that does not run,
rather than code that differs by bytes.

The port follows upstream's split: the label thunk is built from the module
source as the user wrote it (upstream computes it in phase 2, so the position is
the source's, not the partially-rewritten text's), and the function body becomes
`{ return $.trace(<tracing>, () => { …rest… }); }`, awaited with an `async`
thunk when the function is async. `get_function_label`'s fallbacks are ported in
full: a declaration's own name, a named function expression's own name, the
`const` for an anonymous one, the callee's source text plus `(...)` for an IIFE,
and `'trace'` for a class method.

The generated `await` is excluded from the dev await instrumentation, which
otherwise wrapped it in `$.track_reactivity_loss` on its next fixed-point pass.

A component's `<script module>` is unchanged (#3543): it reaches the shared
transform with already-rewritten text, so its positions are not the source's.
