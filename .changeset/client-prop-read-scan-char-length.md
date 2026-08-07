---
"@rsvelte/compiler": patch
---

fix(compiler): measure the prop name in characters in the client prop-read scan

`transform_prop_reads_in_expr` walks a `Vec<char>` but sized the prop name with
`prop_name.len()`, a byte length, as did `is_shadowed_by_function_param`. A
non-ASCII `export let` prop read from a `$:` statement therefore dropped trailing
code (`名前()` for `名前 + 1`), lost array elements, produced unbalanced object
shorthand, and missed parameter shadowing.
