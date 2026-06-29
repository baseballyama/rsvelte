---
"@rsvelte/fmt": patch
---

fix(fmt): move the open `>` to its own line for a hug-start, multi-line inline element

When an inline element's body hugs the open tag (`>{content}` with no leading
whitespace) but ends with whitespace before the close tag, and the source kept
the body broken across lines, prettier-plugin-svelte drops the open `>` onto its
own indented line so it hugs the first content word while a normal close tag
follows:

```
<label for={forName} style="cursor:{cursor}"
  >{label}
  <slot />
</label>
```

rsvelte left `…cursor:{cursor}">{label}` glued. `try_hug_mixed` now handles this
`shouldHugStart && !shouldHugEnd` shape (single-line or wrapped open tag),
mirroring `build_element_doc`'s hug-start-only assembly in `children.rs`. A
`<slot>` (`SlotElement`) child is also now classified as inline (it is a
`display:contents` element prettier hugs like a component), so it no longer
disqualifies its parent from the hug path.

Burns down the fmt-parity corpus by 3 (82 known failures; svelte-form-builder
Label/Button/Link). First increment of the milestone-2 layout-engine alignment.
