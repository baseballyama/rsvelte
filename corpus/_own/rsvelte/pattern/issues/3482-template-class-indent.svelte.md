# `3482-template-class-indent.svelte`

**Issue:** [#3482](https://github.com/baseballyama/rsvelte/issues/3482)

A class declaration inside a template-expression IIFE. The primary OXC printer re-indented its retained source, but the client text fallback replayed the class body at the source column, two levels shallower than the generated `$.template_effect` closure
