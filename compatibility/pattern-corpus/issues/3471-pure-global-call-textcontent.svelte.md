# `3471-pure-global-call-textcontent.svelte`

**Issue:** [#3471](https://github.com/baseballyama/rsvelte/issues/3471)

A `$derived` whose value is a call to one of upstream's 46 `globals` keypaths over a never-written `$state`. `scope.evaluate` folds it, so the element keeps the `textContent` fast path; the client's own eight-name `Math` table and its depth-0 `has_call` bail dropped it to a text node plus a `$.set_text` effect. Carries `Math.sign` / `String` / `Number` (names the old table lacked), `Math.abs` (a name it had but could not reach through a binding reference) and a `\|\|` host, with `parseInt` and `Math.hypot` as the controls upstream also declines
