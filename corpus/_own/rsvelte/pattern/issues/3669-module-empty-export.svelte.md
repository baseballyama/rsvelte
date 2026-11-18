# `3669-module-empty-export.svelte`

**Issue:** [#3669](https://github.com/baseballyama/rsvelte/issues/3669)

A TypeScript module script containing `export {}` loses the empty export during shared source projection, while the instance script and template remain intact on client and server targets.
