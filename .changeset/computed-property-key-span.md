---
'@rsvelte/compiler': patch
---

Give a computed property key in a `<script>` its own span instead of the bracket's

`convert_property_key` is the program-path key converter — every one of its callers is a
`*_for_program` function — but its computed branch reached for `convert_expression`, which
subtracts one byte "for the paren we added": the wrapper a **template** expression is parsed
inside and a script is not. So a computed key's whole subtree landed one byte early, pointing at
the `[`. The identifier branches beside it never had that subtraction, which is why a plain key
was right and only a computed one was wrong.

Everything that reads a position out of the serialized program was one column early on this
shape: the `bidirectional_control_characters` warning, `rsvelte-lint` (where it had already cost
six lost findings on a fixture no other gate grades), svelte2tsx and the language server. Eight
positions across five hosts — an object literal, a class field, a class method, a destructuring
pattern and `<script module>` — now match the official compiler, and the five neighbouring
shapes that were already correct are unchanged.
