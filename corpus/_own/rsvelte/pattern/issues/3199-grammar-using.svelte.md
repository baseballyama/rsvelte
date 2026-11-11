# `3199-grammar-using.svelte`

**Issue:** [#3199](https://github.com/baseballyama/rsvelte/issues/3199)

`using r = { [Symbol.dispose]() {} }` — explicit resource management, which OXC implements and acorn does not, so rsvelte compiled a file official rejects. Written inside a function because the declaration is what is illegal, not the `Symbol.dispose` object
