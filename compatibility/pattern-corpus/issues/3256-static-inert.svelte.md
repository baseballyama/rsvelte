# `3256-static-inert.svelte`

**Issue:** [#3256](https://github.com/baseballyama/rsvelte/issues/3256)

A static `inert="a"` attribute stays in the template. `inert` is a DOM property for dynamic updates, but unlike `autofocus`, `muted`, `defaultValue` and `defaultChecked`, it is not in upstream's non-static-property set.
