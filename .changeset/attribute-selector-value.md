---
"@rsvelte/compiler": patch
---

fix(parse): `AttributeSelector.value` is the unquoted value upstream reads

`read_attribute_value` treats the quotes as delimiters, keeps a backslash on an
escape and trims the result, so `[a="x"]`, `[a='x']` and `[a= x ]` all carry
`x`. rsvelte kept the quotes in the AST to preserve the author's quote style,
which made the value a different string from upstream's on every quoted
attribute selector. `print`'s `AttributeSelector` always re-quotes with `"`,
which is what upstream's printer does.
