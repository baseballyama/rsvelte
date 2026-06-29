---
"@rsvelte/fmt": patch
---

fix(fmt): defer the close-tag `>` to its own line for a hug-end, multi-line inline element

Mirror of the hug-start fix. When an inline element's body has leading whitespace
(so the open `>` stays on the open-tag line — not hug_start) but ends directly
adjacent to the close tag (hug_end), and the body is already broken across lines,
prettier-plugin-svelte defers the close tag's final `>` onto its own line at the
element indent:

```
  <picture …>
    …
  </picture></GroupSlot
>
```

rsvelte left `</GroupSlot>` glued. `try_hug_mixed` now handles this
`!shouldHugStart && shouldHugEnd` shape, mirroring `build_element_doc`'s
hug-end-only assembly (whose trailing `softline, '>'` breaks when the element is
multi-line).

Burns down the fmt-parity corpus by 2 (80 known failures; svelte-form-builder
Picture, layerchart Histogram).
