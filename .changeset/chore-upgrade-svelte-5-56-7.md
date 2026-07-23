---
"@rsvelte/compiler": patch
---

chore: upgrade Svelte compatibility target to 5.56.7

Bumps the pinned Svelte submodule from 5.56.4 to 5.56.7, regenerates all test
fixtures, and ports the two server-transform (SSR) codegen changes that alter
compiler output:

- **`$state.eager(<arg>)` visits its argument** (upstream #18530): the server
  `CallExpression` visitor now visits `node.arguments[0]` instead of returning
  it verbatim, so a `$derived` read inside `$state.eager(...)` is resolved to a
  getter call (`$state.eager(d)` → `d()`). The read-wrap pass no longer skips
  the eager argument.
- **Inline `{await …}` expression tags read-wrap their reads** (upstream #18492
  `process_children` threading `state` into `visit`): an inline await whose
  immediate parent is an element now applies the read-wrap pass to the
  `$.save`-wrapped result, so `$derived` / store reads inside it resolve to
  getter calls (`{await push(d)}` → `push(d())`).
