# `3042-legacy-entities.svelte`

**Issue:** [#3042](https://github.com/baseballyama/rsvelte/issues/3042)

Semicolon-less **legacy named character references**: `&notanentity;` must decode its longest legacy prefix (`&not` → `¬`) leaving `anentity;` as text, per the HTML spec table upstream ports
