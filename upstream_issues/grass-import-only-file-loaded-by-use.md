# `grass` resolves a `*.import.scss` file from `@use` / `@forward`, producing a spurious module loop

Sass reserves the `<name>.import.scss` filename for the `@import`-only
convention: a load of `<name>` from `@import` may resolve to it, and a load of
`<name>` from `@use` or `@forward` must **not** — it has to resolve to
`<name>.scss`. `grass` 0.13.4 does not make that distinction, so a package that
ships both files (the shape `@material/*` and therefore `svelte-material-ui`
uses everywhere) loads the `@import` shim from `@use`, and the shim's own
`@forward './index'` walks straight back into the file that was being loaded.

## Reproduction

```
sub/_functions.scss           @function f($x) { @return $x; }
sub/_index.scss               @forward "./functions";
sub/_functions.import.scss    @forward "./index" as p-*;
```

Compiling `sub/_index.scss`:

- dart-sass 1.x: `OK` (`@forward "./functions"` resolves to `_functions.scss`)
- `grass` 0.13.4: `Error: Module loop: this module is already being loaded.`

The specifier form does not matter — `@use "functions"`, `@use "./functions"`,
`@forward "functions"`, `@forward "./functions"` and `@forward "./functions" as
p-*` all fail, and the entry file's own name (`_index.scss`, `_partial.scss`, a
non-partial `notindex.scss`) makes no difference.

**Positive control for the attribution.** Deleting `sub/_functions.import.scss`
turns every one of those five cases green in `grass`; restoring it turns all five
red again. Nothing else in the directory changes.

## Where it shows up

32 of the 99 units the `scss-known-failures` ratchet lists as
`grass-rejects-accepted`, all in `svelte-material-ui`, which vendors the
`@material/*` packages' `_*.import.scss` shims.
