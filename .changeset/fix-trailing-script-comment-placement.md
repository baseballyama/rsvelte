---
"@rsvelte/compiler": patch
---

fix(client): keep trailing `<script>` comments in place

A comment sitting after the last statement of a `<script>` was emitted at the
end of the generated component function instead of next to the code it was
written beside. In `svelte/compiler` the element identifier of `var p = root();`
carries the element's source location (`b.id(name, element.name_loc)`), so esrap
flushes the leftover comment there; every node rsvelte generated read as "no
location", leaving the enclosing body as the only span that bracketed the
comment. Generated element identifiers now carry that anchor, and only when the
element really does follow the comment in the *source* — an element written
before the `<script>` still leaves the comment at the body tail, as upstream
does. Over the Svelte test corpus four more components now match
`svelte/compiler` byte-for-byte and none regress.
