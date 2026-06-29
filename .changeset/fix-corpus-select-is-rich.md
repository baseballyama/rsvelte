---
"@rsvelte/compiler": patch
---

fix(compiler): mark a `<select>` with non-option content as "rich" (SSR)

A `<select>` whose children include anything other than `<option>`/`<optgroup>`
elements — e.g. `<select multiple><slot /></select>` — must emit the trailing
`is_rich = true` flag on the SSR `$$renderer.select(attrs, fn, …rest, true)` call
so the runtime adds the customizable-select hydration marker.

rsvelte's rich-content scan (`select_special_is_rich`) was narrower than upstream's
`is_customizable_select_element`: it only treated components / `{@render}` /
`{@html}` as rich and missed `<slot>` (a `SlotElement`), non-option/optgroup
regular elements, and text. It now faithfully ports
`is_customizable_select_element` for the `<select>` owner (mirroring
`find_descendants`: skip snippet/debug/const/declaration/comment/expression tags,
recurse if/each/key/await/boundary branches but not element children, and treat a
non-option/optgroup element, non-whitespace text, or any other node as rich).

Clears `sveltestrap/.../Input/Input.svelte` (SSR), zero corpus regressions.
