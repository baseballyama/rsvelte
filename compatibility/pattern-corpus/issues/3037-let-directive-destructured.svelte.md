# `3037-let-directive-destructured.svelte`

**Issue:** [#3037](https://github.com/baseballyama/rsvelte/issues/3037)

Destructured `let:` directives (`let:item={{ id, name }}`, `let:cell={[first, ...others]}`) — the client lowered only the identifier form, so pattern names were never bound; the element path and the analysis-side pattern binding rules (upstream binds nothing for array `...spread` / defaults) both needed the port
