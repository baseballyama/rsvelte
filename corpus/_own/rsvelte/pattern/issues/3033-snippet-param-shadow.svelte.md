# `3033-snippet-param-shadow.svelte`

**Issue:** [#3033](https://github.com/baseballyama/rsvelte/issues/3033)

A snippet parameter that **shadows a component-scope binding** — the SSR constant-fold resolved the body read to the outer never-reassigned `$state` literal, so every `{@render row(…)}` rendered the outer value
