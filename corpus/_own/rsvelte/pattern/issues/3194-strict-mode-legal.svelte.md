# `3194-strict-mode-legal.svelte`

**Issue:** [#3194](https://github.com/baseballyama/rsvelte/issues/3194)

The control for the whole strict-mode scan, and the half that decides whether it is safe: every construct that LOOKS like one of the violations and is legal — `0o755` / `0x1f` / `1_000`, a lone `\0`, an escaped backslash before digits, `static` / `let` / `private` as property names, a single `__proto__`, a shorthand and an accessor `__proto__`, `delete o.a`, a parameter shadowed in a nested function, `arguments.length`, a tagged template carrying `\251`, and a `static` class method. A scan keyed on the token rather than on the AST position rejects most of these
