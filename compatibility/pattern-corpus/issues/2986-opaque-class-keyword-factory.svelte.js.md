# `2986-opaque-class-keyword-factory.svelte.js`

**Issue:** [#2986](https://github.com/baseballyama/rsvelte/issues/2986)

A module with **no class in it**, whose leading comment happens to contain `class `. The SSR class-field transform located its class with a raw `memmem::find(b"class ")` and the body brace with `str::find('{')`, so the comment started a "class header" and the factory function became its body: the local `const differs = $derived(…)` came out as `#const_differs = …` with `get const differs()` accessors, in statement position. `compileModule` returned successfully and the module was not JavaScript — a bundler rejected the whole build. Delete the word `class` from the comment and the same input already compiled correctly
