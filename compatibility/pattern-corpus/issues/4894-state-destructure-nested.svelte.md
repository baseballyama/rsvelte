# `4894-state-destructure-nested.svelte`

**Issue:** [#4894](https://github.com/baseballyama/rsvelte/issues/4894)

On the client, a destructured `$state` / `$state.raw` declarator is lowered the way upstream's `extract_paths` does it:
- Every array pattern, at any depth, gets its own `$$array`.
- All the `$$array`s come first, then every leaf.
- A nested pattern used to leave the whole declaration unlowered, with the `$state` call still in it.

Also covered:
- A default and a computed key that read state are visited, so they get `$.get`.
- A reassigned `$state.raw` object rest keeps its `$.state` wrap.
