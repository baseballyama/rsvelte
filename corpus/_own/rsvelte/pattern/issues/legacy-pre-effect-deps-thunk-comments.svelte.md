# `legacy-pre-effect-deps-thunk-comments.svelte`

**Issue:** corpus residue

Upstream's legacy dependency thunk is `b.thunk(b.sequence(deps))` and carries no `loc`, so esrap's comment cursor never writes into it. rsvelte generates the whole `$.legacy_pre_effect(...)` as text and APPENDS it after the rest of the instance body, so re-parsing gives the thunk coordinates past a script-tail comment run — which then printed inside its parameter list. The run before `function f()` and the located function body's own comment are the controls: a fix that stopped emitting comments there would satisfy the first assertion and fail these.
