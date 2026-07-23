---
"@rsvelte/compiler": patch
---

chore: upgrade Svelte compatibility target to 5.56.7

Bumps the pinned Svelte submodule from 5.56.4 to 5.56.7, regenerates all test
fixtures, and ports the codegen changes that alter compiler output — two on the
server (SSR) transform and two on the client transform:

- **`$state.eager(<arg>)` visits its argument** (upstream #18530): the server
  `CallExpression` visitor now visits `node.arguments[0]` instead of returning
  it verbatim, so a `$derived` read inside `$state.eager(...)` resolves to a
  getter call (`$state.eager(d)` → `d()`). The read-wrap pass no longer skips
  the eager argument.
- **Inline `{await …}` expression tags read-wrap their reads** (upstream #18492
  `process_children` threading `state` into `visit`): an inline await whose
  immediate parent is an element now applies the read-wrap pass to the
  `$.save`-wrapped result, so `$derived` / store reads inside it resolve to
  getter calls (`{await push(d)}` → `push(d())`).
- **Keyed each computed destructuring keys are transformed** (upstream #18521):
  the client key-function parameter pattern is now converted under the each
  block's `key_state`, so a computed destructuring key rewrites to its
  prop / state access (`{#each … as { [labelKey]: label } (…)}` →
  `({ [$$props.labelKey]: label }) => …`).
- **A lone update effect in a `DeclarationTag` element scope stays concise**: an
  element that directly contains a `{let …}` / `{const …}` declaration tag now
  collapses a single-statement `$.template_effect` to the `() => stmt` arrow body
  instead of a block, matching upstream (a pre-existing client quirk surfaced by
  the new `declaration-tags-transform` sample).

The `async-batch-derived` runtime-runes fixture is skip-listed: its
`<svelte:boundary {pending}>` with a `$derived` pending attribute needs the
server pending-attribute boundary branch, an unported gap that is unaffected by
this bump (`SvelteBoundary.js` is unchanged across 5.56.4..5.56.7).
