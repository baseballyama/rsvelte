# `3582-reserved-word-tag-name.svelte`

**Issue:** [#3582](https://github.com/baseballyama/rsvelte/issues/3582)

An element whose tag name is a JS reserved word: the client named its variable after the tag, so `<var>x</var>` emitted `var var = root();` — 42 of 46 reserved words produced output no JS parser accepts, and the four that did not (`async`, `of`, `get`, `set`) are exactly the four that are not reserved. `Memoizer::generate_id` had three of upstream's four membership tests and not `is_reserved` (`phases/scope.js:728-734`). Carries `<var>` twice so the suffix path runs after the fast path, a `bind:this` host, SVG `<switch>`, and `<async>`/`<get>` as the negative controls that must keep their bare names
