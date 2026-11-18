# `3149-scoped-class-escape.svelte`

**Issue:** [#3149](https://github.com/baseballyama/rsvelte/issues/3149)

Upstream escapes a folded class literal as an HTML attribute before appending the hash. All three of `&`, `<` and `"` are in the file because `escape_attr` covers exactly those three, and the entity case needs an expression beside it so the chunk folds rather than going into the template
