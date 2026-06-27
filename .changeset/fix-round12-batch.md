---
"@rsvelte/compiler": patch
---

fix(transform): nested prop-assignment in $: RHS, function-decl shadowing, boundary snippet order

- A nested prop assignment in a `$:` state-var-assignment RHS (an arrow default
  `() => (isOpen = !isOpen)`) is now lowered to the setter call `isOpen(!isOpen())`;
  the state-var branch was missing the prop-assignment pass its siblings run.
- A `function foo()` declaration now shadows a same-named prop/state binding in the
  runes read-wrapper, so a reference to the local function (`executing.then(enter)`,
  where `async function enter()` shadows an `enter` prop) stays bare instead of
  becoming `enter()`.
- A non-hoistable `<svelte:boundary failed>` snippet is emitted into the SSR
  template stream in visit order (like the regular snippet visitor) instead of
  being prepended ahead of preceding `{@const}` / sibling snippets.
