# `3235-rune-name-member-property.svelte`

**Issue:** [#3235](https://github.com/baseballyama/rsvelte/issues/3235)

The same shapes in a component **instance script**. The instance and `compileModule` pipelines locate rune calls in different files, so this is not `compileModule`-only — `o.$inspect(1)` produced `const a = o.;` on the instance path while the module path produced `o.`
