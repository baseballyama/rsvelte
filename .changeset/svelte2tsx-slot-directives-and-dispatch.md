---
'@rsvelte/svelte2tsx': patch
'@rsvelte/compiler': patch
'@rsvelte/svelte-check': patch
---

Three svelte2tsx fixes, two of which produced TypeScript no parser accepts.

An element carrying a `slot=` attribute inside a component went through a second,
legacy attribute emitter: a `use:` action was written as an entry *inside* the
props object and a transition as `__sveltets_2_ensureTransition(f)(tag, {})`, both
of which are syntax errors. Named-slot elements now use the same
`build_directive_prefix_suffix` path as every other element, so an action becomes a
preceding `const $$action_N = …` and a transition a call after `createElement`.

`dispatch(` + backtick + `${name}:trigger` + backtick + `)` registered an event named after the raw
template text. Upstream's `checkIfCallExpressionIsDispatch` accepts only a
`ts.isStringLiteral` first argument, which a template literal is not — substituting
or not.

A typed `createEventDispatcher<{ change: … }>()` whose member name is also a
*forwarded* `on:change` did not emit the `'change': __sveltets_2_customEvent` entry.
Upstream seeds its `events` map from the bubbled events in the `ComponentEvents`
constructor, so `addToEvents` sees a collision and the name joins `dispatchedEvents`.
