# `3228-derived-literal.svelte`

**Issue:** [#3228](https://github.com/baseballyama/rsvelte/issues/3228)

`{rd}` over `$derived(1)`. `Binding::initial` stores a literal argument as its own source text rather than as node JSON, so the "is this known" check parsed `"1"` into a JSON number, rejected it for not being an object, and emitted a text node plus a `template_effect` where official writes `textContent` — the TEMPLATE STRING differs, so the two hydrate against different DOM
