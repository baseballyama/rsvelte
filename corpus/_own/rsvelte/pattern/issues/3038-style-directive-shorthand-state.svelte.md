# `3038-style-directive-shorthand-state.svelte`

**Issue:** [#3038](https://github.com/baseballyama/rsvelte/issues/3038)

A **shorthand** `style:color` backed by an unmutated `$state` — upstream scores a shorthand by binding *kind* alone (`kind !== 'normal'`, never `scope.evaluate`), so it stays reactive (`let styles; $.template_effect(…)`) while the explicit `style:x={x}` form of the same binding folds static; rsvelte evaluated both alike and emitted the static call
