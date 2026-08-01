---
"@rsvelte/compiler": patch
"@rsvelte/svelte2tsx": patch
"@rsvelte/svelte-check": patch
---

fix(svelte2tsx): apply official's `value[0]` rule to every slot-name path.
Official svelte2tsx only ever reads the FIRST part of a slot-name attribute
value; rsvelte concatenated all `Text` parts (or kept the last one), so
`<slot name="a{b}c">` produced `slots: { undefined: {} }` instead of
`{ 'a': {} }`, `$$slots` keyed on `c` instead of `a`, and
`<Comp><div slot="a{b}c">` was lowered to a `$$slot_def["ac"]` wrapper that
official does not emit. The three sibling paths now mirror their own upstream
rule: `slots`/`$$slots` use `nameAttr.value[0].raw` (shared map),
`let:`-binding scope resolution uses `getSlotName`'s `value[0].raw`, and the
`$$slot_def[…]` lowering uses `attributeValueIsOfType(value, 'Text')` — so an
interpolated or dynamic `slot=` stays an ordinary attribute and is no longer
dropped from the generated props.
