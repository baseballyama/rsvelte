---
'@rsvelte/svelte2tsx': patch
'@rsvelte/compiler': patch
'@rsvelte/svelte-check': patch
---

An attribute's host now answers `Attribute.ts`'s two host tests separately, and a
valueless CSS custom property is `true`.

`element instanceof Element` picks the `data-` workaround
(`...__sveltets_2_empty({…})`) over the component-only `--` one
(`__sveltets_2_cssProp`), while the attribute-case fold needs
`parent.type === 'Element'` as well. A `<slot>` is built as an `Element` whose node
type is `Slot`, so it takes the first wrapper and not the second — rsvelte had the
two the wrong way round. A named-slot element is a real element and now folds its
attribute name's case like any other. And `<C --x />` types the property as `true`,
not `""`: the `""` fallback in `addProp` is only reached when `addAttribute` is
called with no value, which the valueless branch never does.
